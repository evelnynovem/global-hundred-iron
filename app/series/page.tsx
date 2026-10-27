"use client";

import Link from "next/link";
import Footer from "@/components/Footer";

export default function SeriesPage() {
  const seriesList = [
    {
      season: "2026 秋季賽",
      location: "台東縣 / 屏東縣",
      name: "巴歌浪鐵人三項",
      date: "2026/10/17 - 10/18",
      category: "113km / 226km / 51.5km",
      status: "已完賽 · 開放成績認領"
    },
    {
      season: "2026 冬季賽",
      location: "高雄市",
      name: "高雄百K 自行車挑戰賽",
      date: "2026/11/29",
      category: "90km+ 公路單車賽",
      status: "已完賽 · 開放成績認領"
    },
    {
      season: "2026 冬季賽",
      location: "台東縣",
      name: "戀戀197 自行車賽",
      date: "2026/12/06",
      category: "90km+ 公路單車賽",
      status: "已完賽 · 開放成績認領"
    },
    {
      season: "2026 冬季賽",
      location: "台南市",
      name: "輪躍台南單車嘉年華",
      date: "2026/12/06",
      category: "90km+ 公路單車賽",
      status: "已完賽 · 開放成績認領"
    },
    {
      season: "2027 春季賽",
      location: "嘉義縣",
      name: "梅山36彎自行車挑戰賽",
      date: "2027/02/21",
      category: "90km+ 公路單車賽",
      status: "報名 / 籌備中"
    },
    {
      season: "2027 秋季賽",
      location: "宜蘭縣",
      name: "蘭陽百K 自行車挑戰賽",
      date: "2027/09/20",
      category: "90km+ 公路單車賽",
      status: "報名 / 籌備中"
    },
    {
      season: "2027 秋季賽",
      location: "台東縣",
      name: "巴歌浪鐵人三項",
      date: "2027/10/16 - 10/17",
      category: "113km / 226km / 51.5km",
      status: "報名 / 籌備中"
    },
    {
      season: "2027 冬季賽",
      location: "高雄市",
      name: "高雄百K 自行車挑戰賽",
      date: "2027/11/28",
      category: "90km+ 公路單車賽",
      status: "報名 / 籌備中"
    },
    {
      season: "2027 冬季賽",
      location: "台東縣",
      name: "戀戀197 自行車賽",
      date: "2027/12/05",
      category: "90km+ 公路單車賽",
      status: "報名 / 籌備中"
    },
    {
      season: "2027 冬季賽",
      location: "台南市",
      name: "輪躍台南單車嘉年華",
      date: "2027/12/12",
      category: "90km+ 公路單車賽",
      status: "報名 / 籌備中"
    },
    {
      season: "2027 冬季賽",
      location: "桃園市",
      name: "石門羅馬自行車挑戰賽",
      date: "2027/12/19",
      category: "90km+ 公路單車賽",
      status: "報名 / 籌備中"
    }
  ];

  return (
    <div translate="no" className="notranslate min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <div className="mx-auto max-w-5xl w-full py-12 px-6 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
              Official Series Schedule
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              2026 - 2027 聯盟系列賽事一覽
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              收錄全球百鐵認證與台東城鄉生活運動協會認可之所有三鐵與百K自行車賽事。
            </p>
          </div>
          <Link
            href="/profile/claim"
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 transition shadow-lg text-center"
          >
            前往認領歷史賽事成績 →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {seriesList.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-amber-500/40 transition shadow-xl"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md">
                    {item.season}
                  </span>
                  <span className="text-xs text-slate-400">📍 {item.location}</span>
                  <span className="text-xs font-mono text-slate-300">📅 {item.date}</span>
                </div>
                <h2 className="text-xl font-bold text-white">{item.name}</h2>
                <p className="text-xs text-slate-400">
                  認證組別：<span className="text-amber-400/90 font-medium">{item.category}</span>
                </p>
              </div>
              <div>
                <span
                  className={`inline-block px-4 py-2 rounded-xl text-xs font-bold tracking-wide ${
                    item.status.includes("已完賽")
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                      : "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
