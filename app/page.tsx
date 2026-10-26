"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 完整對應官方賽事清單與戶外賽事主題實景海報
  const slides = [
    {
      badge: "單車百鐵認證",
      badgeColor: "bg-red-600 text-white",
      title: "戀戀197自行車挑戰賽",
      desc: "2026/12/06 & 2027/12/05｜挑戰台灣最美縱谷縣道，極致耐力與風景的完美結合。",
      link: "/series",
      poster: "/posters/197.jpg",
      fallbackPoster: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1200&q=85"
    },
    {
      badge: "鐵人三項認證",
      badgeColor: "bg-amber-500 text-black",
      title: "台東巴歌浪鐵人三項",
      desc: "2026/10/17-18 & 2027/10/16-17｜馳騁東海岸壯闊山海，體驗純粹而熱血的鐵人意志。",
      link: "/series",
      poster: "/posters/pakelang.jpg",
      fallbackPoster: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=85"
    },
    {
      badge: "單車百鐵認證",
      badgeColor: "bg-amber-500 text-black",
      title: "高雄百K 自行車挑戰賽",
      desc: "2026/11/29 & 2027/11/28｜南台灣經典百K高速巡航，累積百鐵馬榮耀的最佳起點。",
      link: "/series",
      poster: "/posters/kaohsiung.jpg",
      fallbackPoster: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=85"
    },
    {
      badge: "單車百鐵認證",
      badgeColor: "bg-red-600 text-white",
      title: "輪躍台南單車嘉年華",
      desc: "2026/12/06 & 2027/12/12｜穿梭古都山海美景，年度最熱鬧的單車盛會。",
      link: "/series",
      poster: "/posters/tainan.jpg",
      fallbackPoster: "https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?auto=format&fit=crop&w=1200&q=85"
    },
    {
      badge: "單車百鐵認證",
      badgeColor: "bg-amber-500 text-black",
      title: "2027 梅山36彎自行車挑戰賽",
      desc: "2027/02/21 (日)｜挑戰嘉義經典36道髮夾彎爬坡聖地，征服雲端之巔。",
      link: "/series",
      poster: "/posters/meishan.jpg",
      fallbackPoster: "https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?auto=format&fit=crop&w=1200&q=85"
    },
    {
      badge: "單車百鐵認證",
      badgeColor: "bg-red-600 text-white",
      title: "蘭陽百K & 石門羅馬挑戰賽",
      desc: "2027/09/20 蘭陽百K ＆ 2027/12/19 石門羅馬公路｜北台灣經典山海長途試煉。",
      link: "/series",
      poster: "/posters/lanyang.jpg",
      fallbackPoster: "https://images.unsplash.com/photo-1517649281203-dad836b4abe5?auto=format&fit=crop&w=1200&q=85"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const announcements = [
    {
      id: 1,
      isPinned: true,
      category: "系統公告",
      title: "【重要公告】全球百鐵認證官網全新改版上線，開放歷史完賽紀錄認領與查詢！",
      date: "2026-10-25",
      href: "/profile/claim"
    },
    {
      id: 2,
      isPinned: true,
      category: "賽事快訊",
      title: "【賽事專區】台東巴歌浪鐵人三項、高雄百K、戀戀197與輪躍台南完賽成績連動開放",
      date: "2026-10-20",
      href: "/certifications/query"
    },
    {
      id: 3,
      isPinned: false,
      category: "協會公告",
      title: "【協會動態】台東城鄉生活運動協會 2026-2027 年度結盟賽事行事曆正式公布",
      date: "2026-10-15",
      href: "/series"
    }
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between">
      <main className="max-w-6xl mx-auto w-full px-6 pt-5 pb-14 space-y-5">
        
        {/* 第一屏上半部：主視覺與賽事海報輪播 */}
        <section className="relative rounded-3xl bg-gradient-to-br from-zinc-950 via-[#0d090a] to-[#1a0a0d] border border-zinc-800/80 p-6 md:p-8 shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* 左側標語與漸層色保留 */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-block px-3.5 py-1 rounded-full bg-red-950/60 border border-red-800/50 text-red-400 text-xs font-bold tracking-widest uppercase">
                GLOBAL 100 TRIATHLON CERTIFICATION
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                <span className="text-white">每一場挑戰，</span>
                <br />
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
                  都值得被記錄。
                </span>
              </h1>
              
              <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
                全球百鐵認證，為鐵人三項與單車選手保存每一次出發、完賽與突破。從初鐵到百鐵，累積屬於你的榮耀里程碑。
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
                  href="/profile/claim"
                  className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm transition shadow-lg shadow-amber-500/20 flex items-center gap-2"
                >
                  ✍️ 完賽登錄 / 認領紀錄
                </Link>
              </div>
            </div>

            {/* 右側：賽事海報輪播卡 */}
            <div className="lg:col-span-5">
              <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-zinc-700/80 shadow-2xl group bg-zinc-900">
                {slides.map((slide, index) => (
                  <div
                    key={index}
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
                            {slides.map((_, dotIdx) => (
                              <button
                                key={dotIdx}
                                type="button"
                                onClick={() => setCurrentSlide(dotIdx)}
                                className={`h-1.5 rounded-full transition-all ${
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

        {/* 第一屏下半部：最新協會與賽事公告 (拉近至首頁第一屏) */}
        <section className="rounded-2xl bg-zinc-900/70 border border-zinc-800/90 p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-2.5">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-wide">
                最新協會與賽事公告
              </h2>
            </div>
            <Link
              href="/taitung-assoc"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 transition"
            >
              查看全部公告 →
            </Link>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {announcements.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-zinc-800/40 px-2 rounded-lg transition group"
              >
                <div className="flex items-center gap-2.5 flex-wrap">
                  {item.isPinned && (
                    <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-800/60 text-red-400 text-[11px] font-bold">
                      置頂
                    </span>
                  )}
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
            <h3 className="text-lg font-extrabold text-white group-hover:text-amber-400 transition">鐵人三項英雄榜</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              免登入公開查詢總排名、初鐵、10鐵至百鐵各階段榮耀選手名單。
            </p>
          </Link>

          <Link
            href="/certifications/query"
            className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-red-500/50 p-6 transition space-y-2 group"
          >
            <div className="text-xs font-black text-red-400 tracking-wider">02 / 成績查詢</div>
            <h3 className="text-lg font-extrabold text-white group-hover:text-red-400 transition">賽事登錄資料查詢</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              輸入選手姓名或賽事名稱，快速檢索歷年上萬筆完賽成績與分段紀錄。
            </p>
          </Link>

          <Link
            href="/taitung-assoc"
            className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/50 p-6 transition space-y-2 group"
          >
            <div className="text-xs font-black text-amber-400 tracking-wider">03 / 協會專區</div>
            <h3 className="text-lg font-extrabold text-white group-hover:text-amber-400 transition">台東城鄉生活運動協會</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              最新協會公告、巴歌浪鐵人三項與戀戀197官方賽事成績連動。
            </p>
          </Link>

          <Link
            href="/profile"
            className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-blue-500/50 p-6 transition space-y-2 group"
          >
            <div className="text-xs font-black text-blue-400 tracking-wider">04 / 會員中心</div>
            <h3 className="text-lg font-extrabold text-white group-hover:text-blue-400 transition">認領與完賽登錄</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              登入後即可認領歷史完賽數據、登錄最新賽事證書並申請百鐵認證獎章。
            </p>
          </Link>
        </section>

      </main>

      <Footer />
    </div>
  );
}
