"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";

// 系統內建基準百鐵英雄榜與公路單車百鐵馬英雄榜（當選手有新登錄或認領時，系統會自動往上動態累加！）
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
  { email: "evelny1985@gmail.com", name: "洪緯欣", team: "醫護鐵人", baseCount: 2 },
];

// 根據您上傳的「公路單車百鐵馬英雄榜」Google Sheets 基準數據建立
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

        // 1. 讀取資料庫完賽明細並動態統計每位選手的場次
        const table = activeSport === "triathlon" ? "race_details_full" : "cycling_details_full";
        const { data: pubRecords } = await supabase.from(table).select("athlete_name, login_email, team, race_date");

        (pubRecords || []).forEach((r: any) => {
          const rawName = (r.athlete_name || "").trim();
          if (!rawName || rawName === "EMPTY" || rawName === "選手") return;

          const existing = heroMap.get(rawName);
          if (existing) {
            existing.dbCount += 1;
            // 若是 2026 年後新登錄的賽事，視為在基準之上動態累加（如陳彥良 103 + 新登錄 1 = 104 場）
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

        // 2. 結合基準場次與新登錄場次，計算最終統計場次並排序
        const finalHeroes = Array.from(heroMap.values()).map((item) => {
          const total = item.baseCount > 0
            ? Math.max(item.baseCount + item.addedCount, item.dbCount)
            : item.dbCount;
          return {
            athlete_name: item.name,
            team: item.team,
            total_races: total,
            award: getAwardTitle(total, activeSport),
          };
        });

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

  const filteredHeroes = heroList.filter(
    (h) =>
      !searchQuery.trim() ||
      h.athlete_name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      (h.team || "").toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

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
              系統自動結合歷史認證場次與最新登錄賽事，即時動態統計總完賽數與賞別階級。
            </p>
          </div>

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
              🏊‍♂️ 鐵人三項百鐵英雄榜
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
              🚴‍♂️ 公路單車百鐵馬英雄榜
            </button>
          </div>
        </div>

        {/* 搜尋與前往單場成績查詢按鈕（拆分為兩個獨立功能動線） */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="輸入選手姓名（如：陳彥良、曾亭彬、洪緯欣）或所屬團隊（如：醫護鐵人）檢索排名..."
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
              {activeSport === "triathlon" ? "🏆 鐵人三項百鐵總排名" : "🚴‍♂️ 公路單車百鐵馬總排名"}
            </h2>
            <span className="text-xs text-amber-400 font-bold">
              共收錄 {filteredHeroes.length} 位認證鐵人英雄
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-zinc-400 py-10 text-center animate-pulse">正在統計最新完賽數據與排名...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-800 text-zinc-400 text-xs uppercase bg-zinc-950">
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
