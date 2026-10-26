import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-10 space-y-6 text-slate-700">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            隱私權與個人資料保護政策聲明
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            全球百鐵認證平台（全球醫鐵有限公司 / 台東城鄉生活運動協會 聯合維運）
          </p>
        </div>

        <section className="space-y-3 text-sm sm:text-base leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">一、 個人資料之蒐集目的與類別</h2>
          <p>
            為提供鐵人三項與自行車選手完賽成績查詢、百鐵榮耀排行榜統計、歷史成績認領、證書審核及賽事報名服務，本平台於您註冊會員或登錄完賽資料時，會蒐集您的姓名、聯絡電子郵件、所屬運動團隊名稱、參賽紀錄及完賽證明影像。
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-2">二、 排行榜去識別化與個資安全設計</h2>
          <p>
            『百鐵認證』公開英雄榜為兼顧選手榮耀展示與個人隱私安全，僅以「選手姓名＋所屬團隊名稱」及「累積完賽場次」進行公開揭示，絕不公開選手之身分證字號、電話、通訊地址或電子郵件等敏感個人資訊。
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-2">三、 Cookie 與第三方登入驗證</h2>
          <p>
            本網站使用必要之安全性 Cookie 以維持您的會員登入狀態（包含 Google OAuth 快速登入驗證）與購物車安全。相關驗證金鑰皆受雲端資料庫資料列級別安全（Row Level Security, RLS）保護。
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-2">四、 選手當事人權利</h2>
          <p>
            您可隨時登入「會員中心」查詢、認領、更正您的完賽紀錄，或向本平台提出停止公開顯示、刪除帳號資料之請求。
          </p>
        </section>

        <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/login"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition"
          >
            我已了解並同意，返回登入 / 會員中心
          </Link>
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-800"
          >
            返回首頁
          </Link>
        </div>
      </div>
    </div>
  );
}
