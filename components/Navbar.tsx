"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isTuraaSite, setIsTuraaSite] = useState(false);
  const [lang, setLang] = useState("zh-TW");
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

      // 讀取目前 Cookie 中的語言狀態
      const match = document.cookie.match(/googtrans=\/zh-TW\/([a-zA-Z-]+)/);
      if (match && match[1]) {
        setLang(match[1]);
      } else {
        setLang("zh-TW");
      }

      // 載入 Google Cloud 網頁即時翻譯元件
      if (!document.getElementById("google-translate-script")) {
        (window as any).googleTranslateElementInit = function () {
          if ((window as any).google && (window as any).google.translate) {
            new (window as any).google.translate.TranslateElement(
              {
                pageLanguage: "zh-TW",
                includedLanguages: "zh-TW,en,ja,ko",
                autoDisplay: false,
              },
              "google_translate_element"
            );
          }
        };
        const s = document.createElement("script");
        s.id = "google-translate-script";
        s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        s.async = true;
        document.body.appendChild(s);
      }
    }
  }, [pathname]);

  const handleLanguageChange = (targetLang: string) => {
    setLang(targetLang);
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const host = window.location.hostname;
      if (targetLang === "zh-TW") {
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${host}; path=/;`;
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${host}; path=/;`;
      } else {
        document.cookie = `googtrans=/zh-TW/${targetLang}; path=/;`;
        document.cookie = `googtrans=/zh-TW/${targetLang}; domain=${host}; path=/;`;
        document.cookie = `googtrans=/zh-TW/${targetLang}; domain=.${host}; path=/;`;
      }

      // 優先直接觸發 Google 隱藏下拉選單，若未載入完成則自動重整頁面套用 Cookie
      const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (combo) {
        combo.value = targetLang === "zh-TW" ? "" : targetLang;
        combo.dispatchEvent(new Event("change"));
        if (targetLang === "zh-TW") window.location.reload();
      } else {
        window.location.reload();
      }
    }
  };

  // 已移除「台東城鄉生活運動協會」，維持全球百鐵認證對所有加盟主辦單位之中立性
  const g100Links = [
    { label: "系列賽事", href: "/series", highlight: true },
    { label: "百鐵英雄榜", href: "/rankings" },
    { label: "成績登錄查詢", href: "/certifications/query" },
    { label: "完賽登錄", href: "/profile/new-record" },
    { label: "單車專欄", href: "/columns" },
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
    <header className="sticky top-0 z-50 w-full bg-white text-zinc-900 border-b border-zinc-200 shadow-sm">
      <div id="google_translate_element" className="fixed -top-96 left-0 opacity-0 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-3 sm:px-5 min-h-[62px] py-1.5 flex items-center justify-between gap-2">
        
        <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 shrink-0">
          {isTuraaSite ? (
            <>
              <img
                src="/images/turaa-logo.png"
                alt="臺東縣城鄉生活運動協會"
                className="h-10 w-10 object-contain rounded-lg bg-black p-0.5 shrink-0"
              />
              <div className="leading-tight">
                <div className="text-sm sm:text-base font-black tracking-tight text-zinc-900">
                  臺東縣城鄉生活運動協會
                </div>
                <div className="text-[8.5px] font-bold tracking-wider text-orange-600 uppercase">
                  TAITUNG URBAN RURAL ATHLETIC ASSOC.
                </div>
              </div>
            </>
          ) : (
            <>
              <img
                src="/logo.png"
                alt="全球百鐵認證"
                className="h-10 w-10 object-contain rounded-full shrink-0"
              />
              <div className="leading-tight flex flex-col">
                <span className="text-sm sm:text-base font-black tracking-tight text-zinc-900">
                  全球百鐵認證
                </span>
                <span className="text-[8px] sm:text-[9px] font-extrabold tracking-wide text-red-600 uppercase leading-tight">
                  FOUNDED BY IRONMEDIC 醫護鐵人創立統籌
                </span>
                <span className="text-[7.5px] sm:text-[8.5px] font-bold tracking-wider text-zinc-500 uppercase leading-tight">
                  GLOBAL 100 TRIATHLON CERTIFICATION
                </span>
              </div>
            </>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-3 lg:gap-4 text-xs lg:text-[13px] font-bold flex-wrap justify-end">
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

          <select
            value={lang}
            onChange={(e) => handleLanguageChange(e.target.value)}
            aria-label="切換網站語言"
            className="px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-800 text-xs font-extrabold cursor-pointer"
          >
            <option value="zh-TW">🌐 繁體中文</option>
            <option value="en">🌐 English</option>
            <option value="ja">🌐 日本語</option>
            <option value="ko">🌐 한국어</option>
          </select>

          <Link
            href="/profile"
            className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold transition shadow-sm whitespace-nowrap"
          >
            {isTuraaSite ? "選手/管理中心" : "會員中心"}
          </Link>
        </nav>

        <div className="flex md:hidden items-center gap-1.5">
          <select
            value={lang}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="px-1.5 py-1 rounded-lg bg-zinc-100 border border-zinc-300 text-zinc-800 text-[11px] font-bold"
          >
            <option value="zh-TW">繁中</option>
            <option value="en">EN</option>
            <option value="ja">日本語</option>
            <option value="ko">한국어</option>
          </select>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-sm shrink-0 cursor-pointer"
            aria-label="開啟選單"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-b border-zinc-200 px-5 py-4 space-y-3 shadow-xl">
          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm font-bold">
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
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-center font-extrabold text-xs shadow-md"
            >
              {isTuraaSite ? "選手/管理中心" : "會員中心"}
            </Link>
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 text-amber-400 text-center font-extrabold text-xs shadow-md"
            >
              👑 管理後台
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
