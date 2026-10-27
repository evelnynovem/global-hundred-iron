"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";

const AWARD_STAGES = [
  "初鐵賞 (1場)", "三鐵賞 (3場)", "五鐵賞 (5場)", "十鐵賞 (10場)",
  "二十鐵賞 (20場)", "三十鐵賞 (30場)", "四十鐵賞 (40場)", "五十鐵賞 (50場)",
  "六十鐵賞 (60場)", "七十鐵賞 (70場)", "八十鐵賞 (80場)", "九十鐵賞 (90場)", "百鐵賞 (100場)",
  "初鐵馬賞 (單車1場)", "十鐵馬賞 (單車10場)", "五十鐵馬賞 (單車50場)", "百鐵馬賞 (單車100場)"
];

export default function ShopPage() {
  const [certName, setCertName] = useState("陳彥良");
  const [certStage, setCertStage] = useState("初鐵賞");
  const [certDate, setCertDate] = useState("2026.10.27");
  const [isPaidUnlocked, setIsPaidUnlocked] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const metaName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || "";
        if (metaName) setCertName(metaName === "Wei-hsin Hung" ? "洪緯欣" : metaName);
      }
    }
    loadUser();
  }, [supabase]);

  const products = [
    {
      badge: "官方授證紀念",
      tag: "達成階梯限定",
      title: "全球百鐵認證 專屬雷雕紀念獎牌",
      price: "NT$ 200",
      image: "/images/medal-only.jpg",
      fallbackImage: "/logo.png",
      desc: "採用台灣天然芳香樟木精緻雷雕，專屬刻印您的姓名、達成場次（初鐵/十鐵/五十鐵/百鐵）與完賽日期。",
      features: ["天然樟木立體雷雕", "客製化刻印姓名與達成賞別", "含專屬紀念保護包裝"],
      cta: "立即申購獎牌 (NT$ 200)",
    },
    {
      badge: "官方授證紀念",
      tag: "最受歡迎組合",
      title: "全球百鐵認證 獎牌＋裱框水晶證書組",
      price: "NT$ 200",
      image: "/images/crystal-cert.jpg",
      fallbackImage: "/logo.png",
      desc: "包含專屬階段賞別證書與精緻外框，適合擺設於家中或辦公室榮耀展示牆，紀錄每一個突破自我的里程碑。",
      features: ["官方認證專屬賞別獎狀", "高質感精緻裱框與防偽印記", "可搭配下方線上預覽直接下單出貨"],
      cta: "立即申購獎牌＋框 (NT$ 200)",
    },
    {
      badge: "個人榮耀旗幟",
      tag: "終點拱門焦點",
      title: "全球百鐵認證 客製化終點大刀旗幟",
      price: "專案客製報價",
      image: "/images/custom-flag.jpg",
      fallbackImage: "/logo.png",
      desc: "1100mm × 3000mm / 4000mm 巨型抗風水滴大刀旗，印有全球百鐵認證金章、駿馬圖騰與選手專屬大名，賽事終點最霸氣的榮耀象徵！",
      features: ["尺寸規格：寬 1100mm × 高 3000mm（含旗桿 4000mm）", "專屬印製選手大名與百鐵榮耀駿馬圖騰", "適合百鐵達成、授證典禮與車隊主場佈置"],
      cta: "洽詢客製化個人大刀旗幟",
    },
    {
      badge: "聯名戰袍",
      tag: "百鐵榮耀戰袍",
      title: "全球百鐵認證 × 昇陽 SYB 客製化頂級三鐵衣",
      price: "依款式報價",
      image: "/images/syb-trisuit.jpg",
      fallbackImage: "/logo.png",
      desc: "由昇陽自行車專業團隊操刀，採用高透氣低風阻義大利進口布料，可印製個人專屬百鐵編號與姓名。",
      features: ["專業長距離三鐵競速剪裁", "可客製印製個人姓名/百鐵認證標章", "昇陽官方品質保固"],
      cta: "前往合作夥伴專區選購",
    },
  ];

  return (
    <div translate="no" className="notranslate min-h-screen bg-[#070709] text-white flex flex-col justify-between">
      <main className="max-w-6xl w-full mx-auto px-6 py-12 space-y-14">
        
        {/* 標題區 */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold uppercase tracking-widest">
            HONOR SHOP & DIGITAL CERTIFICATE
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            百鐵榮耀商城與線上賞別獎狀預覽
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            全球百鐵認證堅持「零報名費、免費登錄」。您可以免費線上預覽個人各階段賞別獎狀，或自由選購 NT$ 200 紀念獎牌、裱框證書與客製化終點大刀旗幟。
          </p>
        </div>

        {/* 🌟 新增功能：線上即時預覽個人各階段「賞別水晶獎狀（含防偽浮水印）」與付款解鎖下載/出貨 */}
        <section className="rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-amber-500/40 p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* 左側設定與付款解鎖控制 */}
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-block px-3 py-1 rounded-lg bg-amber-500 text-black text-xs font-black">
                ✨ 線上即時賞別獎狀產生器
              </div>
              <h2 className="text-2xl font-black text-white">
                預覽您的專屬階段《賞別完賽證書》
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                系統根據您累積的完賽場次，自動生成對應階段之榮耀獎狀（預覽版帶有防偽浮水印）。完成 NT$ 200 申購付款後，即可直接下載高清無浮水印數位檔並安排實體水晶證書/獎牌出貨！
              </p>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">授證選手姓名</label>
                  <input
                    type="text"
                    value={certName}
                    onChange={(e) => setCertName(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm text-white font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">選擇達成賞別階段</label>
                    <select
                      value={certStage}
                      onChange={(e) => setCertStage(e.target.value.split(" ")[0])}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-amber-400 font-bold focus:border-amber-500 focus:outline-none"
                    >
                      {AWARD_STAGES.map((st) => (
                        <option key={st} value={st.split(" ")[0]}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">授證日期</label>
                    <input
                      type="text"
                      value={certDate}
                      onChange={(e) => setCertDate(e.target.value)}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPaidUnlocked(true);
                      alert("🎉 已為您模擬付款完成（NT$ 200）！右側獎狀浮水印已解除，並已登記實體獎牌/證書出貨申請！");
                    }}
                    className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm transition shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    💳 付款 NT$ 200 解鎖高清證書下載 ＆ 實體出貨
                  </button>
                  {isPaidUnlocked && (
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm transition cursor-pointer"
                    >
                      ⬇️ 立即列印 / 儲存高清無浮水印證書
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 右側：擬真完賽水晶證書預覽（比照您上傳的原住民圖騰邊框＋百鐵金章＋駿馬底圖＋動態浮水印） */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-md aspect-[3/4] rounded-2xl bg-white text-zinc-900 shadow-2xl overflow-hidden border-8 border-zinc-900 flex">
                
                {/* 左側原住民菱形圖騰裝飾條 */}
                <div className="w-7 h-full bg-zinc-950 flex flex-col justify-between py-2 items-center select-none">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} className="w-4 h-4 rotate-45 border-2 border-red-500 bg-amber-400/80" />
                  ))}
                </div>

                {/* 證書中央主體 */}
                <div className="flex-1 p-6 flex flex-col items-center justify-between text-center relative overflow-hidden">
                  
                  {/* 駿馬剪影背景 */}
                  <div className="absolute right-[-20px] bottom-16 text-[180px] opacity-10 pointer-events-none select-none">
                    🐎
                  </div>

                  {/* 防偽浮水印（未付款前顯示） */}
                  {!isPaidUnlocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-20 -rotate-30">
                      <div className="text-2xl sm:text-3xl font-black text-red-600/25 border-4 border-red-600/25 px-4 py-2 rounded-xl tracking-widest uppercase">
                        GLOBAL 100 PREVIEW WATERMARK
                      </div>
                      <div className="text-sm font-black text-zinc-900/25 mt-2">
                        線上預覽專用・付款後解鎖無浮水印高清版與出貨
                      </div>
                    </div>
                  )}

                  {/* 頂部百鐵認證 Logo */}
                  <div className="space-y-1 z-10">
                    <img
                      src="/logo.png"
                      alt="Global 100 Triathlon"
                      className="w-20 h-20 mx-auto object-contain"
                    />
                    <div className="text-[11px] font-bold text-zinc-500 tracking-widest pt-1">
                      全球百鐵認證
                    </div>
                    <div className="text-2xl font-black tracking-widest text-zinc-900">
                      完 賽 證 書
                    </div>
                    <div className="text-[10px] font-extrabold tracking-widest text-zinc-600 uppercase">
                      CERTIFICATE OF FINISH
                    </div>
                  </div>

                  {/* 選手姓名與授證詞 */}
                  <div className="space-y-2 z-10 w-full">
                    <div className="text-xs font-bold text-zinc-700">恭賀選手</div>
                    <div className="text-3xl font-black text-zinc-950 border-b-2 border-zinc-800 pb-1.5 mx-6 tracking-wider">
                      {certName || "認證選手"}
                    </div>
                    <p className="text-xs text-zinc-700 font-semibold leading-relaxed pt-1">
                      通過全球百鐵認證官方<br />
                      查核達成階段完賽目標
                    </p>
                    <p className="text-xs text-zinc-800 font-bold pt-1">
                      特頒此狀 以茲鼓勵
                    </p>
                    <div className="text-3xl font-black text-amber-900 pt-1 tracking-widest">
                      {certStage}
                    </div>
                  </div>

                  {/* 底部聯名單位與日期 */}
                  <div className="space-y-1.5 z-10 w-full border-t border-zinc-200 pt-3">
                    <div className="flex items-center justify-center gap-3 text-[9px] font-black text-zinc-600">
                      <span className="px-1.5 py-0.5 bg-zinc-900 text-white rounded">IRONMEDIC 醫護鐵人</span>
                      <span>巴歌浪鐵人</span>
                      <span>臺東城鄉生活運動協會</span>
                    </div>
                    <div className="text-[10px] font-bold text-zinc-700">
                      中華民國全球百鐵認證協會
                    </div>
                    <div className="text-xs font-mono font-bold text-zinc-600">
                      {certDate}
                    </div>
                  </div>
                </div>

                {/* 右側原住民菱形圖騰裝飾條 */}
                <div className="w-7 h-full bg-zinc-950 flex flex-col justify-between py-2 items-center select-none">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} className="w-4 h-4 rotate-45 border-2 border-red-500 bg-amber-400/80" />
                  ))}
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* 四大實體商品與客製化大刀旗展示 */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((item, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-zinc-950 border border-zinc-800/90 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl hover:border-amber-500/40 transition"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-bold">{item.badge}</span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                    {item.tag}
                  </span>
                </div>

                {/* 商品照片預覽區（自動讀取您上傳至 public/images/ 的照片） */}
                <div className="h-52 w-full rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center">
                  <img
                    src={item.image}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== item.fallbackImage) {
                        target.src = item.fallbackImage;
                      }
                    }}
                    alt={item.title}
                    className="h-full w-full object-contain p-2"
                  />
                </div>

                <div>
                  <h3 className="text-xl font-black text-white">{item.title}</h3>
                  <div className="text-2xl font-black text-amber-400 mt-1">{item.price}</div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {item.desc}
                </p>

                <ul className="space-y-1.5 text-xs text-zinc-400">
                  {item.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href="https://line.me"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm text-center transition shadow-lg shadow-amber-500/20"
              >
                {item.cta} ↗
              </a>
            </div>
          ))}
        </section>

      </main>
      <Footer />
    </div>
  );
}
