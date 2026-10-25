import React from "react";

const products = [
  {
    id: "medal-wood",
    category: "官方授證紀念",
    name: "全球百鐵認證 專屬雷雕樟木獎牌暨證書",
    price: "NT$ 800",
    badge: "達成階梯限定",
    description:
      "採用台灣天然芳香樟木精緻雷雕，專屬刻印您的姓名、達成場次（十鐵/三十鐵/五十鐵/百鐵）與完賽日期，附贈官方認證裱框證書。",
    features: ["天然樟木立體雷雕", "客製化刻印姓名與場次", "含稅與專屬紀念盒裝"],
    ctaText: "透過官方 LINE@ 申請核對並訂購",
    // 若日後有藍新快速收款網址，可直接替換下方連結
    externalUrl: "https://line.me/R/ti/p/@global100", 
  },
  {
    id: "tri-suit",
    category: "聯名戰袍",
    name: "全球百鐵認證 × 昇陽 SYB 客製化頂級三鐵衣",
    price: "依款式報價",
    badge: "百鐵榮耀戰袍",
    description:
      "由昇陽自行車專業團隊操刀，採用高透氣低風阻義大利進口布料，可印製個人專屬百鐵編號與姓名，在賽道上展現百鐵英雄辨識度。",
    features: ["專業長距離三鐵競速剪裁", "可客製印製個人姓名/百鐵認證標章", "昇陽官方品質保固"],
    ctaText: "前往合作夥伴專區選購",
    externalUrl: "https://www.syb-sports.com/",
  },
  {
    id: "gala-dinner",
    category: "年度盛會",
    name: "年度百鐵英雄授證榮耀晚宴",
    price: "依年度公告",
    badge: "年度盛事",
    description:
      "每年定期舉辦之鐵人界年終盛會，邀請創始推手、各大賽事主辦人親自為達成階段目標之鐵人頒發榮譽獎座，共享榮耀時刻。",
    features: ["公開授證儀式與榮譽背板合影", "跨界鐵人交流晚宴", "專屬伴手禮袋"],
    ctaText: "洽詢最新梯次報名資訊",
    externalUrl: "https://line.me/R/ti/p/@global100",
  },
  {
    id: "support-van",
    category: "賽事後勤結盟",
    name: "花東賽事 單車運送 / 保母車 / 住宿異業服務",
    price: "合作夥伴優惠價",
    badge: "異業結盟",
    description:
      "為減輕選手征戰台東普悠瑪、花蓮等外地賽事之交通負擔，平台嚴選合法租賃與單車託運合作夥伴，提供百鐵會員專屬後勤支援。",
    features: ["專業單車無損運送", "賽事期間保母車支援", "本服務由合作廠商直接提供並負履約責任"],
    ctaText: "查看合作廠商與預約方式",
    externalUrl: "https://line.me/R/ti/p/@global100",
  },
];

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-14">
          <span className="inline-block rounded-full bg-amber-500/10 border border-amber-500/30 px-4 py-1 text-xs font-semibold text-amber-400 mb-3">
            HONOR SHOP & SERVICES
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            百鐵榮耀商城與專屬服務
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
            全球百鐵認證堅持「零報名費、免費登錄」。您可以自由選購專屬雷雕紀念獎牌或聯名戰袍，將賽道上的汗水化為實體收藏，同時支持平台永續營運。
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {products.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-7 flex flex-col justify-between hover:border-amber-500/40 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold text-slate-400">{item.category}</span>
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-0.5 text-xs font-bold text-amber-300">
                    {item.badge}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{item.name}</h2>
                <div className="text-2xl font-extrabold text-amber-400 mb-4">{item.price}</div>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">{item.description}</p>
                <ul className="space-y-2 mb-8 border-t border-slate-800/80 pt-4">
                  {item.features.map((f, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="text-amber-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={item.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center rounded-xl bg-amber-500 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 transition"
              >
                {item.ctaText} ↗
              </a>
            </div>
          ))}
        </div>

        {/* 商城免責與金流安全說明 */}
        <div className="mt-12 rounded-xl border border-slate-800 bg-slate-900/30 p-5 text-xs text-slate-400 leading-relaxed">
          <p className="font-semibold text-slate-300 mb-1">💡 訂購與履約說明：</p>
          <p>
            1. 申請各階梯榮耀獎牌（如十鐵、五十鐵、百鐵）需先於本平台完成完賽紀錄登錄，由小幫手核對場次無誤後即可安排製作。<br />
            2. 為保障您的交易資安，本平台不直接儲存任何信用卡號；相關商品與異業結盟服務將導引至官方授權夥伴商城、第三方安全支付連結或官方客服辦理。
          </p>
        </div>
      </div>
    </div>
  );
}