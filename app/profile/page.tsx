"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [myRecords, setMyRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          window.location.href = "/auth/login";
          return;
        }
        setUser(session.user);

        // 讀取該使用者自行登錄的所有完賽紀錄
        const { data: records, error } = await supabase
          .from("user_records")
          .select("*")
          .eq("user_id", session.user.id)
          .order("match_date", { ascending: false });

        if (!error && records) {
          setMyRecords(records);
        }
      } catch (err) {
        console.error("載入會員資料發生錯誤:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [supabase]);

  // 刪除個人完賽紀錄功能
  const handleDeleteRecord = async (id: string) => {
    if (!confirm("確定要刪除這筆完賽紀錄嗎？")) return;

    try {
      const { error } = await supabase
        .from("user_records")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setMyRecords(myRecords.filter((r) => r.id !== id));
      alert("✅ 紀錄已成功刪除");
    } catch (err: any) {
      alert("❌ 刪除失敗：" + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center">
        <p className="text-zinc-400 animate-pulse">載入會員中心中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between">
      <div className="max-w-5xl w-full mx-auto px-6 py-12 space-y-10">
        
        {/* 會員頂部資訊 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
              Member Center
            </span>
            <h1 className="text-3xl font-black text-white mt-2">
              會員專屬完賽中心
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              歡迎回來，{user?.email}。在此管理您的個人完賽履歷與榮耀紀錄。
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/profile/new-record"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm transition shadow-lg shadow-amber-500/20"
            >
              ✍️ 登錄最新完賽成績
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/";
              }}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-sm transition"
            >
              登出
            </button>
          </div>
        </div>

        {/* 我的個人完賽履歷清單區塊 */}
        <section className="rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-white">🏆 我的個人完賽履歷</h2>
              <p className="text-xs text-zinc-400 mt-1">
                總累積完賽場次：<span className="text-amber-400 font-bold">{myRecords.length} 場</span>
              </p>
            </div>
          </div>

          {myRecords.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl space-y-3">
              <p className="text-sm text-zinc-400">目前尚無手動登錄的完賽紀錄。</p>
              <Link
                href="/profile/new-record"
                className="inline-block px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold hover:bg-amber-500/20 transition"
              >
                立即新增第一筆完賽紀錄 →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-800 text-zinc-400 text-xs uppercase font-mono">
                  <tr>
                    <th className="py-3 px-4">賽事類型</th>
                    <th className="py-3 px-4">賽事名稱</th>
                    <th className="py-3 px-4">參賽日期</th>
                    <th className="py-3 px-4">組別</th>
                    <th className="py-3 px-4">完賽時間</th>
                    <th className="py-3 px-4 text-right">操作管理</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {myRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-zinc-900/40 transition">
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                          {record.sport_type === "cycling" ? "🚴‍♂️ 公路單車" : "🏊‍♂️ 鐵人三項"}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-white">{record.event_name}</td>
                      <td className="py-4 px-4 text-zinc-300 font-mono text-xs">{record.match_date}</td>
                      <td className="py-4 px-4 text-zinc-400 text-xs">{record.category}</td>
                      <td className="py-4 px-4 text-emerald-400 font-mono font-bold">{record.result_time || "完賽"}</td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold transition cursor-pointer"
                        >
                          刪除
                        </button>
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