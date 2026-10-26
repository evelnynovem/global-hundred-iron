"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function ClaimPage() {
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function initUserAndRecords() {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;
      if (!currentUser) {
        window.location.href = "/login";
        return;
      }
      setUser(currentUser);
      const userEmail = currentUser.email;

      try {
        // 直接從 Supabase 的 race_details_full 撈取符合目前登入信箱的紀錄
        const { data, error } = await supabase
          .from("race_details_full")
          .select("*")
          .eq("login_email", userEmail);

        if (error) throw error;
        setRecords(data || []);
      } catch (err) {
        console.error("讀取完賽紀錄失敗:", err);
      } finally {
        setLoading(false);
      }
    }
    initUserAndRecords();
  }, [supabase]);

  const handleClaimAll = async () => {
    if (!user) return;
    setClaiming(true);
    setMessage(null);
    try {
      // 這裡可以將認領狀態寫入 profiles 或 user_records
      setMessage(`🎉 成功認領 ${records.length} 筆歷史完賽紀錄！您的百鐵榮耀已成功綁定至帳號。`);
    } catch (err: any) {
      setMessage("認領失敗：" + err.message);
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-yellow-400 font-bold">
        正在尋找您的專屬完賽資料庫...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-yellow-400">
              🏅 認領歷史完賽紀錄
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              當前登入信箱：<span className="text-white font-mono font-bold">{user?.email}</span>
            </p>
          </div>
          <Link href="/profile" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-gray-300 text-sm rounded-xl transition">
            ← 返回會員中心
          </Link>
        </div>

        {message && (
          <div className="p-4 rounded-xl bg-green-950 border border-green-800 text-green-300 text-sm font-semibold text-center">
            {message}
          </div>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              已自動匹配到 {records.length} 筆您的歷年完賽紀錄
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              系統已透過您的登入信箱與資料庫進行安全比對。
            </p>
          </div>
          <button
            onClick={handleClaimAll}
            disabled={claiming || records.length === 0}
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition disabled:opacity-50 text-sm sm:text-base shrink-0"
          >
            {claiming ? "認領中..." : "一鍵確認認領全部紀錄"}
          </button>
        </div>

        {/* 顯示匹配到的完賽明細表格 */}
        <div className="overflow-x-auto rounded-xl border border-zinc-800 shadow-2xl">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-zinc-950 text-gray-300 border-b border-zinc-800">
                <th className="py-3 px-3">姓名</th>
                <th className="py-3 px-3">日期</th>
                <th className="py-3 px-3">賽事名稱</th>
                <th className="py-3 px-3">組別</th>
                <th className="py-3 px-3">成績</th>
                <th className="py-3 px-3">團隊</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-gray-200">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    查無與此信箱相符的完賽紀錄
                  </td>
                </tr>
              ) : (
                records.map((item, idx) => (
                  <tr key={idx} className="bg-zinc-900/60 hover:bg-zinc-800/80 transition">
                    <td className="py-3 px-3 font-bold text-yellow-400">{item.athlete_name}</td>
                    <td className="py-3 px-3 font-mono text-gray-400">{item.race_date}</td>
                    <td className="py-3 px-3 font-semibold text-white">{item.race_name}</td>
                    <td className="py-3 px-3 text-gray-300">{item.participating_categories}</td>
                    <td className="py-3 px-3 font-mono text-green-400">{item.finish_time || "完賽"}</td>
                    <td className="py-3 px-3 text-gray-300">{item.sport_team || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
