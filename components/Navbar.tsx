"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // 當路由改變時，自動關閉手機版下拉選單
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "台東城鄉生活運動協會", href: "/taitung-assoc", highlight: true },
    { label: "系列賽事", href: "/series" },
    { label: "百鐵英雄榜", href: "/rankings" },
    { label: "成績登錄查詢", href: "/certifications/query" },
    { label: "完賽登錄", href: "/profile/new-record" },
    { label: "關於我們", href: "/about" },
    { label: "榮耀商城", href: "/shop" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white text-zinc-900 border-b border-zinc-200 shadow-sm notranslate" translate="no">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* 左側 Logo 與認證標題 */}
        <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="全球百鐵認證"
            className="h-10 w-10 object-contain rounded-full"
          />
          <div className="leading-tight">
            <div className="text-base sm:text-lg font-black tracking-tight text-zinc-900">
              全球百鐵認證
            </div>
            <div className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
              GLOBAL 100 TRIATHLON CERTIFICATION
            </div>
          </div>
        </Link>

        {/* 電腦版導覽列 */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-bold">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                item.highlight
                  ? "text-orange-600 hover:text-orange-500 font-extrabold transition"
                  : "text-zinc-700 hover:text-black transition"
              }
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/profile"
            className="ml-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold transition shadow-sm"
          >
            會員中心
          </Link>
        </nav>

        {/* 手機版漢堡選單按鈕 */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-sm"
          aria-label="開啟選單"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* 手機版展開選單（點擊任一項目立即自動關閉） */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-b border-zinc-200 px-6 py-5 space-y-3 shadow-xl">
          <div className="flex flex-col space-y-3 text-sm font-bold">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={
                  item.highlight
                    ? "py-1.5 text-orange-600 font-extrabold"
                    : "py-1.5 text-zinc-800 hover:text-black"
                }
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="pt-2">
            <Link
              href="/profile"
              onClick={() => setMenuOpen(false)}
              className="block w-full py-3 rounded-xl bg-blue-600 text-white text-center font-extrabold text-sm shadow-md"
            >
              會員中心
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
