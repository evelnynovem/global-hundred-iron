"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function FullQueryPage() {
  const [sportTab, setSportTab] = useState<"triathlon" | "cycling">("triathlon");
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleSearch = async (tab = sportTab, kw = keyword) => {
    setLoading(true);
    try {
      const table = tab === "cycling" ? "cycling_details_full" : "race_details_full";
      let query = supabase.from(table).select("*").order("race_date", { ascending: false }).limit(150);

      if (kw.trim()) {
        query = supabase
          .from(table)
          .select("*")
          .or(`athlete_name.ilike.%${kw.trim()}%,race_name.ilike.%${kw.trim()}%`)
          .order("race_date", { ascending: false })
          .limit(150);
      }

      const { data } = await query;
      const valid = (data || []).filter((r: any) => r.athlete_name && r.athlete_name !== "EMPTY");
      setResults(valid);
    } catch (err) {
      console.error("查詢錯誤:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch(sportTab, keyword);
  }, [sportTab]);

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between">
      <div className="max-w-6xl w-full mx-auto px-6 py-12 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-amber-400">
              賽事登錄資料與完賽紀錄查詢
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              支援「鐵人三項」與「百鐵馬（自行車）」雙軌歷史與最新榮譽登錄完賽紀錄檢索。
            </p>
          </div>
          <Link
            href="/rankings"
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-extrabold transition shrink-0"
          >
            🏆 前往百鐵 & 百鐵馬英雄榜
          </Link>
        </div>

        {/* 鐵人三項 vs 鐵馬（自行車）雙軌切換 */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setSportTab("triathlon")}
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
            onClick={() => setSportTab("cycling")}
            className={`px-6 py-3 rounded-2xl text-sm font-extrabold transition cursor-pointer ${
              sportTab === "cycling"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white"
            }`}
          >
            🚴‍♂️ 鐵馬（自行車）完賽紀錄查詢
          </button>
        </div>

        {/* 搜尋框 */}
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
            placeholder="輸入選手姓名（如：洪緯欣）、賽事名稱（如：普悠瑪、戀戀197）或團隊..."
            className="flex-1 rounded-2xl bg-zinc-900 border border-amber-500/50 px-5 py-3.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
          />
          <button
            type="submit"
            className="px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm transition cursor-pointer"
          >
            搜尋紀錄
          </button>
        </form>

        {/* 結果表格 */}
        <div className="rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 shadow-2xl overflow-x-auto">
          {loading ? (
            <p className="text-center py-10 text-zinc-400 animate-pulse">檢索資料庫中...</p>
          ) : results.length === 0 ? (
            <p className="text-center py-10 text-zinc-400">查無符合條件的完賽紀錄。</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800 text-zinc-400 text-xs uppercase">
                <tr>
                  <th className="py-3 px-4">姓名 (Name)</th>
                  <th className="py-3 px-4">日期 (Date)</th>
                  <th className="py-3 px-4">賽事名稱 (Race Name)</th>
                  <th className="py-3 px-4">參賽組別</th>
                  <th className="py-3 px-4">完賽時間</th>
                  <th className="py-3 px-4">所屬團隊</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {results.map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-zinc-900/40 transition">
                    <td className="py-4 px-4 font-bold text-amber-400 whitespace-nowrap">{r.athlete_name}</td>
                    <td className="py-4 px-4 font-mono text-xs text-zinc-300 whitespace-nowrap">{r.race_date || "-"}</td>
                    <td className="py-4 px-4 font-bold text-white">{r.race_name || r.event_name || "-"}</td>
                    <td className="py-4 px-4 text-xs text-zinc-300">{r.category || r.distance || "-"}</td>
                    <td className="py-4 px-4 font-mono text-xs font-bold text-emerald-400 whitespace-nowrap">
                      {r.finish_time || r.result_time || "完賽"}
                    </td>
                    <td className="py-4 px-4 text-xs text-zinc-400">{r.team || r.sport_team || "-"}</td>
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
