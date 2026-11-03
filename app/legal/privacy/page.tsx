"use client";

import React, { useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  const [copiedType, setCopiedType] = useState<string>("");

  const partnerClauseText = `【個人資料蒐集、處理、利用暨全球百鐵認證共同行銷授權條款】
1. 蒐集主體與聯合認證宣告：本賽事為「全球百鐵認證（Global 100 Triathlon Certification，由全球醫鐵有限公司統籌營運）」之官方指定結盟系列賽事。當您報名本賽事時，即表示您同意主辦單位蒐集、處理及利用您的個人資料。
2. 蒐集之個人資料類別：包含姓名、性別、出生年月日、身分證字號（或護照號碼）、聯絡電話、電子郵件信箱（Email）、通訊地址、緊急聯絡人資訊、所屬運動團隊名稱、參賽組別、參賽號碼及完賽成績紀錄。
3. 個人資料利用之期間、地區、對象及方式（含提供予全球百鐵認證同步行銷使用）：
(1) 利用對象：除供本賽事主辦單位及承辦廠商辦理賽事保險、晶片計時、物資寄送及賽務通知外，您明確同意主辦單位得將上述報名個人資料與完賽成績數據，同步提供予「全球百鐵認證（全球醫鐵有限公司）」及其官方合作贊助商（包含但不限於醫護鐵人、邁克仕 AminoMax 等運動補給與裝備合作夥伴）。
(2) 利用目的與方式：供「全球百鐵認證」進行跨賽事歷年完賽場次累計、百鐵／百鐵馬英雄榜公開排名（僅公開顯示姓名、團隊、組別與完賽成績）、會員完賽履歷歸戶、榮耀證書與獎牌核發、參賽補給品預約兌換核銷，以及後續相關賽事資訊、運動醫學衛教與贊助商品牌優惠之同步行銷推廣。
(3) 利用期間與地區：於本賽事及全球百鐵認證平台存續期間內，於台灣及全球百鐵認證服務所及之地區合理利用。
4. 當事人權利行使：您得依個人資料保護法第 3 條規定，隨時向主辦單位或「全球百鐵認證」請求查詢、閱覽、補充或更正、停止共同行銷推播或刪除您的個人資料。`;

  const copyPartnerClause = () => {
    navigator.clipboard.writeText(partnerClauseText);
    setCopiedType("partner");
    setTimeout(() => setCopiedType(""), 3000);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between">
      <div className="max-w-5xl w-full mx-auto px-6 py-12 space-y-10">
        
        <div className="border-b border-zinc-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest">
              PRIVACY POLICY & DATA SHARING AGREEMENT
            </span>
            <h1 className="text-3xl font-black text-white mt-2">
              個人資料保護暨跨賽事共同行銷授權聲明
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              符合台灣《個人資料保護法》規範，保障選手權益並落實加盟主辦單位與全球百鐵認證之數據互通。
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold transition shrink-0"
          >
            ← 返回首頁
          </Link>
        </div>

        {/* 區塊一：全球百鐵認證官網版個資聲明 */}
        <section className="rounded-3xl bg-zinc-950 border border-zinc-800 p-6 sm:p-8 space-y-5 shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-black">
              版本一：全球百鐵認證官網版
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white">
              全球百鐵認證（G100TC）官方網站個人資料保護與共同行銷條款
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            <p>
              歡迎您使用「全球百鐵認證（Global 100 Triathlon Certification，由全球醫鐵有限公司統籌營運，下稱本平台）」。依據中華民國《個人資料保護法》規定，本平台向您告知以下個人資料蒐集、處理、利用及與加盟賽事主辦單位同步行銷之規範：
            </p>
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2">
              <h3 className="font-extrabold text-amber-400">1. 資料來源與蒐集類別</h3>
              <p>
                本平台之選手資料來源包含：(1) 各加盟系列賽事主辦單位（含各縣市運動協會、賽事執行公司及線上報名平台）經選手報名同意後合法移轉之完賽與報名資料；(2) 會員本人於本平台註冊、認領或榮譽登錄之個人資料（含姓名、英文姓名、身分證字號或護照號碼、出生年月日、聯絡電話、Email、收件地址、醫護證照資訊及預計參賽場次）。
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2">
              <h3 className="font-extrabold text-amber-400">2. 跨單位資料互通與同步行銷利用（主辦單位 × 全球百鐵認證 × 贊助夥伴）</h3>
              <p>
                當您報名全球百鐵認證系列賽事、或於本平台會員中心勾選「預計參加之未來賽事（如邁克仕 AminoMax 參賽補給預約兌換）」時，<strong>您明確同意您的報名與預約資料除了提供予該場賽事之主辦協會／公司外，亦同步授權提供予「全球百鐵認證（全球醫鐵有限公司）」及「醫護鐵人」作為場次統計、物資配發核銷、完賽歸戶，以及後續賽事資訊、運動醫學衛教與官方贊助商品牌優惠之同步行銷使用</strong>。
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2">
              <h3 className="font-extrabold text-amber-400">3. 公開排行榜之個資安全遮罩原則</h3>
              <p>
                本平台之「百鐵英雄榜」與「完賽紀錄查詢」僅公開顯示選手之「姓名、所屬團隊、參賽組別、賽事名稱、完賽日期與完賽時間」，絕不對外公開您的身分證字號、電話、通訊地址或電子郵件信箱。
              </p>
            </div>
          </div>
        </section>

        {/* 區塊二：給合作公司或協會放入報名簡章的公版條款（含一鍵複製按鈕） */}
        <section className="rounded-3xl bg-zinc-950 border border-emerald-500/40 p-6 sm:p-8 space-y-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-black">
                版本二：提供給合作協會／賽事公司／報名平台使用
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white mt-2">
                加盟主辦單位報名簡章專用《個資提供暨同步行銷授權條款》
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                請點擊右側按鈕直接複製以下文字，交給臺東城鄉協會、輪躍台南或活動咖放入報名表勾選同意書中。
              </p>
            </div>
            <button
              type="button"
              onClick={copyPartnerClause}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition cursor-pointer shrink-0"
            >
              {copiedType === "partner" ? "✅ 已複製條款文字！" : "📋 一鍵複製給合作協會使用"}
            </button>
          </div>

          <pre className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed font-sans">
            {partnerClauseText}
          </pre>
        </section>

      </div>
      <Footer />
    </div>
  );
}
