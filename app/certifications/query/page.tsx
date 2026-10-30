"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";

// 統一完賽日期格式為 YYYY-MM-DD（將 Mar 28, 2026 或 2024/5/19 全數轉為標準 2026-03-28、2024-05-19）
function normalizeDate(raw: any): string {
  if (!raw || raw === "-" || raw === "NULL" || raw === "EMPTY") return "歷史紀錄 (未載日期)";
  const str = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const slashParts = str.replace(/\//g, "-").split("-");
  if (slashParts.length === 3 && slashParts[0].length === 4) {
    return `${slashParts[0]}-${slashParts[1].padStart(2, "0")}-${slashParts[2].padStart(2, "0")}`;
  }
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  return str;
}

// 統一完賽時間格式為 HH:MM:SS（例如將 3:00:00 自動補零為 03:00:00）
function normalizeTime(raw: any): string {
  if (!raw || raw === "-" || raw === "NULL" || raw === "EMPTY" || raw === "完賽") {
    return "完賽 (認證通過)";
  }
  const str = String(raw).trim();
  const match = str.match(/^(\d{1,2}):(\d{1,2}):(\d{1,2})(.*)$/);
  if (match) {
    return `${match[1].padStart(2, "0")}:${match[2].padStart(2, "0")}:${match[3].padStart(2, "0")}${match[4] || ""}`;
  }
  return str;
}

function formatCreatedAt(raw?: string): string {
  if (!raw) return "官方歷史匯入";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return "官方歷史匯入";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
}

export default function FullQueryPage() {
  const [sportTab, setSportTab] = useState<"triathlon" | "cycling">("triathlon");
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const nameParam = params.get("name");
      const sportParam = params.get("sport");
      if (sportParam === "cycling" || sportParam === "triathlon") {
        setSportTab(sportParam);
      }
      if (nameParam) {
        setKeyword(nameParam);
        handleSearch(sportParam === "cycling" ? "cycling" : "triathlon", nameParam);
        return;
      }
    }
    handleSearch(sportTab, keyword);
  }, []);

  const handleSearch = async (tab = sportTab, kw = keyword) => {
    setLoading(true);
    try {
      const table = tab === "cycling" ? "cycling_details_full" : "race_details_full";
      let pubQuery = supabase.from(table).select("*").limit(250);

      if (kw.trim()) {
        pubQuery = supabase
          .from(table)
          .select("*")
          .or(`athlete_name.ilike.%${kw.trim()}%,race_name.ilike.%${kw.trim()}%`)
          .limit(250);
      }

      const [pubRes, userRecRes, sessionRes] = await Promise.all([
        pubQuery,
        supabase.from("user_records").select("*").eq("sport_type", tab).order("created_at", { ascending: false }),
        supabase.auth.getSession(),
      ]);

      const currentUser = sessionRes.data?.session?.user;
      if (currentUser?.email) {
        const em = currentUser.email.toLowerCase();
        if (em.includes("evelny") || em.includes("pianopub") || em.includes("novem")) {
          setIsAdmin(true);
        }
      }
      const unifiedList: any[] = [];
      const seenKeys = new Set<string>();

      // 1. 先放入 user_records 最新登錄紀錄（包含精確登錄年月日時分秒）
      (userRecRes.data || []).forEach((ur: any) => {
        let athleteName = "洪緯欣";
        if (currentUser && ur.user_id === currentUser.id) {
          const email = (currentUser.email || "").toLowerCase();
          const metaName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || "";
          if (email.includes("pianopub") || metaName.includes("陳彥良")) athleteName = "陳彥良";
          else if (metaName === "Wei-hsin Hung" || email.includes("evelny")) athleteName = "洪緯欣";
          else if (metaName) athleteName = metaName;
        }

        const rName = (ur.event_name || "認證賽事").trim();
        const stdDate = normalizeDate(ur.match_date);
        const stdTime = normalizeTime(ur.result_time);
        const teamName = ur.sport_team || "醫護鐵人";

        if (
          !kw.trim() ||
          athleteName.toLowerCase().includes(kw.trim().toLowerCase()) ||
          rName.toLowerCase().includes(kw.trim().toLowerCase()) ||
          teamName.toLowerCase().includes(kw.trim().toLowerCase())
        ) {
          const key = `${athleteName}-${rName}-${stdDate}`;
          seenKeys.add(key);
          unifiedList.push({
            id: `ur-${ur.id}`,
            athlete_name: athleteName,
            race_date: stdDate,
            race_name: rName,
            category: ur.category || (tab === "cycling" ? "100K 公路單車" : "51.5K 標準鐵人"),
            finish_time: stdTime,
            team: teamName,
            submitted_at: formatCreatedAt(ur.created_at),
          });
        }
      });

      // 2. 併入公開歷史資料表 (race_details_full / cycling_details_full)
      (pubRes.data || []).forEach((r: any) => {
        const athleteName = (r.athlete_name || "").trim();
        if (!athleteName || athleteName === "EMPTY" || athleteName === "NULL") return;
        const rName = (r.race_name || r.event_name || "-").trim();
        const stdDate = normalizeDate(r.race_date || r.match_date);
        const stdTime = normalizeTime(r.finish_time || r.result_time);
        const teamName = r.team || r.sport_team || "個人";

        const key = `${athleteName}-${rName}-${stdDate}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          unifiedList.push({
            id: r.id || key,
            athlete_name: athleteName,
            race_date: stdDate,
            race_name: rName,
            category: r.category || r.distance || (tab === "cycling" ? "公路單車認證" : "標準鐵人認證"),
            finish_time: stdTime,
            team: teamName,
            submitted_at: formatCreatedAt(r.created_at),
          });
        }
      });

      // 依完賽日期由新到舊排序（有明確 YYYY-MM-DD 的排前面）
      unifiedList.sort((a, b) => {
        const aValid = /^\d{4}-\d{2}-\d{2}$/.test(a.race_date);
        const bValid = /^\d{4}-\d{2}-\d{2}$/.test(b.race_date);
        if (aValid && !bValid) return -1;
        if (!aValid && bValid) return 1;
        return b.race_date.localeCompare(a.race_date);
      });

      setResults(unifiedList);
    } catch (err) {
      console.error("查詢錯誤:", err);
    } finally {
      setLoading(false);
    }
  };

  
  const handleAdminDeleteSingleRow = async (row: any) => {
    if (!confirm(`確定要從資料庫徹底刪除「${row.athlete_name} - ${row.race_name}」這筆紀錄嗎？`)) return;
    try {
      await supabase.from("user_records").delete().eq("event_name", row.race_name);
      await supabase.from("race_details_full").delete().eq("athlete_name", row.athlete_name).eq("race_name", row.race_name);
      await supabase.from("cycling_details_full").delete().eq("athlete_name", row.athlete_name).eq("race_name", row.race_name);
      setResults((prev) => prev.filter((item) => !(item.athlete_name === row.athlete_name && item.race_name === row.race_name && item.race_date === row.race_date)));
      alert("✅ 已徹底刪除此筆紀錄！");
    } catch (e: any) {
      alert("刪除失敗：" + e.message);
    }
  };

  return (
    <div translate="no" className="notranslate min-h-screen bg-[#070709] text-white flex flex-col justify-between">
      <div className="max-w-6xl w-full mx-auto px-6 py-12 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-amber-400">
              賽事登錄資料與完賽紀錄查詢
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              支援「鐵人三項」與「百鐵馬（自行車）」雙軌檢索。所有完賽日期統一為 YYYY-MM-DD，完賽時間統一為 HH:MM:SS，並顯示登錄時間戳記。
            </p>
          </div>
          <Link
            href="/rankings"
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-extrabold transition shrink-0"
          >
            🏆 前往百鐵 & 百鐵馬英雄榜
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setSportTab("triathlon");
              handleSearch("triathlon", keyword);
            }}
            className={`px-6 py-3 rounded-2xl text-sm font-extrabold transition cursor-pointer ${
              sportTab === "triathlon"
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white"
            }`}
          >
            🏊‍♂️ 鐵人三項完賽紀錄查詢
          </button>
          <button
            type="button"
            onClick={() => {
              setSportTab("cycling");
              handleSearch("cycling", keyword);
            }}
            className={`px-6 py-3 rounded-2xl text-sm font-extrabold transition cursor-pointer ${
              sportTab === "cycling"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white"
            }`}
          >
            🚴‍♂️ 鐵馬（自行車）完賽紀錄查詢
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(sportTab, keyword);
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="輸入選手姓名（如：陳彥良、洪緯欣）、賽事名稱（如：普悠瑪、戀戀197）或團隊..."
            className="flex-1 rounded-2xl bg-zinc-900 border border-amber-500/50 px-5 py-3.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
          />
          <button
            type="submit"
            className="px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm transition cursor-pointer"
          >
            搜尋紀錄
          </button>
        </form>

        <div className="rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 shadow-2xl overflow-x-auto">
          {loading ? (
            <p className="text-center py-10 text-zinc-400 animate-pulse">檢索並格式化完賽資料庫中...</p>
          ) : results.length === 0 ? (
            <p className="text-center py-10 text-zinc-400">查無符合條件的完賽紀錄。</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800 text-zinc-400 text-xs uppercase font-mono">
                <tr>
                  <th className="py-3.5 px-4">姓名 (NAME)</th>
                  <th className="py-3.5 px-4">完賽日期 (YYYY-MM-DD)</th>
                  <th className="py-3.5 px-4">賽事名稱 (RACE NAME)</th>
                  <th className="py-3.5 px-4">參賽組別</th>
                  <th className="py-3.5 px-4">完賽時間 (HH:MM:SS)</th>
                  <th className="py-3.5 px-4">所屬團隊</th>
                  <th className="py-3.5 px-4">登錄時間 (年-月-日 時:分:秒)</th>
                  {isAdmin && <th className="py-3.5 px-4 text-right">管理操作</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {results.map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-zinc-900/40 transition">
                    <td className="py-4 px-4 font-bold text-amber-400 whitespace-nowrap">{r.athlete_name}</td>
                    <td className="py-4 px-4 font-mono text-xs text-zinc-200 whitespace-nowrap">{r.race_date}</td>
                    <td className="py-4 px-4 font-bold text-white">{r.race_name}</td>
                    <td className="py-4 px-4 text-xs text-zinc-300">{r.category}</td>
                    <td className="py-4 px-4 font-mono text-xs font-bold text-emerald-400 whitespace-nowrap">
                      {r.finish_time}
                    </td>
                    <td className="py-4 px-4 text-xs text-amber-400/90 font-semibold whitespace-nowrap">{r.team}</td>
                    <td className="py-4 px-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">{r.submitted_at}</td>
                    {isAdmin && (
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleAdminDeleteSingleRow(r)}
                          className="px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-600 hover:text-white border border-red-500/30 text-red-400 text-xs font-bold transition cursor-pointer"
                        >
                          刪除
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
      <Footer />
    </div>
  );
}
