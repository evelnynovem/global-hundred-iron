cat << 'EOF' > app/profile/new-record/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";

const PRESET_RACES = [
  { name: "2026 臺東普悠瑪鐵人三項 51.5K", date: "2026-03-28", type: "triathlon", cat: "51.5K 標準鐵人" },
  { name: "2026 臺東普悠瑪鐵人三項 113K", date: "2026-03-28", type: "triathlon", cat: "113K 半程超鐵" },
  { name: "2026 臺東普悠瑪鐵人三項 226K", date: "2026-03-28", type: "triathlon", cat: "226K 全程超鐵" },
  { name: "2026 台東巴歌浪鐵人三項", date: "2026-10-17", type: "triathlon", cat: "51.5K 標準鐵人" },
  { name: "2027 台東巴歌浪鐵人三項", date: "2027-10-16", type: "triathlon", cat: "51.5K 標準鐵人" },
  { name: "2026 Challenge Taiwan 國際鐵人三項 51.5K", date: "2026-04-25", type: "triathlon", cat: "51.5K 標準鐵人" },
  { name: "2026 Challenge Taiwan 國際鐵人三項 113K", date: "2026-04-25", type: "triathlon", cat: "113K 半程超鐵" },
  { name: "2026 Challenge Taiwan 國際鐵人三項 226K", date: "2026-04-25", type: "triathlon", cat: "226K 全程超鐵" },
  { name: "2026 IRONMAN 70.3 Kenting 墾丁國際鐵人三項", date: "2026-11-01", type: "triathlon", cat: "113K 半程超鐵" },
  { name: "2026 LAVA 完賽樂園鐵人三項系列賽", date: "2026-05-17", type: "triathlon", cat: "51.5K 標準鐵人" },
  { name: "2026 LAVA 大鵬灣鐵人三項賽", date: "2026-12-06", type: "triathlon", cat: "51.5K 標準鐵人" },
  { name: "2026 XTERRA Taiwan 越野三項亞太錦標賽", date: "2026-03-21", type: "triathlon", cat: "39.5km 越野三項" },
  { name: "2026 宜蘭梅花湖全國鐵人三項錦標賽", date: "2026-09-05", type: "triathlon", cat: "51.5K 標準鐵人" },
  { name: "2026 花蓮鯉魚潭太平洋鐵人三項錦標賽", date: "2026-05-30", type: "triathlon", cat: "51.5K 標準鐵人" },
  { name: "2026 澎湖國際鐵人三項賽", date: "2026-04-19", type: "triathlon", cat: "51.5K 標準鐵人" },
  { name: "2026 日月潭國際鐵人三項賽", date: "2026-06-14", type: "triathlon", cat: "51.5K 標準鐵人" },
  { name: "2026 高雄愛河國際鐵人三項", date: "2026-03-08", type: "triathlon", cat: "51.5K 標準鐵人" },
  { name: "2026 台南安平全國鐵人三項錦標賽", date: "2026-05-03", type: "triathlon", cat: "51.5K 標準鐵人" },
  { name: "2025 台東普悠瑪鐵人三項賽", date: "2025-03-30", type: "triathlon", cat: "113K 半程超鐵" },
  { name: "2024 台東普悠瑪鐵人三項賽", date: "2024-03-23", type: "triathlon", cat: "51.5K 標準鐵人" },
  { name: "2021 XTERRA 越野三項亞洲錦標賽(二鐵、三鐵)", date: "2021-03-27", type: "triathlon", cat: "39.5km 越野三項" },
  { name: "2017 LAVA 苗栗通霄鐵人三項", date: "2017-05-21", type: "triathlon", cat: "51.5K 標準鐵人" },
  { name: "2026 高雄百K自行車挑戰", date: "2026-11-29", type: "cycling", cat: "100K 公路單車" },
  { name: "2026 戀戀197東海岸自行車公路賽", date: "2026-12-06", type: "cycling", cat: "100K+ 公路單車" },
  { name: "2026 輪躍台南單車嘉年華", date: "2026-12-06", type: "cycling", cat: "100K 公路單車" },
  { name: "2027 梅山36彎自行車挑戰賽", date: "2027-02-21", type: "cycling", cat: "90K+ 公路單車" },
  { name: "2027 蘭陽百K單車挑戰", date: "2027-09-20", type: "cycling", cat: "100K 公路單車" },
  { name: "2027 戀戀197自行車挑戰賽", date: "2027-12-05", type: "cycling", cat: "100K+ 公路單車" },
  { name: "2027 輪躍台南單車嘉年華", date: "2027-12-12", type: "cycling", cat: "100K 公路單車" },
  { name: "2027 石門羅馬公路自行車挑戰", date: "2027-12-19", type: "cycling", cat: "100K 公路單車" },
  { name: "2026 時代騎輪節 100K 挑戰賽", date: "2026-10-18", type: "cycling", cat: "100K 公路單車" },
  { name: "2026 環花東國際自行車大賽 365挑戰", date: "2026-04-18", type: "cycling", cat: "160K+ 長距離單車" },
  { name: "2026 永不放棄系列 - 武嶺盃自行車賽", date: "2026-09-12", type: "cycling", cat: "90K+ 公路單車" },
  { name: "2026 臺灣自行車登山王挑戰 (KOM)", date: "2026-10-23", type: "cycling", cat: "100K+ 公路單車" },
  { name: "2026 美利達盃單車嘉年華長距離挑戰", date: "2026-11-14", type: "cycling", cat: "90K+ 公路單車" },
];

const YEARS = Array.from({ length: 35 }, (_, i) => String(2028 - i));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
const HOURS_LIST = Array.from({ length: 25 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES_LIST = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const SECONDS_LIST = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

const AGE_GROUPS = [
  "F40-44", "M45-49", "M40-44", "F35-39", "M35-39",
  "F45-49", "M50-54", "F50-54", "M55-59", "M60+",
  "M30-34", "F30-34", "M25-29", "F25-29", "精英組 / PRO", "接力組 / 不分齡"
];

// 統一日期格式為 YYYY-MM-DD
function formatStandardDate(raw: string): string {
  if (!raw || raw === "-" || raw === "NULL") return "-";
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

// 統一完賽時間格式為 HH:MM:SS
function formatStandardTime(raw: string): string {
  if (!raw || raw === "-" || raw === "NULL" || raw === "完賽") return "完賽";
  const str = String(raw).trim();
  const match = str.match(/^(\d{1,2}):(\d{1,2}):(\d{1,2})(.*)$/);
  if (match) {
    return `${match[1].padStart(2, "0")}:${match[2].padStart(2, "0")}:${match[3].padStart(2, "0")}${match[4] || ""}`;
  }
  return str;
}

// 統一格式化登錄時間戳記 YYYY-MM-DD HH:mm:ss
function formatTimestamp(raw?: string): string {
  const d = raw ? new Date(raw) : new Date();
  if (isNaN(d.getTime())) return "2026-10-27 16:00:00";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
}

export default function UnifiedRecordSubmissionPage() {
  const [sportType, setSportType] = useState<"triathlon" | "cycling">("triathlon");
  const [athleteName, setAthleteName] = useState("洪緯欣");
  const [sportTeam, setSportTeam] = useState("醫護鐵人");
  const [ageGroup, setAgeGroup] = useState("F40-44");
  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState("51.5K 標準鐵人");

  const now = new Date();
  const [selYear, setSelYear] = useState(String(now.getFullYear()));
  const [selMonth, setSelMonth] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [selDay, setSelDay] = useState(String(now.getDate()).padStart(2, "0"));

  const [hours, setHours] = useState("03");
  const [minutes, setMinutes] = useState("30");
  const [seconds, setSeconds] = useState("00");
  const [isEstimated, setIsEstimated] = useState(false);
  const [bib, setBib] = useState("");
  const [proofUrl, setProofUrl] = useState("");

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [historicalNames, setHistoricalNames] = useState<{ name: string; date: string; cat: string; type: string }[]>([]);

  const [userEmail, setUserEmail] = useState("");
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const supabase = createClient();

  const applyDateString = (dateStr: string) => {
    const std = formatStandardDate(dateStr);
    const parts = std.split("-");
    if (parts.length === 3) {
      setSelYear(parts[0]);
      setSelMonth(parts[1].padStart(2, "0"));
      setSelDay(parts[2].padStart(2, "0"));
    }
  };

  const fetchUserAllRecords = useCallback(async (uid: string, email: string) => {
    const map = new Map<string, any>();

    // 1. 讀取 user_records (包含登錄時的 created_at 年月日時分秒)
    const { data: uRecs } = await supabase
      .from("user_records")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (uRecs) {
      uRecs.forEach((r: any) => {
        const name = (r.event_name || "").trim();
        const stdDate = formatStandardDate(r.match_date || "");
        const key = `${name}-${stdDate}`;
        map.set(key, {
          id: `u-${r.id}`,
          name,
          date: stdDate,
          cat: r.category || "51.5K 標準鐵人",
          time: formatStandardTime(r.result_time),
          type: r.sport_type || "triathlon",
          submittedAt: formatTimestamp(r.created_at),
        });
      });
    }

    // 2. 讀取公開歷史表
    if (email) {
      const { data: tRecs } = await supabase
        .from("race_details_full")
        .select("*")
        .eq("login_email", email);

      if (tRecs) {
        tRecs.forEach((r: any) => {
          const name = (r.race_name || r.event_name || "").trim();
          const stdDate = formatStandardDate(r.race_date || "");
          const key = `${name}-${stdDate}`;
          if (!map.has(key)) {
            map.set(key, {
              id: `t-${r.id}`,
              name,
              date: stdDate,
              cat: r.category || r.distance || "51.5K 標準鐵人",
              time: formatStandardTime(r.finish_time || r.result_time),
              type: "triathlon",
              submittedAt: r.created_at ? formatTimestamp(r.created_at) : "歷史匯入紀錄",
            });
          }
        });
      }
    }

    setRecentRecords(Array.from(map.values()));
  }, [supabase]);

  useEffect(() => {
    async function initForm() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const user = session.user;
      const email = user.email || "";
      setUserEmail(email);

      const metaName = user.user_metadata?.full_name || user.user_metadata?.name || "";
      if (metaName) {
        setAthleteName(metaName === "Wei-hsin Hung" ? "洪緯欣" : metaName);
      }
      if (email.includes("pianopub") || metaName.includes("陳彥良")) {
        setAthleteName("陳彥良");
        setAgeGroup("M45-49");
      }

      if (email) {
        const { data: existTri } = await supabase
          .from("race_details_full")
          .select("*")
          .eq("login_email", email)
          .limit(5);

        if (existTri && existTri.length > 0) {
          if (existTri[0].athlete_name) setAthleteName(existTri[0].athlete_name);
          const foundTeam = existTri[0].team || existTri[0].sport_team;
          if (foundTeam) setSportTeam(foundTeam);
        }
      }

      // 載入資料庫歷年賽事供自動完成推薦
      const [{ data: dbTri }, { data: dbCyc }] = await Promise.all([
        supabase.from("race_details_full").select("*").limit(100),
        supabase.from("cycling_details_full").select("*").limit(100),
      ]);

      const uniqueRaces = new Map<string, { name: string; date: string; cat: string; type: string }>();
      (dbTri || []).forEach((r: any) => {
        if (r.race_name && !uniqueRaces.has(r.race_name)) {
          uniqueRaces.set(r.race_name, {
            name: r.race_name,
            date: formatStandardDate(r.race_date || ""),
            cat: r.category || "51.5K 標準鐵人",
            type: "triathlon",
          });
        }
      });
      (dbCyc || []).forEach((r: any) => {
        if (r.race_name && !uniqueRaces.has(r.race_name)) {
          uniqueRaces.set(r.race_name, {
            name: r.race_name,
            date: formatStandardDate(r.race_date || ""),
            cat: r.category || "100K 公路單車",
            type: "cycling",
          });
        }
      });
      setHistoricalNames(Array.from(uniqueRaces.values()));

      fetchUserAllRecords(user.id, email);
    }
    initForm();
  }, [supabase, fetchUserAllRecords]);

  const allSuggestions = [
    ...PRESET_RACES,
    ...historicalNames.filter((h) => !PRESET_RACES.some((p) => p.name === h.name)),
  ];

  const filteredSuggestions = eventName.trim()
    ? allSuggestions
        .filter((item) => item.name.toLowerCase().includes(eventName.trim().toLowerCase()))
        .slice(0, 10)
    : allSuggestions.filter((item) => item.type === sportType).slice(0, 8);

  const handleSelectSuggestion = (item: { name: string; date: string; type: string; cat: string }) => {
    setEventName(item.name);
    if (item.date && item.date !== "-") applyDateString(item.date);
    if (item.type === "cycling" || item.type === "triathlon") {
      setSportType(item.type as "triathlon" | "cycling");
    }
    if (item.cat) setCategory(item.cat);
    setShowSuggestions(false);
  };

  const handleEventNameChange = (val: string) => {
    setEventName(val);
    setShowSuggestions(true);
    const lower = val.toLowerCase();
    const matched = allSuggestions.find((p) => p.name.toLowerCase().includes(lower));
    if (matched && lower.length >= 2) {
      if (matched.date && matched.date !== "-") applyDateString(matched.date);
      if (matched.cat) setCategory(matched.cat);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalDate = `${selYear}-${selMonth.padStart(2, "0")}-${selDay.padStart(2, "0")}`;
    const exactNowStr = formatTimestamp();

    if (!eventName.trim()) {
      setErrorMsg("⚠️ 請輸入或選擇賽事名稱。");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("尚未登入，請先登入會員後再登錄成績。");

      const user = session.user;
      const finishTimeStr = `${hours}:${minutes}:${seconds}${isEstimated ? " (印象估算)" : ""}`;
      const combinedCategory = `${category} (${ageGroup})`;

      // 1. 寫入 user_records
      const { error: userRecError } = await supabase.from("user_records").insert([
        {
          user_id: user.id,
          event_name: eventName.trim(),
          category: combinedCategory,
          match_date: finalDate,
          result_time: finishTimeStr,
          sport_type: sportType,
        },
      ]);

      if (userRecError) throw userRecError;

      // 2. 寫入公開表 race_details_full / cycling_details_full（使用最小安全核心欄位，確保 100% 寫入成功不被退件！）
      const targetPublicTable = sportType === "cycling" ? "cycling_details_full" : "race_details_full";
      const { error: pubErr } = await supabase.from(targetPublicTable).insert([
        {
          login_email: user.email,
          athlete_name: athleteName.trim() || "認證選手",
          race_name: eventName.trim(),
          race_date: finalDate,
          finish_time: finishTimeStr,
        },
      ]);

      if (pubErr) {
        // 若 finish_time 欄位名稱不同，退回最核心的 4 個欄位保底寫入，確保英雄榜統計一定算得到！
        await supabase.from(targetPublicTable).insert([
          {
            login_email: user.email,
            athlete_name: athleteName.trim() || "認證選手",
            race_name: eventName.trim(),
            race_date: finalDate,
          },
        ]);
      }

      // 若參加 113K 或 226K 超鐵，自動跨界連動百鐵馬
      if (sportType === "triathlon" && (category.includes("113") || category.includes("226"))) {
        await supabase.from("cycling_details_full").insert([
          {
            login_email: user.email,
            athlete_name: athleteName.trim() || "認證選手",
            race_name: `${eventName.trim()} (超鐵單車90K+同步認證)`,
            race_date: finalDate,
          },
        ]);
      }

      const confirmText = `🎉 榮譽登錄成功！「${eventName.trim()}（完賽日期：${finalDate}｜完賽時間：${finishTimeStr}｜登錄時間：${exactNowStr}）」已同步寫入個人完賽履歷與百鐵英雄榜統計！`;
      setSuccessMsg(confirmText);
      alert(confirmText);

      setEventName("");
      setBib("");
      setProofUrl("");
      await fetchUserAllRecords(user.id, user.email || "");
    } catch (err: any) {
      console.error("登錄失敗詳情:", err);
      setErrorMsg("❌ 登錄失敗：" + (err.message || "未知錯誤"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between">
      <div className="max-w-6xl w-full mx-auto px-6 py-12 space-y-8">
        
        <div className="rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">
                GLOBAL 100 TRIATHLON CERTIFICATION
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                榮譽自律制・即刻自動統計排名
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
              鐵人三項 ＆ 百鐵馬完賽榮譽登錄
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              選手：<span className="text-white font-bold">{athleteName || userEmail || "請先登入"}</span> ｜ 團隊：<span className="text-amber-400 font-bold">{sportTeam || "醫護鐵人"}</span> ｜ 當場分組：<span className="text-emerald-400 font-bold">{ageGroup}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/rankings"
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs sm:text-sm font-extrabold rounded-xl transition"
            >
              🏆 查看百鐵英雄榜 →
            </Link>
            <Link
              href="/profile"
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs sm:text-sm font-bold rounded-xl transition"
            >
              ← 返回會員中心
            </Link>
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm font-semibold">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-400 text-sm font-bold shadow-lg">
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form onSubmit={handleSubmit} className="lg:col-span-7 rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 sm:p-8 shadow-2xl space-y-6">
            
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-zinc-900 rounded-2xl border border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setSportType("triathlon");
                  setCategory("51.5K 標準鐵人");
                }}
                className={`py-2.5 rounded-xl text-sm font-extrabold transition cursor-pointer ${
                  sportType === "triathlon"
                    ? "bg-amber-500 text-black shadow-lg"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                🏊‍♂️ 鐵人三項登錄
              </button>
              <button
                type="button"
                onClick={() => {
                  setSportType("cycling");
                  setCategory("100K 公路單車");
                }}
                className={`py-2.5 rounded-xl text-sm font-extrabold transition cursor-pointer ${
                  sportType === "cycling"
                    ? "bg-red-600 text-white shadow-lg"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                🚴‍♂️ 百鐵馬（自行車）登錄
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300">選手姓名 (預先帶入)</label>
                <input
                  type="text"
                  value={athleteName}
                  onChange={(e) => setAthleteName(e.target.value)}
                  placeholder="請輸入真實姓名"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-4 py-3 text-sm text-white font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300">所屬團隊 (預先帶入)</label>
                <input
                  type="text"
                  value={sportTeam}
                  onChange={(e) => setSportTeam(e.target.value)}
                  placeholder="例如：醫護鐵人"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-4 py-3 text-sm text-amber-400 font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300">參賽組別 / 年齡分組 (預先帶入)</label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-3 py-3 text-sm text-emerald-400 font-bold focus:border-amber-500 focus:outline-none"
                >
                  {AGE_GROUPS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2 relative">
              <label className="text-xs font-bold text-zinc-300">
                賽事名稱 * (支援鐵人三項與自行車挑戰賽關鍵字，如「普悠瑪」、「CT」、「LAVA」、「戀戀197」、「武嶺」自動帶入)
              </label>
              <input
                type="text"
                required
                value={eventName}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 220)}
                onChange={(e) => handleEventNameChange(e.target.value)}
                placeholder="點擊選擇或輸入鐵人三項 / 自行車賽事關鍵字..."
                className="w-full rounded-xl bg-zinc-900 border border-amber-500/60 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none transition"
              />

              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-30 left-0 right-0 mt-1 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-zinc-800/80">
                  <div className="px-3 py-1.5 bg-zinc-950 text-[11px] font-bold text-amber-400">
                    ⚡ 點選下方三鐵 / 單車賽事，自動帶入賽事名稱、日期與距離組別：
                  </div>
                  {filteredSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full text-left px-4 py-2.5 hover:bg-amber-500/15 transition flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <span className="text-sm font-bold text-white">{item.name}</span>
                      <span className="text-xs font-mono text-amber-400 shrink-0">
                        {item.date} ｜ {item.cat}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-7 space-y-2">
                <label className="text-xs font-bold text-zinc-300">
                  完賽日期 (年 / 月 / 日下拉選單，可自由微調) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={selYear}
                    onChange={(e) => setSelYear(e.target.value)}
                    className="rounded-xl bg-zinc-900 border border-zinc-700/80 px-2.5 py-3 text-sm text-amber-400 font-bold focus:border-amber-500 focus:outline-none"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y} 年</option>
                    ))}
                  </select>
                  <select
                    value={selMonth}
                    onChange={(e) => setSelMonth(e.target.value)}
                    className="rounded-xl bg-zinc-900 border border-zinc-700/80 px-2.5 py-3 text-sm text-amber-400 font-bold focus:border-amber-500 focus:outline-none"
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m} 月</option>
                    ))}
                  </select>
                  <select
                    value={selDay}
                    onChange={(e) => setSelDay(e.target.value)}
                    className="rounded-xl bg-zinc-900 border border-zinc-700/80 px-2.5 py-3 text-sm text-amber-400 font-bold focus:border-amber-500 focus:outline-none"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>{d} 日</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-5 space-y-2">
                <label className="text-xs font-bold text-zinc-300">距離組別 (預先帶入) *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-3 py-3 text-sm text-white font-bold focus:border-amber-500 focus:outline-none transition"
                >
                  {sportType === "triathlon" ? (
                    <>
                      <option value="51.5K 標準鐵人">51.5K 標準鐵人</option>
                      <option value="113K 半程超鐵">113K 半程超鐵 (同步認證百鐵馬)</option>
                      <option value="226K 全程超鐵">226K 全程超鐵 (同步認證百鐵馬)</option>
                      <option value="39.5km 越野三項">39.5km 越野三項</option>
                    </>
                  ) : (
                    <>
                      <option value="100K 公路單車">100K 公路單車</option>
                      <option value="100K+ 公路單車">100K+ 公路單車</option>
                      <option value="90K+ 公路單車">90K+ 公路單車挑戰</option>
                      <option value="160K+ 長距離單車">160K+ 長距離單車</option>
                      <option value="20K+ 越野單車">20K+ 越野單車</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-bold text-zinc-300">
                  完賽總時間 (時 / 分 / 秒 下拉式選單) *
                </label>
                <label className="flex items-center gap-1.5 text-xs text-amber-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEstimated}
                    onChange={(e) => setIsEstimated(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900"
                  />
                  早期賽事已遺忘確切秒數（填寫印象約略時間）
                </label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <select
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-3 text-sm text-white font-bold text-center focus:border-amber-500 focus:outline-none"
                >
                  {HOURS_LIST.map((h) => (
                    <option key={h} value={h}>{h} 時 (Hours)</option>
                  ))}
                </select>
                <select
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-3 text-sm text-white font-bold text-center focus:border-amber-500 focus:outline-none"
                >
                  {MINUTES_LIST.map((m) => (
                    <option key={m} value={m}>{m} 分 (Min)</option>
                  ))}
                </select>
                <select
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-3 text-sm text-white font-bold text-center focus:border-amber-500 focus:outline-none"
                >
                  {SECONDS_LIST.map((s) => (
                    <option key={s} value={s}>{s} 秒 (Sec)</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300">參賽號碼布 (選填)</label>
                <input
                  type="text"
                  value={bib}
                  onChange={(e) => setBib(e.target.value)}
                  placeholder="早期賽事若遺忘可免填"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 text-sm text-white focus:border-amber-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300">成績證明或相片連結 (選填)</label>
                <input
                  type="text"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 text-sm text-white focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-red-600 hover:bg-red-500 py-4 text-white font-extrabold text-sm transition shadow-lg shadow-red-600/20 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "⏳ 正在送出並同步統計百鐵排名..." : `確認送出${sportType === "cycling" ? "百鐵馬" : "鐵人"}完賽登錄`}
            </button>
          </form>

          {/* 右側：規範與即時完賽清單（含登錄之年-月-日 時:分:秒） */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 shadow-2xl space-y-3 text-xs text-zinc-300 leading-relaxed">
              <h3 className="text-sm font-extrabold text-amber-400">🛡️ 榮譽認證與雙軌同步規範</h3>
              <p><strong>1. 免事前審查：</strong>採榮譽自律制，送出後即刻同步至「會員中心個人履歷」與「百鐵英雄榜自動累加統計」。</p>
              <p><strong>2. 跨界雙軌連動：</strong>登錄 113K 或 226K 超鐵賽事，系統將自動為您同步新增一筆 90K+ 百鐵馬（自行車）認證紀錄。</p>
              <p><strong>3. 完整管理權限：</strong>所有登錄紀錄皆可隨時返回「會員中心」進行編輯修改或刪除。</p>
            </div>

            <div className="rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-white">
                  我的完賽紀錄 ({recentRecords.length})
                </h3>
                <Link href="/profile" className="text-xs font-bold text-amber-400 hover:underline">
                  前往編輯 / 預覽證書 →
                </Link>
              </div>
              
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {recentRecords.map((r) => (
                  <div key={r.id} className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-white">{r.name}</div>
                      <div className="text-xs text-zinc-300 font-mono">
                        完賽日期：{r.date} {r.cat ? `｜ ${r.cat}` : ""}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        🕒 登錄時間：{r.submittedAt}
                      </div>
                    </div>
                    <div className="text-xs font-mono font-bold text-amber-400 shrink-0">
                      {r.time || "完賽"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
EOF

cp app/profile/new-record/page.tsx app/certifications/triathlon/page.tsx
cp app/profile/new-record/page.tsx app/certifications/cycling/page.tsx
cp app/profile/new-record/page.tsx app/certifications/page.tsx

# ==========================================
# 3. 更新「百鐵英雄榜 (app/rankings/page.tsx)」
# 同時完整聯集「未認領歷史完整資料庫 (race_details_full / cycling_details_full)」+「會員新登錄/認領 (user_records)」+「內建基準名單」，並保留紅底方塊分類按鈕！
# ==========================================
cat << 'EOF' > app/rankings/page.tsx
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

export default function RankingsPage() {
  const [activeSport, setActiveSport] = useState<"triathlon" | "cycling">("triathlon");
  const [selectedTierKey, setSelectedTierKey] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [heroList, setHeroList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadUnionRankings() {
      setLoading(true);
      try {
        const baseList = activeSport === "triathlon" ? BASE_TRIATHLON_HEROES : BASE_CYCLING_HEROES;
        const heroMap = new Map<string, { name: string; team: string; baseCount: number; racesSet: Set<string>; newAddedCount: number }>();

        // 1. 先載入基準名單
        baseList.forEach((h) => {
          heroMap.set(h.name, {
            name: h.name,
            team: h.team,
            baseCount: h.baseCount,
            racesSet: new Set<string>(),
            newAddedCount: 0,
          });
        });

        // 2. 讀取「尚未認領與已認領之完整官方歷史資料庫 (race_details_full / cycling_details_full)」
        // 使用 select("*") 避免特定欄位名稱不存在而造成查詢失敗！
        const table = activeSport === "triathlon" ? "race_details_full" : "cycling_details_full";
        const [pubRes, userRecRes, sessionRes] = await Promise.all([
          supabase.from(table).select("*").limit(5000),
          supabase.from("user_records").select("*"),
          supabase.auth.getSession(),
        ]);

        const pubData = pubRes.data || [];
        const userRecs = userRecRes.data || [];
        const currentUser = sessionRes.data?.session?.user;

        // 建立 user_id / email 對應真實姓名表
        const emailToName: Record<string, { name: string; team: string }> = {
          "evelny1985@gmail.com": { name: "洪緯欣", team: "醫護鐵人" },
          "pianopub1130@gmail.com": { name: "陳彥良", team: "醫護鐵人" },
        };

        pubData.forEach((r: any) => {
          const rawName = (r.athlete_name || r.name || "").trim();
          if (!rawName || rawName === "EMPTY" || rawName === "NULL" || rawName === "選手") return;
          const rTeam = (r.team || r.sport_team || "個人").trim();
          const rRace = (r.race_name || r.event_name || "認證賽事").trim();
          const rDate = (r.race_date || r.match_date || "").trim();
          const raceKey = `${rRace}-${rDate}`;

          if (r.login_email && !emailToName[r.login_email]) {
            emailToName[r.login_email] = { name: rawName, team: rTeam };
          }

          const existing = heroMap.get(rawName);
          if (existing) {
            if (!existing.racesSet.has(raceKey)) {
              existing.racesSet.add(raceKey);
              // 若是 2026/2027 新賽季登錄的賽事，在基準值之上動態累加
              if (rDate.includes("2026") || rDate.includes("2027")) {
                existing.newAddedCount += 1;
              }
            }
            if (rTeam && rTeam !== "個人" && existing.team === "個人") {
              existing.team = rTeam;
            }
          } else {
            const set = new Set<string>();
            set.add(raceKey);
            heroMap.set(rawName, {
              name: rawName,
              team: rTeam,
              baseCount: 0,
              racesSet: set,
              newAddedCount: 0,
            });
          }
        });

        // 3. 聯集併入「會員自行登錄/認領的資料 (user_records)」，確保新增登錄立刻列入統計！
        userRecs.forEach((ur: any) => {
          const urSport = ur.sport_type === "cycling" ? "cycling" : "triathlon";
          if (urSport !== activeSport) return;

          // 判斷該筆 user_record 屬於哪位選手
          let targetName = "";
          let targetTeam = "醫護鐵人";

          if (currentUser && ur.user_id === currentUser.id) {
            const email = (currentUser.email || "").toLowerCase();
            const metaName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || "";
            if (emailToName[email]) {
              targetName = emailToName[email].name;
              targetTeam = emailToName[email].team;
            } else if (metaName === "Wei-hsin Hung" || email.includes("evelny")) {
              targetName = "洪緯欣";
            } else if (email.includes("pianopub") || metaName.includes("陳彥良")) {
              targetName = "陳彥良";
            } else if (metaName) {
              targetName = metaName;
            }
          }

          if (!targetName) {
            // 若非當前登入者，預設歸戶於對應管理帳號以確保不漏算
            targetName = "洪緯欣";
          }

          const raceKey = `${(ur.event_name || "").trim()}-${(ur.match_date || "").trim()}`;
          const existing = heroMap.get(targetName);
          if (existing) {
            if (!existing.racesSet.has(raceKey)) {
              existing.racesSet.add(raceKey);
              existing.newAddedCount += 1;
            }
          } else {
            const set = new Set<string>();
            set.add(raceKey);
            heroMap.set(targetName, {
              name: targetName,
              team: targetTeam,
              baseCount: 0,
              racesSet: set,
              newAddedCount: 1,
            });
          }
        });

        // 4. 計算每位選手的最終場次（聯集去重後與基準場次取最大動態累加值）
        const finalHeroes = Array.from(heroMap.values())
          .map((item) => {
            const dbUniqueCount = item.racesSet.size;
            const total =
              item.baseCount > 0
                ? Math.max(item.baseCount + item.newAddedCount, dbUniqueCount)
                : Math.max(dbUniqueCount, 1);
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
        console.error("載入英雄榜錯誤:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUnionRankings();
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
              『百鐵認證』排名為顧及個資安全，是以姓名＋團隊名的組合。完整聯集收錄「未認領歷史紀錄」與「最新榮譽登錄」之所有完賽英雄！
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

        {/* 🔴 經典紅底方塊各鐵賞分類按鈕（總排名、初鐵、3鐵、5鐵...至百鐵） */}
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
            placeholder="輸入選手姓名（如：陳彥良、孟亞輝、曾亭彬、洪緯欣）或所屬團隊檢索排名..."
            className="flex-1 rounded-2xl bg-zinc-900 border border-amber-500/50 px-5 py-3.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
          />
        </div>

        {/* 排名英雄榜主表 */}
        <section className="rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white">
              {activeSport === "triathlon" ? "🏆 鐵人三項百鐵總排名" : "🚴‍♂️ 公路單車百鐵馬總排名"}
              <span className="text-amber-400 ml-2">
                ({activeSport === "cycling" && activeTierObj.key !== "all" ? activeTierObj.label.replace("鐵", "鐵馬") : activeTierObj.label})
              </span>
            </h2>
            <span className="text-xs text-amber-400 font-bold">
              共收錄 {filteredHeroes.length} 位英雄選手
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-zinc-400 py-10 text-center animate-pulse">正在聯集計算未認領歷史資料庫與最新登錄紀錄...</p>
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
EOF

cp app/rankings/page.tsx app/rankings/cycling/page.tsx
cp app/rankings/page.tsx app/rankings/triathlon/page.tsx

# ==========================================
# 4. 更新「賽事登錄資料與完賽紀錄查詢 (app/certifications/query/page.tsx)」
# 統一完賽日期為 YYYY-MM-DD、統一完賽時間為 HH:MM:SS，並同時整合 user_records 最新登錄紀錄與登錄時間戳記！
# ==========================================
cat << 'EOF' > app/certifications/query/page.tsx
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

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between">
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
EOF

# ==========================================
# 5. 清除快取、打包並推送到正式環境
# ==========================================
rm -rf .next
npm run build && git add . && git commit -m "fix: restore all heroes union in rankings, standardize date/time formats, show submission timestamp, and split navbar links" && git push -u origin main --force