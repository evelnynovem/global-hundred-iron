"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const acceptCookies = (type: "all" | "essential") => {
    localStorage.setItem("cookie_consent", type);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-2xl z-50 border-t border-gray-700">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-xs md:text-sm text-gray-300 leading-relaxed">
          <strong className="text-white">🍪 網站 Cookie 與隱私權聲明：</strong>
          本網站（含全球百鐵認證、普悠瑪鐵人三項及輪躍台南聯合專區）使用必要之 Cookie 以維持您的會員登入狀態與購物車安全，並透過分析型 Cookie 改善賽事查詢體驗。詳情請參閱
          <Link href="/legal/privacy" className="text-blue-400 underline ml-1">
            隱私權與個資保護政策
          </Link>。
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => acceptCookies("essential")}
            className="px-4 py-2 text-xs font-medium bg-gray-700 hover:bg-gray-600 rounded-md transition"
          >
            僅接受必要項目
          </button>
          <button
            onClick={() => acceptCookies("all")}
            className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 rounded-md transition"
          >
            同意全部
          </button>
        </div>
      </div>
    </div>
  );
}
