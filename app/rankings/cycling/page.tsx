"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function RankingsAndQueryPage() {
  const [activeSport, setActiveSport] = useState<"triathlon" | "cycling">("triathlon");
  const [searchQuery, setSearchQuery] = useState("");
  const [heroList, setHeroList] = useState<any[]>([]);
  const [raceRecords, setRaceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (activeSport === "triathlon") {
          // 1. 讀取鐵人英雄榜
          const { data: heroes } = await supabase
            .from("hero_rankings")
            .select("*")
            .order("total_races", { ascending: false })
            .limit(100);
          setHeroList(heroes || []);

          // 2. 讀取鐵人完賽紀錄明細
          let query = supabase.from("race_details_full").select("*").order("race_date", { ascending: false }).limit(100);
          if (searchQuery.trim()) {
            query = supabase
              .from("race_details_full")
              .select("*")
              .or(`athlete_name.ilike.%${searchQuery.trim()}%,race_name.ilike.%${searchQuery.trim()}%,team.ilike.%${searchQuery.trim()}%`)
              .limit(100);
          }
          const { data: details } = await query;
          setRaceRecords(details || []);
        } else {
          // 公路單車百鐵馬：從 cycling_details_full 統計排行榜與明細
          let query = supabase.from("cycling_details_full").select("*").order("race_date", { ascending: false }).limit(200);
          if (searchQuery.trim()) {
            query = supabase
              .from("cycling_details_full")
              .select("*")
              .or(`athlete_name.ilike.%${searchQuery.trim()}%,race_name.ilike.%${searchQuery.trim()}%`)
              .limit(200);
          }
          const { data: cycDetails } = await query;
          const validDetails = (cycDetails || []).filter((r: any) => r.athlete_name && r.athlete_name !== "EMPTY");
          setRaceRecords(validDetails);

          // 動態聚合百鐵馬英雄榜
          const countMap: Record<string, { athlete_name: string; total_races: number; latest_race: string }> = {};
          validDetails.forEach((r: any) => {
            const name = r.athlete_name.trim();
            if (!countMap[name]) {
              countMap[name] = { athlete_name: name, total_races: 0, latest_race: r.race_name || "" };
            }
            countMap[name].total_races += 1;
          });
          const aggregatedHeroes = Object.values(countMap).sort((a, b) => b.total_races - a.total_races);
          setHeroList(aggregatedHeroes);
        }
      } catch (err) {
        console.error("載入英雄榜與查詢資料錯誤:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activeSport, searchQuery, supabase]);

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between">
      <div className="max-w-6xl w-full mx-auto px-6 py-12 space-y-10">
        
        {/* 頁面標題與雙軌切換 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-6">
          <div>
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
              Global 100 Leaderboard & Records
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-3">
              成績查詢與百鐵英雄榜
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              同一頁面即時切換「鐵人三項」與「百鐵馬（公路單車）」英雄榜排名及歷年完賽紀錄明細。
            </p>
          </div>

          {/* 鐵人三項 vs 百鐵馬 大切換按鈕 */}
          <div className="flex items-center gap-3 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveSport("triathlon")}
              className={`px-5 py-2.5 rounded-xl text-sm font-extrabold transition cursor-pointer ${
                activeSport === "triathlon"
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              🏊‍♂️ 鐵人三項英雄榜
            </button>
            <button
              type="button"
              onClick={() => setActiveSport("cycling")}
              className={`px-5 py-2.5 rounded-xl text-sm font-extrabold transition cursor-pointer ${
                activeSport === "cycling"
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              🚴‍♂️ 百鐵馬（自行車）英雄榜
            </button>
          </div>
        </div>

        {/* 全域搜尋列 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`輸入選手姓名、賽事名稱（如：普悠瑪、戀戀197）或團隊（如：醫護鐵人）即時檢索...`}
            className="flex-1 rounded-2xl bg-zinc-900 border border-amber-500/50 px-5 py-3.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
          />
          <Link
            href="/certifications/query"
            className="px-6 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-extrabold text-sm transition flex items-center justify-center shrink-0"
          >
            🔍 展開 13 欄完整賽事明細查詢 →
          </Link>
        </div>

        {/* 上半部：百鐵 / 百鐵馬 英雄榜總排名 */}
        <section className="rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white">
              {activeSport === "triathlon" ? "🏆 鐵人三項百鐵英雄榜" : "🚴‍♂️ 公路單車百鐵馬英雄榜"}
            </h2>
            <span className="text-xs text-zinc-400">
              共收錄 {heroList.length} 位榮耀選手
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-zinc-400 py-8 text-center animate-pulse">載入排行榜資料中...</p>
          ) : (
            <div className="overflow-x-auto max-h-[420px]">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-800 text-zinc-400 text-xs uppercase sticky top-0 bg-zinc-950">
                  <tr>
                    <th className="py-3 px-4">排名</th>
                    <th className="py-3 px-4">選手姓名</th>
                    <th className="py-3 px-4">累積完賽數</th>
                    <th className="py-3 px-4">認證等級 / 代表賽事</th>
                    <th className="py-3 px-4 text-right">明細檢索</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {heroList
                    .filter((h) => !searchQuery.trim() || (h.athlete_name || h.name || "").includes(searchQuery.trim()))
                    .map((hero, idx) => {
                      const name = hero.athlete_name || hero.name || "選手";
                      const count = hero.total_races || hero.race_count || hero.count || 1;
                      return (
                        <tr key={idx} className="hover:bg-zinc-900/50 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-zinc-400">#{idx + 1}</td>
                          <td className="py-3.5 px-4 font-extrabold text-amber-400">{name}</td>
                          <td className="py-3.5 px-4 font-mono font-black text-white">{count} 場</td>
                          <td className="py-3.5 px-4 text-xs text-zinc-300">
                            {hero.tier || hero.level || hero.latest_race || (count >= 100 ? "百鐵殿堂" : "榮耀鐵人")}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSearchQuery(name)}
                              className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-amber-500 hover:text-black text-xs font-bold transition cursor-pointer"
                            >
                              查看完賽紀錄
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 下半部：同頁直接顯示「賽事登錄資料與完賽紀錄查詢」 */}
        <section className="rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-amber-400">
                📋 {activeSport === "triathlon" ? "鐵人三項" : "百鐵馬（自行車）"}完賽紀錄明細
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                點選上方選手或輸入關鍵字，下方即刻同步列出歷年完賽紀錄。
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
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
                {raceRecords.map((rec, i) => (
                  <tr key={rec.id || i} className="hover:bg-zinc-900/40 transition">
                    <td className="py-3.5 px-4 font-bold text-amber-400 whitespace-nowrap">
                      {rec.athlete_name || "選手"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-zinc-300 whitespace-nowrap">
                      {rec.race_date || "-"}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {rec.race_name || rec.event_name || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-zinc-300">
                      {rec.category || rec.distance || "-"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-emerald-400 whitespace-nowrap">
                      {rec.finish_time || rec.result_time || "完賽"}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-zinc-400">
                      {rec.team || rec.sport_team || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
      <Footer />
    </div>
  );
}
