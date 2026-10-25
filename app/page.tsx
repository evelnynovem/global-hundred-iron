import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-[85vh] flex flex-col justify-center max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* 頂部主視覺 Banner (採用彈性間距與 RWD 字級，手機與桌機均完美呈現) */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-gray-800">
        <div className="space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-bold border border-amber-400/20">
            🔥 全球百鐵認證暨普悠瑪聯合服務平台
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            看見每一段堅持的累積。
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-lg leading-relaxed">
            零報名費、永久記錄。一組帳號通用於全球百鐵認證、台東普悠瑪鐵人三項與長途單車挑戰，為您的榮譽留下永恆見證。
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
            <Link
              href="/rankings"
              className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-black text-xs font-black rounded-xl shadow-lg transition"
            >
              成績查詢與英雄榜 →
            </Link>
            <Link
              href="/certifications"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition border border-white/10"
            >
              完賽榮譽登錄
            </Link>
          </div>
        </div>

        <div className="shrink-0">
          <img
            src="/logo.png"
            alt="全球百鐵認證"
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-amber-400 shadow-2xl mx-auto"
          />
        </div>
      </div>

      {/* 核心功能導覽三欄卡片 (完美適應手機單欄、平板與桌機多欄排列) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link
          href="/certifications/triathlon"
          className="group bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:border-red-500 hover:shadow-xl transition flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-xl font-bold shadow-inner">
              🏊‍♂️
            </div>
            <h2 className="text-lg font-black text-gray-900 group-hover:text-red-600 transition">
              鐵人三項登錄
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              支援 51.5K、113K、226K 賽事，系統自動精算年齡分組。
            </p>
          </div>
          <span className="text-xs font-bold text-red-600 group-hover:translate-x-1 transition">
            前往登錄成績 →
          </span>
        </Link>

        <Link
          href="/certifications/cycling"
          className="group bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:border-emerald-500 hover:shadow-xl transition flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold shadow-inner">
              🚴‍♂️
            </div>
            <h2 className="text-lg font-black text-gray-900 group-hover:text-emerald-600 transition">
              公路車單車登錄
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              支援 100K+、200K+、300K+ 長途挑戰賽與 KOM 登山王認證。
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition">
            前往登錄成績 →
          </span>
        </Link>

        <Link
          href="/rankings"
          className="group bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:border-amber-500 hover:shadow-xl transition flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold shadow-inner">
              🏆
            </div>
            <h2 className="text-lg font-black text-gray-900 group-hover:text-amber-600 transition">
              百鐵英雄榜查詢
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              即時檢視全站公開完賽記錄、個人歷程總覽與社群榮譽監督機制。
            </p>
          </div>
          <span className="text-xs font-bold text-amber-600 group-hover:translate-x-1 transition">
            立即查詢紀錄 →
          </span>
        </Link>
      </div>

      {!user && (
        <div className="text-center pt-2">
          <Link
            href="/auth/login"
            className="inline-block px-8 py-3.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-lg transition"
          >
            登入會員以同步個人資料與完賽紀錄
          </Link>
        </div>
      )}
    </div>
  );
}