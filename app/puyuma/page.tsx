import Link from "next/link";

export default function PuyumaHomePage() {
  return (
    <div className="min-h-screen bg-amber-50/30 text-gray-800">
      {/* 普悠瑪專區主視覺 Banner */}
      <div className="bg-gradient-to-r from-amber-900 to-orange-800 text-white py-16 px-6 text-center shadow-md">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-wider mb-4">
          台東普悠瑪鐵人三項賽事專區
        </h1>
        <p className="text-amber-100 max-w-2xl mx-auto text-sm md:text-base mb-8">
          結合全球百鐵認證系統，單一帳號快速預填個資、一鍵報名、歷屆成績互通查詢。
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/profile"
            className="px-6 py-3 bg-white text-amber-900 font-bold rounded-lg shadow hover:bg-amber-50 transition"
          >
            立即預填選手資料報名
          </Link>
          <a
            href="https://www.facebook.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-3 bg-amber-800 border border-amber-600 text-white font-medium rounded-lg shadow hover:bg-amber-700 transition"
          >
            📸 歷屆精彩賽事寫真 (FB 相簿)
          </a>
        </div>
      </div>

      {/* 內容介紹區 */}
      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
          <h3 className="text-lg font-bold text-amber-900 mb-2">⚡ 快速報名通道</h3>
          <p className="text-sm text-gray-600">
            不用每次重複填寫身分證與衣服尺寸。直接從百鐵會員中心帶入，秒速完成普悠瑪報名。
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
          <h3 className="text-lg font-bold text-amber-900 mb-2">🏆 成績自動互通</h3>
          <p className="text-sm text-gray-600">
            完賽後成績直接同步至全球百鐵認證資料庫，累積您的鐵人生涯總里程與榮譽榜。
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
          <h3 className="text-lg font-bold text-amber-900 mb-2">🛡️ 醫護鐵人守護</h3>
          <p className="text-sm text-gray-600">
            賽道安全最高規格，由醫護鐵人專業團隊與在地醫療資源全面為您的完賽之路護航。
          </p>
        </div>
      </div>
    </div>
  );
}
