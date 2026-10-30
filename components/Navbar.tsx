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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3">
          {isTuraaSite ? (
            <>
              <img
                src="/images/turaa-logo.png"
                alt="臺東縣城鄉生活運動協會"
                className="h-11 w-11 object-contain rounded-lg bg-black p-0.5"
              />
              <div className="leading-tight">
                <div className="text-base sm:text-lg font-black tracking-tight text-zinc-900">
                  臺東縣城鄉生活運動協會
                </div>
                <div className="text-[10px] font-bold tracking-wider text-orange-600 uppercase">
                  TAITUNG URBAN RURAL ATHLETIC ASSOCIATION
                </div>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </Link>

        <nav className="hidden lg:flex items-center gap-5 text-sm font-bold">
          {activeLinks.map((item, idx) => (
            <Link
              key={idx}
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
            {isTuraaSite ? "選手/管理中心" : "會員中心"}
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-sm"
          aria-label="開啟選單"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-white border-b border-zinc-200 px-6 py-5 space-y-3 shadow-xl">
          <div className="flex flex-col space-y-3 text-sm font-bold">
            {activeLinks.map((item, idx) => (
              <Link
                key={idx}
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
              {isTuraaSite ? "選手/管理中心" : "會員中心"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
