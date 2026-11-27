"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function RankingRulesBanner() {
  const [expanded, setExpanded] = useState(true);

  return (
    <section
      aria-label="全球百鐵認證排名與三層漸進式身分歸戶規則說明"
      className="rounded-2xl bg-[#0d0d10] border border-amber-500/30 shadow-xl overflow-hidden"
    >
      {/* 標題列（支援收合／展開，兼顧專業權威感與手機瀏覽流暢度） */}
      <div className="px-4 sm:px-5 py-3.5 bg-gradient-to-r from-amber-500/10 via-zinc-900/90 to-zinc-950 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black tracking-widest uppercase">
            3-TIER IDENTITY RESOLUTION
          </span>
          <h2 className="text-sm sm:text-base font-black text-white">
            🛡️ 百鐵認證排名計算規則 ＆ 三層漸進式身分歸戶機制
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/about"
            className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline hidden sm:inline"
          >
            查看完整認證規範 →
          </Link>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold transition cursor-pointer"
          >
            {expanded ? "收合規則 ▲" : "展開排名規則 ▼"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 sm:p-5 space-y-4">
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            為確保上萬筆歷年官方成績排名之公信力並避免同名同姓混淆，本榜捨棄會隨年度變動的「年齡」，全面採用<strong className="text-amber-300">不隨時間漂移的「出生年份／推算出生年區間」</strong>搭配<strong className="text-white">會員逐筆實名認領</strong>之三層歸戶機制：
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
            {/* 第一層 */}
            <div className="rounded-xl bg-zinc-950 border border-amber-500/35 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-500 text-black font-black text-[10px]">
                  第一層・黃金準確
                </span>
                <span className="text-[11px] font-bold text-amber-400">✓ 已實名認證</span>
              </div>
              <h3 className="text-sm font-black text-white">會員帳號唯一識別歸戶</h3>
              <p className="text-zinc-400 leading-relaxed">
                已完成註冊並於「認領中心」親手勾選本人賽事的選手，系統以專屬會員帳號獨立歸戶，徹底與同名同姓陌生人分離，並解鎖 13 階賞別水晶證書與加價購特權。
              </p>
            </div>

            {/* 第二層 */}
            <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-amber-300 border border-amber-500/30 font-black text-[10px]">
                  第二層・智慧防誤拆
                </span>
                <span className="text-[11px] font-bold text-zinc-400">📋 官方收錄待認領</span>
              </div>
              <h3 className="text-sm font-black text-white">推算出生年區間輔助比對</h3>
              <p className="text-zinc-400 leading-relaxed">
                由「賽事年份 − 分齡組別」反推不變的出生年區間（避免跨年從 M35 升組 M40 被誤拆為兩人）。若同名者推算出生年跨度超過 12 年，自動標註「⚠️ 含同名選手」引導認領分流。
              </p>
            </div>

            {/* 第三層 */}
            <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40 font-black text-[10px]">
                  第三層・同日防呆＆雙軌
                </span>
                <span className="text-[11px] font-bold text-emerald-400">⚖️ 榮譽查核制</span>
              </div>
              <h3 className="text-sm font-black text-white">同日僅計 1 場・超鐵雙軌併計</h3>
              <p className="text-zinc-400 leading-relaxed">
                同一日期無論登錄幾場，英雄榜嚴格僅採計 <strong className="text-white">1 場</strong>有效完賽；完成 113K／226K 超鐵將自動雙軌併計「百鐵馬」場次。所有成績開放公開查核與檢舉。
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
