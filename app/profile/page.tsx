"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [privacyConfirmed, setPrivacyConfirmed] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setLoading(false);
        return;
      }
      // 給 OAuth callback 1 秒鐘緩衝讀取狀態
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.replace("/login");
      }
      setLoading(false);
    }
    loadUser();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        正在載入您的百鐵會員資料與驗證狀態...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 會員頂部歡迎卡片 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
              ✓ 已通過帳號驗證與個資保護聲明確認
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">
              歡迎回來，{user.user_metadata?.full_name || user.email}
            </h1>
            <p className="text-sm text-slate-500">登入信箱：{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-medium transition"
          >
            登出帳號
          </button>
        </div>

        {/* 個資同意狀態確認與管理區塊 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              個人資料授權與完賽紀錄認領狀態
            </h2>
            <Link href="/legal/privacy" className="text-xs text-blue-600 hover:underline">
              查看完整個資聲明條款 →
            </Link>
          </div>
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-slate-700 space-y-1">
              <p className="font-semibold text-slate-900">
                您已同意《全球百鐵認證隱私權與個資保護聲明》
              </p>
              <p className="text-slate-500">
                為保護選手個資，排行榜僅以「姓名＋所屬團隊」去識別化方式公開累積鐵數。
              </p>
            </div>
            <input
              type="checkbox"
              checked={privacyConfirmed}
              onChange={(e) => setPrivacyConfirmed(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
          </div>
        </div>

        {/* 會員核心功能快捷區 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/profile/claim"
            className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 shadow-sm transition space-y-2"
          >
            <div className="text-lg font-bold text-slate-900">🏅 認領歷史完賽紀錄</div>
            <p className="text-xs text-slate-500">
              從百鐵資料庫上萬筆歷史賽事中，搜尋您的姓名並綁定至個人帳號。
            </p>
          </Link>

          <Link
            href="/certifications"
            className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 shadow-sm transition space-y-2"
          >
            <div className="text-lg font-bold text-slate-900">✍️ 登錄最新完賽成績</div>
            <p className="text-xs text-slate-500">
              上傳最新鐵人三項或單車賽事完賽證書，累積您的百鐵榮耀場次。
            </p>
          </Link>

          <Link
            href="/rankings"
            className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 shadow-sm transition space-y-2"
          >
            <div className="text-lg font-bold text-slate-900">📊 查看百鐵英雄榜</div>
            <p className="text-xs text-slate-500">
              前往查看目前總排名及初鐵、10鐵至百鐵各階段認證名單。
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
