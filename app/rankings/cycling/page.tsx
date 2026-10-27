"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";

const BASE_TRIATHLON_HEROES: { email: string; name: string; team: string; baseCount: number }[] = [
  { email: "pianopub1130@gmail.com", name: "陳彥良", team: "醫護鐵人", baseCount: 103 },
  { email: "sino.polar@msa.hinet.net", name: "孟亞輝", team: "高雄鐵人", baseCount: 98 },
  { email: "ironwayne703@gmail.com", name: "梁忠仁", team: "超級難止汗鐵人隊", baseCount: 86 },
  { email: "bx4ai@yahoo.com.tw", name: "曾亭彬", team: "台灣大腳ㄚ", baseCount: 82 },
  { email: "williamhuang1786@yahoo.com.tw", name: "黃偉靈", team: "個人", baseCount: 75 },
  { email: "mike740606@gmail.com", name: "劉光武", team: "KUANGYU光聿", baseCount: 68 },
  { email: "54albert@gmail.com", name: "鄭旭劭", team: "康軒鐵人隊", baseCount: 62 },
  { email: "c062k60@gmail.com", name: "韓德安", team: "醫護鐵人", baseCount: 55 },
  { email: "kouhakusei@gmail.com", name: "黃柏青", team: "DWD", baseCount: 51 },
  { email: "micsu@kimo.com", name: "蘇耀宗", team: "個人", baseCount: 46 },
  { email: "ylsun@nycu.edu.tw", name: "孫英玲", team: "個人", baseCount: 42 },
  { email: "chiu05290529@gmail.com", name: "邱正賢", team: "個人", baseCount: 38 },
  { email: "wucm8012@gmail.com", name: "吳蔡明", team: "崇越鐵人", baseCount: 35 },
  { email: "h202502@yahoo.com.tw", name: "許航紹", team: "醫護鐵人", baseCount: 32 },
  { email: "nellyhuang123@gmail.com", name: "黃浚平", team: "個人", baseCount: 28 },
  { email: "kaito276@gmail.com", name: "林昱辰", team: "個人", baseCount: 15 },
  { email: "panliuching@gmail.com", name: "潘柳青", team: "個人", baseCount: 12 },
  { email: "yuanyioyi.ching@gmail.com", name: "羅義清", team: "醫護鐵人", baseCount: 10 },
  { email: "mark780502@gmail.com", name: "呂模晉", team: "醫護鐵人", baseCount: 6 },
  { email: "emayo0331@gmail.com", name: "陳丹鳳", team: "個人", baseCount: 3 },
  { email: "evelny1985@gmail.com", name: "洪緯欣", team: "醫護鐵人", baseCount: 2 },
];

const BASE_CYCLING_HEROES: { email: string; name: string; team: string; baseCount: number }[] = [
  { email: "pianopub1130@gmail.com", name: "陳彥良", team: "醫護鐵人", baseCount: 53 },
  { email: "bx4ai@yahoo.com.tw", name: "曾亭彬", team: "台灣大腳ㄚ", baseCount: 49 },
  { email: "williamhuang1786@yahoo.com.tw", name: "黃偉靈 (HUANG WEI LING)", team: "個人", baseCount: 44 },
  { email: "mike740606@gmail.com", name: "劉光武", team: "KUANGYU光聿", baseCount: 35 },
  { email: "54albert@gmail.com", name: "鄭旭劭", team: "康軒鐵人隊", baseCount: 28 },
  { email: "c062k60@gmail.com", name: "韓德安", team: "醫護鐵人", baseCount: 25 },
  { email: "kouhakusei@gmail.com", name: "黃柏青", team: "DWD", baseCount: 22 },
  { email: "sino.polar@msa.hinet.net", name: "孟亞輝", team: "高雄鐵人", baseCount: 21 },
  { email: "micsu@kimo.com", name: "蘇耀宗", team: "個人", baseCount: 20 },
  { email: "ironwayne703@gmail.com", name: "梁忠仁", team: "超級難止汗鐵人隊", baseCount: 20 },
  { email: "ylsun@nycu.edu.tw", name: "孫英玲", team: "個人", baseCount: 19 },
  { email: "chiu05290529@gmail.com", name: "邱正賢", team: "個人", baseCount: 19 },
  { email: "wucm8012@gmail.com", name: "吳蔡明", team: "崇越鐵人", baseCount: 14 },
  { email: "kaito276@gmail.com", name: "林昱辰", team: "個人", baseCount: 14 },
  { email: "h202502@yahoo.com.tw", name: "許航紹", team: "醫護鐵人", baseCount: 14 },
  { email: "panliuching@gmail.com", name: "潘柳青", team: "個人", baseCount: 13 },
  { email: "charlez.h@gmail.com", name: "黃英棋", team: "個人", baseCount: 13 },
  { email: "yuanyioyi.ching@gmail.com", name: "羅義清", team: "醫護鐵人", baseCount: 12 },
  { email: "tony.wang@modenamotori.com.tw", name: "王志隆", team: "個人", baseCount: 12 },
  { email: "samchien333@gmail.com", name: "簡清山", team: "個人", baseCount: 12 },
  { email: "nellyhuang123@gmail.com", name: "黃浚平", team: "個人", baseCount: 12 },
  { email: "mark780502@gmail.com", name: "呂模晉", team: "醫護鐵人", baseCount: 10 },
  { email: "h02020315@yahoo.com.tw", name: "黃境畯", team: "紅斑馬", baseCount: 10 },
  { email: "emayo0331@gmail.com", name: "陳丹鳳", team: "個人", baseCount: 10 },
  { email: "uv1781021@gmail.com", name: "曹志瑋", team: "個人", baseCount: 9 },
  { email: "spgod33@gmail.com", name: "孫一弘", team: "個人", baseCount: 9 },
];

// 13 個正式賞別階段定義（從初鐵 1 場到百鐵 100 場）
const TIER_FILTERS = [
  { key: "all", min: 1, max: 9999, triLabel: "全部總榜", cycLabel: "全部總榜" },
  { key: "100", min: 100, max: 9999, triLabel: "《百鐵賞》(100+)", cycLabel: "《百鐵馬賞》(100+)" },
  { key: "90", min: 90, max: 99, triLabel: "《九十鐵賞》(90-99)", cycLabel: "《九十鐵馬賞》(90-99)" },
  { key: "80", min: 80, max: 89, triLabel: "《八十鐵賞》(80-89)", cycLabel: "《八十鐵馬賞》(80-89)" },
  { key: "70", min: 70, max: 79, triLabel: "《七十鐵賞》(70-79)", cycLabel: "《七十鐵馬賞》(70-79)" },
  { key: "60", min: 60, max: 69, triLabel: "《六十鐵賞》(60-69)", cycLabel: "《六十鐵馬賞》(60-69)" },
  { key: "50", min: 50, max: 59, triLabel: "《五十鐵賞》(50-59)", cycLabel: "《五十鐵馬賞》(50-59)" },
  { key: "40", min: 40, max: 49, triLabel: "《四十鐵賞》(40-49)", cycLabel: "《四十鐵馬賞》(40-49)" },
  { key: "30", min: 30, max: 39, triLabel: "《三十鐵賞》(30-39)", cycLabel: "《三十鐵馬賞》(30-39)" },
  { key: "20", min: 20, max: 29, triLabel: "《二十鐵賞》(20-29)", cycLabel: "《二十鐵馬賞》(20-29)" },
  { key: "10", min: 10, max: 19, triLabel: "《十鐵賞》(10-19)", cycLabel: "《十鐵馬賞》(10-19)" },
  { key: "5", min: 5, max: 9, triLabel: "《五鐵賞》(5-9)", cycLabel: "《五鐵馬賞》(5-9)" },
  { key: "3", min: 3, max: 4, triLabel: "《三鐵賞》(3-4)", cycLabel: "《三鐵馬賞》(3-4)" },
  { key: "1", min: 1, max: 2, triLabel: "《初鐵賞》(1-2)", cycLabel: "《初鐵馬賞》(1-2)" },
];

function getAwardTitle(count: number, sport: "triathlon" | "cycling") {
  const suffix = sport === "cycling" ? "鐵馬賞" : "鐵賞";
  if (count >= 100) return `🏆 《百${suffix}》`;
  if (count >= 90) return `🥇 《九十${suffix}》`;
  if (count >= 80) return `🥇 《八十${suffix}》`;
  if (count >= 70) return `🥇 《七十${suffix}》`;
  if (count >= 60) return `🥇 《六十${suffix}》`;
  if (count >= 50) return `🥇 《五十${suffix}》`;
  if (count >= 40) return `🥈 《四十${suffix}》`;
  if (count >= 30) return `🥈 《三十${suffix}》`;
  if (count >= 20) return `🥈 《二十${suffix}》`;
  if (count >= 10) return `🥉 《十${suffix}》`;
  if (count >= 5) return `🥉 《五${suffix}》`;
  if (count >= 3) return `🥉 《三${suffix}》`;
  return `🎖️ 《初${suffix}》`;
}

export default function RankingsPage() {
  const [activeSport, setActiveSport] = useState<"triathlon" | "cycling">("triathlon");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [heroList, setHeroList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function computeDynamicRankings() {
      setLoading(true);
      try {
        const baseList = activeSport === "triathlon" ? BASE_TRIATHLON_HEROES : BASE_CYCLING_HEROES;
        const heroMap = new Map<string, { name: string; email: string; team: string; baseCount: number; addedCount: number; dbCount: number }>();

        baseList.forEach((h) => {
          heroMap.set(h.name, {
            name: h.name,
            email: h.email,
            team: h.team,
            baseCount: h.baseCount,
            addedCount: 0,
            dbCount: 0,
          });
        });

        // 讀取公開完賽明細表 (哪怕只登錄過 1 筆的初鐵選手也全部納入統計！)
        const table = activeSport === "triathlon" ? "race_details_full" : "cycling_details_full";
        const { data: pubRecords } = await supabase
          .from(table)
          .select("athlete_name, login_email, team, race_date")
          .limit(3000);

        (pubRecords || []).forEach((r: any) => {
          const rawName = (r.athlete_name || "").trim();
          if (!rawName || rawName === "EMPTY" || rawName === "NULL" || rawName === "選手") return;

          const existing = heroMap.get(rawName);
          if (existing) {
            existing.dbCount += 1;
            if (r.team && existing.team === "個人") existing.team = r.team;
            if ((r.race_date || "").startsWith("2026") || (r.race_date || "").startsWith("2027")) {
              existing.addedCount += 1;
            }
          } else {
            heroMap.set(rawName, {
              name: rawName,
              email: r.login_email || "",
              team: r.team || "個人",
              baseCount: 0,
              addedCount: 0,
              dbCount: 1,
            });
          }
        });

        const finalHeroes = Array.from(heroMap.values())
          .map((item) => {
            const total = item.baseCount > 0
              ? Math.max(item.baseCount + item.addedCount, item.dbCount)
              : Math.max(item.dbCount, 1);
            return {
              athlete_name: item.name,
              team: item.team,
              total_races: total,
              award: getAwardTitle(total, activeSport),
            };
          })
          .filter((h) => h.total_races >= 1);

        finalHeroes.sort((a, b) => b.total_races - a.total_races);
        setHeroList(finalHeroes);
      } catch (err) {
        console.error("計算英雄榜統計錯誤:", err);
      } finally {
        setLoading(false);
      }
    }
    computeDynamicRankings();
  }, [activeSport, supabase]);

  const currentTierObj = TIER_FILTERS.find((t) => t.key === selectedTier) || TIER_FILTERS[0];

  const filteredHeroes = heroList.filter((h) => {
    const matchesTier = h.total_races >= currentTierObj.min && h.total_races <= currentTierObj.max;
    const matchesSearch =
      !searchQuery.trim() ||
      h.athlete_name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      (h.team || "").toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchesTier && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between">
      <div className="max-w-6xl w-full mx-auto px-6 py-12 space-y-8">
        
        {/* 頂部標題與雙軌英雄榜切換 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-6">
          <div>
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
              GLOBAL 100 TRIATHLON CERTIFICATION LEADERBOARD
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-3">
              全球百鐵 ＆ 百鐵馬榮耀英雄榜
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              完整收錄從《初鐵賞 / 初鐵馬賞 (1場)》、《三鐵賞》、《五鐵賞》、《十鐵賞》一路至《百鐵賞 / 百鐵馬賞》各階段認證英雄！
            </p>
          </div>

          <div className="flex items-center gap-3 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setActiveSport("triathlon");
                setSelectedTier("all");
              }}
              className={`px-5 py-2.5 rounded-xl text-sm font-extrabold transition cursor-pointer ${
                activeSport === "triathlon"
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              🏊‍♂️ 鐵人三項百鐵英雄榜
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSport("cycling");
                setSelectedTier("all");
              }}
              className={`px-5 py-2.5 rounded-xl text-sm font-extrabold transition cursor-pointer ${
                activeSport === "cycling"
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              🚴‍♂️ 公路單車百鐵馬英雄榜
            </button>
          </div>
        </div>

        {/* 🏅 完整 14 階段賞別分類快速篩選列（初鐵 / 三鐵 / 五鐵 / 十鐵 / 二十鐵 ... 至百鐵） */}
        <div className="rounded-3xl bg-zinc-950 border border-zinc-800/90 p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-400">
              🏅 點選下方賞別階段，直接檢視該階段榮耀選手名單：
            </span>
            {selectedTier !== "all" && (
              <button
                type="button"
                onClick={() => setSelectedTier("all")}
                className="text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
              >
                返回顯示全部階段 ✕
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {TIER_FILTERS.map((tier) => {
              const countInTier = heroList.filter((h) => h.total_races >= tier.min && h.total_races <= tier.max).length;
              const isSelected = selectedTier === tier.key;
              const label = activeSport === "triathlon" ? tier.triLabel : tier.cycLabel;

              return (
                <button
                  key={tier.key}
                  type="button"
                  onClick={() => setSelectedTier(tier.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? activeSport === "triathlon"
                        ? "bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20"
                        : "bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/20"
                      : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800"
                  }`}
                >
                  <span>{label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    isSelected ? "bg-black/20 text-white" : "bg-zinc-800 text-amber-400"
                  }`}>
                    {countInTier}人
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 搜尋與前往單場成績查詢按鈕 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="輸入選手姓名（如：陳彥良、曾亭彬、洪緯欣）或所屬團隊（如：醫護鐵人）檢索..."
            className="flex-1 rounded-2xl bg-zinc-900 border border-amber-500/50 px-5 py-3.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
          />
          <Link
            href="/certifications/query"
            className="px-6 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-400 font-extrabold text-sm transition flex items-center justify-center shrink-0"
          >
            🔍 前往「歷年賽事成績查詢」專頁 →
          </Link>
        </div>

        {/* 英雄榜排名主表 */}
        <section className="rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white">
              {activeSport === "triathlon" ? "🏆 鐵人三項百鐵英雄榜" : "🚴‍♂️ 公路單車百鐵馬英雄榜"}
              <span className="ml-2 text-sm font-bold text-amber-400">
                — {activeSport === "triathlon" ? currentTierObj.triLabel : currentTierObj.cycLabel}
              </span>
            </h2>
            <span className="text-xs text-amber-400 font-bold">
              此階段共 {filteredHeroes.length} 位認證選手
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-zinc-400 py-10 text-center animate-pulse">正在統計全體初鐵至百鐵選手數據...</p>
          ) : filteredHeroes.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl space-y-3">
              <p className="text-sm text-zinc-400">目前此賞別區間尚無符合條件之選手紀錄。</p>
              <button
                type="button"
                onClick={() => setSelectedTier("all")}
                className="px-4 py-2 rounded-xl bg-amber-500/15 text-amber-400 text-xs font-bold"
              >
                查看全部賞別總榜
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[650px]">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-800 text-zinc-400 text-xs uppercase sticky top-0 bg-zinc-950 z-10">
                  <tr>
                    <th className="py-3.5 px-4">榮耀排名</th>
                    <th className="py-3.5 px-4">選手姓名</th>
                    <th className="py-3.5 px-4">所屬團隊</th>
                    <th className="py-3.5 px-4">累積認證場次</th>
                    <th className="py-3.5 px-4">達成賞別階段</th>
                    <th className="py-3.5 px-4 text-right">歷年完賽紀錄</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredHeroes.map((hero, idx) => (
                    <tr key={hero.athlete_name + idx} className="hover:bg-zinc-900/50 transition">
                      <td className="py-4 px-4 font-mono font-black text-base">
                        {idx === 0 ? (
                          <span className="text-amber-400">👑 #1</span>
                        ) : idx === 1 ? (
                          <span className="text-zinc-200">🥈 #2</span>
                        ) : idx === 2 ? (
                          <span className="text-amber-600">🥉 #3</span>
                        ) : (
                          <span className="text-zinc-400">#{idx + 1}</span>
                        )}
                      </td>
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
