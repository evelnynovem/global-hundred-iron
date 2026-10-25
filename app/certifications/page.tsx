"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CertificationsHubPage() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, [supabase]);

  return (
    <div className="min-h-[85vh] flex flex-col justify-center max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* 頂部標題區 (調整上下 padding，確保手機與桌機都能在第一屏完美呈現) */}
      <div className="text-center space-y-3">
        <img
          src="/logo.png"
          alt="全球百鐵認證"
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto border-2 border-amber-400 shadow-lg object-cover"
        />
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          全球百鐵與單車完賽認證中心
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
          零報名費、永久記錄、榮譽自律。請選擇您本次要進行認證登錄的運動項目類別：
        </p>
      </div>

      {/* 雙欄卡片區 (加入自適應間距與 flex 彈性，完美適應各種螢幕寬度) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto w-full">
        {/* 鐵人三項入口 */}
        <Link
          href="/certifications/triathlon"
          className="group bg-white p-6 sm:p-7 rounded-2xl shadow-lg border border-gray-100 hover:border-red-500 hover:shadow-xl transition flex flex-col items-center text-center space-y-3"
        >
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-xl group-hover:scale-110 transition shadow-inner">
            🏊‍♂️🚴‍♂️🏃‍♂️
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-gray-900 group-hover:text-red-600 transition">
              鐵人三項完賽登錄
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              支援 51.5K、113K、226K 標準與超級鐵人，自動計算年齡分組。
            </p>
          </div>
          <span className="text-xs font-bold text-red-600 pt-1 group-hover:translate-x-1 transition">
            開始登錄成績 →
          </span>
        </Link>

        {/* 公路車單車入口 */}
        <Link
          href="/certifications/cycling"
          className="group bg-white p-6 sm:p-7 rounded-2xl shadow-lg border border-gray-100 hover:border-emerald-500 hover:shadow-xl transition flex flex-col items-center text-center space-y-3"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl group-hover:scale-110 transition shadow-inner">
            🚴‍♂️⚡
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-gray-900 group-hover:text-emerald-600 transition">
              公路車完賽登錄
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              支援 100K+、200K+、300K+ 長途挑戰賽與 KOM 登山王認證。
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 pt-1 group-hover:translate-x-1 transition">
            開始登錄成績 →
          </span>
        </Link>
      </div>

      {!user && (
        <div className="text-center pt-2">
          <Link
            href="/auth/login"
            className="inline-block px-6 py-3 bg-gray-900 text-white text-xs font-bold rounded-xl shadow hover:bg-black transition"
          >
            登入會員以同步個人資料與完賽紀錄
          </Link>
        </div>
      )}
    </div>
  );
}