"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function HomePage() {
  const [siteMode, setSiteMode] = useState<"g100" | "turaa">("g100");
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (host.includes("turaa") || params.get("site") === "turaa" || sessionStorage.getItem("force_turaa_site") === "1") {
        setSiteMode("turaa");
      }
    }
  }, []);

  // 輪播首張直接使用已產出的高清 SVG 海報，徹底消除左上角破圖圖示
  const allSlides = [
    {
      badge: "🔥 會員參賽免費領取",
      badgeColor: "bg-amber-500 text-black",
      title: "邁克仕 AminoMax × 百鐵參賽補給兌換",
      desc: "開賽前30天登入會員預先勾選參賽場次，比賽當天憑號碼布或安全帽號碼貼做記號免費領取！",
      link: "/profile#aminomax-preorder",
      poster: "/images/aminomax-poster.svg",
      fallbackPoster: "/images/aminomax-poster.svg",
      isTuraa: false,
    },
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
      desc: "2026/03/28 & 2027/03/27｜臺東縣城鄉生活運動協會主辦，活水湖經典賽道年度盛事。",
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
    }, 5500);
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
      category: "專屬福利",
      title: "【邁克仕補給兌換】登入會員預先勾選未來參賽場次，開賽當天憑號碼布或安全帽號碼貼免費領取邁克仕產品！",
      date: "2026-11-02",
      href: "/profile#aminomax-preorder",
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

  const g100Sponsors = [
    {
      name: "醫護鐵人 IRONMEDIC",
      pngLogo: "/images/sponsors/ironmedic.png",
      svgLogo: "/images/sponsors/ironmedic.svg",
      role: "創立統籌單位",
      desc: "全球首創運動安全暨百鐵認證創立統籌機構",
      url: "https://www.facebook.com/ironmedic.tw",
    },
    {
      name: "美利達自行車 MERIDA",
      pngLogo: "/images/sponsors/merida.png",
      svgLogo: "/images/sponsors/merida.svg",
      role: "國際領導單車品牌",
      desc: "全力支持台灣鐵人與百鐵馬耐力運動發展",
      url: "https://www.merida-bikes.com/zh-tw",
    },
    {
      name: "SYB 昇陽自行車",
      pngLogo: "/images/sponsors/syb.png",
      svgLogo: "/images/sponsors/syb.svg",
      role: "頂級單車與三鐵戰袍夥伴",
      desc: "專業三鐵車、競速裝備與客製化百鐵戰袍",
      url: "https://www.syb-cycling.com/",
    },
    {
      name: "邁克仕 AminoMax",
      pngLogo: "/images/sponsors/aminomax.png",
      svgLogo: "/images/sponsors/aminomax.svg",
      role: "官方指定運動補給",
      desc: "專業胺基酸、BCAA 與長距離耐力能量補給",
      url: "https://www.aminomax.com.tw/",
    },
    {
      name: "肌樂 Mentholatum",
      pngLogo: "/images/sponsors/mentholatum.png",
      svgLogo: "/images/sponsors/mentholatum.svg",
      role: "官方運動防護夥伴",
      desc: "賽前熱身與賽後舒緩之運動噴劑領導品牌",
      url: "https://www.mentholatum.com.tw/",
    },
    {
      name: "ZIV 專業運動眼鏡",
      pngLogo: "/images/sponsors/ziv.png",
      svgLogo: "/images/sponsors/ziv.svg",
      role: "官方指定運動眼鏡",
      desc: "專為亞洲臉型設計之防風抗 UV 頂級光學鏡片",
      url: "https://www.ziv.com.tw/",
    },
    {
      name: "SAEKO 專業泳鏡",
      pngLogo: "/images/sponsors/saeko.png",
      svgLogo: "/images/sponsors/saeko.svg",
      role: "官方指定開放水域泳鏡",
      desc: "台灣外銷全球之三鐵開放水域廣角防霧泳鏡",
      url: "https://www.saeko.com.tw/",
    },
    {
      name: "NOVATEC 久裕興業",
      pngLogo: "/images/sponsors/novatec.png",
      svgLogo: "/images/sponsors/novatec.svg",
      role: "官方指定高階輪組",
      desc: "國際頂尖碳纖維輪組與高順暢度花鼓技術",
      url: "https://www.novatecusa.net/",
    },
  ];

  const turaaSponsors = [
    {
      name: "臺東縣政府",
      pngLogo: "/images/turaa-logo.png",
      svgLogo: "/images/sponsors/ironmedic.svg",
      role: "指導單位",
      desc: "深耕東台灣慢經濟與國際鐵人運動觀光城市",
      url: "https://www.taitung.gov.tw/",
    },
    {
      name: "臺東縣城鄉生活運動協會",
      pngLogo: "/images/turaa-logo.png",
      svgLogo: "/images/turaa-logo.png",
      role: "主辦單位",
      desc: "主辦普悠瑪鐵人三項、臺東超鐵與戀戀197公路賽",
      url: "/taitung-assoc",
    },
    {
      name: "全球百鐵認證 G100TC",
      pngLogo: "/logo.png",
      svgLogo: "/logo.png",
      role: "官方成績認證夥伴",
      desc: "全數完賽成績直通全球百鐵與百鐵馬榮耀殿堂",
      url: "/rankings",
    },
    {
      name: "醫護鐵人 IRONMEDIC",
      pngLogo: "/images/sponsors/ironmedic.png",
      svgLogo: "/images/sponsors/ironmedic.svg",
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
    <div translate="no" className="notranslate min-h-screen bg-[#070709] text-white flex flex-col justify-between overflow-x-hidden">
      <main className="max-w-6xl mx-auto w-full px-3.5 sm:px-6 pt-2 sm:pt-4 pb-12 space-y-4 sm:space-y-5">
        
        {/* 第一屏：已移除紅框膠囊標籤並整體上移，四顆按鈕在手機與電腦皆 100% 等寬等高 */}
        <section className="relative rounded-3xl bg-gradient-to-br from-zinc-950 via-[#0d090a] to-[#1a0a0d] border border-zinc-800/80 p-4 sm:p-6 shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-center">
            
            <div className="lg:col-span-7 space-y-3.5 sm:space-y-4">
              {siteMode === "turaa" ? (
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                  <span className="text-white">臺東縣城鄉生活運動協會</span>
                  <br />
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent text-xl sm:text-3xl">
                    普悠瑪鐵人 ＆ 戀戀197官方總站
                  </span>
                </h1>
              ) : (
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  <span className="text-white">每一場挑戰，</span>
                  <br />
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
                    都值得被記錄。
                  </span>
                </h1>
              )}
              
              <p className="text-xs sm:text-base text-zinc-400 max-w-xl leading-relaxed">
                {siteMode === "turaa"
                  ? "深耕東台灣耐力運動，主辦臺東普悠瑪鐵人三項、臺東超級鐵人及戀戀197自行車公路賽。本會所有完賽紀錄皆與「全球百鐵認證」中央資料庫即時互通連動。"
                  : "全球百鐵認證，為鐵人三項與單車選手保存每一次出發、完賽與突破。串聯全台指標結盟賽事，從初鐵到百鐵，累積屬於你的榮耀里程碑。"}
              </p>

              {/* 四顆主按鈕（第六張截圖）：手機版 2x2、電腦版 1x4，全部固定 h-12 w-full 確保尺寸 100% 一致 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <Link
                  href="/rankings"
                  className="h-12 w-full px-2 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs sm:text-[13px] transition shadow-lg shadow-red-600/20 flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <span>🏆</span>
                  <span>百鐵英雄榜查詢</span>
                </Link>
                <Link
                  href="/certifications/query"
                  className="h-12 w-full px-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 font-extrabold text-xs sm:text-[13px] transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <span>🔍</span>
                  <span>歷年完賽成績查詢</span>
                </Link>
                <Link
                  href="/profile/new-record"
                  className="h-12 w-full px-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs sm:text-[13px] transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <span>✍️</span>
                  <span>完賽榮譽登錄</span>
                </Link>
                <Link
                  href="/profile/claim"
                  className="h-12 w-full px-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/50 text-amber-400 font-extrabold text-xs sm:text-[13px] transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <span>📥</span>
                  <span>認領歷史紀錄</span>
                </Link>
              </div>
            </div>

            {/* 右側：賽事與邁克仕海報輪播卡（已刪除上方紅框標籤並上提對齊） */}
            <div className="lg:col-span-5">
              <div className="relative h-56 sm:h-64 w-full rounded-2xl overflow-hidden border border-zinc-700/80 shadow-2xl group bg-zinc-900">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />

                    <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end">
                      <div className="space-y-1.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-extrabold ${slide.badgeColor}`}>
                          {slide.badge}
                        </span>
                        <h3 className="text-lg sm:text-xl font-black text-white drop-shadow-md leading-tight">
                          {slide.title}
                        </h3>
                        <p className="text-xs text-zinc-200 line-clamp-2 drop-shadow">
                          {slide.desc}
                        </p>
                        <div className="pt-1.5 flex items-center justify-between">
                          <Link
                            href={slide.link}
                            className="text-xs font-extrabold text-amber-400 hover:text-amber-300 transition flex items-center gap-1"
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

        {/* 🎯 第四張截圖的完整邁克仕活動卡片：直接排在第一屏（第六張截圖）正下方，並取代第五張截圖 */}
        {siteMode !== "turaa" && (
          <section className="rounded-3xl bg-gradient-to-r from-amber-950/60 via-zinc-900 to-red-950/50 border-2 border-amber-500/50 p-4 sm:p-6 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center">
              
              {/* 左側：小海報與商品樣式展示框（第四張截圖完整設計） */}
              <div className="lg:col-span-4">
                <div className="relative rounded-2xl overflow-hidden border border-amber-400/50 bg-zinc-950 p-3.5 sm:p-4 text-center space-y-2 shadow-lg">
                  <img
                    src="/images/aminomax-poster.svg"
                    alt="邁克仕兌換活動海報"
                    className="w-full h-36 sm:h-40 object-cover rounded-xl mb-1.5"
                  />
                  <div className="flex items-center justify-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-amber-500 text-black text-[10px] font-black">
                      官方指定補給海報
                    </span>
                    <span className="text-xs font-extrabold text-amber-400">aminoMax 邁克仕</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-white">
                    ⚡ 能量膠・BCAA・電解質補給組
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-0.5">
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-[11px] font-bold text-amber-300">
                      📦 能量膠包
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-[11px] font-bold text-emerald-300">
                      💊 BCAA / 電解質
                    </span>
                  </div>
                </div>
              </div>

              {/* 右側：活動規則說明與立即勾選導流按鈕 */}
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black animate-pulse">
                    🔥 年度系列賽事專屬福利
                  </span>
                  <span className="text-xs font-bold text-amber-400">
                    全球百鐵認證 × 邁克仕 AminoMax 參賽補給免費領取活動
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white leading-snug">
                  登入會員預先勾選參賽場次，比賽當天憑「號碼布」或「安全帽號碼貼」免費領取邁克仕補給！
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  只要於<strong>各場系列賽事開賽前 1 個月（30天前）</strong>登入「全球百鐵認證會員中心」勾選您預計參加的未來賽事，我們將預先為您把邁克仕產品配發至該場次主辦單位。比賽當天現場出示<strong>號碼布（若該單車賽事無號碼布則憑「安全帽上的號碼貼」）</strong>，由工作人員在上面做記號後即可直接領取！
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <Link
                    href="/profile#aminomax-preorder"
                    className="w-full sm:w-auto text-center px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm transition shadow-lg shadow-amber-500/20"
                  >
                    👉 立即進入會員中心預先勾選未來參賽場次 →
                  </Link>
                  <Link
                    href="/series"
                    className="flex-1 sm:flex-initial text-center px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs sm:text-sm transition"
                  >
                    查看年度系列賽事清單
                  </Link>
                  <Link
                    href="/legal/privacy"
                    className="text-xs text-zinc-400 hover:text-amber-400 underline px-2 py-1"
                  >
                    活動個資與共同行銷說明
                  </Link>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* 最新加盟協會與賽事聯合公告 */}
        <section className="rounded-2xl bg-zinc-900/70 border border-zinc-800/90 p-4 sm:p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-3 mb-2.5 gap-2">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
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
                className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 hover:bg-zinc-800/40 px-2 rounded-lg transition group"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  {item.isPinned && (
                    <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-800/60 text-red-400 text-[10px] sm:text-[11px] font-bold">
                      置頂
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] sm:text-[11px] font-bold">
                    {item.org}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] sm:text-[11px] font-semibold">
                    {item.category}
                  </span>
                  <span className="text-xs sm:text-sm text-zinc-200 group-hover:text-amber-400 transition font-medium">
                    {item.title}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500 shrink-0">
                  {item.date}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 四大功能導覽卡片 */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 pt-1">
          <Link
            href="/rankings"
            className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/50 p-5 sm:p-6 transition space-y-2 group"
          >
            <div className="text-xs font-black text-amber-400 tracking-wider">01 / 百鐵排名</div>
            <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-amber-400 transition">百鐵 ＆ 百鐵馬英雄榜</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              免登入公開查詢總排名、初鐵、3鐵、5鐵、10鐵至百鐵各階段榮耀選手名單。
            </p>
          </Link>

          <Link
            href="/certifications/query"
            className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-red-500/50 p-5 sm:p-6 transition space-y-2 group"
          >
            <div className="text-xs font-black text-red-400 tracking-wider">02 / 成績查詢</div>
            <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-red-400 transition">賽事登錄資料查詢</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              輸入選手姓名或賽事名稱，快速檢索歷年上萬筆三鐵與單車完賽成績。
            </p>
          </Link>

          <Link
            href="/taitung-assoc"
            className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/50 p-5 sm:p-6 transition space-y-2 group"
          >
            <div className="text-xs font-black text-amber-400 tracking-wider">03 / 協會專區</div>
            <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-amber-400 transition">台東城鄉生活運動協會</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              普悠瑪鐵人、臺東超鐵與戀戀197官方公告、秩序冊下載與 Excel/CSV 成績匯入。
            </p>
          </Link>

          <Link
            href="/profile/new-record"
            className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-blue-500/50 p-5 sm:p-6 transition space-y-2 group"
          >
            <div className="text-xs font-black text-blue-400 tracking-wider">04 / 完賽登錄 ＆ 認領</div>
            <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-blue-400 transition">榮譽登錄與歷史認領</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              共用百鐵會員中心，10秒下拉選單快速登錄最新完賽成績並預覽水晶證書。
            </p>
          </Link>
        </section>

        {/* 官方統籌與榮耀贊助夥伴 */}
        <section className="rounded-3xl bg-zinc-950 border border-zinc-800/90 p-5 sm:p-8 space-y-5 shadow-xl">
          <div className="text-center space-y-1">
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
              OFFICIAL SPONSORS & STRATEGIC PARTNERS
            </span>
            <h2 className="text-lg sm:text-2xl font-black text-white">
              {siteMode === "turaa"
                ? "🤝 臺東縣城鄉生活運動協會 官方指導與合作夥伴"
                : "🤝 全球百鐵認證 官方統籌與榮耀贊助夥伴（點擊前往品牌官網）"}
            </h2>
            <p className="text-xs text-zinc-400">
              感謝各大國際運動領導品牌與醫護鐵人共同守護賽道安全、支持台灣耐力運動發展
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
            {activeSponsors.map((sp, i) => (
              <a
                key={i}
                href={sp.url}
                target={sp.url.startsWith("http") ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="rounded-2xl bg-zinc-900/70 border border-zinc-800/90 hover:border-amber-500 hover:bg-zinc-900 p-3.5 sm:p-4 text-center space-y-1.5 transition group block"
              >
                <div className="h-14 sm:h-16 w-full flex items-center justify-center px-2 py-1.5 rounded-xl bg-gradient-to-b from-zinc-800/40 to-transparent">
                  <img
                    src={sp.pngLogo}
                    alt={sp.name}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.endsWith(sp.svgLogo)) {
                        target.src = sp.svgLogo;
                      }
                    }}
                    className="max-h-11 sm:max-h-12 max-w-[130px] sm:max-w-[150px] object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)] group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="text-[10px] sm:text-[11px] font-bold text-amber-400 pt-0.5">{sp.role}</div>
                <div className="text-xs sm:text-sm font-black text-white group-hover:text-amber-300 transition flex items-center justify-center gap-1">
                  <span className="truncate">{sp.name}</span>
                  <span className="text-xs text-zinc-500 group-hover:text-amber-400 shrink-0">↗</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-zinc-400 leading-snug line-clamp-2">{sp.desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* 單車誌專欄 */}
        <section className="rounded-3xl bg-zinc-950 border border-zinc-800/90 p-5 sm:p-8 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-4">
            <div>
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
                CYCLINGTIME MEDIA × IRONMEDIC COLUMNS
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-white mt-1">
                📚 單車誌專欄：醫護鐵人運動醫學 ＆ 百鐵名人堂騎乘經驗分享
              </h2>
            </div>
            <Link href="/about" className="text-xs font-bold text-amber-400 hover:underline">
              閱讀更多專欄文章 →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {columns.map((col, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/40 p-5 sm:p-6 flex flex-col justify-between space-y-4 transition"
              >
                <div className="space-y-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border ${col.badgeColor}`}>
                    {col.badge}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white leading-snug">
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
