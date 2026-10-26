"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function CreateRecordPage() {
  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState("51.5K 標準鐵人");
  const [raceDate, setRaceDate] = useState("");
  const [hours, setHours] = useState("03");
  const [minutes, setMinutes] = useState("30");
  const [seconds, setSeconds] = useState("00");
  const [bib, setBib] = useState("");
  const [sportTeam, setSportTeam] = useState("");
  const [sportType, setSportType] = useState("triathlon");
  
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const supabase = createClient();

  // 初始化並載入該用戶的即時完賽清單
  useEffect(() => {
    async function initForm() {
      try {
        const todayStr = new Date().toISOString().split("T")[0];
        setRaceDate(todayStr);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const user = session.user;
        fetchUserRecords(user.id);
      } catch (err) {
        console.error("初始化錯誤:", err);
      }
    }
    initForm();
  }, [supabase]);

  const fetchUserRecords = async (userId: string) => {
    const { data } = await supabase
      .from("user_records")
      .select("*")
      .eq("user_id", userId)
      .order("match_date", { ascending: false });
    if (data) setRecentRecords(data);
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
      if (!session?.user) throw new Error("尚未登入，請先登入會員。");

      const user = session.user;
      const finishTimeStr = `${hours}:${minutes}:${seconds}`;

      const { error } = await supabase.from("user_records").insert([
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

      if (error) throw error;

      setSuccessMsg("🎉 完賽成績登錄成功！已即時同步至您的個人完賽履歷。");
      setEventName("");
      setBib("");
      fetchUserRecords(user.id); // 即時刷新右側清單
    } catch (err: any) {
      setErrorMsg("❌ 登錄失敗：" + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between">
      <div className="max-w-6xl w-full mx-auto px-6 py-12 space-y-8">
        
        <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
          <div>
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
              Manual Record Submission
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
              登錄最新完賽成績
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              採榮譽自律制，送出後即刻生效公開，並同步至會員中心。
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
          {/* 左側表單 */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300">賽事名稱 *</label>
              <input
                type="text"
                required
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="請輸入賽事名稱"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300">參賽日期 *</label>
                <input
                  type="date"
                  required
                  value={raceDate}
                  onChange={(e) => setRaceDate(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-4 py-3 text-sm text-amber-400 font-semibold focus:border-amber-500 focus:outline-none transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300">距離組別</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-4 py-3 text-sm text-white focus:border-amber-500 focus:outline-none transition"
                >
                  <option value="51.5K 標準鐵人">51.5K 標準鐵人</option>
                  <option value="113K 半程超鐵">113K 半程超鐵</option>
                  <option value="226K 全程超鐵">226K 全程超鐵</option>
                  <option value="90K+ 公路單車">90K+ 公路單車</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300">完賽總時間 (時 / 分 / 秒)</label>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 text-sm text-white text-center focus:border-amber-500"
                />
                <input
                  type="text"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 text-sm text-white text-center focus:border-amber-500"
                />
                <input
                  type="text"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  className="rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 text-sm text-white text-center focus:border-amber-500"
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
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 text-sm text-white focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-red-600 hover:bg-red-500 py-4 text-white font-extrabold text-sm transition shadow-lg shadow-red-600/20 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "正在登錄..." : "確認送出鐵人完賽登錄"}
            </button>
          </form>

          {/* 右側即時清單 */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-extrabold text-white">
                我的鐵人完賽記錄 ({recentRecords.length})
              </h3>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {recentRecords.map((r) => (
                  <div key={r.id} className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                    <div className="text-sm font-bold text-white">{r.event_name}</div>
                    <div className="text-xs text-zinc-400 font-mono">
                      {r.match_date} | {r.category}
                    </div>
                    <div className="text-xs font-mono font-bold text-amber-400">
                      {r.result_time}
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