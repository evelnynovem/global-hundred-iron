"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("頁面載入自動恢復:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col items-center justify-center px-6 text-center space-y-5">
      <div className="text-amber-400 text-xs font-extrabold tracking-widest uppercase">
        GLOBAL 100 TRIATHLON CERTIFICATION
      </div>
      <h2 className="text-2xl font-black text-white">頁面載入完成中</h2>
      <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
        偵測到行動網路或瀏覽器快取更新，請點擊下方按鈕立即顯示最新頁面。
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-sm"
        >
          立即顯示頁面
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 font-bold text-sm"
        >
          返回首頁
        </button>
      </div>
    </div>
  );
}
