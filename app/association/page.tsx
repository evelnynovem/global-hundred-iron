"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// 定義三大賽事類別
type EventSeries = "ALL" | "普悠瑪鐵人三項" | "臺東超級鐵人" | "戀戀197自行車賽";

interface Announcement {
  id: string | number;
  title: string;
  category: string;      // 例如：重要公告、秩序冊下載、交通管制
  event_series?: string; // 對應賽事
  content?: string;
  file_url?: string;     // 簡章或秩序冊 PDF 連結
  is_pinned?: boolean;   // 是否紅字置頂
  created_at: string;
}

interface HistoryResult {
  id: string | number;
  event_year: string;    // 年份，如 2025
  event_name: string;    // 賽事名稱
  category: string;      // 組別，如 226K, 113K, 51.5K, 197K
  bib_number: string;    // 號碼布
  name: string;          // 選手姓名
  gender?: string;
  age_group?: string;    // 分齡組
  swim_time?: string;
  bike_time?: string;
  run_time?: string;
  total_time: string;    // 總成績
  rank_overall?: string; // 總排
  rank_group?: string;   // 分組排名
}

export default function TaitungAssociationPage() {
  const [activeTab, setActiveTab] = useState<EventSeries>("ALL");
  
  // 公告狀態
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  // 成績查詢狀態
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [results, setResults] = useState<HistoryResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 證書預覽彈窗狀態
  const [selectedCert, setSelectedCert] = useState<HistoryResult | null>(null);

  // 1. 載入協會公告 (association_announcements)
  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        setLoadingNews(true);
        const { data, error } = await supabase
          .from("association_announcements")
          .select("*")
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        if (data && data.length > 0) {
          setAnnouncements(data);
        } else {
          // 若資料庫尚無資料，提供預設展示資料讓您向協會 Demo 時畫面飽滿
          setAnnouncements([
            {
              id: 1,
              title: "【重要置頂】2026 臺東普悠瑪鐵人三項 選手秩序冊與晶片領取須知（請選手務必詳閱）",
              category: "秩序冊下載",
              event_series: "普悠瑪鐵人三項",
              file_url: "#download-pdf",
              is_pinned: true,
              created_at: "2026-03-15",
            },
            {
              id: 2,
              title: "【交通管制公告】臺東森林公園活水湖周邊暨中華大橋 賽事期間階段性封路說明",
              category: "交通管制",
              event_series: "臺東超級鐵人",
              is_pinned: true,
              created_at: "2026-03-10",
            },
            {
              id: 3,
              title: "戀戀197東海岸自行車公路賽 歷年完賽選手榮譽榜已全數匯入系統，歡迎查詢下載電子證書",
              category: "賽事公告",
              event_series: "戀戀197自行車賽",
              is_pinned: false,
              created_at: "2026-02-20",
            },
          ]);
        }
      } catch (err) {
        console.error("讀取公告提示(已切換為展示模式):", err);
      } finally {
        setLoadingNews(false);
      }
    }
    fetchAnnouncements();
  }, []);

  // 2. 搜尋歷年成績 (association_history_results)
  const handleSearchResults = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      alert("請輸入選手姓名或號碼布進行查詢！");
      return;
    }

    setLoadingResults(true);
    setHasSearched(true);

    try {
      let query = supabase
        .from("association_history_results")
        .select("*")
        .or(`name.ilike.%${searchQuery.trim()}%,bib_number.ilike.%${searchQuery.trim()}%`);

      if (activeTab !== "ALL") {
        query = query.ilike("event_name", `%${activeTab.slice(0, 3)}%`);
      }
      if (selectedYear !== "ALL") {
        query = query.eq("event_year", selectedYear);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      if (data && data.length > 0) {
        setResults(data);
      } else {
        // Demo 展示保底資料（當輸入測試姓名或資料庫尚未匯入時可展示給協會看）
        if (searchQuery.includes("陳") || searchQuery.includes("測試") || searchQuery.includes("108")) {
          setResults([
            {
              id: "demo-1",
              event_year: "2025",
              event_name: "2025 臺東普悠瑪鐵人三項賽",
              category: "113K 半程超鐵",
              bib_number: "A108",
              name: searchQuery.trim(),
              age_group: "M45-49",
              swim_time: "00:38:12",
              bike_time: "02:45:30",
              run_time: "02:10:15",
              total_time: "05:33:57",
              rank_overall: "32",
              rank_group: "5",
            },
            {
              id: "demo-2",
              event_year: "2024",
              event_name: "2024 戀戀197東海岸自行車賽",
              category: "130K 挑戰組",
              bib_number: "C701",
              name: searchQuery.trim(),
              age_group: "M45-49",
              total_time: "04:12:40",
              rank_overall: "18",
              rank_group: "3",
            },
          ]);
        } else {
          setResults([]);
        }
      }
    } catch (err) {
      console.error("查詢歷史成績錯誤:", err);
      setResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  // 根據當前選擇的賽事 Tab 過濾公告
  const filteredAnnouncements = announcements.filter((item) => {
    if (activeTab === "ALL") return true;
    return !item.event_series || item.event_series.includes(activeTab.slice(0, 3));
  });

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 pb-24">
      {/* 頂部雙品牌聯名旗艦橫幅 (Hero Section) */}
      <div className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 pt-10 pb-14 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          {/* 聯名徽章列 */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-8">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-black text-slate-950 tracking-wider uppercase shadow">
                OFFICIAL PORTAL
              </span>
              <span className="text-xs sm:text-sm font-bold text-amber-400">
                臺東城鄉生活運動協會 ✕ 全球百鐵認證 官方指定數位賽事總站
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
              >
                選手個人中心
              </Link>
            </div>
          </div>

          {/* 主標題與協會尊榮介紹 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                臺東城鄉生活運動協會
                <span className="block text-xl sm:text-2xl font-bold text-amber-400 mt-2">
                  深耕東台灣耐力運動・打造活水湖與東海岸經典傳奇
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                本專區為「臺東城鄉生活運動協會」與「全球百鐵認證」共同建置之官方數位服務中心。完整收錄本會主辦之
                <strong className="text-white">「普悠瑪鐵人三項」</strong>、
                <strong className="text-white">「臺東超級鐵人」</strong>及
                <strong className="text-white">「戀戀197自行車公路賽」</strong>
                最新賽事公告、秩序冊下載與歷年完賽成績資料庫。所有完賽紀錄皆可直接勾稽匯入全球百鐵認證個人履歷。
              </p>
            </div>

            {/* 數據與榮譽小卡 */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
                <div className="text-2xl sm:text-3xl font-black text-amber-400">3 大</div>
                <div className="text-xs font-bold text-slate-300 mt-1">東台灣指標經典賽事</div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-center">
                <div className="text-2xl sm:text-3xl font-black text-white">100%</div>
                <div className="text-xs font-bold text-slate-400 mt-1">成績直通百鐵認證</div>
              </div>
              <div className="col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex items-center justify-between">
                <div className="text-left">
                  <div className="text-xs font-bold text-emerald-400">● 數位無紙化服務已啟用</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">提供選手歷年成績秒查與電子證書下載</div>
                </div>
                <span className="text-xs font-bold bg-slate-800 px-3 py-1.5 rounded-lg text-slate-200">
                  官方認證
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 核心主體內容區 */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 -mt-6 space-y-10">
        
        {/* 區塊一：三大經典賽事切換頁籤 (Tabs) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-2 sm:p-3 shadow-2xl backdrop-blur">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(
              [
                { id: "ALL", label: "🏆 協會總覽與全部賽事", sub: "All Association Events" },
                { id: "普悠瑪鐵人三項", label: "🏊‍♂️ 普悠瑪鐵人三項", sub: "226K / 113K / 51.5K" },
                { id: "臺東超級鐵人", label: "🏃‍♂️ 臺東超級鐵人賽", sub: "秋季活水湖經典賽" },
                { id: "戀戀197自行車賽", label: "🚴‍♂️ 戀戀197自行車賽", sub: "197縣道東海岸公路賽" },
              ] as const
            ).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-start justify-center rounded-xl p-3 sm:p-4 text-left transition-all ${
                    isActive
                      ? "bg-amber-500 text-slate-950 shadow-lg font-black"
                      : "bg-slate-950/60 text-slate-300 hover:bg-slate-800/80 border border-slate-800/60"
                  }`}
                >
                  <span className="text-sm sm:text-base font-extrabold">{tab.label}</span>
                  <span className={`text-[11px] mt-0.5 ${isActive ? "text-slate-900 font-semibold" : "text-slate-500"}`}>
                    {tab.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 區塊二：紅字置頂公告與秩序冊下載區 (串接 association_announcements) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  協會官方置頂公告 ＆ 秩序冊簡章下載
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {activeTab === "ALL" ? "顯示協會所有最新賽事公告" : `目前篩選：${activeTab} 專屬公告`}
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              賽事行政公告板
            </span>
          </div>

          {loadingNews ? (
            <div className="py-8 text-center text-slate-400 text-sm">正在載入協會最新公告...</div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">目前此分類尚無最新公告。</div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {filteredAnnouncements.map((news) => (
                <div
                  key={news.id}
                  className={`py-4 px-4 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    news.is_pinned ? "bg-red-500/10 border border-red-500/30 mb-3" : "hover:bg-slate-900/60"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {news.is_pinned && (
                        <span className="rounded bg-red-600 px-2 py-0.5 text-[11px] font-black text-white">
                          置頂重要公告
                        </span>
                      )}
                      <span className="rounded bg-slate-800 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400 border border-slate-700">
                        {news.category || "賽事公告"}
                      </span>
                      <span className="text-xs text-slate-400">{news.created_at?.slice(0, 10)}</span>
                    </div>
                    <h3 className={`text-sm sm:text-base font-bold ${news.is_pinned ? "text-red-300" : "text-slate-100"}`}>
                      {news.title}
                    </h3>
                  </div>

                  {news.file_url && (
                    <a
                      href={news.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 transition shadow"
                    >
                      📄 下載簡章 / 秩序冊 (PDF)
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 區塊三：歷年成績快速查詢與電子證書引擎 (串接 association_history_results) */}
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                OFFICIAL RESULTS & E-CERTIFICATE
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                臺東城鄉協會 — 歷年賽事成績查詢暨電子證書系統
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                支援查詢普悠瑪鐵人、臺東超鐵、戀戀197歷年完賽紀錄，查詢後可直接預覽聯名電子證書或一鍵匯入百鐵履歷。
              </p>
            </div>
            <Link
              href="/profile/claim"
              className="shrink-0 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition text-center"
            >
              前往百鐵會員一鍵認領 →
            </Link>
          </div>

          {/* 搜尋表單 */}
          <form onSubmit={handleSearchResults} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-3">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="ALL">所有比賽年份 (歷年全部)</option>
                <option value="2026">2026 年度</option>
                <option value="2025">2025 年度</option>
                <option value="2024">2024 年度</option>
                <option value="2023">2023 年度以前</option>
              </select>
            </div>
            <div className="sm:col-span-6">
              <input
                type="text"
                placeholder="請輸入選手真實姓名 或 比賽號碼布（例如：陳彥良 或 A108）"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={loadingResults}
                className="w-full rounded-xl bg-amber-500 px-6 py-3 text-sm font-black text-slate-950 hover:bg-amber-400 transition shadow-lg disabled:opacity-50"
              >
                {loadingResults ? "查詢中..." : "🔍 立即查詢成績"}
              </button>
            </div>
          </form>

          {/* 查詢結果表格 */}
          {hasSearched && (
            <div className="pt-4">
              {loadingResults ? (
                <div className="py-12 text-center text-slate-400">正在檢索協會歷年資料庫...</div>
              ) : results.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center space-y-2">
                  <div className="text-slate-300 font-bold">查無符合「{searchQuery}」的歷年成績紀錄</div>
                  <p className="text-xs text-slate-500">
                    請確認姓名有無錯別字，或嘗試切換上方賽事頁籤為「協會總覽與全部賽事」後再試一次。（Demo 測試可輸入「陳彥良」或「108」查看效果）
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900 text-xs text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">年份 / 賽事名稱</th>
                        <th className="p-3.5">組別</th>
                        <th className="p-3.5">號碼布</th>
                        <th className="p-3.5">選手姓名</th>
                        <th className="p-3.5">完賽總成績</th>
                        <th className="p-3.5">總排 / 分組</th>
                        <th className="p-3.5 text-right">數位服務</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 bg-slate-950/60">
                      {results.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-900/60 transition">
                          <td className="p-3.5 font-bold text-white">
                            <span className="text-amber-400 mr-1.5">[{r.event_year}]</span>
                            {r.event_name}
                          </td>
                          <td className="p-3.5 text-slate-300">{r.category}</td>
                          <td className="p-3.5 font-mono text-amber-300">{r.bib_number}</td>
                          <td className="p-3.5 font-bold text-white">{r.name}</td>
                          <td className="p-3.5 font-mono font-extrabold text-emerald-400 text-base">
                            {r.total_time}
                          </td>
                          <td className="p-3.5 text-xs text-slate-400">
                            總排 {r.rank_overall || "-"} / 組排 {r.rank_group || "-"}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedCert(r)}
                              className="rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 px-3 py-1.5 text-xs font-bold text-amber-400 transition"
                            >
                              📜 預覽電子證書
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 雙品牌聯名電子證書預覽彈窗 (向協會展示數位轉型價值的殺手鐧) */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl border-2 border-amber-500 bg-slate-950 p-6 sm:p-10 text-center shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="text-left">
                <div className="text-xs font-black text-amber-400 tracking-widest">OFFICIAL FINISHER CERTIFICATE</div>
                <div className="text-sm font-bold text-white">臺東城鄉生活運動協會 ✕ 全球百鐵認證 聯合授證</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCert(null)}
                className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300 hover:bg-slate-700"
              >
                關閉 ✕
              </button>
            </div>

            <div className="py-4 space-y-4 border border-amber-500/20 rounded-xl bg-slate-900/40 p-6">
              <div className="text-lg sm:text-xl font-extrabold text-amber-400">{selectedCert.event_name}</div>
              <div className="text-xs text-slate-400">茲證明選手以堅韌不拔之耐力精神完成本賽事</div>
              <div className="text-3xl sm:text-4xl font-black text-white py-2">{selectedCert.name}</div>
              <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-300">
                <span className="bg-slate-800 px-3 py-1 rounded-full">參賽組別：{selectedCert.category}</span>
                <span className="bg-slate-800 px-3 py-1 rounded-full">號碼布：{selectedCert.bib_number}</span>
                <span className="bg-slate-800 px-3 py-1 rounded-full">分齡組：{selectedCert.age_group || "標準組"}</span>
              </div>
              <div className="pt-2">
                <div className="text-xs text-slate-400">OFFICIAL TIME / 完賽總成績</div>
                <div className="text-3xl font-mono font-black text-emerald-400 mt-1">{selectedCert.total_time}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-slate-400">
              <div>主辦單位：臺東城鄉生活運動協會</div>
              <div>數位認證暨系統協力：全球百鐵認證 (Global 100 Triathlon)</div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 transition"
              >
                🖨️ 列印 / 另存 PDF 證書
              </button>
              <Link
                href="/profile/claim"
                className="rounded-xl border border-slate-700 bg-slate-800 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition"
              >
                同步登錄至百鐵榮譽榜
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}