"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";

// 官方與歷年常見賽事自動完成推薦資料庫
const PRESET_RACES = [
  { name: "2026 臺東普悠瑪鐵人三項", date: "2026-03-28", type: "triathlon", cat: "51.5K 標準鐵人" },
  { name: "2026 臺東普悠瑪鐵人三項 113K", date: "2026-03-28", type: "triathlon", cat: "113K 半程超鐵" },
  { name: "2026 臺東普悠瑪鐵人三項 226K", date: "2026-03-28", type: "triathlon", cat: "226K 全程超鐵" },
  { name: "2026 台東巴歌浪鐵人三項", date: "2026-10-17", type: "triathlon", cat: "51.5K 標準鐵人" },
  { name: "2026 高雄百K自行車挑戰", date: "2026-11-29", type: "cycling", cat: "100K 公路單車" },
  { name: "2026 戀戀197自行車公路賽", date: "2026-12-06", type: "cycling", cat: "100K+ 公路單車" },
  { name: "2026 輪躍台南單車嘉年華", date: "2026-12-06", type: "cycling", cat: "100K 公路單車" },
  { name: "2027 梅山36彎挑戰賽", date: "2027-02-21", type: "cycling", cat: "90K+ 公路單車" },
  { name: "2027 蘭陽百K單車挑戰", date: "2027-09-20", type: "cycling", cat: "100K 公路單車" },
  { name: "2027 台東巴歌浪鐵人三項", date: "2027-10-16", type: "triathlon", cat: "51.5K 標準鐵人" },
  { name: "2027 戀戀197自行車挑戰賽", date: "2027-12-05", type: "cycling", cat: "100K+ 公路單車" },
  { name: "2027 輪躍台南單車嘉年華", date: "2027-12-12", type: "cycling", cat: "100K 公路單車" },
  { name: "2027 石門羅馬公路挑戰", date: "2027-12-19", type: "cycling", cat: "100K 公路單車" },
  { name: "2025 台東普悠瑪鐵人三項賽", date: "2025-03-30", type: "triathlon", cat: "113K 半程超鐵" },
  { name: "2024 台東普悠瑪鐵人三項賽", date: "2024-03-23", type: "triathlon", cat: "51.5K 標準鐵人" },
  { name: "2023 戀戀197自行車挑戰賽", date: "2023-12-03", type: "cycling", cat: "100K+ 公路單車" },
  { name: "2021 XTERRA 越野三項亞洲錦標賽(二鐵、三鐵)", date: "2021-03-27", type: "triathlon", cat: "39.5km" },
  { name: "2017 LAVA 苗栗通霄鐵人三項", date: "2017-05-21", type: "triathlon", cat: "51.5K 標準鐵人" },
  { name: "Challenge Taiwan 國際鐵人三項", date: "2026-04-25", type: "triathlon", cat: "113K 半程超鐵" },
  { name: "IRONMAN 70.3 Kenting 墾丁國際鐵人三項", date: "2026-11-01", type: "triathlon", cat: "113K 半程超鐵" },
];

const YEARS = Array.from({ length: 35 }, (_, i) => String(2028 - i));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

export default function UnifiedRecordSubmissionPage() {
  const [sportType, setSportType] = useState<"triathlon" | "cycling">("triathlon");
  const [athleteName, setAthleteName] = useState("洪緯欣");
  const [sportTeam, setSportTeam] = useState("醫護鐵人");
  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState("51.5K 標準鐵人");

  // 年 / 月 / 日 選單狀態（預設今日）
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

  // 自動完成選單控制
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [historicalNames, setHistoricalNames] = useState<{ name: string; date: string; cat: string }[]>([]);

  const [userEmail, setUserEmail] = useState("");
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const supabase = createClient();

  const parseDateToYMD = (dateStr: string) => {
    if (!dateStr) return null;
    const clean = dateStr.trim().replace(/\//g, "-");
    const parts = clean.split("-");
    if (parts.length === 3) {
      return {
        y: parts[0],
        m: parts[1].padStart(2, "0"),
        d: parts[2].padStart(2, "0"),
      };
    }
    return null;
  };

  const applyDateString = (dateStr: string) => {
    const parsed = parseDateToYMD(dateStr);
    if (parsed) {
      setSelYear(parsed.y);
      setSelMonth(parsed.m);
      setSelDay(parsed.d);
    }
  };

  const fetchUserAllRecords = useCallback(async (uid: string, email: string) => {
    const map = new Map<string, any>();

    // 1. 讀取 user_records
    const { data: uRecs } = await supabase
      .from("user_records")
      .select("*")
      .eq("user_id", uid)
      .order("match_date", { ascending: false });

    if (uRecs) {
      uRecs.forEach((r: any) => {
        const name = (r.event_name || "").trim();
        const dateNormalized = (r.match_date || "").replace(/\//g, "-");
        const key = `${name}-${dateNormalized}`;
        map.set(key, {
          id: `u-${r.id}`,
          name,
          date: r.match_date || "",
          cat: r.category || "",
          time: r.result_time || "完賽",
          type: r.sport_type || "triathlon",
        });
      });
    }

    // 2. 讀取 race_details_full 並去重合併歷史資訊
    if (email) {
      const { data: tRecs } = await supabase
        .from("race_details_full")
        .select("*")
        .eq("login_email", email)
        .order("race_date", { ascending: false });

      if (tRecs) {
        tRecs.forEach((r: any) => {
          const name = (r.race_name || r.event_name || "").trim();
          const dateNormalized = (r.race_date || "").replace(/\//g, "-");
          const key = `${name}-${dateNormalized}`;
          const existing = map.get(key);
          if (existing) {
            if (!existing.cat && (r.category || r.distance)) existing.cat = r.category || r.distance;
            if ((!existing.time || existing.time === "完賽") && r.finish_time) existing.time = r.finish_time;
          } else {
            map.set(key, {
              id: `t-${r.id}`,
              name,
              date: r.race_date || "",
              cat: r.category || r.distance || "",
              time: r.finish_time || r.result_time || "完賽",
              type: "triathlon",
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

      if (email) {
        const { data: existTri } = await supabase
          .from("race_details_full")
          .select("athlete_name, team, race_name, race_date, category")
          .eq("login_email", email)
          .limit(20);

        if (existTri && existTri.length > 0) {
          if (existTri[0].athlete_name) setAthleteName(existTri[0].athlete_name);
          if (existTri[0].team) setSportTeam(existTri[0].team);
        }
      }

      // 載入資料庫歷年賽事名稱供自動完成推薦使用
      const { data: dbRaces } = await supabase
        .from("race_details_full")
        .select("race_name, race_date, category")
        .limit(100);

      if (dbRaces) {
        const uniqueRaces = new Map<string, { name: string; date: string; cat: string }>();
        dbRaces.forEach((r: any) => {
          if (r.race_name && !uniqueRaces.has(r.race_name)) {
            uniqueRaces.set(r.race_name, {
              name: r.race_name,
              date: r.race_date || "",
              cat: r.category || "51.5K 標準鐵人",
            });
          }
        });
        setHistoricalNames(Array.from(uniqueRaces.values()));
      }

      fetchUserAllRecords(user.id, email);
    }
    initForm();
  }, [supabase, fetchUserAllRecords]);

  // 結合官方預設與歷史賽事的自動完成清單
  const allSuggestions = [
    ...PRESET_RACES,
    ...historicalNames.filter((h) => !PRESET_RACES.some((p) => p.name === h.name)).map((h) => ({
      name: h.name,
      date: h.date,
      type: "triathlon",
      cat: h.cat,
    })),
  ];

  const filteredSuggestions = eventName.trim()
    ? allSuggestions.filter((item) => item.name.toLowerCase().includes(eventName.trim().toLowerCase())).slice(0, 8)
    : allSuggestions.slice(0, 6);

  const handleSelectSuggestion = (item: { name: string; date: string; type: string; cat: string }) => {
    setEventName(item.name);
    if (item.date) applyDateString(item.date);
    if (item.type === "cycling" || item.type === "triathlon") {
      setSportType(item.type as "triathlon" | "cycling");
    }
    if (item.cat) setCategory(item.cat);
    setShowSuggestions(false);
  };

  // 當使用者手動輸入關鍵字時，也自動匹配對應日期
  const handleEventNameChange = (val: string) => {
    setEventName(val);
    setShowSuggestions(true);
    const lower = val.toLowerCase();
    const matched = PRESET_RACES.find((p) => p.name.toLowerCase().includes(lower));
    if (matched && lower.length >= 2) {
      applyDateString(matched.date);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalDate = `${selYear}-${selMonth.padStart(2, "0")}-${selDay.padStart(2, "0")}`;

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
      const finishTimeStr = `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}${isEstimated ? " (印象估算)" : ""}`;

      // 🚀 1. 寫入 user_records (嚴格只傳入資料表實際存在的欄位，徹底解決 'bib' column schema cache 報錯！)
      const { error: userRecError } = await supabase.from("user_records").insert([
        {
          user_id: user.id,
          event_name: eventName.trim(),
          category: category,
          match_date: finalDate,
          result_time: finishTimeStr,
          sport_type: sportType,
        },
      ]);

      if (userRecError) throw userRecError;

      // 🚀 2. 同步寫入公開查詢資料表 (race_details_full 或 cycling_details_full)
      const targetPublicTable = sportType === "cycling" ? "cycling_details_full" : "race_details_full";
      await supabase.from(targetPublicTable).insert([
        {
          login_email: user.email,
          athlete_name: athleteName.trim() || "認證選手",
          race_name: eventName.trim(),
          race_date: finalDate,
          category: category,
          finish_time: finishTimeStr,
          team: sportTeam.trim() || "醫護鐵人",
        },
      ]);

      // 若參加 113K 或 226K 超鐵，自動跨界連動百鐵馬
      if (sportType === "triathlon" && (category.includes("113") || category.includes("226"))) {
        await supabase.from("cycling_details_full").insert([
          {
            login_email: user.email,
            athlete_name: athleteName.trim() || "認證選手",
            race_name: `${eventName.trim()} (超鐵單車90K+同步認證)`,
            race_date: finalDate,
            category: "90K+ 超鐵單車段",
            finish_time: finishTimeStr,
            team: sportTeam.trim() || "醫護鐵人",
          },
        ]);
      }

      const confirmText = `🎉 榮譽登錄成功！「${eventName.trim()} (${finalDate})」已成功送出，並即時同步至【我的完賽紀錄】與【會員中心個人履歷】！`;
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
        
        {/* 頂部橫幅 */}
        <div className="rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">
                GLOBAL 100 HONOR SYSTEM
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                榮譽自律制・即刻同步
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
              鐵人三項 ＆ 百鐵馬完賽榮譽登錄
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              選手：<span className="text-white font-bold">{athleteName || userEmail || "請先登入"}</span> ｜ 常用團隊：<span className="text-amber-400 font-bold">{sportTeam || "醫護鐵人"}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/rankings"
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs sm:text-sm font-extrabold rounded-xl transition"
            >
              查看英雄榜與成績查詢 →
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
          {/* 左側：登錄表單 */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* 運動類別切換 */}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300">選手姓名 (自動帶入)</label>
                <input
                  type="text"
                  value={athleteName}
                  onChange={(e) => setAthleteName(e.target.value)}
                  placeholder="請輸入真實姓名"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-4 py-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300">所屬團隊 (自動帶入)</label>
                <input
                  type="text"
                  value={sportTeam}
                  onChange={(e) => setSportTeam(e.target.value)}
                  placeholder="例如：醫護鐵人"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-4 py-3 text-sm text-amber-400 font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 賽事名稱 + 智慧自動完成推薦下拉選單 */}
            <div className="space-y-2 relative">
              <label className="text-xs font-bold text-zinc-300">
                賽事名稱 * (輸入「普悠瑪」、「巴歌浪」、「戀戀197」、「LAVA」自動推薦歷年賽事並帶出日期)
              </label>
              <input
                type="text"
                required
                value={eventName}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onChange={(e) => handleEventNameChange(e.target.value)}
                placeholder="點擊選擇或輸入關鍵字自動完成賽事名稱..."
                className="w-full rounded-xl bg-zinc-900 border border-amber-500/60 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none transition"
              />

              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-30 left-0 right-0 mt-1 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-zinc-800/80">
                  <div className="px-3 py-1.5 bg-zinc-950 text-[11px] font-bold text-amber-400">
                    ⚡ 點選下方賽事自動帶入名稱、參賽日期與距離組別：
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

            {/* 參賽日期：年 / 月 / 日 下拉選單，避免輸入錯誤 */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300">
                完賽日期 (已根據賽事自動帶出，亦可由選單手動修改年/月/日) *
              </label>
              <div className="grid grid-cols-3 gap-3">
                <select
                  value={selYear}
                  onChange={(e) => setSelYear(e.target.value)}
                  className="rounded-xl bg-zinc-900 border border-zinc-700/80 px-3 py-3 text-sm text-amber-400 font-bold focus:border-amber-500 focus:outline-none"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y} 年</option>
                  ))}
                </select>
                <select
                  value={selMonth}
                  onChange={(e) => setSelMonth(e.target.value)}
                  className="rounded-xl bg-zinc-900 border border-zinc-700/80 px-3 py-3 text-sm text-amber-400 font-bold focus:border-amber-500 focus:outline-none"
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m} 月</option>
                  ))}
                </select>
                <select
                  value={selDay}
                  onChange={(e) => setSelDay(e.target.value)}
                  className="rounded-xl bg-zinc-900 border border-zinc-700/80 px-3 py-3 text-sm text-amber-400 font-bold focus:border-amber-500 focus:outline-none"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{d} 日</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300">距離組別 *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-4 py-3 text-sm text-white focus:border-amber-500 focus:outline-none transition"
              >
                {sportType === "triathlon" ? (
                  <>
                    <option value="51.5K 標準鐵人">51.5K 標準鐵人</option>
                    <option value="113K 半程超鐵">113K 半程超鐵 (同步認證百鐵馬)</option>
                    <option value="226K 全程超鐵">226K 全程超鐵 (同步認證百鐵馬)</option>
                    <option value="39.5km">39.5km 越野三項 / 標準組</option>
                    <option value="越野三項 / 其他">越野三項 / 其他距離</option>
                  </>
                ) : (
                  <>
                    <option value="100K 公路單車">100K 公路單車</option>
                    <option value="100K+ 公路單車">100K+ 公路單車</option>
                    <option value="90K+ 公路單車">90K+ 公路單車挑戰</option>
                    <option value="160K+ 長距離單車">160K+ 長距離單車</option>
                  </>
                )}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300">完賽總時間 (時 / 分 / 秒) *</label>
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
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="時 (HH)"
                  className="rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 text-sm text-white text-center font-bold focus:border-amber-500"
                />
                <input
                  type="text"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="分 (MM)"
                  className="rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 text-sm text-white text-center font-bold focus:border-amber-500"
                />
                <input
                  type="text"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  placeholder="秒 (SS)"
                  className="rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 text-sm text-white text-center font-bold focus:border-amber-500"
                />
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
              {isLoading ? "⏳ 正在送出並同步完賽履歷..." : `確認送出${sportType === "cycling" ? "百鐵馬" : "鐵人"}完賽登錄`}
            </button>
          </form>

          {/* 右側：規範與即時完賽清單 */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 shadow-2xl space-y-3 text-xs text-zinc-300 leading-relaxed">
              <h3 className="text-sm font-extrabold text-amber-400">🛡️ 榮譽認證與雙軌同步規範</h3>
              <p><strong>1. 免事前審查：</strong>採榮譽自律制，送出後即刻同步至「會員中心個人履歷」與「公開成績查詢系統」。</p>
              <p><strong>2. 跨界雙軌連動：</strong>登錄 113K 或 226K 超鐵賽事，系統將自動為您同步新增一筆 90K+ 百鐵馬（自行車）認證紀錄。</p>
              <p><strong>3. 完整管理權限：</strong>所有登錄紀錄皆可隨時返回「會員中心」進行編輯修改或刪除。</p>
            </div>

            <div className="rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-white">
                  我的完賽紀錄 ({recentRecords.length})
                </h3>
                <Link href="/profile" className="text-xs font-bold text-amber-400 hover:underline">
                  前往編輯 / 刪除 →
                </Link>
              </div>
              
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {recentRecords.map((r) => (
                  <div key={r.id} className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-white">{r.name}</div>
                      <div className="text-xs text-zinc-400 font-mono">
                        {r.date} {r.cat ? `｜ ${r.cat}` : ""}
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
