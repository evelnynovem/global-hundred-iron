"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function HomePage() {
  // 網站模式：'g100' (全球百鐵認證母站) | 'turaa' (臺東縣城鄉生活運動協會獨立官網模擬)
  const [siteMode, setSiteMode] = useState<"g100" | "turaa">("g100");
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      // 若網址是 turaa.org.tw 或帶有 ?site=turaa 參數，自動切換為城會獨立官網外觀
      if (host.includes("turaa") || params.get("site") === "turaa") {
        setSiteMode("turaa");
      }
    }
  }, []);

  // 全部 4 張海報（全球百鐵母站顯示全部；城會模式僅顯示 isTuraa: true 的戀戀197與普悠瑪）
  const allSlides = [
    {
      badge: "單車百鐵認證",
      badgeColor: "bg-red-600 text-white",
      title: "戀戀197自行車挑戰賽",
      desc: "2026/12/06 & 2027/12/05｜臺東縣城鄉生活運動協會主辦，挑戰東海岸與197縣道最美縱谷。",
      link: "/taitung-assoc",
      poster: "/images/love197.jpg",
      fallbackPoster: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1200&q=85",
      isTuraa: true,
    },
    {
      badge: "鐵人三項認證",
      badgeColor: "bg-amber-500 text-black",
      title: "台東普悠瑪鐵人三項",
      desc: "2026/03/28｜臺東縣城鄉生活運動協會主辦，活水湖經典賽道，匯聚全台鐵人好手的年度盛事。",
      link: "/taitung-assoc",
      poster: "/images/puyuma.jpg",
      fallbackPoster: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=85",
      isTuraa: true,
    },
    {
      badge: "鐵人三項認證",
      badgeColor: "bg-amber-500 text-black",
      title: "台東巴歌浪鐵人三項",
      desc: "2026/10/17-18 & 2027/10/16-17｜馳騁東海岸壯闊山海，體驗純粹而熱血的鐵人意志。",
      link: "/series",
      poster: "/images/pakelangTSTA.jpeg",
      fallbackPoster: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=85",
      isTuraa: false,
    },
    {
      badge: "單車百鐵認證",
      badgeColor: "bg-red-600 text-white",
      title: "輪躍台南單車嘉年華",
      desc: "2026/12/06 & 2027/12/12｜穿梭古都山海美景，年度最熱鬧的單車盛會。",
      link: "/series",
      poster: "/images/tainan.png",
      fallbackPoster: "https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?auto=format&fit=crop&w=1200&q=85",
      isTuraa: false,
    },
  ];

  const activeSlides = siteMode === "turaa" ? allSlides.filter((s) => s.isTuraa) : allSlides;

  useEffect(() => {
    setCurrentSlide(0);
  }, [siteMode]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const announcements = [
    {
      id: 1,
      isPinned: true,
      org: "城會公告",
      category: "秩序冊與簡章",
      title: "【重要置頂】臺東普悠瑪鐵人三項 ＆ 戀戀197自行車公路賽 選手秩序冊與歷年成績認領開放！",
      date: "2026-10-28",
      href: "/taitung-assoc",
    },
    {
      id: 2,
      isPinned: true,
      org: "百鐵總站",
      category: "系統公告",
      title: "【重要公告】全球百鐵認證官網全新改版上線，支援三鐵與百鐵馬雙軌同日防呆統計與水晶證書預覽！",
      date: "2026-10-27",
      href: "/profile/new-record",
    },
    {
      id: 3,
      isPinned: false,
      org: "結盟賽事",
      category: "賽事快訊",
      title: "【賽事專區】台東巴歌浪鐵人三項、高雄百K、戀戀197與輪躍台南完賽成績連動開放查詢",
      date: "2026-10-20",
      href: "/certifications/query",
    },
  ];

  // 全球百鐵認證 G100TC 官方八大戰略贊助夥伴（已綁定真實官方外部連結）
  const g100Sponsors = [
    {
      name: "醫護鐵人 IRONMEDIC",
      role: "主導統籌單位",
      desc: "全球首創運動安全暨百鐵認證統籌機構",
      url: "https://www.facebook.com/ironmedic.tw",
    },
    {
      name: "美利達自行車 MERIDA",
      role: "國際領導單車品牌",
      desc: "全力支持台灣鐵人與百鐵馬耐力運動發展",
      url: "https://www.merida-bikes.com/zh-tw",
    },
    {
      name: "SYB 昇陽自行車",
      role: "頂級單車與三鐵戰袍夥伴",
      desc: "專業三鐵車、競速裝備與客製化百鐵戰袍",
      url: "https://www.syb-cycling.com/",
    },
    {
      name: "邁克仕 AminoMax",
      role: "官方指定運動補給",
      desc: "專業胺基酸、BCAA 與長距離耐力能量補給",
      url: "https://www.aminomax.com.tw/",
    },
    {
      name: "肌樂 Mentholatum",
      role: "官方運動防護夥伴",
      desc: "賽前熱身與賽後舒緩之運動噴劑領導品牌",
      url: "https://www.mentholatum.com.tw/",
    },
    {
      name: "ZIV 專業運動眼鏡",
      role: "官方指定運動眼鏡",
      desc: "專為亞洲臉型設計之防風抗 UV 頂級光學鏡片",
      url: "https://www.ziv.com.tw/",
    },
    {
      name: "SAEKO 專業泳鏡",
      role: "官方指定開放水域泳鏡",
      desc: "台灣外銷全球之三鐵開放水域廣角防霧泳鏡",
      url: "https://www.saeko.com.tw/",
    },
    {
      name: "NOVATEC 久裕興業",
      role: "官方指定高階輪組",
      desc: "國際頂尖碳纖維輪組與高順暢度花鼓技術",
      url: "https://www.novatecusa.net/",
    },
  ];

  // 城會（臺東縣城鄉生活運動協會）專屬合作與贊助夥伴（可依王理事長需求獨立更換）
  const turaaSponsors = [
    {
      name: "臺東縣政府",
      role: "指導單位",
      desc: "深耕東台灣慢經濟與國際鐵人運動觀光城市",
      url: "https://www.taitung.gov.tw/",
    },
    {
      name: "臺東縣城鄉生活運動協會",
      role: "主辦單位",
      desc: "主辦普悠瑪鐵人三項、臺東超鐵與戀戀197公路賽",
      url: "/taitung-assoc",
    },
    {
      name: "全球百鐵認證 G100TC",
      role: "官方成績認證夥伴",
      desc: "全數完賽成績直通全球百鐵與百鐵馬榮耀殿堂",
      url: "/rankings",
    },
    {
      name: "醫護鐵人 IRONMEDIC",
      role: "賽道移動安全夥伴",
      desc: "提供賽道內專業醫護選手移動式安全支援",
      url: "https://www.facebook.com/ironmedic.tw",
    },
  ];

  const activeSponsors = siteMode === "turaa" ? turaaSponsors : g100Sponsors;

  const columns = [
    {
      badge: "單車誌 × 醫護鐵人運動醫學專欄",
      badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      title: "長距離耐力賽事的心肺評估、熱傷害預防與精準補給策略",
      author: "洪緯欣 醫師（屏東榮總胸腔內科暨運動醫學專家）× 醫護鐵人團隊",
      summary: "深入解析 113K/226K 超鐵與百K單車挑戰中常見之抽筋、低血鈉與高溫脫水風險，如何透過科學化配速與電解質補給安全完賽。",
      link: "/about",
    },
    {
      badge: "單車誌 × 全球百鐵認證藝人騎乘專欄",
      badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      title: "向前一步，就是解方：狂飆的鐵人與跨界藝人破風故事",
      author: "全球百鐵認證名人堂 × 跨界藝人與搖滾鐵人實戰分享",
      summary: "從舞台聚光燈走向東海岸活水湖與 197 縣道，看跨界藝人與百鐵推手們如何透過游泳、單車與跑步療癒焦慮、突破中年危機！",
      link: "/about",
    },
  ];

  return (
    <div translate="no" className="notranslate min-h-screen bg-[#070709] text-white flex flex-col justify-between">
      
      {/* 頂部雙網址模式即時模擬切換器（方便隨時切換展示給王理事長或陳素梅董事長看） */}
      <div className="bg-zinc-950 border-b border-zinc-800/80 py-2 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>
              目前顯示門面：
              <strong className="text-amber-400 ml-1">
                {siteMode === "g100"
                  ? "🌐 全球百鐵認證總站 (global100triathlon.com)"
                  : "🏛️ 臺東縣城鄉生活運動協會獨立官網模擬 (www.turaa.org.tw)"}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSiteMode("g100")}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                siteMode === "g100"
                  ? "bg-amber-500 text-black"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              切換：全球百鐵總站 (4海報+8贊助商)
            </button>
            <button
              type="button"
              onClick={() => setSiteMode("turaa")}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                siteMode === "turaa"
                  ? "bg-orange-600 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              切換：城會獨立官網 (僅戀戀197與普悠瑪+城會贊助商)
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto w-full px-6 pt-5 pb-14 space-y-6">
        
        {/* 第一屏：主視覺與賽事海報輪播 */}
        <section className="relative rounded-3xl bg-gradient-to-br from-zinc-950 via-[#0d090a] to-[#1a0a0d] border border-zinc-800/80 p-6 md:p-8 shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-block px-3.5 py-1 rounded-full bg-red-950/60 border border-red-800/50 text-red-400 text-xs font-bold tracking-widest uppercase">
                {siteMode === "turaa"
                  ? "TAITUNG URBAN & RURAL ATHLETIC ASSOCIATION (TURAA)"
                  : "GLOBAL 100 TRIATHLON CERTIFICATION"}
              </div>
              
              {siteMode === "turaa" ? (
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  <span className="text-white">臺東縣城鄉生活運動協會</span>
                  <br />
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent text-2xl sm:text-4xl">
                    普悠瑪鐵人 ＆ 戀戀197官方總站
                  </span>
                </h1>
              ) : (
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                  <span className="text-white">每一場挑戰，</span>
                  <br />
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
                    都值得被記錄。
                  </span>
                </h1>
              )}
              
              <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
                {siteMode === "turaa"
                  ? "深耕東台灣耐力運動，主辦臺東普悠瑪鐵人三項、臺東超級鐵人及戀戀197自行車公路賽。本會所有完賽紀錄皆與「全球百鐵認證」中央資料庫即時互通連動。"
                  : "全球百鐵認證，為鐵人三項與單車選手保存每一次出發、完賽與突破。串聯全台指標結盟賽事，從初鐵到百鐵，累積屬於你的榮耀里程碑。"}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/rankings"
                  className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition shadow-lg shadow-red-600/20 flex items-center gap-2"
                >
                  🏆 百鐵英雄榜查詢
                </Link>
                <Link
                  href="/certifications/query"
                  className="px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-sm transition flex items-center gap-2"
                >
                  🔍 歷年完賽成績查詢
                </Link>
                <Link
                  href="/profile/new-record"
                  className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm transition shadow-lg shadow-amber-500/20 flex items-center gap-2"
                >
                  ✍️ 完賽榮譽登錄
                </Link>
                <Link
                  href="/profile/claim"
                  className="px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-amber-400 font-extrabold text-sm transition flex items-center gap-1.5"
                >
                  📥 認領歷史紀錄
                </Link>
              </div>
            </div>

            {/* 右側：賽事海報輪播卡（城會模式自動只留戀戀197與普悠瑪 2 張） */}
            <div className="lg:col-span-5">
              <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-zinc-700/80 shadow-2xl group bg-zinc-900">
                {activeSlides.map((slide, index) => (
                  <div
                    key={slide.title}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                    }`}
                  >
                    <img
                      src={slide.poster}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== slide.fallbackPoster) {
                          target.src = slide.fallbackPoster;
                        }
                      }}
                      alt={slide.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <div className="space-y-2">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-extrabold ${slide.badgeColor}`}>
                          {slide.badge}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
                          {slide.title}
                        </h3>
                        <p className="text-xs text-zinc-200 line-clamp-2 drop-shadow">
                          {slide.desc}
                        </p>
                        <div className="pt-2 flex items-center justify-between">
                          <Link
                            href={slide.link}
                            className="text-xs font-bold text-amber-400 hover:text-amber-300 transition flex items-center gap-1"
                          >
                            進入專區查看詳情 →
                          </Link>

                          <div className="flex items-center gap-1.5">
                            {activeSlides.map((_, dotIdx) => (
                              <button
                                key={dotIdx}
                                type="button"
                                onClick={() => setCurrentSlide(dotIdx)}
                                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                  dotIdx === currentSlide ? "w-5 bg-amber-400" : "w-1.5 bg-zinc-500 hover:bg-zinc-400"
                                }`}
                                aria-label={`切換至第 ${dotIdx + 1} 張海報`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* 跨網互通之最新協會與賽事公告 */}
        <section className="rounded-2xl bg-zinc-900/70 border border-zinc-800/90 p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-2.5">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-wide">
                {siteMode === "turaa" ? "臺東縣城鄉生活運動協會 最新官方公告" : "最新加盟協會與賽事聯合公告"}
              </h2>
            </div>
            <Link
              href="/taitung-assoc"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 transition"
            >
              前往協會公告與秩序冊下載區 →
            </Link>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {announcements.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-zinc-800/40 px-2 rounded-lg transition group"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {item.isPinned && (
                    <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-800/60 text-red-400 text-[11px] font-bold">
                      置頂
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-bold">
                    {item.org}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px] font-semibold">
                    {item.category}
                  </span>
                  <span className="text-xs sm:text-sm text-zinc-200 group-hover:text-amber-400 transition font-medium">
                    {item.title}
                  </span>
                </div>
                <span className="text-xs font-mono text-zinc-500 shrink-0">
                  {item.date}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 四大功能導覽卡片 */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <Link
            href="/rankings"
            className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/50 p-6 transition space-y-2 group"
          >
            <div className="text-xs font-black text-amber-400 tracking-wider">01 / 百鐵排名</div>
            <h3 className="text-lg font-extrabold text-white group-hover:text-amber-400 transition">百鐵 ＆ 百鐵馬英雄榜</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              免登入公開查詢總排名、初鐵、3鐵、5鐵、10鐵至百鐵各階段榮耀選手名單。
            </p>
          </Link>

          <Link
            href="/certifications/query"
            className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-red-500/50 p-6 transition space-y-2 group"
          >
            <div className="text-xs font-black text-red-400 tracking-wider">02 / 成績查詢</div>
            <h3 className="text-lg font-extrabold text-white group-hover:text-red-400 transition">賽事登錄資料查詢</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              輸入選手姓名或賽事名稱，快速檢索歷年上萬筆三鐵與單車完賽成績。
            </p>
          </Link>

          <Link
            href="/taitung-assoc"
            className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/50 p-6 transition space-y-2 group"
          >
            <div className="text-xs font-black text-amber-400 tracking-wider">03 / 協會專區</div>
            <h3 className="text-lg font-extrabold text-white group-hover:text-amber-400 transition">台東城鄉生活運動協會</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              普悠瑪鐵人、臺東超鐵與戀戀197官方公告、秩序冊下載與 Excel/CSV 成績匯入。
            </p>
          </Link>

          <Link
            href="/profile/new-record"
            className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-blue-500/50 p-6 transition space-y-2 group"
          >
            <div className="text-xs font-black text-blue-400 tracking-wider">04 / 完賽登錄 ＆ 認領</div>
            <h3 className="text-lg font-extrabold text-white group-hover:text-blue-400 transition">榮譽登錄與歷史認領</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              共用百鐵會員中心，10秒下拉選單快速登錄最新完賽成績並預覽水晶證書。
            </p>
          </Link>
        </section>

        {/* 🤝 官方統籌與榮耀贊助夥伴（已綁定美利達、SYB昇陽、邁克仕、肌樂、ZIV、SAEKO、NOVATEC 外部官方網址） */}
        <section className="rounded-3xl bg-zinc-950 border border-zinc-800/90 p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="text-center space-y-1">
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
              OFFICIAL SPONSORS & STRATEGIC PARTNERS
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {siteMode === "turaa"
                ? "🤝 臺東縣城鄉生活運動協會 官方指導與合作夥伴"
                : "🤝 全球百鐵認證 官方統籌與榮耀贊助夥伴（點擊前往品牌官網）"}
            </h2>
            <p className="text-xs text-zinc-400">
              {siteMode === "turaa"
                ? "城會獨立官網可完全自訂專屬贊助商名單，同時與全球百鐵認證共享流量與資料庫"
                : "感謝各大國際運動領導品牌與醫護鐵人共同守護賽道安全、支持台灣耐力運動發展"}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
            {activeSponsors.map((sp, i) => (
              <a
                key={i}
                href={sp.url}
                target={sp.url.startsWith("http") ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="rounded-2xl bg-zinc-900/70 border border-zinc-800/90 hover:border-amber-500 hover:bg-zinc-900 p-4 text-center space-y-1.5 transition group block"
              >
                <div className="text-[11px] font-bold text-amber-400">{sp.role}</div>
                <div className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition flex items-center justify-center gap-1">
                  <span>{sp.name}</span>
                  <span className="text-xs text-zinc-500 group-hover:text-amber-400">↗</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">{sp.desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* 📚 單車誌 × 醫護鐵人運動醫學專欄 ＆ 全球百鐵認證藝人騎乘經驗分享專欄 */}
        <section className="rounded-3xl bg-zinc-950 border border-zinc-800/90 p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-4">
            <div>
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
                CYCLINGTIME MEDIA × IRONMEDIC COLUMNS
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                📚 單車誌專欄：醫護鐵人運動醫學 ＆ 百鐵名人堂騎乘經驗分享
              </h2>
            </div>
            <Link href="/about" className="text-xs font-bold text-amber-400 hover:underline">
              閱讀更多專欄文章 →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {columns.map((col, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/40 p-6 flex flex-col justify-between space-y-4 transition"
              >
                <div className="space-y-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border ${col.badgeColor}`}>
                    {col.badge}
                  </span>
                  <h3 className="text-lg font-black text-white leading-snug">
                    {col.title}
                  </h3>
                  <div className="text-xs font-bold text-amber-400/90">
                    撰文 / 專訪：{col.author}
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {col.summary}
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href={col.link}
                    className="text-xs font-extrabold text-white hover:text-amber-400 transition inline-flex items-center gap-1"
                  >
                    前往閱讀完整專欄 →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
