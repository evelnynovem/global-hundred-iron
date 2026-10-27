"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function ClaimRecordsPage() {
  const [activeTab, setActiveTab] = useState<"triathlon" | "cycling">("triathlon");
  const [user, setUser] = useState<any>(null);
  const [candidateRecords, setCandidateRecords] = useState<any[]>([]);
  const [claimedKeys, setClaimedKeys] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient();

  const normalizeKey = (name: string, date: string) => {
    const cleanName = (name || "").trim();
    const cleanDate = (date || "").trim().replace(/\//g, "-");
    return `${cleanName}-${cleanDate}`;
  };

  useEffect(() => {
    async function loadClaimable() {
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

        // 1. 讀取該用戶在 user_records 中已經認領/登錄過的紀錄
        const { data: myRecs } = await supabase
          .from("user_records")
          .select("event_name, match_date")
          .eq("user_id", currentUser.id);

        const claimed = new Set<string>();
        (myRecs || []).forEach((r: any) => {
          claimed.add(normalizeKey(r.event_name, r.match_date));
        });
        setClaimedKeys(claimed);

        // 2. 讀取歷史資料表
        const table = activeTab === "cycling" ? "cycling_details_full" : "race_details_full";
        const { data: hist } = await supabase
          .from(table)
          .select("*")
          .eq("login_email", email);

        setCandidateRecords(hist || []);
        setSelectedIds(new Set());
      } catch (err) {
        console.error("載入歷史成績錯誤:", err);
      } finally {
        setLoading(false);
      }
    }
    loadClaimable();
  }, [activeTab, supabase]);

  const toggleSelect = (id: string, isAlreadyClaimed: boolean) => {
    if (isAlreadyClaimed) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    const unclaimedIds = candidateRecords
      .filter((r) => !claimedKeys.has(normalizeKey(r.race_name || r.event_name, r.race_date || r.match_date)))
      .map((r) => r.id);
    setSelectedIds(new Set(unclaimedIds));
  };

  const handleClaimSubmit = async () => {
    if (selectedIds.size === 0 || !user) return;
    setSubmitting(true);
    try {
      const toInsert = candidateRecords
        .filter((r) => selectedIds.has(r.id))
        .map((r) => ({
          user_id: user.id,
          event_name: (r.race_name || r.event_name || "認證賽事").trim(),
          category: r.category || r.distance || "51.5K 標準鐵人",
          match_date: (r.race_date || r.match_date || "").replace(/\//g, "-"),
          result_time: r.finish_time || r.result_time || "完賽",
          sport_type: activeTab,
        }));

      const { error } = await supabase.from("user_records").insert(toInsert);
      if (error) throw error;

      const updatedClaimed = new Set(claimedKeys);
      toInsert.forEach((item) => {
        updatedClaimed.add(normalizeKey(item.event_name, item.match_date));
      });
      setClaimedKeys(updatedClaimed);
      setSelectedIds(new Set());
      alert(`🎉 成功認領 ${toInsert.length} 筆歷史完賽紀錄！已標示為「已認領」並同步至個人履歷。`);
    } catch (err: any) {
      alert("❌ 認領失敗：" + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between">
      <div className="max-w-5xl w-full mx-auto px-6 py-12 space-y-8">
        
        <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
          <div>
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
              LEGACY RECORDS CLAIM
            </span>
            <h1 className="text-3xl font-black text-white mt-2">
              歷史成績智慧認領
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              系統自動比對您的歷史完賽紀錄，已認領過的賽事會直接標示「✅ 已認領」。
            </p>
          </div>
          <Link
            href="/profile"
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs sm:text-sm font-bold rounded-xl transition"
          >
            ← 返回會員中心
          </Link>
        </div>

        {/* 雙軌頁籤 */}
        <div className="grid grid-cols-2 border-b border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab("triathlon")}
            className={`py-3.5 text-sm font-extrabold border-b-2 transition cursor-pointer ${
              activeTab === "triathlon"
                ? "border-amber-400 text-amber-400 bg-amber-500/5"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            🏊‍♂️ 鐵人三項歷史成績認領
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cycling")}
            className={`py-3.5 text-sm font-extrabold border-b-2 transition cursor-pointer ${
              activeTab === "cycling"
                ? "border-amber-400 text-amber-400 bg-amber-500/5"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            🚴‍♂️ 公路單車(百鐵馬)歷史成績認領
          </button>
        </div>

        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4 flex items-center justify-between">
          <div className="text-sm text-zinc-300">
            找到 <span className="text-amber-400 font-bold">{candidateRecords.length}</span> 筆紀錄，已勾選 <span className="text-emerald-400 font-bold">{selectedIds.size}</span> 筆
          </div>
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition cursor-pointer"
          >
            一鍵全選未認領賽事
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-zinc-400 animate-pulse">比對歷史資料庫中...</div>
        ) : (
          <div className="rounded-3xl bg-zinc-950 border border-zinc-800/80 divide-y divide-zinc-900 overflow-hidden shadow-2xl">
            {candidateRecords.map((rec) => {
              const name = rec.race_name || rec.event_name || "認證賽事";
              const date = rec.race_date || rec.match_date || "";
              const isClaimed = claimedKeys.has(normalizeKey(name, date));
              const isSelected = selectedIds.has(rec.id);

              return (
                <div
                  key={rec.id}
                  onClick={() => toggleSelect(rec.id, isClaimed)}
                  className={`p-5 flex items-center justify-between gap-4 transition ${
                    isClaimed
                      ? "bg-zinc-950/60 opacity-85"
                      : "hover:bg-zinc-900/50 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={isClaimed || isSelected}
                      disabled={isClaimed}
                      onChange={() => {}}
                      className="h-5 w-5 rounded border-zinc-700 bg-zinc-900 accent-amber-500"
                    />
                    <div className="space-y-1">
                      <div className="text-base font-extrabold text-white flex items-center gap-2.5">
                        {name}
                        {isClaimed && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-extrabold">
                            ✅ 已認領
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-3">
                        <span>組別：{rec.category || rec.distance || "-"}</span>
                        <span>日期：{date}</span>
                        <span>時間：{rec.finish_time || rec.result_time || "完賽"}</span>
                        <span className="text-amber-400 font-semibold">團隊：{rec.team || "醫護鐵人"}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {isClaimed ? (
                      <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                        已歸入完賽履歷
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold">
                        {isSelected ? "已勾選" : "點擊勾選認領"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            disabled={selectedIds.size === 0 || submitting}
            onClick={handleClaimSubmit}
            className="px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm transition shadow-lg shadow-amber-500/20 disabled:opacity-40 cursor-pointer"
          >
            {submitting ? "認領同步中..." : `確認送出勾選認領 (${selectedIds.size})`}
          </button>
        </div>

      </div>
      <Footer />
    </div>
  );
}
