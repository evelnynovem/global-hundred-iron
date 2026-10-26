"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface RaceDetail {
  name: string;
  date: string;
  race: string;
  category: string;
  finish_time: string;
  team: string;
}

export default function CertificationQueryPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RaceDetail[]>([]);
  const [allData, setAllData] = useState<RaceDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/data/race_details.json");
        if (res.ok) {
          const data = await res.json();
          setAllData(data);
          setResults(data.slice(0, 50));
        }
      } catch (e) {
        console.error("載入賽事明細失敗", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setResults(allData.slice(0, 50));
      return;
    }
    const q = query.toLowerCase();
    const filtered = allData.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.race.toLowerCase().includes(q) ||
        item.team.toLowerCase().includes(q)
    );
    setResults(filtered.slice(0, 100));
  };

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-yellow-400">
              賽事登錄資料與完賽紀錄查詢
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              輸入選手姓名、賽事名稱或所屬團隊，即時檢索歷年完賽明細。
            </p>
          </div>
          <Link
            href="/rankings"
            className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-xs sm:text-sm font-bold rounded-lg transition"
          >
            ← 返回百鐵英雄榜
          </Link>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="請輸入選手姓名 (例如: 陳彥良)、賽事名稱 (例如: 普悠瑪) 或團隊..."
            className="flex-1 bg-zinc-900 border border-zinc-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-yellow-500 text-sm sm:text-base"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition text-sm sm:text-base shrink-0"
          >
            搜尋紀錄
          </button>
        </form>

        <div className="overflow-x-auto rounded-xl border border-zinc-800 shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950 text-gray-300 border-b border-zinc-800 text-xs sm:text-sm">
                <th className="py-3.5 px-4 font-semibold">選手姓名</th>
                <th className="py-3.5 px-4 font-semibold">所屬團隊</th>
                <th className="py-3.5 px-4 font-semibold">賽事日期</th>
                <th className="py-3.5 px-4 font-semibold">賽事名稱</th>
                <th className="py-3.5 px-4 font-semibold">參賽組別</th>
                <th className="py-3.5 px-4 font-semibold">完賽成績</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-sm text-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    正在載入上萬筆完賽資料庫...
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    查無符合「{query}」的完賽紀錄
                  </td>
                </tr>
              ) : (
                results.map((item, idx) => (
                  <tr
                    key={idx}
                    className="bg-zinc-900/60 hover:bg-zinc-800/80 transition"
                  >
                    <td className="py-3 px-4 font-medium text-yellow-400">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-gray-300">{item.team || "-"}</td>
                    <td className="py-3 px-4 text-gray-400 font-mono text-xs">
                      {item.date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {item.race}
                    </td>
                    <td className="py-3 px-4 text-gray-300">{item.category}</td>
                    <td className="py-3 px-4 font-mono text-green-400">
                      {item.finish_time || "完賽"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
