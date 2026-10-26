"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface RaceRecord {
  Name: string;
  "Race date": string;
  "Race name": string;
  "Race contury": string;
  "Race city": string;
  "Participating categories": string;
  Ranking: string;
  "Finish time": string;
  "Sport team": string;
  bib: string;
  gender: string;
  "三鐵完賽數": number;
  "Ranking level": string;
}

export default function CertificationQueryPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RaceRecord[]>([]);
  const [allData, setAllData] = useState<RaceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/data/full_race_records.json");
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
        item.Name.toLowerCase().includes(q) ||
        item["Race name"].toLowerCase().includes(q) ||
        item["Sport team"].toLowerCase().includes(q) ||
        item["Race city"].toLowerCase().includes(q)
    );
    setResults(filtered.slice(0, 100));
  };

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-yellow-400">
              賽事登錄資料與完賽紀錄查詢
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              精確顯示 13 項完整賽事欄位，輸入選手姓名、賽事名稱或團隊即可檢索。
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
            placeholder="請輸入選手姓名、賽事名稱、城市或團隊..."
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
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-zinc-950 text-gray-300 border-b border-zinc-800 whitespace-nowrap">
                <th className="py-3 px-3 font-semibold">姓名 (Name)</th>
                <th className="py-3 px-3 font-semibold">日期 (Date)</th>
                <th className="py-3 px-3 font-semibold">賽事名稱 (Race Name)</th>
                <th className="py-3 px-3 font-semibold">國家/城市</th>
                <th className="py-3 px-3 font-semibold">參賽組別</th>
                <th className="py-3 px-3 font-semibold">名次</th>
                <th className="py-3 px-3 font-semibold">完賽時間</th>
                <th className="py-3 px-3 font-semibold">所屬團隊</th>
                <th className="py-3 px-3 font-semibold">背號</th>
                <th className="py-3 px-3 font-semibold">性別</th>
                <th className="py-3 px-3 font-semibold">總完賽數</th>
                <th className="py-3 px-3 font-semibold">等級</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-gray-500">
                    正在載入完整完賽資料庫...
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-gray-500">
                    查無符合「{query}」的完賽紀錄
                  </td>
                </tr>
              ) : (
                results.map((item, idx) => (
                  <tr key={idx} className="bg-zinc-900/60 hover:bg-zinc-800/80 transition whitespace-nowrap">
                    <td className="py-3 px-3 font-bold text-yellow-400">{item.Name}</td>
                    <td className="py-3 px-3 font-mono text-gray-400">{item["Race date"]}</td>
                    <td className="py-3 px-3 font-semibold text-white">{item["Race name"]}</td>
                    <td className="py-3 px-3 text-gray-300">{item["Race contury"]} {item["Race city"]}</td>
                    <td className="py-3 px-3 text-gray-300">{item["Participating categories"]}</td>
                    <td className="py-3 px-3 text-gray-300">{item.Ranking}</td>
                    <td className="py-3 px-3 font-mono text-green-400">{item["Finish time"] || "完賽"}</td>
                    <td className="py-3 px-3 text-gray-300">{item["Sport team"] || "-"}</td>
                    <td className="py-3 px-3 text-gray-400">{item.bib || "-"}</td>
                    <td className="py-3 px-3 text-gray-400">{item.gender || "-"}</td>
                    <td className="py-3 px-3 font-bold text-amber-400 text-center">{item["三鐵完賽數"]}</td>
                    <td className="py-3 px-3 text-gray-300">{item["Ranking level"]}</td>
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
