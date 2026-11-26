"use client";

import React, { useState } from "react";

interface Props {
  defaultTab?: "all" | "triathlon" | "cycling" | "governance";
  compact?: boolean;
}

export default function CertificationRulesSection({ defaultTab = "all", compact = false }: Props) {
  const [activeTab, setActiveTab] = useState<"all" | "triathlon" | "cycling" | "governance">(defaultTab);

  const showTri = activeTab === "all" || activeTab === "triathlon";
  const showCyc = activeTab === "all" || activeTab === "cycling";
  const showGov = activeTab === "all" || activeTab === "governance";

  return (
    <section className="rounded-3xl bg-[#0e0e11] border border-amber-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="space-y-1.5">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-[11px] font-black tracking-widest uppercase">
            OFFICIAL CERTIFICATION CHARTER・VERIFICATION & GOVERNANCE
          </span>
          <h2 className={compact ? "text-xl sm:text-2xl font-black text-white" : "text-xl sm:text-3xl font-black text-white"}>
            📜 全球百鐵認證（G100TC）官方完賽登錄原則與查核規範
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-3xl">
            本平台秉持「免費、公開、榮譽自律、事實查核」四大核心價值，以下規範適用於所有鐵人三項與公路自行車（百鐵馬）完賽紀錄登錄、認領及英雄榜排名計算。
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          {[
            { id: "all", label: "全部條款" },
            { id: "triathlon", label: "🏊‍♂️ 鐵人三項原則" },
            { id: "cycling", label: "🚴 百鐵馬原則" },
            { id: "governance", label: "⚖️ 查核・檢舉與防同名機制" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={
                "px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer " +
                (activeTab === tab.id
                  ? "bg-amber-500 text-black shadow-lg"
                  : "bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800")
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. 鐵人三項 & 2. 自行車（百鐵馬）雙軌原則 */}
      {(showTri || showCyc) && (
        <div className={"grid grid-cols-1 gap-6 " + (showTri && showCyc ? "lg:grid-cols-2" : "")}>
          {showTri && (
            <article className="rounded-2xl bg-zinc-950 border border-zinc-800 p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                <h3 className="text-base sm:text-lg font-black text-amber-400">
                  🏊‍♂️ 鐵人三項完賽登錄核心原則
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-black">
                  51.5K+ / 113K / 226K
                </span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                全球百鐵認證（Global 100 Triathlon Certification）鐵人三項完賽登錄核心原則為：限 <strong className="text-white">51.5 公里（含）以上</strong>標準距離或超級鐵人賽事、須為合法主辦單位與連續完賽，並採免費線上榮譽自律登錄。
              </p>

              <div className="space-y-3">
                <h4 className="text-xs font-black text-zinc-200 uppercase tracking-wider border-l-2 border-amber-500 pl-2.5">
                  一、賽事與完賽資格原則
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  <li>
                    <strong className="text-white">• 距離標準：</strong>
                    僅開放登錄 51.5 公里（含）以上之鐵人三項賽事，且須同時具備游泳 1.5 公里（含）以上、自行車 40 公里（含）以上、跑步 10 公里（含）以上（包含 113K、226K 超級鐵人三項等）。
                  </li>
                  <li>
                    <strong className="text-white">• 連續完賽與限時：</strong>
                    賽事計時須具備連續性，且選手須於大會規定之各分段關門及總完賽時間內完成，未完賽（DNF）或遭取消資格（DSQ）者不得登錄。
                  </li>
                  <li>
                    <strong className="text-white">• 主辦與合法性：</strong>
                    主辦單位須為政府機關、依法立案之民間團體，或經全球百鐵認證特別認可之賽事（國內外賽事均須獲當地主管機關認可）；私人非正式約騎或私辦賽事不予受理。
                  </li>
                  <li>
                    <strong className="text-white">• 計時與安全配置：</strong>
                    合格賽事須配置大會官方晶片感應計時系統，並具備完整之賽道補給與專業醫護安全配置。
                  </li>
                </ul>
              </div>

              <div className="space-y-3 pt-2 border-t border-zinc-800/70">
                <h4 className="text-xs font-black text-zinc-200 uppercase tracking-wider border-l-2 border-amber-500 pl-2.5">
                  二、登錄與統計制度
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  <li>
                    <strong className="text-white">• 免費與榮譽自律制：</strong>
                    註冊會員完全免費；完賽紀錄採榮譽自律登錄，免除事前逐筆人工審核，送出後即同步更新個人完賽履歷與百鐵英雄榜統計。
                  </li>
                  <li>
                    <strong className="text-white">• 送出前核對與日期防呆：</strong>
                    基於榮譽信任與紀錄公信力，送出後原則上不開放事後自行修改，且系統嚴格禁止登錄超過當日之未來日期；送出前請務必核對賽事名稱、日期、地點、組別與完賽成績。
                  </li>
                  <li>
                    <strong className="text-white">• 同日去重原則：</strong>
                    同一日期（同日）無論登錄幾場賽事，系統於英雄榜及階段賞別累計時嚴格僅採計 <strong className="text-amber-300">1 場</strong>有效完賽。
                  </li>
                </ul>
              </div>
            </article>
          )}

          {showCyc && (
            <article className="rounded-2xl bg-zinc-950 border border-zinc-800 p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                <h3 className="text-base sm:text-lg font-black text-blue-400">
                  🚴 自行車（百鐵馬）完賽登錄核心原則
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/40 text-blue-300 text-[11px] font-black">
                  單日 90K+ 公路車
                </span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                全球百鐵認證（G100TC）自行車（百鐵馬）完賽登錄以<strong className="text-white">單日長距離公路自由車賽</strong>為核心，並與鐵人三項超鐵組別（113K／226K）雙軌自動連動。
              </p>

              <div className="space-y-3">
                <h4 className="text-xs font-black text-zinc-200 uppercase tracking-wider border-l-2 border-blue-500 pl-2.5">
                  一、距離與完賽條件
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  <li>
                    <strong className="text-white">• 距離門檻：</strong>
                    限單日單場 <strong className="text-blue-300">90 公里（含）以上</strong>之公路自由車挑戰賽或正式競賽（如戀戀 197、輪躍台南、蘭陽百K、高雄百K、雙塔 520 等）。
                  </li>
                  <li>
                    <strong className="text-white">• 完賽要求：</strong>
                    須於賽事規定時間內連續騎乘完賽，計時具備連續性；未完賽者不可登錄。
                  </li>
                  <li>
                    <strong className="text-emerald-400">• 超鐵 113K / 226K 雙軌自動同步：</strong>
                    因 113K（70.3）與 226K 超級鐵人三項之公路車段即達 90 公里／180 公里以上，會員於本平台<strong className="text-white">登錄或認領 113K／226K 超鐵賽事時，系統將自動同步寫入並認證一筆 90K+ 百鐵馬紀錄</strong>，無須重複登錄或二次認領。
                  </li>
                </ul>
              </div>

              <div className="space-y-3 pt-2 border-t border-zinc-800/70">
                <h4 className="text-xs font-black text-zinc-200 uppercase tracking-wider border-l-2 border-blue-500 pl-2.5">
                  二、賽事資格與排除項目
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  <li>
                    <strong className="text-white">• 主辦與安全配置：</strong>
                    須由政府單位、政府立案民間團體主辦，或經全球百鐵認證特別認可；須具備政府核可路權或官方晶片感應計時，並設有完整補給與醫護安全措施。私人舉辦賽事不予受理。
                  </li>
                  <li>
                    <strong className="text-red-300">• 明確排除項目：</strong>
                    <span className="text-red-200">越野單車賽（MTB 等）不列入登記範圍</span>；另部分未具官方晶片計時或非屬本認證規格之自我挑戰認證系列賽，亦不開放登錄。
                  </li>
                  <li>
                    <strong className="text-white">• 會員與證明備查：</strong>
                    須先註冊會員並妥善留存官方完賽成績證明或電子完賽證書，以備後續抽檢或查核之用。
                  </li>
                </ul>
              </div>
            </article>
          )}
        </div>
      )}

      {/* 3. 榮譽查核・公開檢舉與違規停權條款（潤飾合法化） + 4. 英雄榜各賞別與防同名同姓三層比對機制 */}
      {showGov && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <article className="rounded-2xl bg-gradient-to-br from-red-950/30 via-zinc-950 to-zinc-950 border border-red-800/40 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-red-900/40 pb-3">
              <h3 className="text-base sm:text-lg font-black text-red-300">
                ⚖️ 榮譽查核、公開檢舉與違規處分條款
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-700/50 text-red-200 text-[11px] font-black">
                公信力保障規範
              </span>
            </div>

            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
              <li>
                <strong className="text-white">1. 榮譽自律與公開檢舉機制：</strong>
                全球百鐵認證採「事前榮譽自律、事後公開查核」原則，並開放大眾及參賽選手針對異常成績提出檢舉。檢舉人應提供具體事證（包含賽事名稱、日期及疑義說明）；本單位將依《個人資料保護法》對檢舉人身分嚴格保密並啟動事實查核程序。
              </li>
              <li>
                <strong className="text-white">2. 不實資料逕行下架與申覆權：</strong>
                凡經本單位事實查核確認登載資料有誤、重複申報、未符合本平台認證規格或無法提出有效完賽佐證者，主辦單位保留<strong className="text-amber-300">逕行修正、下架或刪除該筆紀錄之權利，無須事先徵得同意或另行個別通知</strong>。當事人如對查核結果有異議，得於發現或受通知起 14 日內檢附大會官方完賽證明向本單位提出申覆。
              </li>
              <li>
                <strong className="text-red-200">3. 重大異常帳戶之永久停權處分：</strong>
                若經查核發現單一帳號涉及<strong className="text-white">蓄意偽造完賽證明、大量異常登錄不實紀錄、冒領他人賽事成績</strong>，或屢次違反本平台認證規範情節重大者，本單位有權立即凍結並<strong className="text-red-300">永久終止其會員登錄權限、英雄榜列名與授證資格</strong>，且保留依法追究相關民、刑事法律責任之權利。
              </li>
            </ul>
          </article>

          <article className="rounded-2xl bg-gradient-to-br from-amber-950/25 via-zinc-950 to-zinc-950 border border-amber-600/35 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-amber-900/40 pb-3">
              <h3 className="text-base sm:text-lg font-black text-amber-400">
                🛡️ 英雄榜各賞別統計與「防同名同姓混淆」比對機制
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-black">
                三層身分歸戶
              </span>
            </div>

            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
              <li>
                <strong className="text-white">1. 第一層・實名會員唯一識別歸戶（最高準確度）：</strong>
                已完成註冊並透過個人帳號逐筆勾選認領之紀錄，系統以<strong className="text-amber-300">會員唯一識別碼（帳號／電子信箱）</strong>獨立歸戶，與同名同姓之其他選手徹底分離，並於英雄榜顯示「<strong className="text-amber-300">✓ 已實名認證</strong>」徽章，嚴禁任何帳號重複認領已由他人認證之紀錄。
              </li>
              <li>
                <strong className="text-white">2. 第二層・推算出生年區間輔助比對（防跨年升組誤拆與同名混算）：</strong>
                考量選手「年齡」會隨年度變動，系統將歷年官方成績之「賽事年份與分齡組別」反推為不隨時間漂移之<strong className="text-white">推算出生年區間</strong>（避免跨年由 M35 升組 M40 被誤拆為兩人）。若資料庫偵測到同名待認領紀錄之出生年跨度超過 12 年，英雄榜將自動標註「<strong className="text-orange-300">⚠️ 含同名選手・認領後獨立計場</strong>」，引導本人登入核對分齡組、車隊與完賽時間後逐筆勾選分流。
              </li>
              <li>
                <strong className="text-white">3. 第三層・同日去重與 13 階賞別即時排名：</strong>
                英雄榜採用資料庫伺服器端高速聚合與嚴格同日去重計算，依個人有效完賽場次自動對應 <strong className="text-amber-300">1（初）、3（三）、5（五）、10（十）、20（廿）、30（卅）、40、50、60、70、80、90、100（百）</strong> 共 13 階鐵人賞／鐵馬賞榮耀等級；唯有完成實名認證且達標之會員，方可解鎖對應階段水晶證書與合作品牌加價購特權。
              </li>
            </ul>
          </article>
        </div>
      )}
    </section>
  );
}
