"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function NewRecordPage() {
  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState("51.5km");
  const [matchDate, setMatchDate] = useState("");
  const [resultTime, setResultTime] = useState("");
  const [bibNumber, setBibNumber] = useState("");
  const [teamName, setTeamName] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName || !matchDate) {
      alert("請填寫賽事名稱與參賽日期！");
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("尚未登入會員");

      // 🛡️ 防呆機制：檢查同一天是否已經有登錄過賽事
      const { data: existingRecords, error: checkError } = await supabase
        .from("user_records")
        .select("match_date, event_name")
        .eq("user_id", user.id)
        .eq("match_date", matchDate);

      if (checkError) throw checkError;

      if (existingRecords && existingRecords.length > 0) {
        throw new Error(`防呆攔截：您在 ${matchDate} 當天已經登錄過賽事「${existingRecords[0].event_name}」！鐵人三項規定同一天無法完賽多場賽事。`);
      }

      // 寫入新完賽成績
      const { error: insertError } = await supabase.from("user_records").insert({
        user_id: user.id,
        event_name: eventName,
        category: category,
        match_date: matchDate,
        result_time: resultTime,
        bib_number: bibNumber,
        team_name: teamName,
      });

      if (insertError) throw insertError;

      setMessage({ type: 'success', text: "🎉 成功登錄最新完賽成績！已自動加入您的個人履歷與百鐵場次計算。" });
      setEventName("");
      setMatchDate("");
      setResultTime("");
      setBibNumber("");
      setTeamName("");
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "登錄失敗，請稍後再試。" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-yellow-400">✍️ 登錄最新完賽成績</h1>
            <p className="text-xs text-gray-400 mt-1">手動填寫您的完賽資訊，累積百鐵認證場次。</p>
          </div>
          <Link href="/profile" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-gray-300 text-sm rounded-xl transition">
            ← 返回會員中心
          </Link>
        </div>

        {message && (
          <div className={`p-4 rounded-xl border text-sm font-semibold ${
            message.type === 'success' ? 'bg-green-950 border-green-800 text-green-300' : 'bg-red-950 border-red-800 text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">賽事名稱 *</label>
            <input
              type="text"
              required
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="例如：2026 臺東普悠瑪鐵人三項"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">參賽組別</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 text-sm"
              >
                <option value="51.5km">51.5km (標準標鐵)</option>
                <option value="113km">113km (半程超鐵)</option>
                <option value="226km">226km (全程超鐵)</option>
                <option value="其他">其他賽事</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">參賽日期 *</label>
              <input
                type="text"
                required
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                placeholder="例如：2026/04/28"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">完賽時間</label>
              <input
                type="text"
                value={resultTime}
                onChange={(e) => setResultTime(e.target.value)}
                placeholder="例如：05:32:15"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 text-sm font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">號碼布</label>
              <input
                type="text"
                value={bibNumber}
                onChange={(e) => setBibNumber(e.target.value)}
                placeholder="例如：1234"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">運動團隊</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="例如：醫護鐵人"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold rounded-xl transition text-base shadow-lg disabled:opacity-50"
          >
            {submitting ? "正在寫入成績..." : "確認送出並登錄成績"}
          </button>
        </form>
      </div>
    </div>
  );
}
