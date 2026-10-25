import React from "react";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-16 px-6">
      <div className="mx-auto max-w-4xl space-y-10">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">
            個人資料保護聲明與平台免責條款
          </h1>
          <p className="text-xs text-slate-400">最後更新日期：2026 年 10 月</p>
        </div>

        <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-sm leading-relaxed text-slate-300">
          <h2 className="text-lg font-bold text-amber-400">一、 個人資料蒐集、處理及利用告知事項</h2>
          <p>
            「全球百鐵認證平台」（以下簡稱本平台）為提供耐力運動完賽紀錄登錄、百鐵英雄榜統計及系列賽事榮譽認證服務，依據《個人資料保護法》第八條規定，向您告知下列事項：
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-400">
            <li>
              <strong>蒐集目的：</strong>運動賽事成績統計、英雄榜榮譽公開展示、會員身分識別、階段獎項審核及平台重要公告通知。
            </li>
            <li>
              <strong>個人資料類別：</strong>姓名（或暱稱）、電子郵件信箱、出生年份、性別、個人上傳之代表頭像及運動完賽成績紀錄。
            </li>
            <li>
              <strong>系列賽事資料勾稽說明：</strong>若您參加本平台結盟之「年度系列賽事」，合作主辦單位將於賽後提供完賽選手之姓名、成績與報名電子郵件予本平台建立「待認領紀錄」。本平台於您本人註冊登入並點擊「確認認領」前，絕不會對外公開未認領之電子郵件資訊。
            </li>
            <li>
              <strong>當事人權利：</strong>您可隨時登入會員中心或聯繫官方客服，請求查詢、閱覽、補充、更正、停止處理利用或刪除您的個人資料與完賽紀錄。
            </li>
          </ul>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-sm leading-relaxed text-slate-300">
          <h2 className="text-lg font-bold text-amber-400">二、 完賽紀錄榮譽自律與審核條款</h2>
          <p>
            本平台提供之自主完賽登錄採「鐵人榮譽信任制」。會員應確保所填載之賽事名稱、完賽時間與成績均為本人真實完成，且不重複登錄無晶片計時或非合格標準之活動。若欲申請本平台之實體榮譽獎牌或參加年度百鐵授證儀式，本平台保留要求會員出示大會完賽證明以供人工複核之權利。
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-sm leading-relaxed text-slate-300">
          <h2 className="text-lg font-bold text-amber-400">三、 異業結盟與商品服務免責聲明</h2>
          <p>
            本平台「榮耀商城」所展示之聯名商品（如客製化三鐵服）及賽事後勤支援服務（如單車託運、保母車租賃、旅宿安排等），部分係由本平台之異業結盟合作廠商直接提供。
          </p>
          <p className="text-slate-400">
            本平台僅提供資訊揭露與外部連結導引，並非該第三方商品或租賃運輸服務之出賣人或契約當事人。關於第三方合作廠商之商品瑕疵擔保、運送安全、退換貨及履約爭議，均由各該合作廠商依法負完全責任，本平台不介入亦不承擔連帶賠償責任。
          </p>
        </section>
      </div>
    </div>
  );
}