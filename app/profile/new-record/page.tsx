"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function CreateRecordPage() {
  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState("51.5km (標準標鐵)");
  const [raceDate, setRaceDate] = useState("");
  const [hours, setHours] = useState("03");
  const [minutes, setMinutes] = useState("30");
  const [seconds, setSeconds] = useState("00");
  const [bib, setBib] = useState("");
  const [sportTeam, setSportTeam] = useState("");
  const [sportType, setSportType] = useState("triathlon");
  
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const supabase = createClient();

  useEffect(() => {
    async function initForm() {
      try {
        const todayStr = new Date().toISOString().split("T")[0];
        setRaceDate(todayStr);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setErrorMsg("⚠️ 系統偵測您尚未登入，請先至會員中心登入後再進行登錄。");
          return;
        }

        const user = session.user;
        const metaTeam = user.user_metadata?.sport_team || user.user_metadata?.full_name || "";
        if (metaTeam) setSportTeam(metaTeam);

        const { data: prevRecords } = await supabase
          .from("user_records")
          .select("sport_team")
          .eq("user_id", user.id)
          .limit(5);

        if (prevRecords && prevRecords.length > 0) {
          const validTeam = prevRecords.find((r: any) => r.sport_team)?.sport_team;
          if (validTeam) setSportTeam(validTeam);
        }
      } catch (err) {
        console.error("初始化表單錯誤:", err);
      }
    }
    initForm();
  }, [supabase]);

  const handleEventNameChange = (val: string) => {
    setEventName(val);
    const nameLower = val.toLowerCase();
    
    if (nameLower.includes("巴歌浪")) {
      setRaceDate("2026-10-17");
    } else if (nameLower.includes("高雄百k")) {
      setRaceDate("2026-11-29");
    } else if (nameLower.includes("戀戀197")) {
      setRaceDate("2026-12-06");
    } else if (nameLower.includes("輪躍台南")) {
      setRaceDate("2026-12-06");
    } else if (nameLower.includes("梅山36彎")) {
      setRaceDate("2027-02-21");
    } else if (nameLower.includes("蘭陽百k")) {
      setRaceDate("2027-09-20");
    } else if (nameLower.includes("普悠瑪")) {
      setRaceDate("2026-03-28");
    } else if (nameLower.includes("石門羅馬")) {
      setRaceDate("2027-12-19");
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
      // 1. 取得目前登入的使用者
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        throw new Error("找不到登入工作階段，請重新登入會員。");
      }

      const user = session.user;
      const finishTimeStr = `${hours}:${minutes}:${seconds}`;

      console.log("準備寫入 Supabase:", {
        user_id: user.id,
        event_name: eventName,
        category,
        match_date: raceDate,
        result_time: finishTimeStr,
        bib,
        sport_team: sportTeam,
        sport_type: sportType,
      });

      // 2. 寫入 user_records 表格
      const { data, error } = await supabase.from("user_records").insert([
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
      ]).select();

      if (error) {
        console.error("Supabase 寫入錯誤詳情:", error);
        throw new Error(error.message || "資料庫寫入失敗");
      }

      console.log("寫入成功回傳:", data);
      setSuccessMsg("🎉 完賽成績登錄成功！即將返回會員中心...");
      
      setTimeout(() => {
        window.location.href = "/profile";
      }, 1500);

    } catch (err: any) {
      console.error("提交表單例外狀況:", err);
      setErrorMsg("❌ 登錄失敗：" + (err.message || "未知錯誤，請檢查主控台 (F12)"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between">
      <div className="max-w-3xl w-full mx-auto px-6 py-12 space-y-8">
        
        <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
          <div>
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
              Manual Record Submission
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
              登錄最新完賽成績
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              手動填寫您的完賽資訊，送出後將即時同步至您的個人完賽履歷。
            </p>
          </div>
          <Link
            href="/profile"
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs sm:text-sm font-bold rounded-xl transition"
          >
            ← 返回會員中心
          </Link>
        </div>

        {errorMsg && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm font-semibold whitespace-pre-wrap">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-400 text-sm font-semibold">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 sm:p-8 shadow-2xl space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold text-zinc-300">賽事名稱 * (輸入關鍵字將自動對應賽事日期)</label>
              <input
                type="text"
                required
                value={eventName}
                onChange={(e) => handleEventNameChange(e.target.value)}
                placeholder="例如：2026 巴歌浪鐵人三項 或 戀戀197"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300">運動分類</label>
              <select
                value={sportType}
                onChange={(e) => setSportType(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-4 py-3 text-sm text-white focus:border-amber-500 focus:outline-none transition"
              >
                <option value="triathlon">🏊‍♂️ 鐵人三項</option>
                <option value="cycling">🚴‍♂️ 公路單車 (百鐵馬)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300">參賽組別</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="例如：51.5K 標準鐵人 / 113K"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold text-zinc-300">參賽日期 * (自動對應或預設今日)</label>
              <input
                type="date"
                required
                value={raceDate}
                onChange={(e) => setRaceDate(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-4 py-3 text-sm text-amber-400 font-semibold focus:border-amber-500 focus:outline-none transition"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold text-zinc-300">完賽總時間 (時 / 分 / 秒)</label>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="小時"
                  className="rounded-xl bg-zinc-900 border border-zinc-700/80 px-4 py-3 text-sm text-white text-center focus:border-amber-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="分鐘"
                  className="rounded-xl bg-zinc-900 border border-zinc-700/80 px-4 py-3 text-sm text-white text-center focus:border-amber-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  placeholder="秒鐘"
                  className="rounded-xl bg-zinc-900 border border-zinc-700/80 px-4 py-3 text-sm text-white text-center focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300">參賽號碼布 (選填)</label>
              <input
                type="text"
                value={bib}
                onChange={(e) => setBib(e.target.value)}
                placeholder="例如：1234"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300">運動團隊 (已自動代入)</label>
              <input
                type="text"
                value={sportTeam}
                onChange={(e) => setSportTeam(e.target.value)}
                placeholder="例如：醫護鐵人"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-4 py-3 text-sm text-amber-400 font-semibold placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-red-600 hover:bg-red-500 py-4 text-white font-extrabold text-sm transition shadow-lg shadow-red-600/20 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "正在登錄成績..." : "確認送出鐵人完賽登錄"}
            </button>
          </div>

        </form>

      </div>
      <Footer />
    </div>
  );
}