"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      // 支援前端 URL Hash / Code 直接換取 Session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setLoading(false);
        return;
      }
      
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        // 給予 1.5 秒緩衝避免重新導向過快
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (retrySession?.user) {
            setUser(retrySession.user);
            setLoading(false);
          } else {
            router.replace("/login");
          }
        }, 1200);
        return;
      }
      setLoading(false);
    }
    checkAuth();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-yellow-400 font-bold text-lg">
        正在安全登入百鐵會員中心...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-2.5 py-1 rounded text-xs font-bold bg-green-950 text-green-400 border border-green-800">
              ✓ Google 快速登入成功
            </span>
            <h1 className="text-2xl font-extrabold text-white">
              歡迎回來，{user.user_metadata?.full_name || user.email}
            </h1>
            <p className="text-sm text-gray-400">會員帳號：{user.email}</p>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace("/login");
            }}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-gray-300 text-sm font-medium transition"
          >
            登出帳號
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/profile/claim" className="p-6 bg-zinc-900 border border-zinc-800 hover:border-yellow-500 rounded-2xl transition space-y-2">
            <div className="text-lg font-bold text-yellow-400">🏅 認領歷史完賽紀錄</div>
            <p className="text-xs text-gray-400">搜尋您的姓名與團隊，一鍵綁定個人帳號。</p>
          </Link>
          <Link href="/certifications" className="p-6 bg-zinc-900 border border-zinc-800 hover:border-yellow-500 rounded-2xl transition space-y-2">
            <div className="text-lg font-bold text-red-500">✍️ 登錄最新完賽成績</div>
            <p className="text-xs text-gray-400">上傳證書與賽事資訊，累積百鐵認證場次。</p>
          </Link>
          <Link href="/rankings" className="p-6 bg-zinc-900 border border-zinc-800 hover:border-yellow-500 rounded-2xl transition space-y-2">
            <div className="text-lg font-bold text-amber-400">📊 查看百鐵英雄榜</div>
            <p className="text-xs text-gray-400">瀏覽總排名與各階段百鐵榮耀名單。</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
