"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function UnifiedRecordSubmissionPage() {
  const [sportType, setSportType] = useState<"triathlon" | "cycling">("triathlon");
  const [athleteName, setAthleteName] = useState("");
  const [sportTeam, setSportTeam] = useState("醫護鐵人");
  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState("51.5K 標準鐵人");
  const [raceDate, setRaceDate] = useState("");
  const [hours, setHours] = useState("03");
  const [minutes, setMinutes] = useState("30");
  const [seconds, setSeconds] = useState("00");
  const [isEstimated, setIsEstimated] = useState(false);
  const [bib, setBib] = useState("");
  const [proofUrl, setProofUrl] = useState("");

  const [userEmail, setUserEmail] = useState("");
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const supabase = createClient();

  const fetchUserAllRecords = useCallback(async (uid: string, email: string) => {
    const list: any[] = [];
    const { data: uRecs } = await supabase
      .from("user_records")
      .select("*")
      .eq("user_id", uid)
      .order("match_date", { ascending: false });

    if (uRecs) {
      uRecs.forEach((r: any) => {
        list.push({
          id: `u-${r.id}`,
          name: r.event_name,
          date: r.match_date,
          cat: r.category,
          time: r.result_time,
          type: r.sport_type,
        });
      });
    }

    if (email) {
      const { data: tRecs } = await supabase
        .from("race_details_full")
        .select("*")
        .eq("login_email", email)
        .order("race_date", { ascending: false });

      if (tRecs) {
        tRecs.forEach((r: any) => {
          list.push({
            id: `t-${r.id}`,
            name: r.race_name || r.event_name,
            date: r.race_date,
            cat: r.category || r.distance,
            time: r.finish_time || r.result_time,
            type: "triathlon",
          });
        });
      }
    }
    setRecentRecords(list);
  }, [supabase]);

  useEffect(() => {
    async function initForm() {
      const todayStr = new Date().toISOString().split("T")[0];
      setRaceDate(todayStr);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const user = session.user;
      const email = user.email || "";
      setUserEmail(email);

      // 自動帶入選手姓名與常用團隊
      const metaName = user.user_metadata?.full_name || user.user_metadata?.name || "";
      if (metaName) setAthleteName(metaName);

      if (email) {
        const { data: existTri } = await supabase
          .from("race_details_full")
          .select("athlete_name, team")
          .eq("login_email", email)
          .limit(1);

        if (existTri && existTri.length > 0) {
          if (existTri[0].athlete_name) setAthleteName(existTri[0].athlete_name);
          if (existTri[0].team) setSportTeam(existTri[0].team);
        }
      }

      fetchUserAllRecords(user.id, email);
    }
    initForm();
  }, [supabase, fetchUserAllRecords]);

  // 關鍵字自動對應賽事日期與分類
  const handleEventNameChange = (val: string) => {
    setEventName(val);
    const lower = val.toLowerCase();
    if (lower.includes("巴歌浪")) {
      setRaceDate("2026-10-17");
      setSportType("triathlon");
    } else if (lower.includes("高雄百k")) {
      setRaceDate("2026-11-29");
      setSportType("cycling");
      setCategory("100K 公路單車");
    } else if (lower.includes("戀戀197")) {
      setRaceDate("2026-12-06");
      setSportType("cycling");
      setCategory("100K+ 公路單車");
    } else if (lower.includes("輪躍台南")) {
      setRaceDate("2026-12-06");
      setSportType("cycling");
      setCategory("100K 公路單車");
    } else if (lower.includes("梅山36彎")) {
      setRaceDate("2027-02-21");
      setSportType("cycling");
    } else if (lower.includes("蘭陽百k")) {
      setRaceDate("2027-09-20");
      setSportType("cycling");
    } else if (lower.includes("普悠瑪")) {
      setRaceDate("2026-03-28");
      setSportType("triathlon");
    } else if (lower.includes("石門羅馬")) {
      setRaceDate("2027-12-19");
      setSportType("cycling");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName || !raceDate) {
      setErrorMsg("⚠️ 請填寫賽事名稱與參賽日期。");
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

      // 1. 寫入 user_records (供會員中心管理)
      const { error: userRecError } = await supabase.from("user_records").insert([
        {
          user_id: user.id,
          event_name: eventName,
          category: category,
          match_date: raceDate,
          result_time: finishTimeStr,
          bib: bib,
          sport_team: sportTeam,
          sport_type: sportType,
        },
      ]);

      if (userRecError) throw userRecError;

      // 2. 同步寫入公開查詢資料表 (race_details_full 或 cycling_details_full)
      const targetPublicTable = sportType === "cycling" ? "cycling_details_full" : "race_details_full";
      await supabase.from(targetPublicTable).insert([
        {
          login_email: user.email,
          athlete_name: athleteName || user.email?.split("@")[0] || "認證選手",
          race_name: eventName,
          race_date: raceDate,
          category: category,
          finish_time: finishTimeStr,
          team: sportTeam,
        },
      ]);

      // 若參加 113K 或 226K 超鐵，自動跨界連動百鐵馬 (cycling_details_full)
      if (sportType === "triathlon" && (category.includes("113") || category.includes("226"))) {
        await supabase.from("cycling_details_full").insert([
          {
            login_email: user.email,
            athlete_name: athleteName || user.email?.split("@")[0] || "認證選手",
            race_name: `${eventName} (超鐵單車90K+同步認證)`,
            race_date: raceDate,
            category: "90K+ 超鐵單車段",
            finish_time: finishTimeStr,
            team: sportTeam,
          },
        ]);
      }

      setSuccessMsg(`🎉 榮譽登錄成功！「${eventName}」已同步更新至會員中心與公開查詢系統！`);
      setEventName("");
      setBib("");
      setProofUrl("");
      fetchUserAllRecords(user.id, user.email || "");
    } catch (err: any) {
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
              選手：<span className="text-white font-bold">{athleteName || userEmail || "請先登入"}</span> ｜ 常用團隊：<span className="text-amber-400 font-bold">{sportTeam || "未設定"}</span>
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
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-400 text-sm font-semibold">
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

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300">
                賽事名稱 * (輸入「巴歌浪」、「普悠瑪」、「戀戀197」、「高雄百K」自動帶入日期)
              </label>
              <input
                type="text"
                required
                value={eventName}
                onChange={(e) => handleEventNameChange(e.target.value)}
                placeholder="請輸入關鍵字或完整賽事名稱"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300">賽事日期 (預設今日或自動對應) *</label>
                <input
                  type="date"
                  required
                  value={raceDate}
                  onChange={(e) => setRaceDate(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-4 py-3 text-sm text-amber-400 font-semibold focus:border-amber-500 focus:outline-none transition"
                />
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
                      <option value="越野三項 / 其他">越野三項 / 其他距離</option>
                    </>
                  ) : (
                    <>
                      <option value="100K 公路單車">100K 公路單車</option>
                      <option value="90K+ 公路單車">90K+ 公路單車挑戰</option>
                      <option value="160K+ 長距離單車">160K+ 長距離單車</option>
                    </>
                  )}
                </select>
              </div>
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
              {isLoading ? "正在同步寫入完賽履歷..." : `確認送出${sportType === "cycling" ? "百鐵馬" : "鐵人"}完賽登錄`}
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
                        {r.date} ｜ {r.cat}
                      </div>
                    </div>
                    <div className="text-xs font-mono font-bold text-amber-400 shrink-0">
                      {r.time}
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
