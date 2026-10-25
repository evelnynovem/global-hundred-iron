'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type RankingRow = {
  rank: number;
  name: string;
  team: string;
  identifier: string;
  count: number;
};

type RpcRankingRow = {
  identifier: string;
  ranking_name: string;
  ranking_team: string;
  finish_count: number;
};

// 若是 Email 則進行遮罩；若是純姓名則保留或部分遮罩
function formatIdentifier(id: string) {
  if (!id) return "選手***";
  if (id.includes("@")) {
    const [localPart, domain] = id.split("@");
    if (!domain) return id;
    if (localPart.length <= 2) {
      return `${localPart[0] ?? "*"}***@${domain}`;
    }
    return `${localPart.slice(0, 2)}***@${domain}`;
  }
  // 如果是純姓名識別，可以適度保護隱私或直接顯示
  return id.length > 1 ? `${id[0]}*${id.slice(2)}` : id;
}

// 根據你的需求精確定義各個鐵數區間 (min ~ max，max 為 null 代表以上)
const MILESTONES = [
  { label: "總排名", min: 1, max: null },
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
  { label: "百鐵", min: 100, max: null },
];

export default function TriathlonRankingsPage() {
  const [rankings, setRankings] = useState<RankingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(MILESTONES[0]); // 預設總排名 (>= 1)
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_triathlon_rankings");

      if (error) {
        setError(true);
        setLoading(false);
        return;
      }

      const rawRows = (data ?? []) as RpcRankingRow[];
      const mapped: RankingRow[] = rawRows.map((row, index) => ({
        rank: index + 1,
        name: row.ranking_name || "選手",
        team: row.ranking_team || "",
        identifier: formatIdentifier(row.identifier),
        count: Number(row.finish_count),
      }));

      setRankings(mapped);
      setLoading(false);
    }

    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMilestone, searchTerm, entriesPerPage]);

  // 根據選擇的鐵數區間與搜尋關鍵字進行篩選
  const filteredRankings = rankings.filter((row) => {
    const matchesMin = row.count >= selectedMilestone.min;
    const matchesMax = selectedMilestone.max === null ? true : row.count <= selectedMilestone.max;
    const matchesMilestone = matchesMin && matchesMax;

    const term = searchTerm.toLowerCase();
    const nameStr = (row.name || "").toLowerCase();
    const teamStr = (row.team || "").toLowerCase();
    const idStr = (row.identifier || "").toLowerCase();

    const matchesSearch = nameStr.includes(term) || teamStr.includes(term) || idStr.includes(term);
    return matchesMilestone && matchesSearch;
  });

  const totalPages = Math.ceil(filteredRankings.length / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const displayedRankings = filteredRankings.slice(startIndex, startIndex + entriesPerPage);

  const startEntry = filteredRankings.length > 0 ? startIndex + 1 : 0;
  const endEntry = Math.min(startIndex + entriesPerPage, filteredRankings.length);

  return (
    <main className="min-h-screen bg-black text-white px-3 py-6 sm:px-8">
      <div className="mx-auto max-w-6xl">
        
        {/* 頁面標題與提示說明 */}
        <div className="text-center mt-4">
          <h1 className="text-2xl sm:text-3xl font-black text-yellow-400 tracking-wider">
            鐵人三項百鐵排名
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 mt-2">
            『百鐵認證』完整納入所有完賽紀錄，並嚴格依據鐵數區間分類，提供最佳瀏覽體驗。
          </p>
        </div>

        {/* 功能分頁按鈕列 (支援手機橫向捲動) */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700">
          <Link
            href="/certifications/query"
            className="px-3 py-2 bg-red-800 text-white text-xs sm:text-sm font-bold rounded whitespace-nowrap hover:bg-red-700 transition"
          >
            賽事登錄資料查詢
          </Link>
          
          {MILESTONES.map((m) => {
            const isActive = selectedMilestone.label === m.label;
            return (
              <button
                key={m.label}
                onClick={() => setSelectedMilestone(m)}
                className={`px-3 py-2 text-xs sm:text-sm font-bold rounded whitespace-nowrap transition ${
                  isActive
                    ? "bg-amber-600 text-white shadow-lg scale-105"
                    : "bg-red-900 text-zinc-200 hover:bg-red-800"
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        {/* 表格上方控制列 (Show entries & Search) */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-zinc-300">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              className="bg-black border border-zinc-700 rounded px-2 py-1 text-white text-xs sm:text-sm"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="whitespace-nowrap">Search:</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜尋姓名、團隊或帳號..."
              className="bg-black border border-zinc-700 rounded px-3 py-1 text-white text-xs sm:text-sm w-full sm:w-64 focus:outline-none focus:border-zinc-500"
            />
          </div>
        </div>

        {/* 排行榜表格 */}
        <div className="mt-4 overflow-x-auto border border-zinc-800 rounded bg-black">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-300 text-xs sm:text-sm">
                <th className="py-3 px-4 sm:px-6 w-20">排名</th>
                <th className="py-3 px-4 sm:px-6">姓名</th>
                <th className="py-3 px-4 sm:px-6">團隊</th>
                <th className="py-3 px-4 sm:px-6">認證身分 / 帳號</th>
                <th className="py-3 px-4 sm:px-6 text-right">總完賽次數</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-400">
                    載入排行榜中...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-red-500">
                    目前無法讀取排行榜資料，請稍後再試。
                  </td>
                </tr>
              ) : displayedRankings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    目前沒有符合條件的完賽紀錄。
                  </td>
                </tr>
              ) : (
                displayedRankings.map((row) => (
                  <tr key={`${row.identifier}-${row.rank}`} className="border-b border-zinc-900 hover:bg-zinc-950/50 transition">
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-bold text-zinc-400">
                      {String(row.rank).padStart(2, "0")}
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-base font-bold text-white">
                      {row.name || "選手"}
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-base text-zinc-300">
                      {row.team || "-"}
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm text-zinc-400 font-mono">
                      {row.identifier}
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-base sm:text-xl font-black text-right text-yellow-400">
                      {row.count}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 底部分頁控制列 */}
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-zinc-400 gap-4">
          <div>
            Showing {startEntry} to {endEntry} of {filteredRankings.length} entries
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            
            <span className="px-3 py-1 bg-red-900 text-white rounded font-bold">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}