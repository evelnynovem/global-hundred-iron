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

const CYC_TIERS = [
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

function getTriAwardBadge(cnt: number) {
  if (cnt >= 100) return { title: "🏆 《百鐵賞》", cls: "bg-amber-950/60 border-amber-500/50 text-amber-300" };
  if (cnt >= 90) return { title: "🥇 《九十鐵賞》", cls: "bg-amber-950/40 border-amber-500/40 text-amber-300" };
  if (cnt >= 80) return { title: "🥇 《八十鐵賞》", cls: "bg-amber-950/40 border-amber-500/40 text-amber-300" };
  if (cnt >= 70) return { title: "🥇 《七十鐵賞》", cls: "bg-amber-950/40 border-amber-500/40 text-amber-300" };
  if (cnt >= 60) return { title: "🥇 《六十鐵賞》", cls: "bg-amber-950/40 border-amber-500/40 text-amber-300" };
  if (cnt >= 50) return { title: "🏅 《五十鐵賞》", cls: "bg-amber-950/40 border-amber-500/40 text-amber-300" };
  if (cnt >= 40) return { title: "🏅 《四十鐵賞》", cls: "bg-amber-950/40 border-amber-500/40 text-amber-300" };
  if (cnt >= 30) return { title: "🏅 《卅鐵賞》", cls: "bg-amber-950/40 border-amber-500/40 text-amber-300" };
  if (cnt >= 20) return { title: "🥈 《廿鐵賞》", cls: "bg-zinc-900 border-zinc-700 text-amber-300" };
  if (cnt >= 10) return { title: "🥈 《十鐵賞》", cls: "bg-zinc-900 border-zinc-700 text-amber-300" };
  if (cnt >= 5) return { title: "🥉 《五鐵賞》", cls: "bg-zinc-900 border-zinc-700 text-zinc-300" };
  if (cnt >= 3) return { title: "🥉 《三鐵賞》", cls: "bg-zinc-900 border-zinc-700 text-zinc-300" };
  return { title: "🔰 《初鐵賞》", cls: "bg-zinc-900 border-zinc-800 text-zinc-400" };
}

function getCycAwardBadge(cnt: number) {
  if (cnt >= 100) return { title: "🏆 《百鐵馬賞》", cls: "bg-amber-950/60 border-amber-500/50 text-amber-300" };
  if (cnt >= 90) return { title: "🥇 《九十鐵馬賞》", cls: "bg-amber-950/40 border-amber-500/40 text-amber-300" };
  if (cnt >= 80) return { title: "🥇 《八十鐵馬賞》", cls: "bg-amber-950/40 border-amber-500/40 text-amber-300" };
  if (cnt >= 70) return { title: "🥇 《七十鐵馬賞》", cls: "bg-amber-950/40 border-amber-500/40 text-amber-300" };
  if (cnt >= 60) return { title: "🥇 《六十鐵馬賞》", cls: "bg-amber-950/40 border-amber-500/40 text-amber-300" };
  if (cnt >= 50) return { title: "🏅 《五十鐵馬賞》", cls: "bg-amber-950/40 border-amber-500/40 text-amber-300" };
  if (cnt >= 40) return { title: "🏅 《四十鐵馬賞》", cls: "bg-amber-950/40 border-amber-500/40 text-amber-300" };
  if (cnt >= 30) return { title: "🏅 《卅鐵馬賞》", cls: "bg-amber-950/40 border-amber-500/40 text-amber-300" };
  if (cnt >= 20) return { title: "🥈 《廿鐵馬賞》", cls: "bg-zinc-900 border-zinc-700 text-amber-300" };
  if (cnt >= 10) return { title: "🥈 《十鐵馬賞》", cls: "bg-zinc-900 border-zinc-700 text-amber-300" };
  if (cnt >= 5) return { title: "🥉 《五鐵馬賞》", cls: "bg-zinc-900 border-zinc-700 text-zinc-300" };
  if (cnt >= 3) return { title: "🥉 《三鐵馬賞》", cls: "bg-zinc-900 border-zinc-700 text-zinc-300" };
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

  const supabase = createClient();

  const loadRankingsData = useCallback(async () => {
    setLoading(true);
    try {
      const triMap = new Map<string, HeroStat>();
      const cycMap = new Map<string, HeroStat>();

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
          const uniqueDayKey = cleanName + "__" + normDate;
          if (seenAthleteDateKey.has(uniqueDayKey)) {
            duplicateIdsToDelete.push(r.id);
          } else {
            seenAthleteDateKey.set(uniqueDayKey, r.id);
          }
          const prevTeam = cur.team;
       cur.dateSet.add(normDate); // 預設同日只記一次 (Set)
          if (normDate > cur.latestDate) cur.latestDate = normDate;
        } else {
          const rName = (r.race_name || "").trim();
          if (rName) cur.undatedNames.add(rName);
        }

        dbTriGroup.set(cleanName, cur);
      });

      if (duplicateIdsToDelete.length > 0) {
        supabase
          .from("race_details_full")
          .delete()
          .in("id", duplicateIdsToDelete.slice(0, 100))
          .then(() => console.log("Auto-cleaned same-day duplicate DB rows:", duplicateIdsToDelete.length));
      }

      dbTriGroup.forEach((val, name) => {
        const validDbCount = val.dateSet.size + val.undatedNames.size;
        const existing = triMap.get(name);
        if (existing) {
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
      alert("✅ CSV 英雄榜資料已成功更新上雲端！共計更新 " + parsedList.length + " 位認證英雄！");
    } catch (err: any) {
      alert("CSV 匯入錯誤：" + (err?.message || "未知錯誤"));
    } finally {
      setUploadingCsv(false);
    }
  };

  const activeList = activeSport === "triathlon" ? triHeroes : cycHeroes;
  const activeTierList = activeSport === "triathlon" ? TRI_TIERS : CYC_TIERS;
  const currentTierObj = activeTierList.find((t) => t.key === activeTier) || activeTierList[0];

  const filteredHeroes = activeList.filter((h) => {
    if (h.count < currentTierObj.min || h.count > currentTierObj.max) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return h.name.toLowerCase().includes(q) || (h.team || "").toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between overflow-x-hidden">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        
        {/* 100% 還原您原本喜愛的標題與右上角切換卡片設計 (image_4311d8.jpg) */}
        <section className="rounded-3xl bg-zinc-950/90 border border-zinc-800/80 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2.5 max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-extrabold uppercase tracking-wider">
              GLOBAL 100 TRIATHLON CERTIFICATION LEADERBOARD
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white">
              {activeSport === "triathlon" ? "鐵人三項百鐵排名" : "公路單車百鐵馬排名"}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              已啟用雙軌同日防呆機制：同一天同運動類別僅計一場完賽；完賽 113K/226K 超鐵自動同步計入 90km+ 百鐵馬認證。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setActiveSport("triathlon");
                  setActiveTier("all");
                }}
                className={"px-5 py-3 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer text-center leading-snug " + (activeSport === "triathlon" ? "bg-amber-500 text-black shadow-lg" : "text-zinc-400 hover:text-white")}
              >
                🏊‍♂️ 鐵人三項百鐵排名
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveSport("cycling");
                  setActiveTier("all");
                }}
                className={"px-5 py-3 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer text-center leading-snug " + (activeSport === "cycling" ? "bg-amber-500 text-black shadow-lg" : "text-zinc-400 hover:text-white")}
              >
                🚴‍♂️ 公路單車百鐵馬排名
              </button>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowCsvUploader(!showCsvUploader)}
                className="px-4 py-3 rounded-2xl bg-red-700 hover:bg-red-600 text-white font-black text-xs transition cursor-pointer shadow-lg"
              >
                📥 上傳更新 .csv
              </button>
            )}
          </div>
        </section>

        {/* 管理員 CSV 上傳面板（僅點擊上傳按鈕時展開） */}
        {isAdmin && showCsvUploader && (
          <section className="rounded-3xl bg-zinc-950 border-2 border-red-600/50 p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-base font-black text-amber-400">
                👑 管理員專用：直接上傳更新【百鐵英雄榜 .csv】與【公路單車百鐵馬英雄榜 .csv】
              </h2>
              <button onClick={() => setShowCsvUploader(false)} className="text-zinc-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                <label className="text-xs font-extrabold text-amber-400 block">
                  🏊‍♂️ 1. 上傳更新【鐵人三項・百鐵英雄榜 (.csv / .xlsx)】
                </label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  disabled={uploadingCsv}
                  onChange={(e) => handleCsvUpload(e, "tri")}
                  className="text-xs text-zinc-300 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-red-700 file:text-white cursor-pointer"
                />
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                <label className="text-xs font-extrabold text-amber-400 block">
                  🚴‍♂️ 2. 上傳更新【公路單車・百鐵馬英雄榜 (.csv / .xlsx)】
                </label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  disabled={uploadingCsv}
                  onChange={(e) => handleCsvUpload(e, "cyc")}
                  className="text-xs text-zinc-300 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-red-700 file:text-white cursor-pointer"
                />
              </div>
            </div>
          </section>
        )}

        {/* 🎯 100% 原汁原味還原您最喜歡的「紅底白字 ＋ 金色人數徽章 ＋ 點選時亮起金橘白框」階級按鈕列 (image_35ee95.png) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/certifications/query"
            className="px-4 py-2.5 rounded-xl bg-[#4a1212] hover:bg-[#5c1717] border border-red-900/70 text-white font-extrabold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-md"
          >
            <span>🔍</span>
            <span>賽事登錄資料查詢</span>
          </Link>

          {activeTierList.map((tier) => {
            const tierCount = activeList.filter((h) => h.count >= tier.min && h.count <= tier.max).length;
            const isSelected = activeTier === tier.key;

            return (
              <button
                key={tier.key}
                type="button"
                onClick={() => setActiveTier(tier.key)}
                className={
                  isSelected
                    ? "px-4 py-2.5 rounded-xl bg-amber-500 text-black border-2 border-white font-black text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 shadow-lg"
                    : "px-4 py-2.5 rounded-xl bg-[#b91c1c] hover:bg-[#dc2626] text-white font-extrabold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 shadow-md"
                }
              >
                <span>{tier.label}</span>
                <span
                  className={
                    isSelected
                      ? "px-1.5 py-0.5 rounded bg-black/20 text-black font-mono text-[11px] font-black"
                      : "px-1.5 py-0.5 rounded bg-black/45 text-amber-300 font-mono text-[11px] font-extrabold"
                  }
                >
                  {tierCount}
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
            className="flex-1 rounded-2xl bg-zinc-950 border border-zinc-800 px-4 py-3.5 text-sm text-white focus:border-amber-500 outline-none"
          />
        </div>

        {/* 排行榜主表 */}
        <section className="rounded-3xl bg-zinc-950 border border-zinc-800/90 p-5 sm:p-7 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <h2 className="text-lg sm:text-xl font-black text-white">
              {activeSport === "triathlon" ? "🏆 鐵人三項百鐵總排名" : "🚴‍♂️ 公路單車百鐵馬總排名"}
              <span className="text-amber-400 ml-1.5">
                ({currentTierObj.label})
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
                              <span className="px-2 py-0.5 rounded-full bg-red-950/80 border border-red-800/60 text-red-300 text-[10px] font-extrabold">
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
                            className="px-3.5 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold transition"
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
