"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";

interface UnifiedRecord {
  key: string;
  user_record_id?: string;
  public_record_id?: string;
  public_table?: "race_details_full" | "cycling_details_full";
  sport_type: "triathlon" | "cycling";
  event_name: string;
  race_date: string;
  category: string;
  result_time: string;
  sport_team: string;
  athlete_name: string;
}

const YEARS = Array.from({ length: 35 }, (_, i) => String(2028 - i));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [myRecords, setMyRecords] = useState<UnifiedRecord[]>([]);
  const [filterType, setFilterType] = useState<"all" | "triathlon" | "cycling">("all");
  const [loading, setLoading] = useState(true);

  // 編輯 Modal 狀態（含完整歷史資料與年/月/日選單）
  const [editingRecord, setEditingRecord] = useState<UnifiedRecord | null>(null);
  const [editEventName, setEditEventName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editYear, setEditYear] = useState("2026");
  const [editMonth, setEditMonth] = useState("01");
  const [editDay, setEditDay] = useState("01");
  const [editResultTime, setEditResultTime] = useState("");
  const [editSportTeam, setEditSportTeam] = useState("醫護鐵人");
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const normalizeDateStr = (d: string) => {
    if (!d) return "";
    const parts = d.trim().replace(/\//g, "-").split("-");
    if (parts.length === 3) {
      return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
    }
    return d.trim();
  };

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

      // 使用 Map 將 user_records 與歷史資料表 (race_details_full / cycling_details_full) 智慧合併，消除重複並保留最完整的歷史欄位！
      const recordMap = new Map<string, UnifiedRecord>();

      // 1. 先讀取歷史公開表 race_details_full (含有豐富的 team, category, finish_time 等歷史資料)
      if (email) {
        const { data: triRecords } = await supabase
          .from("race_details_full")
          .select("*")
          .eq("login_email", email);

        if (triRecords) {
          triRecords.forEach((r: any) => {
            const name = (r.race_name || r.event_name || "鐵人三項賽事").trim();
            const normDate = normalizeDateStr(r.race_date || r.match_date || "");
            const key = `tri-${name}-${normDate}`;
            recordMap.set(key, {
              key,
              public_record_id: r.id,
              public_table: "race_details_full",
              sport_type: "triathlon",
              event_name: name,
              race_date: normDate || r.race_date || "",
              category: r.category || r.distance || "51.5K 標準鐵人",
              result_time: r.finish_time || r.result_time || "完賽",
              sport_team: r.team || r.sport_team || "醫護鐵人",
              athlete_name: r.athlete_name || "洪緯欣",
            });
          });
        }

        const { data: cycRecords } = await supabase
          .from("cycling_details_full")
          .select("*")
          .eq("login_email", email);

        if (cycRecords) {
          cycRecords.forEach((r: any) => {
            const name = (r.race_name || r.event_name || "公路單車賽事").trim();
            const normDate = normalizeDateStr(r.race_date || r.match_date || "");
            const key = `cyc-${name}-${normDate}`;
            recordMap.set(key, {
              key,
              public_record_id: r.id,
              public_table: "cycling_details_full",
              sport_type: "cycling",
              event_name: name,
              race_date: normDate || r.race_date || "",
              category: r.category || r.distance || "100K 公路單車",
              result_time: r.finish_time || r.result_time || "完賽",
              sport_team: r.team || r.sport_team || "醫護鐵人",
              athlete_name: r.athlete_name || "洪緯欣",
            });
          });
        }
      }

      // 2. 讀取 user_records 並與歷史資料合併（若同一場比賽則把歷史表的團隊與組別補齊，不重複顯示兩列！）
      const { data: uRecords } = await supabase
        .from("user_records")
        .select("*")
        .eq("user_id", uid);

      if (uRecords) {
        uRecords.forEach((r: any) => {
          const sType = r.sport_type === "cycling" ? "cycling" : "triathlon";
          const prefix = sType === "cycling" ? "cyc" : "tri";
          const name = (r.event_name || r.race_name || "未命名賽事").trim();
          const normDate = normalizeDateStr(r.match_date || r.race_date || "");
          const key = `${prefix}-${name}-${normDate}`;

          const existing = recordMap.get(key);
          if (existing) {
            existing.user_record_id = r.id;
            if (r.category) existing.category = r.category;
            if (r.result_time) existing.result_time = r.result_time;
          } else {
            recordMap.set(key, {
              key,
              user_record_id: r.id,
              sport_type: sType,
              event_name: name,
              race_date: normDate || r.match_date || "",
              category: r.category || "51.5K 標準鐵人",
              result_time: r.result_time || "完賽",
              sport_team: "醫護鐵人",
              athlete_name: "洪緯欣",
            });
          }
        });
      }

      const unified = Array.from(recordMap.values());
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

  // 刪除紀錄（同步刪除 user_records 與公開歷史表對應紀錄）
  const handleDeleteRecord = async (record: UnifiedRecord) => {
    if (!confirm(`確定要刪除「${record.event_name} (${record.race_date})」這筆完賽紀錄嗎？`)) return;

    try {
      if (record.user_record_id) {
        await supabase.from("user_records").delete().eq("id", record.user_record_id);
      }
      if (record.public_record_id && record.public_table) {
        await supabase.from(record.public_table).delete().eq("id", record.public_record_id);
      }

      setMyRecords((prev) => prev.filter((r) => r.key !== record.key));
      alert("✅ 紀錄已成功刪除！");
    } catch (err: any) {
      alert("❌ 刪除失敗：" + (err.message || "未知錯誤"));
    }
  };

  // 開啟編輯視窗：完整帶出該筆歷史完賽紀錄的所有欄位（含年/月/日自動拆解帶入）
  const handleOpenEdit = (record: UnifiedRecord) => {
    setEditingRecord(record);
    setEditEventName(record.event_name || "");
    setEditCategory(record.category || "51.5K 標準鐵人");

    const norm = normalizeDateStr(record.race_date || "");
    const parts = norm.split("-");
    if (parts.length === 3) {
      setEditYear(parts[0]);
      setEditMonth(parts[1].padStart(2, "0"));
      setEditDay(parts[2].padStart(2, "0"));
    } else {
      setEditYear("2026");
      setEditMonth("01");
      setEditDay("01");
    }

    setEditResultTime(record.result_time || "完賽");
    setEditSportTeam(record.sport_team || "醫護鐵人");
  };

  // 儲存編輯結果（同步寫回 user_records 與 race_details_full / cycling_details_full）
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    setSaving(true);

    const newDateStr = `${editYear}-${editMonth.padStart(2, "0")}-${editDay.padStart(2, "0")}`;

    try {
      if (editingRecord.user_record_id) {
        const { error: uErr } = await supabase
          .from("user_records")
          .update({
            event_name: editEventName.trim(),
            category: editCategory.trim(),
            match_date: newDateStr,
            result_time: editResultTime.trim(),
          })
          .eq("id", editingRecord.user_record_id);
        if (uErr) throw uErr;
      }

      if (editingRecord.public_record_id && editingRecord.public_table) {
        const { error: pErr } = await supabase
          .from(editingRecord.public_table)
          .update({
            race_name: editEventName.trim(),
            category: editCategory.trim(),
            race_date: newDateStr,
            finish_time: editResultTime.trim(),
            team: editSportTeam.trim(),
          })
          .eq("id", editingRecord.public_record_id);
        if (pErr) throw pErr;
      }

      setMyRecords((prev) =>
        prev.map((r) =>
          r.key === editingRecord.key
            ? {
                ...r,
                event_name: editEventName.trim(),
                category: editCategory.trim(),
                race_date: newDateStr,
                result_time: editResultTime.trim(),
                sport_team: editSportTeam.trim(),
              }
            : r
        )
      );

      setEditingRecord(null);
      alert("✅ 歷史完賽紀錄已成功更新並同步！");
    } catch (err: any) {
      console.error("更新錯誤:", err);
      alert("❌ 更新失敗：" + (err.message || "未知錯誤"));
    } finally {
      setSaving(false);
    }
  };

  const triCount = myRecords.filter((r) => r.sport_type === "triathlon").length;
  const cycCount = myRecords.filter((r) => r.sport_type === "cycling").length;
  const filteredRecords = myRecords.filter((r) => (filterType === "all" ? true : r.sport_type === filterType));

  if (loading) {
    return (
      <div translate="no" className="notranslate min-h-screen bg-[#070709] text-white flex items-center justify-center">
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
                    <tr key={record.key} className="hover:bg-zinc-900/40 transition">
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
                      <td className="py-4 px-4 text-amber-400/90 font-semibold text-xs">{record.sport_team || "醫護鐵人"}</td>
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

      {/* 編輯互動視窗 (Modal) — 完整帶出該筆歷史紀錄的年/月/日選單、組別、時間與團隊 */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center px-4 z-50">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">✏️ 編輯完賽紀錄（已自動帶入歷史資料）</h3>
                <p className="text-xs text-zinc-400 mt-0.5">選手：{editingRecord.athlete_name || "洪緯欣"}</p>
              </div>
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

              {/* 參賽日期：年 / 月 / 日 下拉選單，直接帶入歷史紀錄原日期 */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">參賽日期 (年 / 月 / 日選單)</label>
                <div className="grid grid-cols-3 gap-2.5">
                  <select
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-amber-400 font-bold focus:border-amber-500 focus:outline-none"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y} 年</option>
                    ))}
                  </select>
                  <select
                    value={editMonth}
                    onChange={(e) => setEditMonth(e.target.value)}
                    className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-amber-400 font-bold focus:border-amber-500 focus:outline-none"
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m} 月</option>
                    ))}
                  </select>
                  <select
                    value={editDay}
                    onChange={(e) => setEditDay(e.target.value)}
                    className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-amber-400 font-bold focus:border-amber-500 focus:outline-none"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>{d} 日</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">參賽組別</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  placeholder="例如：51.5K 標準鐵人 / 39.5km"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">完賽時間</label>
                  <input
                    type="text"
                    value={editResultTime}
                    onChange={(e) => setEditResultTime(e.target.value)}
                    placeholder="例如：03:30:00 或 完賽"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm text-emerald-400 font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">所屬團隊 (自動帶入歷史資料)</label>
                  <input
                    type="text"
                    value={editSportTeam}
                    onChange={(e) => setEditSportTeam(e.target.value)}
                    placeholder="例如：醫護鐵人"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm text-amber-400 font-bold focus:border-amber-500 focus:outline-none"
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
