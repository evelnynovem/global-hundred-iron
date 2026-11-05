"use client";

import React from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

const FOUNDING_INITIATORS = [
  {
    role: "創始總召集人 ／ 醫護鐵人暨全球百鐵認證創辦人",
    name: "陳彥良 (Novem Chen)",
    title: "全球醫鐵有限公司負責人・醫護鐵人創辦人・119場鐵人三項完賽",
    desc: "創立「醫護鐵人 (IronMedic)」社會企業模式與「全球百鐵認證 (G100TC)」，結合企業流程管理顧問、ISO 27001 主任稽核員、EMT 與三鐵/自由車/游泳/田徑教練專業，推動賽道移動式安全守護與零收費百鐵認證榮耀體系。",
    badge: "🚑 醫護鐵人創辦人",
  },
  {
    role: "共同創辦人 ／ 總醫學顧問",
    name: "洪緯欣 醫師 (Dr. Wei-Hsin Hung)",
    title: "屏東榮民總醫院胸腔內科主治醫師・全球百鐵認證共同創辦人",
    desc: "專精胸腔內科、急重症醫學與耐力運動生理學，合著《向前一步，就是解方：狂飆的18鐵人人生處方箋》，主導《單車誌》運動醫學專欄與耐力賽事心肺安全防護規範。",
    badge: "🩺 運動醫學權威",
  },
  {
    role: "創始倡議協辦單位",
    name: "臺東縣城鄉生活運動協會 (TURAA)",
    title: "臺東普悠瑪國際鐵人三項賽 主辦單位",
    desc: "深耕臺灣鐵人三項搖籃臺東，每年舉辦指標性普悠瑪 226K/113K/51.5K 國際鐵人三項賽，與全球百鐵認證全面串聯歷年完賽成績資料庫。",
    badge: "🏊‍♂️ 普悠瑪鐵人推手",
  },
  {
    role: "創始倡議協辦單位",
    name: "巴歌浪運動發展協會 (Pakelang)",
    title: "臺東巴歌浪 113K 鐵人三項暨船屋馬拉松 主辦單位",
    desc: "結合東海岸原住民文化與絕美山海賽道，打造最具人情味與榮耀感的東海岸鐵人三項盛事，並共同倡議百鐵完賽認證。",
    badge: "🌊 東海岸經典賽事",
  },
  {
    role: "創始倡議協辦單位",
    name: "中華民國體適能健身運動協會 ＆ 全球百鐵認證協會",
    title: "全民體適能推廣與賽事安全認證夥伴",
    desc: "共同推動鐵人三項與 90km+ 公路單車百鐵馬雙軌認證制度，落實『安全完賽、榮耀百鐵』之終身運動理念。",
    badge: "🏅 官方認證機構",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between overflow-x-hidden">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
        
        {/* 頂部橫幅 */}
        <section className="rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-amber-500/40 p-6 sm:p-10 shadow-2xl space-y-4">
          <span className="px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-extrabold uppercase">
            FOUNDED BY IRONMEDIC・GLOBAL 100 TRIATHLON CERTIFICATION
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            關於全球百鐵認證 ＆ 創始倡議人
          </h1>
          <p className="text-xs sm:text-base text-zinc-300 leading-relaxed max-w-4xl">
            「全球百鐵認證（Global 100 Triathlon Certification）」由醫護鐵人創辦人陳彥良與洪緯欣醫師共同發起，串聯國內外指標性鐵人三項與長距離公路單車賽事，以「零報名費、實名查核、雙軌同日防呆」打造華人界最具公信力的耐力運動名人堂。
          </p>
        </section>

        {/* 創始倡議人與共同發起單位卡片專區 */}
        <section className="space-y-6">
          <div className="border-l-4 border-amber-500 pl-4">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              👑 創始倡議人 ＆ 五大共同發起機構
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              凝聚運動醫學、賽道安全守護與指標性賽事主辦協會力量，陪伴每位選手邁向百鐵里程碑。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FOUNDING_INITIATORS.map((person, idx) => (
              <div
                key={idx}
                className="rounded-3xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 p-6 space-y-3 shadow-xl transition"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-amber-400">{person.role}</span>
                  <span className="px-3 py-1 rounded-full bg-red-950/80 border border-red-700/50 text-red-300 text-[11px] font-extrabold">
                    {person.badge}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">{person.name}</h3>
                <div className="text-xs font-bold text-emerald-400">{person.title}</div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pt-1">
                  {person.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 核心認證鐵律說明 */}
        <section className="rounded-3xl bg-zinc-950 border border-zinc-800 p-6 sm:p-8 space-y-4">
          <h2 className="text-lg sm:text-xl font-black text-amber-400">
            ⚖️ 全球百鐵認證 三大查核鐵律
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-zinc-300">
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-1.5">
              <div className="font-black text-white">1. 嚴格同日防呆機制</div>
              <p className="text-zinc-400">同一天（同日期）無論登錄幾場 51.5K、113K 或 90km+ 自行車賽，系統嚴格僅計入 1 場有效完賽，杜絕重複灌水。</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-1.5">
              <div className="font-black text-white">2. 超鐵雙軌自動認證</div>
              <p className="text-zinc-400">完成 113K 或 226K 超級鐵人三項（單車段達 90km/180km），系統自動同步計入「公路單車百鐵馬」場次。</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-1.5">
              <div className="font-black text-white">3. 階段賞別解鎖制</div>
              <p className="text-zinc-400">從初鐵賞、三鐵賞、五鐵賞、十鐵賞至百鐵賞，唯有實際累積達標之選手方能解鎖對應階段電子證書與專屬加價購特權。</p>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap gap-3">
            <Link href="/rankings" className="px-5 py-2.5 rounded-xl bg-[#b91c1c] hover:bg-[#dc2626] text-white font-black text-xs sm:text-sm">
              🏆 查看百鐵英雄榜 →
            </Link>
            <Link href="/shop" className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs sm:text-sm">
              🛒 前往榮耀商城 ＆ 證書預覽 →
            </Link>
          </div>
        </section>

      </div>
      <Footer />
    </div>
  );
}
