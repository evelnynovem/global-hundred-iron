"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "triathlon" | "cycling">("all");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadProfileData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user;
        if (!currentUser) {
          window.location.href = "/login";
          return;
        }
        setUser(currentUser);

        const { data, error } = await supabase
          .from("user_records")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("match_date", { ascending: false });

        if (!error && data) {
          setRecords(data);
        }
      } catch (err) {
        console.error("載入會員資料失敗", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfileData();
  }, [supabase]);

  const filteredRecords = records.filter(r => {
    if (activeTab === "triathlon") return r.sport_type === "triathlon" || !r.sport_type;
    if (activeTab === "cycling") return r.sport_type === "cycling";
    return true;
  });

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center font-bold">載入個人會員中心...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* 會員歡迎卡片 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center sm:text-left">
            <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full uppercase">
              ✓ Google 快速登入成功
            </span>
            <h1 className="text-3xl font-extrabold text-white">
              歡迎回來，{user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </h1>
            <p className="text-sm text-gray-400 font-mono">會員帳號：{user?.email}</p>
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); window.location.href = "/login"; }}
            className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-gray-300 text-sm font-bold rounded-xl transition"
          >
            登出帳號
          </button>
        </div>

        {/* 快速導航功能區 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link href="/profile/claim" className="bg-zinc-900 border border-zinc-800 hover:border-yellow-500/50 rounded-2xl p-6 transition space-y-3 group">
            <div className="text-2xl">🏅</div>
            <h2 className="text-lg font-bold text-white group-hover:text-yellow-400 transition">認領歷史完賽紀錄</h2>
            <p className="text-xs text-gray-400">一鍵綁定三鐵與公路車歷史完賽榮耀。</p>
          </Link>
          <Link href="/profile/new-record" className="bg-zinc-900 border border-zinc-800 hover:border-yellow-500/50 rounded-2xl p-6 transition space-y-3 group">
            <div className="text-2xl">✍️</div>
            <h2 className="text-lg font-bold text-white group-hover:text-yellow-400 transition">登錄最新完賽成績</h2>
            <p className="text-xs text-gray-400">手動登錄賽事與防呆機制。</p>
          </Link>
          <Link href="/rankings" className="bg-zinc-900 border border-zinc-800 hover:border-yellow-500/50 rounded-2xl p-6 transition space-y-3 group">
            <div className="text-2xl">📊</div>
            <h2 className="text-lg font-bold text-white group-hover:text-yellow-400 transition">查看百鐵英雄榜</h2>
            <p className="text-xs text-gray-400">瀏覽總排名與各階段榮耀名單。</p>
          </Link>
        </div>

        {/* 個人完賽履歷總覽區 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-yellow-400">🏆 我的個人完賽履歷</h2>
              <p className="text-xs text-gray-400 mt-1">
                總累積完賽場次：<span className="text-white font-bold text-base text-amber-400">{records.length} 場</span>
                （鐵人三項：{records.filter(r => r.sport_type === 'triathlon' || !r.sport_type).length} 場 | 公路單車：{records.filter(r => r.sport_type === 'cycling').length} 場）
              </p>
            </div>
            {/* 分頁切換 */}
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'all' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'}`}
              >
                全部
              </button>
              <button
                onClick={() => setActiveTab("triathlon")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'triathlon' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'}`}
              >
                🏊‍♂️ 鐵人三項
              </button>
              <button
                onClick={() => setActiveTab("cycling")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'cycling' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'}`}
              >
                🚴‍♂️ 公路單車
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-zinc-950 text-gray-300 border-b border-zinc-800">
                  <th className="py-3 px-4">賽事類型</th>
                  <th className="py-3 px-4">賽事名稱 (Event Name)</th>
                  <th className="py-3 px-4">參賽日期</th>
                  <th className="py-3 px-4">組別</th>
                  <th className="py-3 px-4">完賽時間</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-gray-200">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400 text-sm">
                      目前在此分類尚無完賽紀錄，請前往{" "}
                      <Link href="/profile/claim" className="text-yellow-400 font-bold underline hover:text-yellow-300 transition">
                        「認領歷史完賽紀錄」
                      </Link>{" "}
                      進行綁定！
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r, idx) => (
                    <tr key={idx} className="bg-zinc-900/60 hover:bg-zinc-800/80 transition">
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          r.sport_type === 'cycling' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {r.sport_type === 'cycling' ? '🚴‍♂️ 公路單車' : '🏊‍♂️ 鐵人三項'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">{r.event_name}</td>
                      <td className="py-3 px-4 font-mono text-gray-400">{r.match_date}</td>
                      <td className="py-3 px-4 text-gray-300">{r.category}</td>
                      <td className="py-3 px-4 font-mono text-green-400">{r.result_time || "完賽"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
