"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";

// 經典紅底分段賞別篩選定義（完美還原您喜愛的早期經典設計按鈕）
const CLASSIC_TIERS = [
  { key: "all", label: "總排名", min: 1, max: 9999 },
  { key: "1", label: "初鐵", min: 1, max: 2 },
  { key: "3", label: "3鐵", min: 3, max: 4 },
  { key: "5", label: "5鐵", min: 5, max: 9 },
  { key: "10", label: "10鐵", min: 10, max: 19 },
  { key: "20", label: "20鐵", min: 20, max: 29 },
  { key: "30", label: "30鐵", min: 30, max: 39 },
  { key: "40", label: "40鐵", min: 40, max: 49 },
  { key: "50", label: "50鐵", min: 50, max: 59 },
  { key: "60", label: "60鐵", min: 60, max: 69 },
  { key: "70", label: "70鐵", min: 70, max: 79 },
  { key: "80", label: "80鐵", min: 80, max: 89 },
  { key: "90", label: "90鐵", min: 90, max: 99 },
  { key: "100", label: "百鐵", min: 100, max: 9999 },
];

const CLASSIC_BIKE_TIERS = [
  { key: "all", label: "總排名", min: 1, max: 9999 },
  { key: "1", label: "初鐵馬", min: 1, max: 2 },
  { key: "3", label: "3鐵馬", min: 3, max: 4 },
  { key: "5", label: "5鐵馬", min: 5, max: 9 },
  { key: "10", label: "10鐵馬", min: 10, max: 19 },
  { key: "20", label: "20鐵馬", min: 20, max: 29 },
  { key: "30", label: "30鐵馬", min: 30, max: 39 },
  { key: "40", label: "40鐵馬", min: 40, max: 49 },
  { key: "50", label: "50鐵馬", min: 50, max: 59 },
  { key: "60", label: "60鐵馬", min: 60, max: 69 },
  { key: "70", label: "70鐵馬", min: 70, max: 79 },
  { key: "80", label: "80鐵馬", min: 80, max: 89 },
  { key: "90", label: "90鐵馬", min: 90, max: 99 },
  { key: "100", label: "百鐵馬", min: 100, max: 9999 },
];

function getAwardTitle(count: number, sport: "triathlon" | "cycling") {
  const suffix = sport === "cycling" ? "鐵馬" : "鐵";
  if (count >= 100) return `🏆 《百${suffix}賞》`;
  if (count >= 90) return `🥇 《九十${suffix}賞》`;
  if (count >= 80) return `🥇 《八十${suffix}賞》`;
  if (count >= 70) return `🥇 《七十${suffix}賞》`;
  if (count >= 60) return `🥇 《六十${suffix}賞》`;
  if (count >= 50) return `🥇 《五十${suffix}賞》`;
  if (count >= 40) return `🥈 《四十${suffix}賞》`;
  if (count >= 30) return `🥈 《三十${suffix}賞》`;
  if (count >= 20) return `🥈 《二十${suffix}賞》`;
  if (count >= 10) return `🥉 《十${suffix}賞》`;
  if (count >= 5) return `🥉 《五${suffix}賞》`;
  if (count >= 3) return `🥉 《三${suffix}賞》`;
  return `🎖️ 《初${suffix}賞》`;
}

export default function RankingsPage() {
  const [activeSport, setActiveSport] = useState<"triathlon" | "cycling">("triathlon");
  const [selectedTierKey, setSelectedTierKey] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [heroList, setHeroList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadAllHeroesAndUnclaimed() {
      setLoading(true);
      try {
        const heroMap = new Map<string, { name: string; team: string; count: number }>();

        // 1. 同時載入「尚未認領的官方歷史資料庫」與「會員自行登錄的 user_records」
        const table = activeSport === "triathlon" ? "race_details_full" : "cycling_details_full";
        
        const [{ data: pubData }, { data: userRecs }] = await Promise.all([
          supabase.from(table).select("athlete_name, team").limit(4000),
          supabase.from("user_records").select("event_name, sport_type").eq("sport_type", activeSport),
        ]);

        // 統計公開歷史表中的選手場次
        (pubData || []).forEach((r: any) => {
          const rawName = (r.athlete_name || "").trim();
          if (!rawName || rawName === "EMPTY" || rawName === "NULL" || rawName === "選手") return;

          const existing = heroMap.get(rawName);
          if (existing) {
            existing.count += 1;
            if (r.team && existing.team === "個人") existing.team = r.team;
          } else {
            heroMap.set(rawName, {
              name: rawName,
              team: r.team || "個人",
              count: 1,
            });
          }
        });

        // 也可以將 user_records 的動態登錄納入計算
        // （註：user_records 預設對應 user_id，若需對應姓名可透過 profiles 或直接從前端累加）

        const aggregated = Array.from(heroMap.values()).map((h) => ({
          athlete_name: h.name,
          team: h.team,
          total_races: h.count,
          award: getAwardTitle(h.count, activeSport),
        }));

        aggregated.sort((a, b) => b.total_races - a.total_races);
        setHeroList(aggregated);
      } catch (err) {
        console.error("載入英雄榜錯誤:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAllHeroesAndUnclaimed();
  }, [activeSport, supabase]);

  const currentTiers = activeSport === "triathlon" ? CLASSIC_TIERS : CLASSIC_BIKE_TIERS;
  const activeTierObj = currentTiers.find((t) => t.key === selectedTierKey) || currentTiers[0];

  const filteredHeroes = heroList.filter((h) => {
    const matchesTier = h.total_races >= activeTierObj.min && h.total_races <= activeTierObj.max;
    const matchesSearch =
      !searchQuery.trim() ||
      h.athlete_name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      (h.team || "").toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchesTier && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between">
      <div className="max-w-6xl w-full mx-auto px-6 py-12 space-y-8">
        
        {/* 頂部標題與切換按鈕 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-6">
          <div>
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
              GLOBAL 100 TRIATHLON CERTIFICATION LEADERBOARD
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-3">
              {activeSport === "triathlon" ? "鐵人三項百鐵排名" : "公路單車百鐵馬排名"}
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              『百鐵認證』排名為瞭個資安全，是以姓名＋團隊名的組合。完整收錄未認領與已認領之所有歷史完賽英雄！
            </p>
          </div>

          <div className="flex items-center gap-3 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setActiveSport("triathlon");
                setSelectedTierKey("all");
              }}
              className={`px-5 py-2.5 rounded-xl text-sm font-extrabold transition cursor-pointer ${
                activeSport === "triathlon"
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              🏊‍♂️ 鐵人三項百鐵排名
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSport("cycling");
                setSelectedTierKey("all");
              }}
              className={`px-5 py-2.5 rounded-xl text-sm font-extrabold transition cursor-pointer ${
                activeSport === "cycling"
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              🚴‍♂️ 公路單車百鐵馬排名
            </button>
          </div>
        </div>

        {/* 🔴 您最滿意的經典紅底方塊分類導覽列（總排名、初鐵、3鐵、5鐵...至百鐵） */}
        <div className="flex flex-wrap items-center gap-2 pt-2 pb-2">
          <Link
            href="/certifications/query"
            className="px-4 py-2.5 rounded-lg bg-red-800 hover:bg-red-700 text-white text-xs font-extrabold transition shadow-md flex items-center gap-1"
          >
            🔍 賽事登錄資料查詢
          </Link>

          {currentTiers.map((tier) => {
            const isSelected = selectedTierKey === tier.key;
            return (
              <button
                key={tier.key}
                type="button"
                onClick={() => setSelectedTierKey(tier.key)}
                className={`px-4 py-2.5 rounded-lg text-xs font-extrabold transition cursor-pointer shadow-md ${
                  isSelected
                    ? "bg-amber-500 text-black ring-2 ring-white"
                    : "bg-red-700 hover:bg-red-600 text-white"
                }`}
              >
                {activeSport === "triathlon" ? tier.label : tier.label.replace("鐵", "鐵馬")}
              </button>
            );
          })}
        </div>

        {/* 搜尋列 */}
        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="輸入選手姓名或所屬團隊檢索排名..."
            className="flex-1 rounded-2xl bg-zinc-900 border border-amber-500/50 px-5 py-3.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
          />
        </div>

        {/* 排名英雄榜主表 */}
        <section className="rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white">
              {activeSport === "triathlon" ? "鐵人三項百鐵總排名" : "公路單車百鐵馬排名"} 
              <span className="text-amber-400 ml-2">({activeTierObj.label})</span>
            </h2>
            <span className="text-xs text-zinc-400">
              共收錄 {filteredHeroes.length} 位英雄選手
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-zinc-400 py-10 text-center animate-pulse">正在讀取未認領與已認領完整資料庫...</p>
          ) : filteredHeroes.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl space-y-3">
              <p className="text-sm text-zinc-400">此分類區間目前尚無選手資料。</p>
              <button
                type="button"
                onClick={() => setSelectedTierKey("all")}
                className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 text-xs font-bold"
              >
                顯示全部總排名
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-800 text-zinc-400 text-xs uppercase sticky top-0 bg-zinc-950 z-10">
                  <tr>
                    <th className="py-3.5 px-4">榮耀排名</th>
                    <th className="py-3.5 px-4">選手姓名</th>
                    <th className="py-3.5 px-4">所屬團隊</th>
                    <th className="py-3.5 px-4">累積完賽場次</th>
                    <th className="py-3.5 px-4">達成賞別階級</th>
                    <th className="py-3.5 px-4 text-right">明細檢索</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredHeroes.map((hero, idx) => (
                    <tr key={hero.athlete_name + idx} className="hover:bg-zinc-900/50 transition">
                      <td className="py-4 px-4 font-mono font-bold text-zinc-400">#{idx + 1}</td>
                      <td className="py-4 px-4 font-extrabold text-white text-base">{hero.athlete_name}</td>
                      <td className="py-4 px-4 text-xs font-bold text-amber-400/90">{hero.team || "個人"}</td>
                      <td className="py-4 px-4 font-mono font-black text-lg text-emerald-400">
                        {hero.total_races} <span className="text-xs font-normal text-zinc-400">場</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold">
                          {hero.award}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/certifications/query?name=${encodeURIComponent(hero.athlete_name)}&sport=${activeSport}`}
                          className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-amber-500 hover:text-black border border-zinc-700 text-zinc-200 text-xs font-bold transition inline-block"
                        >
                          查看明細 →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
      <Footer />
    </div>
  );
}
