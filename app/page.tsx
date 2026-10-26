"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import HomeAnnouncements from "@/components/home-announcements";

const FEATURED_BANNERS = [
  {
    id: "puyuma",
    title: "台東普悠瑪鐵人三項",
    subtitle: "PUYUMA TRIATHLON TAITUNG",
    description: "馳騁東海岸最美賽道，累積屬於你的百鐵榮耀里程碑。",
    image: "/puyuma.jpg",
    link: "/puyuma",
    tag: "熱門賽事專區",
  },
  {
    id: "love197",
    title: "戀戀197自行車挑戰賽",
    subtitle: "LOVE 197 CYCLING CHALLENGE",
    description: "挑戰台灣最美縱谷縣道，極致耐力與風景的完美結合。",
    image: "/love197.jpg",
    link: "/certifications/cycling",
    tag: "單車百鐵認證",
  },
  {
    id: "bakelang",
    title: "巴歌浪鐵人三項",
    subtitle: "BAKELANG TRIATHLON",
    description: "山海之間最純粹的鐵人試煉，每一場完賽都值得被永久記錄。",
    image: "/puyuma.jpg",
    link: "/certifications/triathlon",
    tag: "經典認證賽事",
  },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % FEATURED_BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* 頂部主視覺英雄區 (Hero Section) */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-zinc-800 bg-gradient-to-br from-zinc-950 via-black to-red-950/40">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* 左側文字宣言 */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/50 text-red-400 text-xs sm:text-sm font-semibold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              GLOBAL HUNDRED IRON
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              每一場挑戰，
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-red-500">
                都值得被記錄。
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              全球百鐵認證，為鐵人三項與單車選手保存每一次出發、完賽與突破。
              從初鐵到百鐵，累積屬於你的榮耀里程碑。
            </p>

            {/* 核心行動按鈕 (RWD 彈性排列) */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/rankings"
                className="px-6 py-3.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-red-900/30 transition"
              >
                🏆 百鐵英雄榜查詢
              </Link>
              <Link
                href="/certifications/query"
                className="px-6 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-yellow-400 border border-yellow-500/40 font-bold text-sm sm:text-base transition"
              >
                🔍 歷年完賽成績查詢
              </Link>
              <Link
                href="/certifications"
                className="px-6 py-3.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm sm:text-base transition"
              >
                ✍️ 完賽登錄 / 認領紀錄
              </Link>
            </div>
          </div>

          {/* 右側賽事海報輪播卡片 */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl aspect-[4/3]">
              <img
                src={FEATURED_BANNERS[currentSlide].image}
                alt={FEATURED_BANNERS[currentSlide].title}
                className="w-full h-full object-cover opacity-75 transition-all duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/logo.png";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-6 flex flex-col justify-end">
                <span className="inline-block w-fit px-2.5 py-1 rounded bg-red-600 text-white text-xs font-bold mb-2">
                  {FEATURED_BANNERS[currentSlide].tag}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {FEATURED_BANNERS[currentSlide].title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 mt-1 line-clamp-2">
                  {FEATURED_BANNERS[currentSlide].description}
                </p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                  <Link
                    href={FEATURED_BANNERS[currentSlide].link}
                    className="text-xs sm:text-sm font-bold text-yellow-400 hover:underline"
                  >
                    進入專區查看詳情 →
                  </Link>
                  <div className="flex gap-1.5">
                    {FEATURED_BANNERS.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-2 h-2 rounded-full transition ${
                          idx === currentSlide ? "bg-yellow-400 w-5" : "bg-gray-500"
                        }`}
                        aria-label={`切換至第 ${idx + 1} 張海報`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 插入最新協會與賽事公告區塊 */}
      <HomeAnnouncements />

      {/* 四大核心功能快速導覽區 */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/rankings"
            className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-yellow-500/60 transition group"
          >
            <div className="text-yellow-400 text-2xl font-extrabold mb-2 group-hover:translate-x-1 transition">
              01 / 百鐵排名
            </div>
            <h3 className="text-lg font-bold text-white mb-1">鐵人三項英雄榜</h3>
            <p className="text-xs sm:text-sm text-gray-400">
              免登入公開查詢總排名、初鐵、10鐵至百鐵各階段榮耀選手名單。
            </p>
          </Link>

          <Link
            href="/certifications/query"
            className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-yellow-500/60 transition group"
          >
            <div className="text-red-500 text-2xl font-extrabold mb-2 group-hover:translate-x-1 transition">
              02 / 成績查詢
            </div>
            <h3 className="text-lg font-bold text-white mb-1">賽事登錄資料查詢</h3>
            <p className="text-xs sm:text-sm text-gray-400">
              輸入選手姓名或賽事名稱，快速檢索歷年上萬筆完賽成績與分段紀錄。
            </p>
          </Link>

          <Link
            href="/association"
            className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-yellow-500/60 transition group"
          >
            <div className="text-amber-400 text-2xl font-extrabold mb-2 group-hover:translate-x-1 transition">
              03 / 普悠瑪專區
            </div>
            <h3 className="text-lg font-bold text-white mb-1">台東城鄉生活運動協會</h3>
            <p className="text-xs sm:text-sm text-gray-400">
              最新協會公告、普悠瑪鐵人三項、巴歌浪與戀戀197官方賽事成績連動。
            </p>
          </Link>

          <Link
            href="/profile"
            className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-yellow-500/60 transition group"
          >
            <div className="text-blue-400 text-2xl font-extrabold mb-2 group-hover:translate-x-1 transition">
              04 / 會員中心
            </div>
            <h3 className="text-lg font-bold text-white mb-1">認領與完賽登錄</h3>
            <p className="text-xs sm:text-sm text-gray-400">
              登入後即可認領歷史完賽數據、登錄最新賽事證書並申請百鐵認證獎章。
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}