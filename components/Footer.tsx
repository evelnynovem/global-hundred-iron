"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [isTuraa, setIsTuraa] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (host.includes("turaa") || params.get("site") === "turaa" || sessionStorage.getItem("force_turaa_site") === "1") {
        setIsTuraa(true);
      }
    }
  }, []);

  return (
    <footer className="w-full border-t border-zinc-900 bg-[#050507] py-10 px-4 sm:px-6 text-center text-xs text-zinc-500 space-y-3">
      {isTuraa ? (
        <>
          <div className="font-extrabold tracking-widest text-zinc-300 uppercase">
            TAITUNG URBAN & RURAL ATHLETIC ASSOCIATION (TURAA)
          </div>
          <div className="text-zinc-400 font-semibold">
            臺東縣城鄉生活運動協會 官方數位服務平台
          </div>
        </>
      ) : (
        <>
          <div className="font-extrabold tracking-widest text-zinc-300 uppercase">
            GLOBAL 100 TRIATHLON CERTIFICATION
          </div>
          <div className="text-zinc-400 font-semibold">
            全球百鐵認證服務平台（由醫護鐵人 IRONMEDIC 創立統籌）
          </div>
        </>
      )}
      <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-zinc-400">
        <Link href="/series" className="hover:text-amber-400 transition">系列賽事</Link>
        <span>｜</span>
        <Link href="/rankings" className="hover:text-amber-400 transition">百鐵英雄榜</Link>
        <span>｜</span>
        <Link href="/legal/privacy" className="hover:text-amber-400 transition">個人資料保護與共同行銷聲明</Link>
        <span>｜</span>
        <Link href="/about" className="hover:text-amber-400 transition">關於我們</Link>
      </div>
      <div className="text-[11px] text-zinc-600 pt-1">
        © {new Date().getFullYear()} Global 100 Triathlon Certification. All rights reserved.
      </div>
    </footer>
  );
}
