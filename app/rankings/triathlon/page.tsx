"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";

// 官方權威核定之鐵人三項基準名單（梁忠仁已校準為 50 鐵）
const BASE_TRIATHLON_HEROES: { email: string; name: string; team: string; baseCount: number }[] = [
  { email: "pianopub1130@gmail.com", name: "陳彥良", team: "醫護鐵人", baseCount: 103 },
  { email: "sino.polar@msa.hinet.net", name: "孟亞輝", team: "高雄鐵人", baseCount: 98 },
  { email: "bx4ai@yahoo.com.tw", name: "曾亭彬", team: "台灣大腳ㄚ", baseCount: 82 },
  { email: "williamhuang1786@yahoo.com.tw", name: "黃偉靈", team: "個人", baseCount: 75 },
  { email: "mike740606@gmail.com", name: "劉光武", team: "KUANGYU光聿", baseCount: 68 },
  { email: "54albert@gmail.com", name: "鄭旭劭", team: "康軒鐵人隊", baseCount: 62 },
  { email: "c062k60@gmail.com", name: "韓德安", team: "醫護鐵人", baseCount: 55 },
  { email: "kouhakusei@gmail.com", name: "黃柏青", team: "DWD", baseCount: 51 },
  { email: "ironwayne703@gmail.com", name: "梁忠仁", team: "超級難止汗鐵人隊", baseCount: 50 },
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

// 官方核定之公路單車（百鐵馬）基準名單
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

// 標準化日期 YYYY-MM-DD
function normalizeDateStr(raw: any): string {
  if (!raw || raw === "-" || raw === "NULL" || raw === "EMPTY") return "";
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

// 判定一場鐵人賽是否同時符合 90km+ 百鐵馬認證資格（113K / 226K / 超鐵 / IRONMAN 70.3）
function isQualifyingLongDistanceTriathlon(raceName: string, category: string): boolean {
  const combined = `${raceName} ${category}`.toLowerCase();
  return (
    combined.includes("113") ||
    combined.includes("226") ||
    combined.includes("70.3") ||
    combined.includes("超鐵") ||
    combined.includes("半程超鐵") ||
    combined.includes("全程超鐵") ||
    combined.includes("ironman")
  );
}

export default function RankingsPage() {
  const [activeSport, setActiveSport] = useState<"triathlon" | "cycling">("triathlon");
  const [selectedTierKey, setSelectedTierKey] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [heroList, setHeroList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    // 支援若網址本身是 /rankings/cycling 自動切換至公路單車頁籤
    if (typeof window !== "undefined" && window.location.pathname.includes("/cycling")) {
      setActiveSport("cycling");
    }
  }, []);

  useEffect(() => {
    async function loadDualTrackStrictRankings() {
      setLoading(true);
      try {
        const baseList = activeSport === "triathlon" ? BASE_TRIATHLON_HEROES : BASE_CYCLING_HEROES;

        // 每個選手獨立維護 validDaySet，確保不論在「鐵人三項」或「公路單車(百鐵馬)」皆嚴格執行【一日同類運動最多 1 場】防呆！
        const heroMap = new Map<
          string,
          {
            name: string;
            team: string;
            baseCount: number;
            validDaySet: Set<string>;
            newRacesCount: number;
          }
        >();

        baseList.forEach((h) => {
          heroMap.set(h.name, {
            name: h.name,
            team: h.team,
            baseCount: h.baseCount,
            validDaySet: new Set<string>(),
            newRacesCount: 0,
          });
        });

        // 一次平行拉取：鐵人歷史表、單車歷史表、會員登錄表、登入狀態
        const [triRes, cycRes, userRecRes, sessionRes] = await Promise.all([
          supabase.from("race_details_full").select("*").limit(5000),
          supabase.from("cycling_details_full").select("*").limit(5000),
          supabase.from("user_records").select("*"),
          supabase.auth.getSession(),
        ]);

        const triData = triRes.data || [];
        const cycData = cycRes.data || [];
        const userRecs = userRecRes.data || [];
        const currentUser = sessionRes.data?.session?.user;

        const emailToName: Record<string, { name: string; team: string }> = {
          "evelny1985@gmail.com": { name: "洪緯欣", team: "醫護鐵人" },
          "pianopub1130@gmail.com": { name: "陳彥良", team: "醫護鐵人" },
        };

        // 統一註冊場次的防呆函數（同日同運動類別絕對不重複累加）
        const registerValidRace = (
          rawName: string,
          rTeam: string,
          rDateRaw: string,
          rRaceName: string
        ) => {
          const cleanName = (rawName || "").trim();
          if (!cleanName || cleanName === "EMPTY" || cleanName === "NULL" || cleanName === "選手" || /^\d+$/.test(cleanName)) {
            return;
          }

          let hero = heroMap.get(cleanName);
          if (!hero) {
            hero = {
              name: cleanName,
              team: rTeam || "個人",
              baseCount: 0,
              validDaySet: new Set<string>(),
              newRacesCount: 0,
            };
            heroMap.set(cleanName, hero);
          } else if (rTeam && rTeam !== "個人" && hero.team === "個人") {
            hero.team = rTeam;
          }

          const stdDate = normalizeDateStr(rDateRaw);
          if (stdDate) {
            // 🛡️ 硬核防呆：該選手在該日期 (YYYY-MM-DD) 若已經有一場同類運動，直接略過不重複計數！
            if (!hero.validDaySet.has(stdDate)) {
              hero.validDaySet.add(stdDate);
              if (stdDate.startsWith("2026") || stdDate.startsWith("2027")) {
                hero.newRacesCount += 1;
              }
            }
          } else {
            // 若早期歷史資料無日期，以「標準化賽事名稱」去重，同名賽事不重複灌水
            const noDateKey = `nodate-${(rRaceName || "未知賽事").trim().toLowerCase()}`;
            if (!hero.validDaySet.has(noDateKey)) {
              hero.validDaySet.add(noDateKey);
            }
          }
        };

        // 先建立信箱對應表
        triData.forEach((r: any) => {
          const n = (r.athlete_name || r.name || "").trim();
          const t = (r.team || r.sport_team || "個人").trim();
          if (r.login_email && n && !emailToName[r.login_email]) {
            emailToName[r.login_email] = { name: n, team: t };
          }
        });

        if (activeSport === "triathlon") {
          // ==========================================
          // 🏊‍♂️ 模式 A：計算「鐵人三項百鐵排名」
          // ==========================================
          triData.forEach((r: any) => {
            registerValidRace(
              r.athlete_name || r.name,
              r.team || r.sport_team || "個人",
              r.race_date || r.match_date,
              r.race_name || r.event_name
            );
          });

          userRecs.forEach((ur: any) => {
            if (ur.sport_type === "cycling") return;
            let targetName = "洪緯欣";
            let targetTeam = "醫護鐵人";
            if (currentUser && ur.user_id === currentUser.id) {
              const email = (currentUser.email || "").toLowerCase();
              const metaName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || "";
              if (emailToName[email]) {
                targetName = emailToName[email].name;
                targetTeam = emailToName[email].team;
              } else if (email.includes("pianopub") || metaName.includes("陳彥良")) {
                targetName = "陳彥良";
              } else if (metaName && metaName !== "Wei-hsin Hung") {
                targetName = metaName;
              }
            }
            registerValidRace(targetName, targetTeam, ur.match_date, ur.event_name);
          });
        } else {
          // ==========================================
          // 🚴‍♂️ 模式 B：計算「公路單車百鐵馬排名」（含 cycling_details_full ＋ 113K/226K 超鐵自動跨界滿足 90km+ 鐵馬規則）
          // ==========================================
          cycData.forEach((r: any) => {
            registerValidRace(
              r.athlete_name || r.name,
              r.team || r.sport_team || "個人",
              r.race_date || r.match_date,
              r.race_name || r.event_name
            );
          });

          // 跨界連動：若在鐵人賽完賽 113K / 226K 超鐵，自動滿足 90km+ 百鐵馬規則（且受單車同日防呆保護，同一天不會重複加兩次）
          triData.forEach((r: any) => {
            const rName = r.race_name || r.event_name || "";
            const rCat = r.category || r.distance || "";
            if (isQualifyingLongDistanceTriathlon(rName, rCat)) {
              registerValidRace(
                r.athlete_name || r.name,
                r.team || r.sport_team || "個人",
                r.race_date || r.match_date,
                `${rName} (113/226超鐵90K+單車段)`
              );
            }
          });

          userRecs.forEach((ur: any) => {
            const isBike = ur.sport_type === "cycling";
            const isLongTri =
              ur.sport_type !== "cycling" &&
              isQualifyingLongDistanceTriathlon(ur.event_name || "", ur.category || "");
            if (!isBike && !isLongTri) return;

            let targetName = "洪緯欣";
            let targetTeam = "醫護鐵人";
            if (currentUser && ur.user_id === currentUser.id) {
              const email = (currentUser.email || "").toLowerCase();
              const metaName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || "";
              if (emailToName[email]) {
                targetName = emailToName[email].name;
                targetTeam = emailToName[email].team;
              } else if (email.includes("pianopub") || metaName.includes("陳彥良")) {
                targetName = "陳彥良";
              } else if (metaName && metaName !== "Wei-hsin Hung") {
                targetName = metaName;
              }
            }
            registerValidRace(targetName, targetTeam, ur.match_date, ur.event_name);
          });
        }

        // 計算最終防呆後的場次並排序
        const finalHeroes = Array.from(heroMap.values())
          .map((item) => {
            const validCount = item.validDaySet.size;
            const total =
              item.baseCount > 0
                ? Math.max(item.baseCount + item.newRacesCount, validCount)
                : Math.max(validCount, 1);
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
        console.error("載入雙軌防呆英雄榜錯誤:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDualTrackStrictRankings();
  }, [activeSport, supabase]);

  const activeTierObj = CLASSIC_TIERS.find((t) => t.key === selectedTierKey) || CLASSIC_TIERS[0];

  const filteredHeroes = heroList.filter((h) => {
    const matchesTier = h.total_races >= activeTierObj.min && h.total_races <= activeTierObj.max;
    const matchesSearch =
      !searchQuery.trim() ||
      h.athlete_name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      (h.team || "").toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchesTier && matchesSearch;
  });

  return (
    <div translate="no" className="notranslate min-h-screen bg-[#070709] text-white flex flex-col justify-between">
      <div className="max-w-6xl w-full mx-auto px-6 py-12 space-y-8">
        
        {/* 頂部標題與雙軌切換 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-6">
          <div>
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
              GLOBAL 100 TRIATHLON CERTIFICATION LEADERBOARD
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-3">
              {activeSport === "triathlon" ? "鐵人三項百鐵排名" : "公路單車百鐵馬排名"}
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              已啟用雙軌同日防呆機制：同一天同運動類別僅計一場完賽；完賽 113K/226K 超鐵自動同步計入 90km+ 百鐵馬認證。
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

        {/* 經典紅底方塊分段按鈕 */}
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
          <Link
            href="/certifications/query"
            className="px-4 py-2.5 rounded-lg bg-red-900 hover:bg-red-800 border border-red-700 text-white text-xs font-extrabold transition shadow-md flex items-center gap-1"
          >
            🔍 賽事登錄資料查詢
          </Link>

          {CLASSIC_TIERS.map((tier) => {
            const isSelected = selectedTierKey === tier.key;
            const displayLabel =
              activeSport === "cycling" && tier.key !== "all"
                ? tier.label.replace("鐵", "鐵馬")
                : tier.label;
            const countInTier = heroList.filter(
              (h) => h.total_races >= tier.min && h.total_races <= tier.max
            ).length;

            return (
              <button
                key={tier.key}
                type="button"
                onClick={() => setSelectedTierKey(tier.key)}
                className={`px-3.5 py-2.5 rounded-lg text-xs font-extrabold transition cursor-pointer shadow-md flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-amber-500 text-black ring-2 ring-white"
                    : "bg-red-700 hover:bg-red-600 text-white"
                }`}
              >
                <span>{displayLabel}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                  isSelected ? "bg-black/20 text-black font-black" : "bg-black/30 text-amber-300"
                }`}>
                  {countInTier}
                </span>
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
            placeholder="輸入選手姓名（如：陳彥良、梁忠仁、孟亞輝、曾亭彬）或團隊檢索排名..."
            className="flex-1 rounded-2xl bg-zinc-900 border border-amber-500/50 px-5 py-3.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
          />
        </div>

        {/* 排行榜主表 */}
        <section className="rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white">
              {activeSport === "triathlon" ? "🏆 鐵人三項百鐵總排名" : "🚴‍♂️ 公路單車百鐵馬總排名"}
              <span className="text-amber-400 ml-2">
                ({activeSport === "cycling" && activeTierObj.key !== "all" ? activeTierObj.label.replace("鐵", "鐵馬") : activeTierObj.label})
              </span>
            </h2>
            <span className="text-xs text-amber-400 font-bold">
              共收錄 {filteredHeroes.length} 位認證英雄
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-zinc-400 py-10 text-center animate-pulse">正在執行三鐵與公路車雙軌同日防呆統計...</p>
          ) : filteredHeroes.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl space-y-3">
              <p className="text-sm text-zinc-400">此分類區間目前尚無選手資料。</p>
              <button
                type="button"
                onClick={() => setSelectedTierKey("all")}
                className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-extrabold cursor-pointer"
              >
                返回顯示全部總排名
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
                    <th className="py-3.5 px-4">累積完賽場次</th>
                    <th className="py-3.5 px-4">達成賞別階級</th>
                    <th className="py-3.5 px-4 text-right">明細檢索</th>
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
                          查看完賽明細 →
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
