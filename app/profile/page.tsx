"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";

interface UnifiedRecord {
  id: string;
  source_table: "user_records" | "race_details_full" | "cycling_details_full";
  sport_type: "triathlon" | "cycling";
  event_name: string;
  race_date: string;
  category: string;
  result_time: string;
  bib: string;
  sport_team: string;
  raw: any;
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [myRecords, setMyRecords] = useState<UnifiedRecord[]>([]);
  const [filterType, setFilterType] = useState<"all" | "triathlon" | "cycling">("all");
  const [loading, setLoading] = useState(true);

  // 編輯 Modal 狀態
  const [editingRecord, setEditingRecord] = useState<UnifiedRecord | null>(null);
  const [editEventName, setEditEventName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editRaceDate, setEditRaceDate] = useState("");
  const [editResultTime, setEditResultTime] = useState("");
  const [editSportTeam, setEditSportTeam] = useState("");
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const loadAllUserRecords = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        window.location.href = "/auth/login";
        return;
      }
      const currentUser = session.user;
      setUser(currentUser);
      const email = currentUser.email || "";
      const uid = currentUser.id;

      const unified: UnifiedRecord[] = [];

      // 1. 讀取 user_records
      const { data: uRecords } = await supabase
        .from("user_records")
        .select("*")
        .eq("user_id", uid);

      if (uRecords) {
        uRecords.forEach((r: any) => {
          unified.push({
            id: r.id,
            source_table: "user_records",
            sport_type: r.sport_type === "cycling" ? "cycling" : "triathlon",
            event_name: r.event_name || r.race_name || "未命名賽事",
            race_date: r.match_date || r.race_date || "",
            category: r.category || r.distance_category || "",
            result_time: r.result_time || r.finish_time || "完賽",
            bib: r.bib || r.bib_number || "",
            sport_team: r.sport_team || r.team_name || "",
            raw: r,
          });
        });
      }

      // 2. 讀取 race_details_full (鐵人三項榮譽登錄與歷史綁定表)
      if (email) {
        const { data: triRecords } = await supabase
          .from("race_details_full")
          .select("*")
          .eq("login_email", email);

        if (triRecords) {
          triRecords.forEach((r: any) => {
            // 避免與 user_records 重複顯示 (若同日同賽事名稱則以最新為主)
            unified.push({
              id: r.id,
              source_table: "race_details_full",
              sport_type: "triathlon",
              event_name: r.race_name || r.event_name || "鐵人三項賽事",
              race_date: r.race_date || r.match_date || "",
              category: r.category || r.distance || r.group_name || "",
              result_time: r.finish_time || r.result_time || r.total_time || "完賽",
              bib: r.bib_number || r.bib || "",
              sport_team: r.team || r.sport_team || "",
              raw: r,
            });
          });
        }

        // 3. 讀取 cycling_details_full (百鐵馬公路單車表)
        const { data: cycRecords } = await supabase
          .from("cycling_details_full")
          .select("*")
          .eq("login_email", email);

        if (cycRecords) {
          cycRecords.forEach((r: any) => {
            unified.push({
              id: r.id,
              source_table: "cycling_details_full",
              sport_type: "cycling",
              event_name: r.race_name || r.event_name || "公路單車賽事",
              race_date: r.race_date || r.match_date || "",
              category: r.category || r.distance || "百鐵馬認證",
              result_time: r.finish_time || r.result_time || r.total_time || "完賽",
              bib: r.bib_number || r.bib || "",
              sport_team: r.team || r.sport_team || "",
              raw: r,
            });
          });
        }
      }

      // 依日期由新到舊排序
      unified.sort((a, b) => (b.race_date || "").localeCompare(a.race_date || ""));
      setMyRecords(unified);
    } catch (err) {
      console.error("載入會員資料錯誤:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadAllUserRecords();
  }, [loadAllUserRecords]);

  // 刪除紀錄（自動依據來源資料表刪除）
  const handleDeleteRecord = async (record: UnifiedRecord) => {
    if (!confirm(`確定要刪除「${record.event_name}」這筆完賽紀錄嗎？`)) return;

    try {
      const { error } = await supabase
        .from(record.source_table)
        .delete()
        .eq("id", record.id);

      if (error) throw error;

      setMyRecords((prev) => prev.filter((r) => !(r.id === record.id && r.source_table === record.source_table)));
      alert("✅ 紀錄已成功刪除！");
    } catch (err: any) {
      alert("❌ 刪除失敗：" + (err.message || "請確認資料庫 RLS 權限"));
    }
  };

  // 開啟編輯視窗
  const handleOpenEdit = (record: UnifiedRecord) => {
    setEditingRecord(record);
    setEditEventName(record.event_name);
    setEditCategory(record.category);
    // 確保日期格式轉換為 YYYY-MM-DD 供 input[type=date] 使用
    const formattedDate = (record.race_date || "").replace(/\//g, "-");
    setEditRaceDate(formattedDate);
    setEditResultTime(record.result_time);
    setEditSportTeam(record.sport_team);
  };

  // 儲存編輯結果（智慧判斷原始資料表存在的欄位名稱進行更新）
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    setSaving(true);

    try {
      const raw = editingRecord.raw || {};
      const updatePayload: Record<string, any> = {};

      if (editingRecord.source_table === "user_records") {
        updatePayload.event_name = editEventName;
        updatePayload.category = editCategory;
        updatePayload.match_date = editRaceDate;
        updatePayload.result_time = editResultTime;
        if ("sport_team" in raw) updatePayload.sport_team = editSportTeam;
      } else {
        // 針對 race_details_full 或 cycling_details_full 動態匹配欄位
        if ("race_name" in raw) updatePayload.race_name = editEventName;
        else if ("event_name" in raw) updatePayload.event_name = editEventName;

        if ("race_date" in raw) updatePayload.race_date = editRaceDate;
        else if ("match_date" in raw) updatePayload.match_date = editRaceDate;

        if ("category" in raw) updatePayload.category = editCategory;
        else if ("distance" in raw) updatePayload.distance = editCategory;

        if ("finish_time" in raw) updatePayload.finish_time = editResultTime;
        else if ("result_time" in raw) updatePayload.result_time = editResultTime;
        else if ("total_time" in raw) updatePayload.total_time = editResultTime;

        if ("team" in raw) updatePayload.team = editSportTeam;
        else if ("sport_team" in raw) updatePayload.sport_team = editSportTeam;
      }

      const { error } = await supabase
        .from(editingRecord.source_table)
        .update(updatePayload)
        .eq("id", editingRecord.id);

      if (error) throw error;

      setMyRecords((prev) =>
        prev.map((r) =>
          r.id === editingRecord.id && r.source_table === editingRecord.source_table
            ? {
                ...r,
                event_name: editEventName,
                category: editCategory,
                race_date: editRaceDate,
                result_time: editResultTime,
                sport_team: editSportTeam,
              }
            : r
        )
      );

      setEditingRecord(null);
      alert("✅ 完賽紀錄已成功更新！");
    } catch (err: any) {
      console.error("更新錯誤:", err);
      alert("❌ 更新失敗：" + (err.message || "未知錯誤"));
    } finally {
      setSaving(false);
    }
  };

  const triCount = myRecords.filter((r) => r.sport_type === "triathlon").length;
  const cycCount = myRecords.filter((r) => r.sport_type === "cycling").length;
  const filteredRecords = myRecords.filter((r) => filterType === "all" ? true : r.sport_type === filterType);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center">
        <p className="text-zinc-400 animate-pulse font-bold">同步所有完賽資料庫中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between">
      <div className="max-w-6xl w-full mx-auto px-6 py-12 space-y-10">
        
        {/* 頂部會員資訊 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
              Member Center
            </span>
            <h1 className="text-3xl font-black text-white mt-2">
              會員專屬完賽中心
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              歡迎回來，{user?.email}。已為您自動整合所有鐵人三項與百鐵馬完賽紀錄。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/profile/claim"
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-400 font-bold text-sm transition"
            >
              🔍 認領歷史完賽紀錄
            </Link>
            <Link
              href="/profile/new-record"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm transition shadow-lg shadow-amber-500/20"
            >
              ✍️ 登錄最新完賽成績
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/";
              }}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-sm transition cursor-pointer"
            >
              登出
            </button>
          </div>
        </div>

        {/* 三大快捷入口卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/profile/claim" className="rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/50 p-5 transition">
            <h3 className="font-bold text-white text-base">認領歷史完賽紀錄</h3>
            <p className="text-xs text-zinc-400 mt-1">一鍵綁定三鐵與公路車歷史完賽榮耀。</p>
          </Link>
          <Link href="/profile/new-record" className="rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/50 p-5 transition">
            <h3 className="font-bold text-white text-base">登錄最新完賽成績</h3>
            <p className="text-xs text-zinc-400 mt-1">手動登錄鐵人三項或百鐵馬賽事（自動帶入日期與團隊）。</p>
          </Link>
          <Link href="/rankings" className="rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/50 p-5 transition">
            <h3 className="font-bold text-white text-base">查看百鐵 & 百鐵馬英雄榜</h3>
            <p className="text-xs text-zinc-400 mt-1">瀏覽總排名、各階段榮耀名單與歷年成績查詢。</p>
          </Link>
        </div>

        {/* 我的個人完賽履歷清單 */}
        <section className="rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-white">🏆 我的個人完賽履歷</h2>
              <p className="text-xs text-zinc-400 mt-1">
                總累積完賽場次：<span className="text-amber-400 font-bold">{myRecords.length} 場</span>
                （🏊‍♂️ 鐵人三項：{triCount} 場 ｜ 🚴‍♂️ 公路單車：{cycCount} 場）
              </p>
            </div>

            <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterType === "all" ? "bg-amber-500 text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                全部 ({myRecords.length})
              </button>
              <button
                onClick={() => setFilterType("triathlon")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterType === "triathlon" ? "bg-amber-500 text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                🏊‍♂️ 鐵人三項 ({triCount})
              </button>
              <button
                onClick={() => setFilterType("cycling")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterType === "cycling" ? "bg-amber-500 text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                🚴‍♂️ 公路單車 ({cycCount})
              </button>
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl space-y-3">
              <p className="text-sm text-zinc-400">目前此分類尚無完賽紀錄。</p>
              <Link
                href="/profile/new-record"
                className="inline-block px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold hover:bg-amber-500/20 transition"
              >
                立即新增完賽紀錄 →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-800 text-zinc-400 text-xs uppercase font-mono">
                  <tr>
                    <th className="py-3 px-4">賽事類型</th>
                    <th className="py-3 px-4">賽事名稱 (Event Name)</th>
                    <th className="py-3 px-4">參賽日期</th>
                    <th className="py-3 px-4">組別</th>
                    <th className="py-3 px-4">團隊</th>
                    <th className="py-3 px-4">完賽時間</th>
                    <th className="py-3 px-4 text-right">操作管理</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredRecords.map((record) => (
                    <tr key={`${record.source_table}-${record.id}`} className="hover:bg-zinc-900/40 transition">
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold border ${
                          record.sport_type === "cycling"
                            ? "bg-red-500/10 border-red-500/30 text-red-400"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        }`}>
                          {record.sport_type === "cycling" ? "🚴‍♂️ 公路單車" : "🏊‍♂️ 鐵人三項"}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-white">{record.event_name}</td>
                      <td className="py-4 px-4 text-zinc-300 font-mono text-xs whitespace-nowrap">{record.race_date}</td>
                      <td className="py-4 px-4 text-zinc-400 text-xs">{record.category || "-"}</td>
                      <td className="py-4 px-4 text-zinc-400 text-xs">{record.sport_team || "-"}</td>
                      <td className="py-4 px-4 text-emerald-400 font-mono font-bold whitespace-nowrap">{record.result_time || "完賽"}</td>
                      <td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(record)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold transition cursor-pointer"
                        >
                          編輯
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(record)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold transition cursor-pointer"
                        >
                          刪除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>

      {/* 編輯互動視窗 (Modal) */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center px-4 z-50">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-black text-white">✏️ 編輯完賽紀錄</h3>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="text-zinc-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">賽事名稱</label>
                <input
                  type="text"
                  required
                  value={editEventName}
                  onChange={(e) => setEditEventName(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">參賽日期</label>
                  <input
                    type="date"
                    required
                    value={editRaceDate}
                    onChange={(e) => setEditRaceDate(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">參賽組別</label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">完賽時間</label>
                  <input
                    type="text"
                    value={editResultTime}
                    onChange={(e) => setEditResultTime(e.target.value)}
                    placeholder="例如：03:30:00"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">所屬團隊</label>
                  <input
                    type="text"
                    value={editSportTeam}
                    onChange={(e) => setEditSportTeam(e.target.value)}
                    placeholder="例如：醫護鐵人"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 text-zinc-300 font-bold text-sm hover:bg-zinc-800 transition cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-sm hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {saving ? "儲存中..." : "儲存變更"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
