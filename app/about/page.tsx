"use client";

import React from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function AboutPage() {
  const triAwards = [
    "《初鐵賞》", "《三鐵賞》", "《五鐵賞》", "《十鐵賞》",
    "《二十鐵賞》", "《三十鐵賞》", "《四十鐵賞》", "《五十鐵賞》",
    "《六十鐵賞》", "《七十鐵賞》", "《八十鐵賞》", "《九十鐵賞》", "《百鐵賞》"
  ];

  const bikeAwards = [
    "《初鐵馬賞》", "《三鐵馬賞》", "《五鐵馬賞》", "《十鐵馬賞》",
    "《二十鐵馬賞》", "《三十鐵馬賞》", "《四十鐵馬賞》", "《五十鐵馬賞》",
    "《六十鐵馬賞》", "《七十鐵馬賞》", "《八十鐵馬賞》", "《九十鐵馬賞》", "《百鐵馬賞》"
  ];

  return (
    <div translate="no" className="notranslate min-h-screen bg-[#070709] text-white flex flex-col justify-between">
      <main className="max-w-5xl w-full mx-auto px-6 py-12 space-y-10">
        
        {/* 頂部導言 */}
        <section className="rounded-3xl bg-gradient-to-br from-zinc-950 via-[#100a0c] to-zinc-950 border border-zinc-800 p-8 sm:p-10 shadow-2xl space-y-5">
          <div className="inline-block px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold tracking-widest uppercase">
            ABOUT GLOBAL 100 TRIATHLON CERTIFICATION (G100TC)
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            關於「全球百鐵認證 Global 100 Triathlon Certification」
          </h1>
          <div className="space-y-4 text-sm sm:text-base text-zinc-300 leading-relaxed">
            <p>
              鐵人三項源自於夏威夷，而<strong className="text-amber-400">全球百鐵認證則創始自台灣</strong>。全球百鐵認證 <strong className="text-white">Global 100 Triathlon Certification (G100TC)</strong> 為全球首創鐵人三項賽事及鐵馬賽事完賽紀錄認證平台。這個源自台灣、全球首創的鐵人三項賽事、公路自由車賽與登山越野車賽完賽紀錄登錄及認證平台，為<strong className="text-amber-400">醫護鐵人</strong>主導統籌、國際知名<strong className="text-amber-400">美利達自行車</strong>及眾多品牌支持的認證單位。有鑒於馬拉松的百馬認證廣為人知，故百鐵認證採<strong className="text-emerald-400">線上零收費認證</strong>，結合實體賽事現場讓更多愛好者共同參與。
            </p>
            <p>
              鐵人三項代表耐力和毅力，而鐵馬更是貼近大家日常生活，我們的目標是鼓勵熱愛耐力運動的鐵人與鐵馬愛好者挑戰「百鐵」。認證過程簡單，只要登錄本網會員，填寫入會申請表，註冊會員，登錄合格賽事，不需任何費用。
            </p>
          </div>
        </section>

        {/* 三大認證標準 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 鐵人三項認證標準 */}
          <section className="rounded-3xl bg-zinc-950 border border-zinc-800/90 p-6 sm:p-7 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-amber-400 font-black text-lg">
              🏊‍♂️ 【鐵人三項認證標準】
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
              <li><strong className="text-white">原則一：</strong>僅開放登錄 51.5 公里以上距離之鐵人三項賽事（同時具備游泳項目 1.5 公里（含）或以上、自行車 40 公里（含）或以上、跑步 10 公里（含）或以上），且時間必須為連續性，且必須於大會規定的時間內完賽。</li>
              <li><strong className="text-white">原則二：</strong>僅開放登錄政府單位主辦或經政府立案之民間團體所主辦，或由全球百鐵認證特別認可之 51.5km 以上鐵人三項賽事，私人舉辦的賽事恕不接受。</li>
              <li><strong className="text-white">原則三：</strong>僅開放登錄國內外政府核准申辦（如：路權）的賽事。</li>
              <li><strong className="text-white">原則四：</strong>僅開放登錄合格賽事必須設有晶片感應計時，且必須設有完整的補給及醫護措施。</li>
            </ul>
          </section>

          {/* 公路單車認證標準 */}
          <section className="rounded-3xl bg-zinc-950 border border-zinc-800/90 p-6 sm:p-7 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-red-400 font-black text-lg">
              🚴‍♂️ 【公路單車認證標準】
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
              <li><strong className="text-white">原則一：</strong>僅開放登錄 90km 以上距離之公路賽或 113km 以上鐵人三項參賽組別之完賽紀錄，越野單車賽不列入本登記範圍，未完賽者亦不能登錄，且時間必須為連續性，且必須於大會規定的時間內完賽。</li>
              <li><strong className="text-white">原則二：</strong>僅開放登錄政府單位主辦或經政府立案之民間團體所主辦，或由全球百鐵認證特別認可之公路單車賽事及 113km 以上鐵人三項賽事，私人舉辦的賽事恕不接受。</li>
              <li><strong className="text-white">原則三：</strong>為尊重其他已開放各式認證的賽事單位，類似賽事恕不開放登錄（如：北高、雙塔、三塔系列自我挑戰認證賽事）。</li>
              <li><strong className="text-white">原則四：</strong>僅開放登錄國內外政府核准申辦（如：路權）的公路單車賽事。</li>
              <li><strong className="text-white">原則五：</strong>僅開放登錄合格賽事必須設有晶片感應計時，且必須設有完整的補給及醫護措施。</li>
            </ul>
          </section>

          {/* 越野單車認證標準 */}
          <section className="rounded-3xl bg-zinc-950 border border-zinc-800/90 p-6 sm:p-7 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-lg">
              🚵‍♂️ 【越野單車認證標準】
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
              <li><strong className="text-white">原則一：</strong>僅開放登錄 20km 以上距離之越野單車賽或 XTERRA 鐵人三項參賽組別之完賽紀錄，公路單車賽不列入本登記範圍，未完賽者亦不能登錄且時間必須為連續性，且必須於大會規定的時間內完賽。</li>
              <li><strong className="text-white">原則二：</strong>僅開放登錄政府單位主辦或經政府立案之民間團體所主辦，或由全球百鐵認證特別認可之越野單車賽事，私人舉辦的賽事恕不接受。</li>
              <li><strong className="text-white">原則三：</strong>為尊重其他已開放各式認證的賽事單位，類似賽事恕不開放登錄（如：北高、雙塔、三塔系列自我挑戰認證賽事）。</li>
              <li><strong className="text-white">原則四：</strong>僅開放登錄政府核准申辦（如：路權）的越野單車賽事。</li>
              <li><strong className="text-white">原則五：</strong>僅開放登錄合格賽事必須設有晶片感應計時，且必須設有完整的補給及醫護措施。</li>
            </ul>
          </section>
        </div>

        {/* 認證辦法與獎勵 */}
        <section className="rounded-3xl bg-zinc-950 border border-zinc-800 p-8 space-y-6 shadow-xl">
          <div className="space-y-3">
            <h2 className="text-xl font-black text-amber-400">📋 【鐵人三項、公路單車及越野單車認證辦法】</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-300 leading-relaxed">
              <li>上網填寫「全球百鐵認證」入會申請表並註冊登錄成為會員（免繳會費）。</li>
              <li>登錄合格賽事名稱、舉辦時間、地點，並將完賽成績登錄於指定表單才算百鐵中的一鐵。基於對運動愛好者的榮譽信任，全球百鐵認證不另做審核，請申請「全球百鐵認證」的鐵人們務必詳閱相關規定。</li>
            </ol>
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <h2 className="text-xl font-black text-amber-400">🏅 【獎勵】</h2>
            <p className="text-sm text-zinc-300">於全球百鐵認證的官網上列出姓名及榮耀英雄榜排名。</p>
          </div>
        </section>

        {/* 獎項與領獎條件 */}
        <section className="rounded-3xl bg-zinc-950 border border-zinc-800 p-8 space-y-6 shadow-xl">
          <h2 className="text-2xl font-black text-white">🏆 【獎項與授證規範】</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-zinc-900/60 border border-amber-500/30 p-5 space-y-3">
              <h3 className="text-base font-extrabold text-amber-400">1. 鐵人三項獎項設有：</h3>
              <div className="flex flex-wrap gap-2">
                {triAwards.map((aw) => (
                  <span key={aw} className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                    {aw}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-zinc-900/60 border border-red-500/30 p-5 space-y-3">
              <h3 className="text-base font-extrabold text-red-400">2. 公路單車及越野單車獎項設有：</h3>
              <div className="flex flex-wrap gap-2">
                {bikeAwards.map((aw) => (
                  <span key={aw} className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold">
                    {aw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-zinc-800">
            <h3 className="text-base font-extrabold text-white">3. 頒獎時間及領獎條件：</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-300 leading-relaxed">
              <li><strong className="text-amber-400">3.1</strong> 得獎標準以登錄審核截止日（含）前於全球百鐵認證網站上所登錄的合格賽事數為標準。</li>
              <li><strong className="text-amber-400">3.2</strong> 鐵人三項得獎者必須參加每年於台灣台東市超級鐵人三項或普悠瑪鐵人三項賽事聯名舉辦的全球百鐵英雄授證宴並購買獎牌與獎狀（約每年十月或三月）方得領獎。</li>
              <li><strong className="text-amber-400">3.3</strong> 公路單車及越野單車得獎者則另行公告。</li>
              <li><strong className="text-amber-400">3.4</strong> 每年各獎項不得重複領取，亦不能同時領取二種以上獎項。</li>
            </ul>
          </div>

          <div className="pt-4 flex flex-wrap gap-3">
            <Link
              href="/profile/new-record"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm transition"
            >
              ✍️ 立即登錄完賽紀錄
            </Link>
            <Link
              href="/shop"
              className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-sm transition"
            >
              🛍️ 前往榮耀商城查看獎牌與水晶證書
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
