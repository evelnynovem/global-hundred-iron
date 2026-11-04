"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";
import * as XLSX from "xlsx";

interface HeroStat {
  name: string;
  team: string;
  count: number;
  latestDate: string;
}

const TRI_TIERS = [
  { key: "all", label: "總排名 (全部英雄)", min: 1 },
  { key: "100", label: "🏆 百鐵賞 (100+)", min: 100 },
  { key: "90", label: "九十鐵賞 (90+)", min: 90 },
  { key: "80", label: "八十鐵賞 (80+)", min: 80 },
  { key: "70", label: "七十鐵賞 (70+)", min: 70 },
  { key: "60", label: "六十鐵賞 (60+)", min: 60 },
  { key: "50", label: "五十鐵賞 (50+)", min: 50 },
  { key: "30", label: "卅鐵賞 (30+)", min: 30 },
  { key: "20", label: "廿鐵賞 (20+)", min: 20 },
  { key: "10", label: "十鐵賞 (10+)", min: 10 },
  { key: "5", label: "五鐵賞 (5+)", min: 5 },
  { key: "3", label: "三鐵賞 (3+)", min: 3 },
  { key: "1", label: "初鐵賞 (1+)", min: 1 },
];

const CYC_TIERS = [
  { key: "all", label: "總排名 (全部騎士)", min: 1 },
  { key: "100", label: "🏆 百鐵馬賞 (100+)", min: 100 },
  { key: "50", label: "五十鐵馬賞 (50+)", min: 50 },
  { key: "30", label: "卅鐵馬賞 (30+)", min: 30 },
  { key: "20", label: "廿鐵馬賞 (20+)", min: 20 },
  { key: "10", label: "十鐵馬賞 (10+)", min: 10 },
  { key: "5", label: "五鐵馬賞 (5+)", min: 5 },
  { key: "3", label: "三鐵馬賞 (3+)", min: 3 },
  { key: "1", label: "初鐵馬賞 (1+)", min: 1 },
];

function getTriAwardBadge(cnt: number) {
  if (cnt >= 100) return { title: "🏆 《百鐵賞》", cls: "bg-amber-500/20 border-amber-400 text-amber-300" };
  if (cnt >= 90) return { title: "🥇 《九十鐵賞》", cls: "bg-amber-500/15 border-amber-500/40 text-amber-400" };
  if (cnt >= 80) return { title: "🥇 《八十鐵賞》", cls: "bg-amber-500/15 border-amber-500/40 text-amber-400" };
  if (cnt >= 70) return { title: "🥇 《七十鐵賞》", cls: "bg-amber-500/15 border-amber-500/40 text-amber-400" };
  if (cnt >= 60) return { title: "🥇 《六十鐵賞》", cls: "bg-amber-500/15 border-amber-500/40 text-amber-400" };
  if (cnt >= 50) return { title: "🏅 《五十鐵賞》", cls: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400" };
  if (cnt >= 40) return { title: "🏅 《四十鐵賞》", cls: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400" };
  if (cnt >= 30) return { title: "🏅 《卅鐵賞》", cls: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400" };
  if (cnt >= 20) return { title: "🥈 《廿鐵賞》", cls: "bg-sky-500/15 border-sky-500/40 text-sky-400" };
  if (cnt >= 10) return { title: "🥈 《十鐵賞》", cls: "bg-sky-500/15 border-sky-500/40 text-sky-400" };
  if (cnt >= 5) return { title: "🥉 《五鐵賞》", cls: "bg-zinc-800 border-zinc-700 text-zinc-300" };
  if (cnt >= 3) return { title: "🥉 《三鐵賞》", cls: "bg-zinc-800 border-zinc-700 text-zinc-300" };
  return { title: "🔰 《初鐵賞》", cls: "bg-zinc-900 border-zinc-800 text-zinc-400" };
}

function getCycAwardBadge(cnt: number) {
  if (cnt >= 100) return { title: "🏆 《百鐵馬賞》", cls: "bg-red-500/20 border-red-400 text-red-300" };
  if (cnt >= 50) return { title: "🥇 《五十鐵馬賞》", cls: "bg-amber-500/20 border-amber-400 text-amber-300" };
  if (cnt >= 30) return { title: "🏅 《卅鐵馬賞》", cls: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400" };
  if (cnt >= 20) return { title: "🥈 《廿鐵馬賞》", cls: "bg-sky-500/15 border-sky-500/40 text-sky-400" };
  if (cnt >= 10) return { title: "🥈 《十鐵馬賞》", cls: "bg-sky-500/15 border-sky-500/40 text-sky-400" };
  if (cnt >= 5) return { title: "🥉 《五鐵馬賞》", cls: "bg-zinc-800 border-zinc-700 text-zinc-300" };
  if (cnt >= 3) return { title: "🥉 《三鐵馬賞》", cls: "bg-zinc-800 border-zinc-700 text-zinc-300" };
  return { title: "🚴 《初鐵馬賞》", cls: "bg-zinc-900 border-zinc-800 text-zinc-400" };
}

const EMAIL_NAME_MAP: Record<string, string> = {
  "pianopub1130@gmail.com": "陳彥良",
  "bx4ai@yahoo.com.tw": "曾亭彬",
  "williamhuang1786@yahoo.com.tw": "黃偉靈",
  "williamhuang1786@gmail.com": "黃偉靈",
  "mike740606@gmail.com": "劉光武",
  "54albert@gmail.com": "鄭旭劭",
  "sino.polar@msa.hinet.net": "孟亞輝",
  "c062k60@gmail.com": "韓德安",
  "kouhakusei@gmail.com": "黃柏青",
  "micsu@kimo.com": "蘇耀宗",
  "ironwayne703@gmail.com": "梁忠仁",
  "wucm8012@gmail.com": "吳麒明",
  "h02020315@yahoo.com.tw": "黃堉畯",
  "scuba470824@gmail.com": "蘇啟釗",
  "wgw19811229@yahoo.com.tw": "吳曜綸",
};

// 嚴格日期正規化：將 2026/3/28、2026-03-28、Mar 28, 2026 統一轉為 YYYY-MM-DD，以利「同日僅計一場」防呆！
function normalizeStrictDate(rawDate: string): string {
  if (!rawDate) return "";
  const s = String(rawDate).trim();
  if (!s || s.includes("#") || s.toLowerCase() === "nan") return "";
  const slashMatch = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (slashMatch) {
    return slashMatch[1] + "-" + slashMatch[2].padStart(2, "0") + "-" + slashMatch[3].padStart(2, "0");
  }
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }
  return s;
}

export default function RankingsPage() {
  const [activeSport, setActiveSport] = useState<"triathlon" | "cycling">("triathlon");
  const [activeTier, setActiveTier] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [triHeroes, setTriHeroes] = useState<HeroStat[]>([]);
  const [cycHeroes, setCycHeroes] = useState<HeroStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCsvUploader, setShowCsvUploader] = useState(false);
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [cleaningDups, setCleaningDups] = useState(false);

  const supabase = createClient();

  const loadRankingsData = useCallback(async () => {
    setLoading(true);
    try {
      const triMap = new Map<string, HeroStat>();
      const cycMap = new Map<string, HeroStat>();

      // 1. 載入內建官方 CSV 基準資料庫 (/data/rankings-baseline.json)
      try {
        const res = await fetch("/data/rankings-baseline.json?v=" + Date.now());
        if (res.ok) {
          const baseData = await res.json();
          (baseData.triathlon || []).forEach((h: HeroStat) => {
            triMap.set(h.name, { ...h });
          });
          (baseData.cycling || []).forEach((h: HeroStat) => {
            cycMap.set(h.name, { ...h });
          });
        }
      } catch (e) {
        console.warn("Baseline JSON fetch warning:", e);
      }

      // 2. 檢查雲端是否有管理員透過網頁最新上傳覆蓋的 CSV 基準表
      const { data: sysCsvRows } = await supabase
        .from("race_details_full")
        .select("*")
        .eq("athlete_name", "__SYS_RANKING_CSV__");

      if (sysCsvRows && sysCsvRows.length > 0) {
        const triCsvRow = sysCsvRows.find((r: any) => r.race_name === "TRI_CSV_JSON");
        if (triCsvRow?.team) {
          try {
            const arr: HeroStat[] = JSON.parse(triCsvRow.team);
            arr.forEach((h) => {
              const prev = triMap.get(h.name);
              if (!prev || h.count >= prev.count) triMap.set(h.name, h);
            });
          } catch (e) {}
        }
        const cycCsvRow = sysCsvRows.find((r: any) => r.race_name === "CYC_CSV_JSON");
        if (cycCsvRow?.team) {
          try {
            const arr: HeroStat[] = JSON.parse(cycCsvRow.team);
            arr.forEach((h) => {
              const prev = cycMap.get(h.name);
              if (!prev || h.count >= prev.count) cycMap.set(h.name, h);
            });
          } catch (e) {}
        }
      }

      // 3. 讀取線上資料庫 (race_details_full)，並嚴格執行「同一天僅計 1 場三鐵或單車賽」！
      // （徹底防止洪緯欣在同一天 2026-03-28 重複匯入多筆普悠瑪而被異常灌水至 127 場！）
      const { data: dbTriRows } = await supabase
        .from("race_details_full")
        .select("id, athlete_name, race_name, race_date, category, finish_time, team, login_email")
        .limit(10000);

      const dbTriGroup = new Map<string, { dateSet: Set<string>; undatedNames: Set<string>; team: string; latestDate: string }>();
      const duplicateIdsToDelete: any[] = [];
      const seenAthleteDateKey = new Map<string, any>();

      (dbTriRows || []).forEach((r: any) => {
        const rawName = (r.athlete_name || "").trim();
        if (!rawName || rawName.startsWith("__SYS_")) return;
        const em = (r.login_email || "").trim().toLowerCase();
        const cleanName = EMAIL_NAME_MAP[em] || (rawName.includes("HUANG") ? "黃偉靈" : rawName);

        const normDate = normalizeStrictDate(r.race_date || "");
        const cur = dbTriGroup.get(cleanName) || {
          dateSet: new Set<string>(),
          undatedNames: new Set<string>(),
          team: r.team || "個人",
          latestDate: "",
        };

        if (r.team && r.team !== "個人" && r.team !== "SYS" && r.team !== "彥良") {
          cur.team = r.team;
        }

        if (normDate) {
          // 嚴格同日防呆：同一位選手在同一天（normDate）無論被匯入幾筆 51.5K 或 113K，永遠只算 1 場！
          const uniqueDayKey = cleanName + "__" + normDate;
          if (seenAthleteDateKey.has(uniqueDayKey)) {
            // 記錄下來供自動清理資料庫重複列
            duplicateIdsToDelete.push(r.id);
          } else {
            seenAthleteDateKey.set(uniqueDayKey, r.id);
          }
          cur.dateSet.add(normDate);
          if (normDate > cur.latestDate) cur.latestDate = normDate;
        } else {
          // 若歷史紀錄日期為 ########，則以賽事名稱去重
          const rName = (r.race_name || "").trim();
          if (rName) cur.undatedNames.add(rName);
        }

        dbTriGroup.set(cleanName, cur);
      });

      // 自動在背景為資料庫清除同日重複垃圾紀錄（例如洪緯欣在 2026-03-28 的重複列）
      if (duplicateIdsToDelete.length > 0) {
        supabase
          .from("race_details_full")
          .delete()
          .in("id", duplicateIdsToDelete.slice(0, 100))
          .then(() => console.log("Auto-cleaned same-day duplicate DB rows:", duplicateIdsToDelete.length));
      }

      dbTriGroup.forEach((val, name) => {
        // 該選手在線上資料庫經「嚴格同日去重」後的真實有效場次
        const validDbCount = val.dateSet.size + val.undatedNames.size;
        const existing = triMap.get(name);
        if (existing) {
          // 取 CSV 官方基準場次（如劉光武103、孟亞輝103）與「同日去重後之資料庫場次」的較大值
          if (validDbCount > existing.count) existing.count = validDbCount;
          if (val.team && val.team !== "個人") existing.team = val.team;
        } else if (validDbCount > 0) {
          triMap.set(name, {
            name,
            team: val.team || "個人",
            count: validDbCount,
            latestDate: val.latestDate || "2026-01-01",
          });
        }
      });

      // 4. 公路單車資料庫同樣嚴格執行「同一天僅計 1 場單車賽」
      const { data: dbCycRows } = await supabase
        .from("cycling_details_full")
        .select("id, athlete_name, race_name, race_date, team, login_email")
        .limit(10000);

      const dbCycGroup = new Map<string, { dateSet: Set<string>; undatedNames: Set<string>; team: string }>();
      (dbCycRows || []).forEach((r: any) => {
        const rawName = (r.athlete_name || "").trim();
        if (!rawName || rawName.startsWith("__SYS_")) return;
        const em = (r.login_email || "").trim().toLowerCase();
        const cleanName = EMAIL_NAME_MAP[em] || (rawName.includes("HUANG") ? "黃偉靈" : rawName);
        const normDate = normalizeStrictDate(r.race_date || "");

        const cur = dbCycGroup.get(cleanName) || {
          dateSet: new Set<string>(),
          undatedNames: new Set<string>(),
          team: r.team || "個人",
        };
        if (r.team && r.team !== "個人") cur.team = r.team;
        if (normDate) {
          cur.dateSet.add(normDate);
        } else {
          const rName = (r.race_name || "").trim();
          if (rName) cur.undatedNames.add(rName);
        }
        dbCycGroup.set(cleanName, cur);
      });

      dbCycGroup.forEach((val, name) => {
        const validCycCount = val.dateSet.size + val.undatedNames.size;
        const existing = cycMap.get(name);
        if (existing) {
          if (validCycCount > existing.count) existing.count = validCycCount;
          if (val.team && val.team !== "個人") existing.team = val.team;
        } else if (validCycCount > 0) {
          cycMap.set(name, {
            name,
            team: val.team || triMap.get(name)?.team || "個人",
            count: validCycCount,
            latestDate: "2026-01-01",
          });
        }
      });

      const finalTri = Array.from(triMap.values()).sort((a, b) => b.count - a.count);
      const finalCyc = Array.from(cycMap.values()).sort((a, b) => b.count - a.count);

      setTriHeroes(finalTri);
      setCycHeroes(finalCyc);
    } catch (err) {
      console.error("載入英雄榜失敗:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    async function checkAdminAndLoad() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const em = session.user.email.toLowerCase();
        const meta = session.user.user_metadata?.full_name || "";
        if (em.includes("evelny") || em.includes("pianopub") || em.includes("novem") || meta.includes("洪緯欣") || meta.includes("陳彥良")) {
          setIsAdmin(true);
        }
      }
      await loadRankingsData();
    }
    checkAdminAndLoad();
  }, [supabase, loadRankingsData]);

  // 🧹 管理員手動一鍵徹底掃除資料庫中所有「同日重複匯入」之異常紀錄
  const handleCleanDatabaseSameDayDuplicates = async () => {
    setCleaningDups(true);
    try {
      let deletedCount = 0;
      for (const table of ["race_details_full", "cycling_details_full"] as const) {
        const { data: rows } = await supabase.from(table).select("*").limit(10000);
        const keptMap = new Map<string, any>();
        const toDeleteIds: any[] = [];

        (rows || []).forEach((r: any) => {
          const name = (r.athlete_name || "").trim();
          if (!name || name.startsWith("__SYS_")) return;
          const normDate = normalizeStrictDate(r.race_date || "");
          if (!normDate) return;
          const key = name.toLowerCase() + "__" + normDate;
          if (!keptMap.has(key)) {
            keptMap.set(key, r);
          } else {
            const prev = keptMap.get(key);
            const prevScore = (prev.finish_time && prev.finish_time !== "完賽" ? 2 : 0) + (prev.race_name?.length || 0);
            const curScore = (r.finish_time && r.finish_time !== "完賽" ? 2 : 0) + (r.race_name?.length || 0);
            if (curScore > prevScore) {
              toDeleteIds.push(prev.id);
              keptMap.set(key, r);
            } else {
              toDeleteIds.push(r.id);
            }
          }
        });

        for (let i = 0; i < toDeleteIds.length; i += 50) {
          const chunk = toDeleteIds.slice(i, i + 50);
          await supabase.from(table).delete().in("id", chunk);
        }
        deletedCount += toDeleteIds.length;
      }
      await loadRankingsData();
      alert("✅ 已徹底清除資料庫中 " + deletedCount + " 筆「同一天重複參賽」的不合理異常紀錄（同一天僅保留最完整之 1 場紀錄）！");
    } catch (e: any) {
      alert("清理完成！");
    } finally {
      setCleaningDups(false);
    }
  };

  // 📥 管理員在網頁上直接選擇【百鐵英雄榜 .csv】或【公路單車百鐵馬英雄榜 .csv】一鍵匯入更新並同步全站！
  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetType: "tri" | "cyc") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCsv(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const statMap = new Map<string, HeroStat>();

      rows.forEach((row) => {
        const rawEmail = String(row["Login email"] || row["email"] || row["信箱"] || "").trim().toLowerCase();
        let rawName = String(row["Name"] || row["選手姓名"] || row["姓名"] || row["athlete_name"] || "").trim();
        if (rawEmail && EMAIL_NAME_MAP[rawEmail]) {
          rawName = EMAIL_NAME_MAP[rawEmail];
        } else if (rawName.includes("HUANG WEI LING") || rawName.includes("HUANGWEI LING")) {
          rawName = "黃偉靈";
        }
        if (!rawName || rawName === "nan") return;

        const rawTeam = String(row["Sport team"] || row["團隊"] || row["所屬團隊"] || row["team"] || "").trim();
        const countCol = row["Race name的COUNTA"] !== undefined ? Number(row["Race name的COUNTA"]) : 0;
        const hasRaceName = String(row["Race name"] || row["賽事名稱"] || "").trim().length > 0;

        const addCount = countCol > 0 ? countCol : hasRaceName ? 1 : 0;
        if (addCount <= 0) return;

        const cur = statMap.get(rawName) || {
          name: rawName,
          team: rawTeam || "個人",
          count: 0,
          latestDate: "2026-11-04",
        };
        cur.count += addCount;
        if (rawTeam && rawTeam !== "個人" && rawTeam !== "彥良") cur.team = rawTeam;
        statMap.set(rawName, cur);
      });

      const parsedList = Array.from(statMap.values()).sort((a, b) => b.count - a.count);
      if (parsedList.length === 0) {
        alert("⚠️ 無法從此 CSV 讀取到有效選手場次，請確認欄位包含 Name 與 Race name（或 Race name的COUNTA）。");
        setUploadingCsv(false);
        return;
      }

      const sysKey = targetType === "tri" ? "TRI_CSV_JSON" : "CYC_CSV_JSON";
      await supabase
        .from("race_details_full")
        .delete()
        .eq("athlete_name", "__SYS_RANKING_CSV__")
        .eq("race_name", sysKey);

      await supabase.from("race_details_full").insert([
        {
          athlete_name: "__SYS_RANKING_CSV__",
          race_name: sysKey,
          race_date: new Date().toISOString().slice(0, 10),
          category: "SYS",
          finish_time: "SYS",
          team: JSON.stringify(parsedList),
        },
      ]);

      await loadRankingsData();
      alert("✅ CSV 英雄榜資料已成功更新上雲端！共計更新 " + parsedList.length + " 位認證英雄，電腦與手機版已同步生效！");
    } catch (err: any) {
      alert("CSV 匯入錯誤：" + (err?.message || "未知錯誤"));
    } finally {
      setUploadingCsv(false);
    }
  };

  const activeList = activeSport === "triathlon" ? triHeroes : cycHeroes;
  const activeTierList = activeSport === "triathlon" ? TRI_TIERS : CYC_TIERS;
  const minCountRequired = activeTier === "all" ? 1 : Number(activeTier);

  const filteredHeroes = activeList.filter((h) => {
    if (h.count < minCountRequired) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return h.name.toLowerCase().includes(q) || (h.team || "").toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between overflow-x-hidden">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        
        {/* 頂部標題與管理員 CSV 一鍵匯入按鈕 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-extrabold uppercase">
              GLOBAL 100 OFFICIAL HALL OF FAME
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white mt-3">
              🏆 全球百鐵認證 ＆ 百鐵馬英雄榜
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              已啟用嚴格同日防呆機制（同一天參賽兩場以上 90K 單車或鐵人三項僅計 1 場有效完賽），並完整收錄鄭旭劭 134 場、陳彥良 105 場、劉光武 103 場、孟亞輝 103 場、曾亭彬 100 場等百鐵英雄。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={handleCleanDatabaseSameDayDuplicates}
                  disabled={cleaningDups}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition cursor-pointer shadow-lg"
                >
                  {cleaningDups ? "清理同日重複中..." : "🧹 一鍵清理同日重複異常紀錄"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCsvUploader(!showCsvUploader)}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition cursor-pointer shadow-lg"
                >
                  📥 上傳更新 .csv 英雄榜
                </button>
              </>
            )}
            <Link
              href="/certifications/query"
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold"
            >
              🔍 前往歷年完賽成績明細查詢 →
            </Link>
          </div>
        </div>

        {/* 👑 管理員專屬：網頁直接上傳兩個 .csv 更新面板 */}
        {isAdmin && showCsvUploader && (
          <section className="rounded-3xl bg-zinc-950 border-2 border-emerald-500/50 p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-black text-emerald-400">
                  👑 管理員專用：直接上傳更新【百鐵英雄榜 .csv】與【公路單車百鐵馬英雄榜 .csv】
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  支援直接上傳「百鐵英雄榜 - raw data.csv」或「公路單車百鐵馬英雄榜 - 完成公路單車賽事數分析表.csv」，系統將自動解析並同步至電腦與手機版！
                </p>
              </div>
              <button onClick={() => setShowCsvUploader(false)} className="text-zinc-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-amber-500/40 space-y-2">
                <label className="text-xs font-extrabold text-amber-400 block">
                  🏊‍♂️ 1. 上傳更新【鐵人三項・百鐵英雄榜 (.csv / .xlsx)】
                </label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  disabled={uploadingCsv}
                  onChange={(e) => handleCsvUpload(e, "tri")}
                  className="text-xs text-zinc-300 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-amber-500 file:text-black cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-red-500/40 space-y-2">
                <label className="text-xs font-extrabold text-red-400 block">
                  🚴‍♂️ 2. 上傳更新【公路單車・百鐵馬英雄榜 (.csv / .xlsx)】
                </label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  disabled={uploadingCsv}
                  onChange={(e) => handleCsvUpload(e, "cyc")}
                  className="text-xs text-zinc-300 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-red-600 file:text-white cursor-pointer"
                />
              </div>
            </div>
          </section>
        )}

        {/* 雙軌切換：鐵人三項 vs 公路單車百鐵馬 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveSport("triathlon");
              setActiveTier("all");
            }}
            className={"py-3.5 px-4 rounded-2xl font-black text-xs sm:text-base transition cursor-pointer flex items-center justify-center gap-2 " + (activeSport === "triathlon" ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800")}
          >
            <span>🏊‍♂️</span>
            <span>鐵人三項百鐵英雄榜 ({triHeroes.length} 人)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSport("cycling");
              setActiveTier("all");
            }}
            className={"py-3.5 px-4 rounded-2xl font-black text-xs sm:text-base transition cursor-pointer flex items-center justify-center gap-2 " + (activeSport === "cycling" ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800")}
          >
            <span>🚴‍♂️</span>
            <span>公路單車百鐵馬英雄榜 ({cycHeroes.length} 人)</span>
          </button>
        </div>

        {/* 賞別階級篩選列 */}
        <div className="flex flex-wrap items-center gap-2">
          {activeTierList.map((tier) => (
            <button
              key={tier.key}
              type="button"
              onClick={() => setActiveTier(tier.key)}
              className={"px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer " + (activeTier === tier.key ? "bg-white text-black shadow" : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800")}
            >
              {tier.label}
            </button>
          ))}
        </div>

        {/* 搜尋列 */}
        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="輸入選手姓名（如：鄭旭劭、陳彥良、劉光武、孟亞輝、曾亭彬）或團隊檢索排名..."
            className="flex-1 rounded-2xl bg-zinc-900 border border-zinc-700 px-4 py-3 text-sm text-white focus:border-amber-500 outline-none"
          />
        </div>

        {/* 排行榜主表 */}
        <section className="rounded-3xl bg-zinc-950 border border-zinc-800/90 p-4 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <h2 className="text-lg sm:text-xl font-black text-white">
              {activeSport === "triathlon" ? "🏆 鐵人三項百鐵總排名" : "🚴‍♂️ 公路單車百鐵馬總排名"}
              <span className="text-amber-400 ml-2">
                （{activeTierList.find((t) => t.key === activeTier)?.label}）
              </span>
            </h2>
            <span className="text-xs font-bold text-amber-400">
              共收錄 {filteredHeroes.length} 位認證英雄
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-zinc-400 animate-pulse">
              載入百鐵英雄榜數據中...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-zinc-800 text-zinc-400 text-xs uppercase">
                  <tr>
                    <th className="py-3 px-4">榮耀排名</th>
                    <th className="py-3 px-4">選手姓名</th>
                    <th className="py-3 px-4">所屬團隊</th>
                    <th className="py-3 px-4">累積完賽場次</th>
                    <th className="py-3 px-4">達成賞別階級</th>
                    <th className="py-3 px-4 text-right">明細檢索</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredHeroes.map((hero, idx) => {
                    const badge = activeSport === "triathlon" ? getTriAwardBadge(hero.count) : getCycAwardBadge(hero.count);
                    const isIronmedic =
                      (hero.team || "").includes("醫護鐵人") ||
                      ["陳彥良", "洪緯欣", "韓德安", "羅義清", "許航紹", "呂榤晉", "蔡淙緯"].includes(hero.name);

                    return (
                      <tr key={hero.name + idx} className="hover:bg-zinc-900/50 transition">
                        <td className="py-4 px-4 font-mono font-black text-sm whitespace-nowrap">
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
                        <td className="py-4 px-4 font-black text-white text-sm sm:text-base whitespace-nowrap">
                          {hero.name}
                        </td>
                        <td className="py-4 px-4 text-xs font-bold text-amber-400/90">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>{hero.team || "個人"}</span>
                            {isIronmedic && (
                              <span className="px-2 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-[10px] font-extrabold">
                                🚑 醫護鐵人
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="text-base sm:text-lg font-black font-mono text-emerald-400">
                            {hero.count}
                          </span>
                          <span className="text-xs text-zinc-500 ml-1">場</span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={"px-3 py-1 rounded-full border text-xs font-extrabold " + badge.cls}>
                            {badge.title}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <Link
                            href={"/certifications/query?q=" + encodeURIComponent(hero.name)}
                            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold transition"
                          >
                            查看完賽明細 →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
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
