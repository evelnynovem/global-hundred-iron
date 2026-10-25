import React from "react";
import Link from "next/link";

const series2026 = [
  { id: 1, name: "台東普悠瑪鐵人三項", date: "2026 春季", location: "台東縣活水湖", type: "226K / 113K / 51.5K", status: "已完賽・開放成績認領" },
  { id: 2, name: "Challenge Taiwan 國際鐵人三項", date: "2026 春季", location: "台東縣活水湖", type: "226K / 113K / 51.5K", status: "已完賽・開放成績認領" },
  { id: 3, name: "台東之美鐵人三項國際賽", date: "2026 秋季", location: "台東縣活水湖", type: "113K / 51.5K", status: "已完賽・開放成績認領" },
  { id: 4, name: "澎湖國際鐵人三項 / 跨海單車挑戰", date: "2026 秋季", location: "澎湖縣", type: "113K / 51.5K / 100K單車", status: "已完賽・開放成績認領" },
  { id: 5, name: "南橫 / 花東經典百K長途單車系列", date: "2026 冬季", location: "花東縱谷", type: "100K+ 公路車", status: "報名/籌備中" },
];

export default function SeriesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block rounded-full bg-amber-500/10 border border-amber-500/30 px-4 py-1 text-xs font-semibold text-amber-400 mb-3">
            OFFICIAL SERIES RACES
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            年度系列賽事與成績快速認領
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
            2026 年度精選 5 大系列賽，2027 年將全面擴大至 9 場結盟賽事！凡參加系列賽之完賽選手，賽後登入與報名相同之 Email 帳號，即可於會員中心「一鍵認領」官方完賽紀錄。
          </p>
        </div>

        {/* 自動認領機制步驟卡 */}
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-slate-900 p-6 md:p-8 mb-14">
          <h2 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
            ⚡ 什麼是「系列賽成績快速認領」？
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
              <div className="text-amber-400 font-bold mb-1">STEP 1. 報名授權</div>
              <p className="text-slate-300 text-xs leading-relaxed">
                報名結盟系列賽事時，大會將於賽後彙整完賽選手成績與報名聯絡信箱，安全拋轉至百鐵認證待認領區。
              </p>
            </div>
            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
              <div className="text-amber-400 font-bold mb-1">STEP 2. 登入自動勾稽</div>
              <p className="text-slate-300 text-xs leading-relaxed">
                使用您報名比賽時的 Email 註冊或登入「會員中心」，系統將自動比對並跳出您的專屬完賽紀錄提醒。
              </p>
            </div>
            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
              <div className="text-amber-400 font-bold mb-1">STEP 3. 一鍵確認入帳</div>
              <p className="text-slate-300 text-xs leading-relaxed">
                點擊「確認認領」後，該場賽事即刻帶有「官方核實標章」計入您的百鐵總場次，免去手動輸入的繁瑣！
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-4">
            <span className="text-xs text-slate-400">
              * 若您為團報（使用領隊信箱報名），亦可於會員中心透過「姓名＋晶片號碼」手動認領或自主登錄。
            </span>
            <Link
              href="/profile"
              className="rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition"
            >
              前往會員中心查看待認領成績 →
            </Link>
          </div>
        </div>

        {/* 賽事列表 */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">2026 - 2027 結盟系列賽事一覽</h2>
          <span className="text-xs bg-slate-800 text-amber-400 px-3 py-1 rounded-full border border-slate-700">
            2027 全新 9 場系列賽即將公布
          </span>
        </div>

        <div className="space-y-4">
          {series2026.map((race) => (
            <div
              key={race.id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-semibold text-amber-400">{race.date}</span>
                  <span className="text-xs text-slate-500">|</span>
                  <span className="text-xs text-slate-400">{race.location}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{race.name}</h3>
                <p className="text-xs text-slate-400 mt-1">認證組別：{race.type}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-400">
                  {race.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}