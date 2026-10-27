"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* 左上角 Logo 與平台標題 */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500 shadow-md bg-slate-900 flex items-center justify-center shrink-0">
              {/* 若 public 夾中有 logo.png 即可顯示，否則顯示文字備用 */}
              <Image src="/logo.png" alt="全球百鐵認證" width={48} height={48} className="object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg text-gray-900 tracking-tight group-hover:text-amber-600 transition">
                全球百鐵認證
              </span>
              <span className="text-xs text-gray-500 font-medium">
                GLOBAL 100 TRIATHLON CERTIFICATION
              </span>
            </div>
          </Link>

          {/* 桌面版導覽列選單 */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link href="/association" className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 transition">
              台東城鄉生活運動協會
            </Link>
            <Link href="/series" className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-amber-600 transition">
              系列賽事
            </Link>
            <Link href="/certifications/query" className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-amber-600 transition">
              百鐵英雄榜
            </Link>
            <Link href="/certifications" className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-amber-600 transition">
              完賽登錄
            </Link>
            <Link href="/about" className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-amber-600 transition">
              關於我們
            </Link>
            <Link href="/shop" className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-amber-600 transition">
              榮耀商城
            </Link>
          </nav>

          {/* 右側會員中心 */}
          <div className="hidden md:flex items-center">
            <Link href="/profile" className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition">
              會員中心
            </Link>
          </div>

          {/* 手機版漢堡選單按鈕 */}
          <div className="flex md:hidden items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none" aria-label="切換選單">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 手機版下拉選單 */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <Link href="/association" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-sm font-bold text-orange-600 hover:bg-orange-50">台東城鄉生活運動協會</Link>
          <Link href="/series" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-100">系列賽事</Link>
          <Link href="/certifications/query" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-100">百鐵英雄榜</Link>
          <Link href="/certifications" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-100">完賽登錄</Link>
          <Link href="/about" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-100">關於我們</Link>
          <Link href="/shop" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-100">榮耀商城</Link>
          <div className="pt-2 border-t border-gray-100">
            <Link href="/profile" onClick={() => setIsOpen(false)} className="block w-full text-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow">會員中心</Link>
          </div>
        </div>
      )}
    </header>
  );
}