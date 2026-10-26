"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

interface HeroRecord {
  id?: string;
  name: string;
  team: string;
  count: number;
}

const FALLBACK_HEROES: HeroRecord[] = [
  { name: "鄭旭劭", team: "康軒鐵人隊", count: 134 },
  { name: "孟亞輝", team: "高雄鐵人", count: 103 },
  { name: "陳彥良", team: "醫護鐵人", count: 102 },
  { name: "曾亭彬", team: "台灣大腳ㄚ", count: 100 },
  { name: "劉光武", team: "KUANGYU光聿", count: 99 },
  { name: "韓德安", team: "醫護鐵人", count: 85 },
  { name: "黃柏青", team: "DWD", count: 84 },
  { name: "蘇耀宗", team: "", count: 71 },
  { name: "梁忠仁", team: "超級難止汗鐵人隊", count: 51 },
  { name: "林揚智", team: "", count: 44 },
];

const MILESTONE_TABS = [
  { label: "總排名", min: 1, max: 9999 },
  { label: "初鐵", min: 1, max: 2 },
  { label: "3鐵", min: 3, max: 4 },
  { label: "5鐵", min: 5, max: 9 },
  { label: "10鐵", min: 10, max: 19 },
  { label: "20鐵", min: 20, max: 29 },
  { label: "30鐵", min: 30, max: 39 },
  { label: "40鐵", min: 40, max: 49 },
  { label: "50鐵", min: 50, max: 59 },
  { label: "60鐵", min: 60, max: 69 },
  { label: "70鐵", min: 70, max: 79 },
  { label: "80鐵", min: 80, max: 89 },
  { label: "90鐵", min: 90, max: 99 },
  { label: "百鐵", min: 100, max: 9999 },
];

export default function RankingsPage() {
  const [records, setRecords] = useState<HeroRecord[]>(FALLBACK_HEROES);
  const [activeTab, setActiveTab] = useState("總排名");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    async function fetchRankings() {
      // 1. 先直接讀取本地轉好的 362 筆完整排名 JSON，確保 0.1 秒瞬間呈現
      try {
        const res = await fetch("/data/hero_rankings.json");
        if (res.ok) {
          const jsonData = await res.json();
          if (Array.isArray(jsonData) && jsonData.length > 0) {
            setRecords(jsonData);
          }
        }
      } catch {
        // 忽略本地讀取錯誤
      }

      // 2. 若 Supabase 有最新更新的資料，再覆蓋更新
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("hero_rankings")
          .select("*")
          .order("finish_count", { ascending: false })
          .limit(5000);

        if (!error && data && data.length > 0) {
          const formatted = data.map((row: any) => ({
            id: row.id,
            name: row.athlete_name || row.name || "未知選手",
            team: row.team_name || row.team || "",
            count: Number(row.finish_count || row.count || 1),
          }));
          setRecords(formatted);
        }
      } catch {
        // 維持 JSON 資料集
      }
    }
    fetchRankings();
  }, []);

  const filteredRecords = useMemo(() => {
    const currentTabObj =
      MILESTONE_TABS.find((t) => t.label === activeTab) || MILESTONE_TABS[0];

    return records
      .filter((item) => {
        const matchStage =
          activeTab === "總排名"
            ? true
            : item.count >= currentTabObj.min && item.count <= currentTabObj.max;
        const matchQuery =
          !searchQuery.trim() ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.team.toLowerCase().includes(searchQuery.toLowerCase());
        return matchStage && matchQuery;
      })
      .sort((a, b) => (sortAsc ? a.count - b.count : b.count - a.count));
  }, [records, activeTab, searchQuery, sortAsc]);

  const totalEntries = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, pageSize]);

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-yellow-400 tracking-wider">
            鐵人三項百鐵排名
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto leading-relaxed">
            『百鐵認證』排名為了個資安全，是以姓名＋團隊名的組合，所以姓名＋不同團隊的組合則會分開成兩筆。
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 pt-2">
          <Link
            href="/certifications/query"
            className="px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium bg-red-700 hover:bg-red-600 text-white border border-red-500 transition"
          >
            賽事登錄資料查詢
          </Link>

          {MILESTONE_TABS.map((tab) => {
            const isActive = activeTab === tab.label;
            return (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                className={`px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-bold border transition ${
                  isActive
                    ? "bg-amber-700 text-yellow-300 border-yellow-400 shadow-inner"
                    : "bg-red-700 hover:bg-red-600 text-white border-red-500"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs sm:text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-zinc-900 border border-zinc-700 text-white px-2.5 py-1.5 rounded focus:outline-none focus:border-yellow-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span>Search:</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="輸入選手姓名或車隊/鐵人隊..."
              className="w-full sm:w-64 bg-zinc-900 border border-zinc-700 text-white px-3 py-1.5 rounded focus:outline-none focus:border-yellow-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded border border-zinc-800 shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950 text-gray-300 border-b border-zinc-800 text-xs sm:text-sm">
                <th className="py-3.5 px-4 sm:px-6 w-1/3 font-semibold">
                  選手姓名
                </th>
                <th className="py-3.5 px-4 sm:px-6 w-1/3 font-semibold">
                  所屬團隊 / 鐵人隊
                </th>
                <th
                  onClick={() => setSortAsc(!sortAsc)}
                  className="py-3.5 px-4 sm:px-6 w-1/3 font-semibold cursor-pointer hover:text-yellow-400 select-none flex items-center justify-between"
                >
                  <span>累積完賽鐵數</span>
                  <span className="text-xs">{sortAsc ? "▲" : "▼"}</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-black text-sm sm:text-base">
              {paginatedRecords.length === 0 ? (
                <tr className="bg-white">
                  <td colSpan={3} className="py-8 text-center text-gray-500">
                    查無符合「{searchQuery}」的完賽選手紀錄
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((row, idx) => (
                  <tr
                    key={`${row.name}-${row.team}-${idx}`}
                    className={
                      idx % 2 === 0
                        ? "bg-white hover:bg-yellow-50/70 transition"
                        : "bg-gray-100 hover:bg-yellow-50/70 transition"
                    }
                  >
                    <td className="py-3.5 px-4 sm:px-6 font-medium">
                      {row.name}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-gray-700">
                      {row.team}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-gray-900">
                      {row.count}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs sm:text-sm text-gray-400">
          <div>
            Showing{" "}
            {totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries}{" "}
            entries
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 disabled:opacity-40 transition"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 bg-white text-black font-bold rounded">
              {currentPage}
            </span>
            <span className="px-2">of {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}