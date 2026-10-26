"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [userRecords, setUserRecords] = useState<any[]>([]);
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

        // 讀取該使用者在 user_records 裡所有已認領或自行登錄的紀錄
        const { data, error } = await supabase
          .from("user_records")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("match_date", { ascending: false });

        if (!error && data) {
          setUserRecords(data);
        }
      } catch (err) {
        console.error("載入會員資料失敗", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfileData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-bold">
        正在載入個人會員中心...
      </div>
    );
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
            onClick={async () => { 
              await supabase.auth.signOut(); 
              window.location.href = "/login"; 
            }}
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
            <p className="text-xs text-gray-400">搜尋您的姓名與團隊，一鍵綁定歷史完賽榮耀。</p>
          </Link>
          <Link href="/profile/new-record" className="bg-zinc-900 border border-zinc-800 hover:border-yellow-500/50 rounded-2xl p-6 transition space-y-3 group">
            <div className="text-2xl">✍️</div>
            <h2 className="text-lg font-bold text-white group-hover:text-yellow-400 transition">登錄最新完賽成績</h2>
            <p className="text-xs text-gray-400">手動登錄賽事資訊與證書，累積百鐵認證場次（含防呆機制）。</p>
          </Link>
          <Link href="/rankings" className="bg-zinc-900 border border-zinc-800 hover:border-yellow-500/50 rounded-2xl p-6 transition space-y-3 group">
            <div className="text-2xl">📊</div>
            <h2 className="text-lg font-bold text-white group-hover:text-yellow-400 transition">查看百鐵英雄榜</h2>
            <p className="text-xs text-gray-400">瀏覽總排名與各階段百鐵榮耀名單。</p>
          </Link>
        </div>

        {/* 個人完賽履歷總覽區 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-yellow-400">🏆 我的個人完賽履歷</h2>
              <p className="text-xs text-gray-400 mt-1">
                累積總完賽場次：<span className="text-white font-bold text-base text-amber-400">{userRecords.length} 場</span>
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-zinc-950 text-gray-300 border-b border-zinc-800">
                  <th className="py-3 px-4">賽事名稱 (Event Name)</th>
                  <th className="py-3 px-4">參賽日期</th>
                  <th className="py-3 px-4">組別</th>
                  <th className="py-3 px-4">完賽時間</th>
                  <th className="py-3 px-4">號碼布/團隊</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-gray-200">
                {userRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-500">
                      目前尚無完賽紀錄，請點擊上方「認領歷史完賽紀錄」或「登錄最新完賽成績」！
                    </td>
                  </tr>
                ) : (
                  userRecords.map((r, idx) => (
                    <tr key={idx} className="bg-zinc-900/60 hover:bg-zinc-800/80 transition">
                      <td className="py-3 px-4 font-bold text-white">{r.event_name}</td>
                      <td className="py-3 px-4 font-mono text-gray-400">{r.match_date}</td>
                      <td className="py-3 px-4 text-gray-300">{r.category}</td>
                      <td className="py-3 px-4 font-mono text-green-400">{r.result_time || "完賽"}</td>
                      <td className="py-3 px-4 text-gray-400">{r.bib_number || "-"} / {r.team_name || "-"}</td>
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
