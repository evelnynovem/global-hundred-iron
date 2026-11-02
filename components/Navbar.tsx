"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isTuraaSite, setIsTuraaSite] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
    if (typeof window !== "undefined") {
      const host = window.location.hostname.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (host.includes("turaa") || params.get("site") === "turaa" || sessionStorage.getItem("force_turaa_site") === "1") {
        if (params.get("site") === "g100") {
          sessionStorage.removeItem("force_turaa_site");
          setIsTuraaSite(false);
        } else {
          if (params.get("site") === "turaa") sessionStorage.setItem("force_turaa_site", "1");
          setIsTuraaSite(true);
          document.title = "臺東縣城鄉生活運動協會 官方網站";
        }
      } else {
        document.title = "全球百鐵認證 Global 100 Triathlon Certification";
      }
    }
  }, [pathname]);

  const g100Links = [
    { label: "台東城鄉生活運動協會", href: "/taitung-assoc", highlight: true },
    { label: "系列賽事", href: "/series" },
    { label: "百鐵英雄榜", href: "/rankings" },
    { label: "成績登錄查詢", href: "/certifications/query" },
    { label: "完賽登錄", href: "/profile/new-record" },
    { label: "關於我們", href: "/about" },
    { label: "榮耀商城", href: "/shop" },
  ];

  const turaaLinks = [
    { label: "協會首頁", href: "/" },
    { label: "最新公告與秩序冊", href: "/taitung-assoc", highlight: true },
    { label: "普悠瑪鐵人三項", href: "/taitung-assoc" },
    { label: "戀戀197自行車賽", href: "/taitung-assoc" },
    { label: "歷年成績查詢", href: "/certifications/query" },
  ];

  const activeLinks = isTuraaSite ? turaaLinks : g100Links;

  return (
    <header className="sticky top-0 z-50 w-full bg-white text-zinc-900 border-b border-zinc-200 shadow-sm notranslate" translate="no">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 min-h-[60px] py-1.5 flex items-center justify-between gap-2">
        <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {isTuraaSite ? (
            <>
              <img
                src="/images/turaa-logo.png"
                alt="臺東縣城鄉生活運動協會"
                className="h-10 w-10 sm:h-11 sm:w-11 object-contain rounded-lg bg-black p-0.5 shrink-0"
              />
              <div className="leading-tight min-w-0">
                <div className="text-sm sm:text-lg font-black tracking-tight text-zinc-900 truncate">
                  臺東縣城鄉生活運動協會
                </div>
                <div className="text-[9px] sm:text-[10px] font-bold tracking-wider text-orange-600 uppercase truncate">
                  TAITUNG URBAN RURAL ATHLETIC ASSOCIATION
                </div>
              </div>
            </>
          ) : (
            <>
              <img
                src="/logo.png"
                alt="全球百鐵認證"
                className="h-10 w-10 sm:h-11 sm:w-11 object-contain rounded-full shrink-0"
              />
              <div className="leading-tight min-w-0">
                <div className="text-base sm:text-lg font-black tracking-tight text-zinc-900">
                  全球百鐵認證
                </div>
                <div className="text-[8.5px] sm:text-[10px] font-extrabold tracking-wider text-red-600 uppercase leading-snug">
                  FOUNDED BY IRONMEDIC 醫護鐵人創立統籌 ｜ GLOBAL 100 TRIATHLON CERTIFICATION
                </div>
              </div>
            </>
          )}
        </Link>

        <nav className="hidden xl:flex items-center gap-4 text-sm font-bold shrink-0">
          {activeLinks.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className={
                item.highlight
                  ? "text-orange-600 hover:text-orange-500 font-extrabold transition whitespace-nowrap"
                  : "text-zinc-700 hover:text-black transition whitespace-nowrap"
              }
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/profile"
            className="ml-1 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold transition shadow-sm whitespace-nowrap"
          >
            {isTuraaSite ? "選手/管理中心" : "會員中心"}
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="xl:hidden p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-sm shrink-0 cursor-pointer"
          aria-label="開啟選單"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="xl:hidden bg-white border-b border-zinc-200 px-5 py-4 space-y-3 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-bold">
            {activeLinks.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={
                  item.highlight
                    ? "py-2 px-3 rounded-lg bg-orange-50 text-orange-600 font-extrabold"
                    : "py-2 px-3 rounded-lg hover:bg-zinc-100 text-zinc-800"
                }
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="pt-2 flex gap-2">
            <Link
              href="/profile"
              onClick={() => setMenuOpen(false)}
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-center font-extrabold text-sm shadow-md"
            >
              {isTuraaSite ? "選手/管理中心" : "會員中心"}
            </Link>
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3 rounded-xl bg-zinc-900 text-amber-400 text-center font-extrabold text-xs shadow-md flex items-center justify-center"
            >
              👑 管理後台
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
