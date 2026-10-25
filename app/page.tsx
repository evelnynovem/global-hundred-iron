"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// 1. 首屏輪播資料：對應 public/images/ 底下的英文命名圖檔
const HERO_SLIDES = [
  {
    id: 1,
    badge: "GLOBAL 100 TRIATHLON ✕ 臺東城鄉生活運動協會",
    title: "2026 戀戀197 自行車公路賽",
    subtitle: "經典必騎，每年報名都搶破頭🔥 馳騁台灣最美197縣道，成績直通百鐵鐵馬賞履歷！",
    location: "📅 2026.12.06 📍 臺東197縣道",
    categories: ["130K 挑戰組", "百鐵鐵馬賞核心認證", "東海岸經典"],
    ctaText: "進入協會專區 ＆ 查歷年成績",
    ctaLink: "/taitung-assoc",
    externalUrl: "https://bao-ming.com/eb/activity/activity_content.php?activityno=7054",
    bgImage: "/images/love197.jpg",
  },
  {
    id: 2,
    badge: "OFFICIAL CO-BRANDING SERIES ・ 鐵人聖殿",
    title: "2027 普悠瑪鐵人三項賽",
    subtitle: "普悠瑪了沒？到底。東台灣春季最大鐵人盛事・全球百鐵認證春季頒獎典禮指定主場",
    location: "📅 2027.03.27~28 📍 臺東森林公園活水湖",
    categories: ["226K 超鐵", "113K 半程超鐵", "51.5K 標準鐵人"],
    ctaText: "查看普悠瑪賽事與證書專區",
    ctaLink: "/taitung-assoc",
    externalUrl: "https://bao-ming.com/eb/activity/activity_content.php?activityno=7122",
    bgImage: "/images/puyuma.jpg",
  },
  {
    id: 3,
    badge: "TAITUNG SUPER TRIATHLON ・ 無敵海景",
    title: "2026 臺東巴歌浪超鐵",
    subtitle: "邁向20年！台灣歷史最悠久賽事。這場的東海岸風景真的無敵！",
    location: "📅 2026.10.17-18 📍 東海岸賽道",
    categories: ["超級鐵人三項", "英語服務上線", "百鐵認證場次"],
    ctaText: "查看賽事詳情",
    ctaLink: "/taitung-assoc",
    externalUrl: "https://bao-ming.com/eb/activity/activity_content.php?activityno=6842",
    bgImage: "/images/pakelang.jpg",
  },
  {
    id: 4,
    badge: "KAOHSIUNG 100K ・ 南台灣盛事",
    title: "2026 高雄百K自行車挑戰賽",
    subtitle: "全球百鐵認證系列賽事，南台灣年度破風首選，挑戰自我極限！",
    location: "📅 2026.11.29 📍 高雄市",
    categories: ["100K 公路車挑戰", "鐵馬賞認證"],
    ctaText: "前往官方報名網站",
    ctaLink: "https://www.eventpal.com.tw/db65fbc3-66c6-4b0a-bef0-4964b69fda59",
    externalUrl: "https://www.eventpal.com.tw/db65fbc3-66c6-4b0a-bef0-4964b69fda59",
    bgImage: "https://www.eventpal.com.tw/db65fbc3-66c6-4b0a-bef0-4964b69fda59/KV1.jpg",
  },
  {
    id: 5,
    badge: "LANYANG 100K ・ 山海絕景",
    title: "2026 蘭陽百K自行車挑戰賽",
    subtitle: "遠眺龜山島與蘭陽平原絕景，新增38km休閒組，秋季最受車友期待！",
    location: "📅 2026.09.20 📍 宜蘭縣",
    categories: ["100K 公路車", "38K 休閒組", "鐵馬賞認證"],
    ctaText: "查看賽事資訊",
    ctaLink: "https://www.eventpal.com.tw/b9f5874a-467e-49b7-8a1e-b7c715d86c5b",
    externalUrl: "https://www.eventpal.com.tw/b9f5874a-467e-49b7-8a1e-b7c715d86c5b",
    bgImage: "https://www.eventpal.com.tw/b9f5874a-467e-49b7-8a1e-b7c715d86c5b/KV20260715.jpg",
  },
  {
    id: 6,
    badge: "TAINAN CYCLING FESTIVAL ・ 古都嘉年華",
    title: "2026 輪躍台南單車嘉年華",
    subtitle: "台南正統鹿耳門聖母廟出發，馳騁古都台南，年底必騎百K認證場次！",
    location: "📅 2026.12.06 📍 台灣台南",
    categories: ["單車嘉年華", "百K鐵馬賞認證"],
    ctaText: "查看活動報名",
    ctaLink: "https://cdntwirunner.biji.co/reg/812",
    externalUrl: "https://cdntwirunner.biji.co/reg/812",
    bgImage: "/images/2026輪躍台南.png",
  },
];

// 2. 2026 四大壓軸賽事
const EVENTS_2026 = [
  {
    name: "2026 蘭陽百K自行車挑戰賽",
    date: "2026/09/20",
    org: "全球百鐵認證合作賽事",
    tag: "🌊 蘭陽絕景百K",
    highlight: "遠眺龜山島與蘭陽平原絕景，秋季必騎！",
    isFlagship: false,
    type: "100K 公路車 / 38K休閒組",
    url: "https://www.eventpal.com.tw/b9f5874a-467e-49b7-8a1e-b7c715d86c5b",
  },
  {
    name: "2026 巴歌浪鐵人三項 (台東超鐵)",
    date: "2026/10/17–18",
    org: "臺東城鄉生活運動協會",
    tag: "👑 創始旗艦系列賽",
    highlight: "這場的東海岸風景真的無敵！邁向20年經典。",
    isFlagship: true,
    type: "超級鐵人三項認證",
    url: "https://bao-ming.com/eb/activity/activity_content.php?activityno=6842",
  },
  {
    name: "2026 高雄百K 自行車挑戰賽",
    date: "2026/11/29 (日)",
    org: "全球百鐵認證合作賽事",
    tag: "🔥 盛大百K認證",
    highlight: "南台灣年度單車盛事，場面絕對盛大！",
    isFlagship: false,
    type: "100K 公路車鐵馬賞",
    url: "https://www.eventpal.com.tw/db65fbc3-66c6-4b0a-bef0-4964b69fda59",
  },
  {
    name: "2026 戀戀197 自行車公路賽",
    date: "2026/12/06 (日)",
    org: "臺東城鄉生活運動協會",
    tag: "👑 創始旗艦・經典必騎",
    highlight: "經典必騎，每年報名都搶破頭🔥",
    isFlagship: true,
    type: "130K 東海岸公路賽",
    url: "https://bao-ming.com/eb/activity/activity_content.php?activityno=7054",
  },
  {
    name: "2026 輪躍台南 自行車挑戰賽",
    date: "2026/12/06 (日)",
    org: "全球百鐵認證合作賽事",
    tag: "🚴‍♂️ 經典單車嘉年華",
    highlight: "台南正統鹿耳門聖母廟出發，古都單車盛會！",
    isFlagship: false,
    type: "100K 公路車鐵馬賞",
    url: "https://cdntwirunner.biji.co/reg/812",
  },
];

// 3. 2027 年度巡迴系列賽事
const EVENTS_2027 = [
  {
    name: "2027 梅山36彎自行車挑戰賽",
    date: "2027/02/21 (日)",
    org: "全球百鐵認證合作賽事",
    tag: "⛰️ 開春爬坡經典",
    highlight: "挑戰經典太平雲梯36彎，熱血報名啟動！",
    isFlagship: false,
    type: "爬坡挑戰 / 鐵馬認證",
    url: "#",
  },
  {
    name: "2027 臺東普悠瑪鐵人三項賽",
    date: "2027/03/27~28",
    org: "臺東城鄉生活運動協會",
    tag: "👑 創始旗艦・春季頒獎場",
    highlight: "普悠瑪了沒？到底。活水湖鐵人聖殿，百鐵春季頒獎主場！",
    isFlagship: true,
    type: "226K / 113K / 51.5K",
    url: "https://bao-ming.com/eb/activity/activity_content.php?activityno=7122",
  },
  {
    name: "2027 蘭陽百K 自行車挑戰賽",
    date: "2027/09/20",
    org: "全球百鐵認證合作賽事",
    tag: "🌊 蘭陽山海百K",
    highlight: "飽覽龜山島與蘭陽平原風光的極致百K路線！",
    isFlagship: false,
    type: "100K 公路車鐵馬賞",
    url: "#",
  },
  {
    name: "2027 巴歌浪鐵人三項",
    date: "2027/10/16–17",
    org: "臺東城鄉生活運動協會",
    tag: "👑 創始旗艦系列賽",
    highlight: "這場的東海岸風景真的無敵！秋季必朝聖！",
    isFlagship: true,
    type: "鐵人三項認證",
    url: "#",
  },
  {
    name: "2027 高雄百K 自行車挑戰賽",
    date: "2027/11/28 (日)",
    org: "全球百鐵認證合作賽事",
    tag: "🔥 港都盛大百K",
    highlight: "這場感覺會很盛大！冬季南台灣破風首選！",
    isFlagship: false,
    type: "100K 公路車鐵馬賞",
    url: "#",
  },
  {
    name: "2027 戀戀197 自行車公路賽",
    date: "2027/12/05 (日)",
    org: "臺東城鄉生活運動協會",
    tag: "👑 創始旗艦・經典必騎",
    highlight: "經典必騎，每年報名都搶破頭🔥",
    isFlagship: true,
    type: "130K 東海岸公路賽",
    url: "#",
  },
  {
    name: "2027 輪躍台南 自行車挑戰賽",
    date: "2027/12/12 (日)",
    org: "全球百鐵認證合作賽事",
    tag: "🚴‍♂️ 古都單車盛會",
    highlight: "南台灣年底單車大拜拜，與戀戀197錯開週次可連騎！",
    isFlagship: false,
    type: "100K 公路車鐵馬賞",
    url: "#",
  },
  {
    name: "2027 石門羅馬自行車挑戰賽",
    date: "2027/12/19 (日)",
    org: "全球百鐵認證合作賽事",
    tag: "🍁 年度封關經典戰",
    highlight: "挑戰北台灣經典羅馬公路與石門水庫，完美收官！",
    isFlagship: false,
    type: "公路車爬坡與耐力認證",
    url: "#",
  },
];

export default function HomeHeroAndSeriesSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [yearTab, setYearTab] = useState<"2026" | "2027">("2026");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const activeSlide = HERO_SLIDES[currentSlide];
  const displayEvents = yearTab === "2026" ? EVENTS_2026 : EVENTS_2027;

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      
      {/* 頂部標語 */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-slate-950 py-2.5 px-4 text-center text-xs sm:text-sm font-black tracking-wider shadow-inner">
        ⚡ 全球首創鐵人三項與鐵馬賽事完賽紀錄認證平台 ｜ 零收費、實名制、成就你的每一哩傳奇！
      </div>

      {/* 滿版海報輪播 */}
      <div className="relative overflow-hidden border-b border-slate-800 bg-slate-950 min-h-[560px] sm:min-h-[640px] flex items-center">
        <div className="absolute inset-0 z-0 overflow-hidden bg-slate-900">
          <img 
            src={activeSlide.bgImage} 
            alt={activeSlide.title}
            className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 transition-all duration-1000 opacity-60 sm:opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/40 sm:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-amber-500/10 pointer-events-none" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl w-full px-4 sm:px-6 py-12 sm:py-20">
          <div className="space-y-4 sm:space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/90 border border-amber-500/50 px-4 py-1.5 text-xs font-black tracking-wider text-amber-400 shadow-lg">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" /> 
              {activeSlide.badge}
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-lg">
              {activeSlide.title}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-200 font-medium leading-relaxed drop-shadow">
              {activeSlide.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-slate-100 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-lg">
                {activeSlide.location}
              </span>
              {activeSlide.categories.map((cat) => (
                <span key={cat} className="text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 rounded-lg shadow-sm">
                  {cat}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
              <Link
                href={activeSlide.ctaLink}
                className="rounded-xl bg-amber-500 px-7 py-3.5 text-center text-sm font-black text-slate-950 hover:bg-amber-400 transition shadow-xl"
              >
                {activeSlide.ctaText} →
              </Link>
              {activeSlide.externalUrl && (
                <a
                  href={activeSlide.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-center text-sm font-bold text-white hover:bg-slate-800 transition shadow-md"
                >
                  外部報名 / 官方活動頁 ↗
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-12 sm:mt-16 pt-6 border-t border-slate-800/80 backdrop-blur-md bg-slate-950/60 p-3 rounded-2xl">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`text-left p-2.5 rounded-xl border transition-all ${
                  currentSlide === idx
                    ? "bg-slate-900 border-amber-500 shadow-md ring-1 ring-amber-500/50"
                    : "bg-slate-950/60 border-slate-800/60 opacity-60 hover:opacity-100"
                }`}
              >
                <div className="text-[9px] font-extrabold text-amber-400">0{idx + 1} / 焦點賽事</div>
                <div className="text-[11px] font-black text-white truncate mt-0.5">
                  {slide.title}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 巡迴矩陣 */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
              OFFICIAL SERIES CALENDAR
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              全球百鐵認證・2026–2027 年度系列賽事巡迴矩陣
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              金色邊框為「臺東城鄉生活運動協會」創始旗艦主辦賽事，提供官方秩序冊下載與歷年成績電子證書服務。
            </p>
          </div>

          <div className="inline-flex rounded-xl bg-slate-900 p-1.5 border border-slate-800 self-start md:self-auto shadow-inner">
            <button
              type="button"
              onClick={() => setYearTab("2026")}
              className={`rounded-lg px-4 py-2.5 text-xs sm:text-sm font-black transition ${
                yearTab === "2026"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🔥 2026 壓軸系列賽
            </button>
            <button
              type="button"
              onClick={() => setYearTab("2027")}
              className={`rounded-lg px-4 py-2.5 text-xs sm:text-sm font-black transition ${
                yearTab === "2027"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🏆 2027 年度巡迴賽
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayEvents.map((ev, i) => (
            <div
              key={i}
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] border ${
                ev.isFlagship
                  ? "bg-gradient-to-b from-amber-500/15 via-slate-900/95 to-slate-950 border-amber-500/60 shadow-xl shadow-amber-500/5"
                  : "bg-slate-900/50 border-slate-800 hover:border-slate-700 shadow-lg"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-black px-2.5 py-1 rounded-full ${
                      ev.isFlagship
                        ? "bg-amber-500 text-slate-950 shadow"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {ev.tag}
                  </span>
                  <span className="text-xs font-mono font-extrabold text-amber-300 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                    {ev.date}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-white leading-snug">{ev.name}</h3>

                <p className="text-xs font-semibold text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  “{ev.highlight}”
                </p>

                <div className="text-xs text-slate-400 space-y-1 pt-1">
                  <div>主辦／屬性：<strong className="text-slate-200">{ev.org}</strong></div>
                  <div>認證項目：<span className="text-amber-400">{ev.type}</span></div>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <Link
                  href={ev.isFlagship ? "/taitung-assoc" : "/profile"}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300"
                >
                  {ev.isFlagship ? "進入協會官方專區 →" : "完賽登錄與認證 →"}
                </Link>
                {ev.url && ev.url !== "#" && (
                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                  >
                    前往報名 ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}