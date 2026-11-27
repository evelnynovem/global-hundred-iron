"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/client";

export interface RankingRow {
  athlete_name: string;
  finish_count: number;
  latest_race_date: string | null;
  primary_team: string | null;
  is_verified_member: boolean;
  has_homonym_warning: boolean;
}

interface Props {
  defaultSport?: "triathlon" | "cycling";
}

interface AwardTier {
  id: string;
  prefix: string;
  min: number;
  max: number | null;
  rangeText: string;
}

const PAGE_SIZE = 50;

const AWARD_TIERS: AwardTier[] = [
  { id: "all", prefix: "全部賞別", min: 1, max: null, rangeText: "全部完賽選手" },
  { id: "t1", prefix: "初", min: 1, max: 3, rangeText: "1–2 場有效完賽" },
  { id: "t3", prefix: "三", min: 3, max: 5, rangeText: "3–4 場有效完賽" },
  { id: "t5", prefix: "五", min: 5, max: 10, rangeText: "5–9 場有效完賽" },
  { id: "t10", prefix: "十", min: 10, max: 20, rangeText: "10–19 場有效完賽" },
  { id: "t20", prefix: "廿", min: 20, max: 30, rangeText: "20–29 場有效完賽" },
  { id: "t30", prefix: "卅", min: 30, max: 40, rangeText: "30–39 場有效完賽" },
  { id: "t40", prefix: "四十", min: 40, max: 50, rangeText: "40–49 場有效完賽" },
  { id: "t50", prefix: "五十", min: 50, max: 60, rangeText: "50–59 場有效完賽" },
  { id: "t60", prefix: "六十", min: 60, max: 70, rangeText: "60–69 場有效完賽" },
  { id: "t70", prefix: "七十", min: 70, max: 80, rangeText: "70–79 場有效完賽" },
  { id: "t80", prefix: "八十", min: 80, max: 90, rangeText: "80–89 場有效完賽" },
  { id: "t90", prefix: "九十", min: 90, max: 100, rangeText: "90–99 場有效完賽" },
  { id: "t100", prefix: "百", min: 100, max: null, rangeText: "100 場以上最高榮耀" },
];

function getTierLabel(tier: AwardTier, sport: "triathlon" | "cycling"): string {
  if (tier.id === "all") return "全部賞別";
  const unit = sport === "triathlon" ? "鐵賞" : "鐵馬賞";
  return `${tier.prefix}${unit}`;
}

function getMilestoneBadge(count: number, sport: "triathlon" | "cycling") {
  const unit = sport === "triathlon" ? "鐵賞" : "鐵馬賞";
  if (count >= 100) return { label: `百${unit}`, style: "bg-gradient-to-r from-amber-400 to-yellow-300 text-black border-amber-300" };
  if (count >= 90) return { label: `九十${unit}`, style: "bg-amber-500/25 text-amber-300 border-amber-400/60" };
  if (count >= 80) return { label: `八十${unit}`, style: "bg-amber-500/20 text-amber-300 border-amber-500/50" };
  if (count >= 70) return { label: `七十${unit}`, style: "bg-amber-500/20 text-amber-300 border-amber-500/50" };
  if (count >= 60) return { label: `六十${unit}`, style: "bg-amber-500/20 text-amber-300 border-amber-500/50" };
  if (count >= 50) return { label: `五十${unit}`, style: "bg-red-900/60 text-amber-200 border-amber-500/60" };
  if (count >= 40) return { label: `四十${unit}`, style: "bg-zinc-800 text-amber-300 border-amber-500/40" };
  if (count >= 30) return { label: `卅${unit}`, style: "bg-zinc-800 text-amber-300 border-amber-500/40" };
  if (count >= 20) return { label: `廿${unit}`, style: "bg-zinc-800 text-amber-200 border-zinc-700" };
  if (count >= 10) return { label: `十${unit}`, style: "bg-zinc-900 text-amber-200 border-zinc-700" };
  if (count >= 5) return { label: `五${unit}`, style: "bg-zinc-900 text-zinc-200 border-zinc-700" };
  if (count >= 3) return { label: `三${unit}`, style: "bg-zinc-900 text-zinc-300 border-zinc-800" };
  return { label: `初${unit}`, style: "bg-zinc-900 text-zinc-400 border-zinc-800" };
}

function sanitizeSearchTerm(input: string): string {
  return String(input || "")
    .trim()
    .replace(/[%_,()'"\\;]/g, "")
    .slice(0, 40);
}

export default function HighSpeedRankingsView({ defaultSport = "triathlon" }: Props) {
  const supabase = createClient();

  const [sport, setSport] = useState<"triathlon" | "cycling">(defaultSport);
  const [selectedTierId, setSelectedTierId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "unclaimed">("all");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<RankingRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [tierCounts, setTierCounts] = useState<Record<string, number>>({});
  const [tierCountsLoading, setTierCountsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedAthlete, setSelectedAthlete] = useState<RankingRow | null>(null);
  const [detailRecords, setDetailRecords] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const reqSeqRef = useRef(0);
  const countSeqRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sp = params.get("sport");
    if (sp === "cycling") setSport("cycling");
    else if (sp === "triathlon") setSport("triathlon");
    const tierParam = params.get("tier");
    if (tierParam && AWARD_TIERS.some((t) => t.id === tierParam)) {
      setSelectedTierId(tierParam);
    }
    const q = params.get("q");
    if (q) {
      setSearchInput(q);
      setDebouncedSearch(sanitizeSearchTerm(q));
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(sanitizeSearchTerm(searchInput));
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const activeTier = AWARD_TIERS.find((t) => t.id === selectedTierId) || AWARD_TIERS[0];

  // 高速計算 13 階賞別＋全部賞別的「實際統計人數」
  // 優先呼叫單次 RPC (get_ranking_tier_counts)；若尚未建立 RPC 則自動降級為分批 head:true 計數（零資料傳輸、絕不卡頓）
  const fetchTierCounts = useCallback(async () => {
    const currentSeq = ++countSeqRef.current;
    setTierCountsLoading(true);
    try {
      const { data: rpcData, error: rpcErr } = await supabase.rpc("get_ranking_tier_counts", {
        p_sport: sport,
        p_status: statusFilter,
        p_search: debouncedSearch,
      });

      if (currentSeq !== countSeqRef.current) return;

      if (!rpcErr && rpcData && typeof rpcData === "object") {
        const mapped: Record<string, number> = {};
        for (const t of AWARD_TIERS) {
          mapped[t.id] = Number((rpcData as any)[t.id] || 0);
        }
        setTierCounts(mapped);
        setTierCountsLoading(false);
        return;
      }

      // 降級方案：分兩批執行輕量 head:true 計數查詢（僅回傳標頭筆數、不傳輸任何選手資料）
      const viewName = sport === "triathlon" ? "v_triathlon_rankings" : "v_cycling_rankings";
      const resultMap: Record<string, number> = {};

      const queryOneTier = async (tier: AwardTier) => {
        let q = supabase.from(viewName).select("athlete_name", { count: "exact", head: true });
        if (tier.id !== "all") {
          q = q.gte("finish_count", tier.min);
          if (tier.max !== null) q = q.lt("finish_count", tier.max);
        }
        if (debouncedSearch) q = q.ilike("athlete_name", `%${debouncedSearch}%`);
        if (statusFilter === "verified") q = q.eq("is_verified_member", true);
        else if (statusFilter === "unclaimed") q = q.eq("is_verified_member", false);
        const { count } = await q;
        resultMap[tier.id] = count || 0;
      };

      const batchSize = 5;
      for (let i = 0; i < AWARD_TIERS.length; i += batchSize) {
        await Promise.all(AWARD_TIERS.slice(i, i + batchSize).map(queryOneTier));
        if (currentSeq !== countSeqRef.current) return;
      }

      setTierCounts(resultMap);
    } catch (e) {
      // 優雅降級
    } finally {
      if (currentSeq === countSeqRef.current) {
        setTierCountsLoading(false);
      }
    }
  }, [supabase, sport, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchTierCounts();
  }, [fetchTierCounts]);

  const fetchRankings = useCallback(async () => {
    const currentSeq = ++reqSeqRef.current;
    setLoading(true);
    setErrorMsg("");

    try {
      const viewName = sport === "triathlon" ? "v_triathlon_rankings" : "v_cycling_rankings";
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from(viewName)
        .select(
          "athlete_name, finish_count, latest_race_date, primary_team, is_verified_member, has_homonym_warning",
          { count: "exact" }
        );

      if (activeTier.id !== "all") {
        query = query.gte("finish_count", activeTier.min);
        if (activeTier.max !== null) {
          query = query.lt("finish_count", activeTier.max);
        }
      }

      if (debouncedSearch) {
        query = query.ilike("athlete_name", `%${debouncedSearch}%`);
      }

      if (statusFilter === "verified") {
        query = query.eq("is_verified_member", true);
      } else if (statusFilter === "unclaimed") {
        query = query.eq("is_verified_member", false);
      }

      const { data, count, error } = await query
        .order("finish_count", { ascending: false })
        .order("latest_race_date", { ascending: false })
        .order("athlete_name", { ascending: true })
        .range(from, to);

      if (currentSeq !== reqSeqRef.current) return;
      if (error) throw new Error(error.message);

      setRows((data as RankingRow[]) || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      if (currentSeq !== reqSeqRef.current) return;
      setRows([]);
      setTotalCount(0);
      setErrorMsg("排行榜資料暫時無法讀取，請確認網路連線或稍後再試。");
    } finally {
      if (currentSeq === reqSeqRef.current) {
        setLoading(false);
      }
    }
  }, [supabase, sport, page, debouncedSearch, statusFilter, activeTier]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  const handleOpenAthleteDetail = async (athlete: RankingRow) => {
    setSelectedAthlete(athlete);
    setDetailRecords([]);
    setDetailLoading(true);
    try {
      if (sport === "triathlon") {
        const { data } = await supabase
          .from("race_details_full")
          .select("*")
          .eq("athlete_name", athlete.athlete_name)
          .order("race_date", { ascending: false })
          .limit(200);
        setDetailRecords(data || []);
      } else {
        const [cycRes, ultraRes] = await Promise.all([
          supabase
            .from("cycling_details_full")
            .select("*")
            .eq("athlete_name", athlete.athlete_name)
            .order("race_date", { ascending: false })
            .limit(150),
          supabase
            .from("race_details_full")
            .select("*")
            .eq("athlete_name", athlete.athlete_name)
            .or("category.ilike.%113%,category.ilike.%226%,category.ilike.%70.3%,race_name.ilike.%113%,race_name.ilike.%226%,race_name.ilike.%70.3%")
            .order("race_date", { ascending: false })
            .limit(150),
        ]);
        const merged = [
          ...((cycRes.data || []).map((r: any) => ({ ...r, __source: "單車賽" }))),
          ...((ultraRes.data || []).map((r: any) => ({ ...r, __source: "超鐵雙軌併計" }))),
        ].sort((a, b) => String(b.race_date || "").localeCompare(String(a.race_date || "")));
        setDetailRecords(merged);
      }
    } catch (e) {
      setDetailRecords([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const detailDateCounts = React.useMemo(() => {
    const map = new Map<string, number>();
    detailRecords.forEach((r) => {
      const d = String(r.race_date || "").trim().split("/").join("-").slice(0, 10);
      if (d) map.set(d, (map.get(d) || 0) + 1);
    });
    return map;
  }, [detailRecords]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between overflow-x-hidden">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* 1. 頂部權威標題與雙軌切換區 */}
        <section className="rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-amber-500/35 p-6 sm:p-9 shadow-2xl space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div className="space-y-2">
              <span className="inline-block px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-[11px] font-black tracking-widest uppercase">
                OFFICIAL HALL OF FAME・13-TIER MILESTONE RANKINGS
              </span>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                {sport === "triathlon" ? "🏆 全球百鐵認證・百鐵英雄榜" : "🚴 全球百鐵認證・百鐵馬英雄榜"}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-3xl">
                採用資料庫伺服器端高速分頁聚合（每頁 {PAGE_SIZE} 位，秒開不當機），並<strong className="text-amber-300">嚴格執行同日去重（同一日期無論登錄幾場僅計 1 筆完賽）</strong>。下方各賞別按鈕即時統計該級距人數，點擊即可切換查閱。
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => { setSport("triathlon"); setPage(1); }}
                className={
                  "px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer " +
                  (sport === "triathlon"
                    ? "bg-amber-500 text-black shadow-lg"
                    : "bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800")
                }
              >
                🏊‍♂️ 百鐵英雄榜（初鐵賞～百鐵賞）
              </button>
              <button
                type="button"
                onClick={() => { setSport("cycling"); setPage(1); }}
                className={
                  "px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer " +
                  (sport === "cycling"
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800")
                }
              >
                🚴 百鐵馬英雄榜（初鐵馬賞～百鐵馬賞）
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold">
                {getTierLabel(activeTier, sport)}統計人數：<span className="text-amber-400 font-mono font-black text-sm">{totalCount.toLocaleString()}</span> 人
              </span>
              <span className="inline-flex items-center gap-1.5 text-zinc-400">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                已實名認證：已完成會員認領
              </span>
              <span className="inline-flex items-center gap-1.5 text-zinc-400">
                <span className="inline-block w-2 h-2 rounded-full bg-zinc-500" />
                官方收錄待認領：點選直接認領
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/profile/claim?type=${sport}`}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow transition"
              >
                ⚡ 搜尋姓名・一鍵認領歷史賽事 →
              </Link>
              <Link
                href="/profile/new-record"
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs transition"
              >
                ➕ 手動登錄完賽成績
              </Link>
            </div>
          </div>
        </section>

        {/* 2. 13 階賞別分類按鈕區：完整顯示「各賞別實際統計人數」 */}
        <section className="rounded-2xl bg-zinc-950 border border-amber-500/25 p-4 sm:p-5 space-y-3 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-amber-400">
                🏅 {sport === "triathlon" ? "百鐵英雄榜・各賞別統計人數與分類篩選" : "百鐵馬英雄榜・各賞別統計人數與分類篩選"}
              </span>
              <span className="text-[11px] text-zinc-400 font-bold">
                （括號內為該賞別實際統計人數，滑鼠移上可檢視場次門檻）
              </span>
            </div>
            {selectedTierId !== "all" && (
              <button
                type="button"
                onClick={() => { setSelectedTierId("all"); setPage(1); }}
                className="text-xs font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer"
              >
                重置為全部賞別
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {AWARD_TIERS.map((tier) => {
              const isSelected = selectedTierId === tier.id;
              const isTop = tier.id === "t100";
              const label = getTierLabel(tier, sport);
              const countVal = tierCounts[tier.id];
              const countText =
                typeof countVal === "number"
                  ? `${countVal.toLocaleString()} 人`
                  : tierCountsLoading
                  ? "統計中..."
                  : "0 人";

              return (
                <button
                  key={tier.id}
                  type="button"
                  title={`${label}（${tier.rangeText}）`}
                  onClick={() => {
                    setSelectedTierId(tier.id);
                    setPage(1);
                  }}
                  className={
                    "px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border flex items-center gap-1.5 " +
                    (isSelected
                      ? sport === "triathlon"
                        ? "bg-amber-500 text-black border-amber-400 shadow-lg scale-[1.02]"
                        : "bg-blue-500 text-white border-blue-400 shadow-lg scale-[1.02]"
                      : isTop
                      ? "bg-gradient-to-r from-amber-950/60 to-red-950/60 text-amber-300 border-amber-500/50 hover:border-amber-400"
                      : "bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:border-amber-500/40 hover:text-white")
                  }
                >
                  <span>{label}</span>
                  <span
                    className={
                      "text-[11px] font-mono font-bold " +
                      (isSelected
                        ? sport === "triathlon"
                          ? "text-black/85"
                          : "text-white/95"
                        : "text-amber-400/90")
                    }
                  >
                    ({countText})
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. 搜尋與認領狀態篩選列 */}
        <section className="rounded-2xl bg-zinc-950 border border-zinc-800 p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="輸入選手姓名快速搜尋（例如：陳彥良、洪緯欣...）"
              aria-label="搜尋選手姓名"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 focus:border-amber-500 focus:outline-none px-4 py-2.5 text-sm text-white placeholder-zinc-500"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white px-2 py-1"
              >
                清除
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => { setStatusFilter("all"); setPage(1); }}
              className={
                "px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer " +
                (statusFilter === "all"
                  ? "bg-white text-black"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white")
              }
            >
              全部選手
            </button>
            <button
              type="button"
              onClick={() => { setStatusFilter("verified"); setPage(1); }}
              className={
                "px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer " +
                (statusFilter === "verified"
                  ? "bg-amber-500 text-black"
                  : "bg-zinc-900 text-amber-300 border border-amber-500/30 hover:bg-zinc-800")
              }
            >
              ✓ 僅看已實名認證
            </button>
            <button
              type="button"
              onClick={() => { setStatusFilter("unclaimed"); setPage(1); }}
              className={
                "px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer " +
                (statusFilter === "unclaimed"
                  ? "bg-zinc-200 text-black"
                  : "bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800")
              }
            >
              📋 官方收錄待認領
            </button>
          </div>
        </section>

        {errorMsg && (
          <div className="rounded-2xl bg-red-950/50 border border-red-700/60 p-4 text-xs sm:text-sm text-red-200 font-bold">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* 4. 排行榜主表 */}
        <section className="rounded-3xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/90 border-b border-zinc-800 text-[11px] sm:text-xs font-black text-zinc-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-16 text-center">排名</th>
                  <th className="py-3.5 px-4">選手姓名 ＆ 認證狀態</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">代表團隊 / 車隊</th>
                  <th className="py-3.5 px-4 text-center">有效場次（同日計1）</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell text-center">達成賞別</th>
                  <th className="py-3.5 px-4 hidden lg:table-cell text-center">最近完賽日</th>
                  <th className="py-3.5 px-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70 text-xs sm:text-sm">
                {loading ? (
                  Array.from({ length: 8 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 px-4 text-center"><div className="h-4 w-8 mx-auto bg-zinc-800 rounded" /></td>
                      <td className="py-4 px-4"><div className="h-4 w-40 bg-zinc-800 rounded" /></td>
                      <td className="py-4 px-4 hidden md:table-cell"><div className="h-4 w-28 bg-zinc-800 rounded" /></td>
                      <td className="py-4 px-4 text-center"><div className="h-5 w-12 mx-auto bg-zinc-800 rounded" /></td>
                      <td className="py-4 px-4 hidden sm:table-cell text-center"><div className="h-5 w-16 mx-auto bg-zinc-800 rounded-full" /></td>
                      <td className="py-4 px-4 hidden lg:table-cell text-center"><div className="h-4 w-20 mx-auto bg-zinc-800 rounded" /></td>
                      <td className="py-4 px-4 text-right"><div className="h-7 w-20 ml-auto bg-zinc-800 rounded-lg" /></td>
                    </tr>
                  ))
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center text-zinc-500 font-bold">
                      目前在「{getTierLabel(activeTier, sport)}」分類下查無符合條件的選手紀錄。
                    </td>
                  </tr>
                ) : (
                  rows.map((row, idx) => {
                    const globalRank = (page - 1) * PAGE_SIZE + idx + 1;
                    const award = getMilestoneBadge(Number(row.finish_count || 0), sport);
                    const claimUrl = `/profile/claim?type=${sport}&name=${encodeURIComponent(row.athlete_name)}`;

                    return (
                      <tr key={`${row.athlete_name}-${globalRank}`} className="hover:bg-zinc-900/60 transition">
                        <td className="py-3.5 px-4 text-center font-mono font-black">
                          {globalRank === 1 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-black text-xs">1</span>
                          ) : globalRank === 2 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-300 text-black text-xs">2</span>
                          ) : globalRank === 3 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white text-xs">3</span>
                          ) : (
                            <span className="text-zinc-400">#{globalRank}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenAthleteDetail(row)}
                              className="font-black text-white hover:text-amber-400 transition text-left cursor-pointer"
                            >
                              {row.athlete_name}
                            </button>

                            {row.is_verified_member ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-black text-[11px] font-black shadow-sm">
                                ✓ 已實名認證
                              </span>
                            ) : (
                              <Link
                                href={claimUrl}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-900 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold transition"
                                title="點擊前往認領屬於您的歷史賽事"
                              >
                                📋 官方收錄・待認領
                              </Link>
                            )}

                            {row.has_homonym_warning && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-950/70 border border-orange-600/40 text-orange-300 text-[10px] font-bold"
                                title="資料庫偵測到同名選手分齡跨度超過 12 年，建議本人認領以獨立計算場次"
                              >
                                ⚠️ 含同名選手・認領後獨立計場
                              </span>
                            )}
                          </div>
                          <div className="md:hidden text-[11px] text-zinc-500 mt-1">
                            {row.primary_team || "個人"} · {award.label} · 最近：{row.latest_race_date || "—"}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 hidden md:table-cell text-zinc-300 text-xs max-w-[200px] truncate">
                          {row.primary_team || "個人"}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className={"font-mono font-black text-base sm:text-lg " + (sport === "triathlon" ? "text-amber-400" : "text-blue-400")}>
                            {row.finish_count}
                          </span>
                          <span className="text-[11px] text-zinc-500 ml-1">場</span>
                        </td>

                        <td className="py-3.5 px-4 hidden sm:table-cell text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-black ${award.style}`}>
                            {award.label}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 hidden lg:table-cell text-center font-mono text-xs text-zinc-400">
                          {row.latest_race_date || "—"}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenAthleteDetail(row)}
                              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold transition cursor-pointer"
                            >
                              查閱明細
                            </button>
                            {!row.is_verified_member && (
                              <Link
                                href={claimUrl}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition"
                              >
                                認領
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-zinc-900/70 border-t border-zinc-800 px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-zinc-400 font-bold">
              第 <span className="text-white font-mono">{page}</span> / <span className="text-white font-mono">{totalPages}</span> 頁（{getTierLabel(activeTier, sport)}共 <span className="text-amber-400 font-mono">{totalCount.toLocaleString()}</span> 人）
            </div>
            <div className="flex items-center gap-2">
              <button type="button" disabled={page <= 1 || loading} onClick={() => setPage(1)} className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 disabled:opacity-40 hover:bg-zinc-800 font-bold cursor-pointer">
                « 首頁
              </button>
              <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white disabled:opacity-40 hover:bg-zinc-800 font-bold cursor-pointer">
                ← 上一頁
              </button>
              <button type="button" disabled={page >= totalPages || loading} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-black disabled:opacity-40 hover:bg-amber-400 font-black cursor-pointer">
                下一頁 →
              </button>
              <button type="button" disabled={page >= totalPages || loading} onClick={() => setPage(totalPages)} className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 disabled:opacity-40 hover:bg-zinc-800 font-bold cursor-pointer">
                末頁 »
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* 單一選手歷年明細 Modal（含同日多筆標註提示） */}
      {selectedAthlete && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center px-4 z-50">
          <div className="bg-zinc-950 border border-amber-500/50 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    {selectedAthlete.athlete_name} — 歷年官方收錄明細
                  </h2>
                  {selectedAthlete.is_verified_member ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-black text-[11px] font-black">✓ 已實名認證</span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-amber-500/40 text-amber-300 text-[11px] font-bold">📋 官方收錄・待認領</span>
                  )}
                </div>
                <p className="text-xs text-zinc-400">
                  英雄榜有效採計場次（同一日期僅計 1 筆）：<span className="text-amber-400 font-mono font-black">{selectedAthlete.finish_count}</span> 場
                  {selectedAthlete.has_homonym_warning && " · ⚠️ 含同名不同人紀錄，建議本人登入勾選認領分流"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAthlete(null)}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs cursor-pointer"
              >
                ✕ 關閉
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-2.5 flex-1">
              {detailLoading ? (
                <div className="py-12 text-center text-zinc-400 text-sm font-bold">讀取歷年完賽紀錄中...</div>
              ) : detailRecords.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-sm">尚無詳細明細</div>
              ) : (
                detailRecords.map((rec, i) => {
                  const normD = String(rec.race_date || "").trim().split("/").join("-").slice(0, 10);
                  const isSameDayDup = (detailDateCounts.get(normD) || 0) > 1;
                  return (
                    <div
                      key={rec.id || i}
                      className={
                        "p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs " +
                        (isSameDayDup
                          ? "bg-orange-950/30 border-orange-500/50"
                          : "bg-zinc-900/70 border-zinc-800")
                      }
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-black text-amber-400">{normD}</span>
                          <span className="font-black text-white text-sm">{rec.race_name}</span>
                          {isSameDayDup && (
                            <span className="px-2 py-0.5 rounded bg-orange-500/20 border border-orange-500/50 text-orange-300 text-[10px] font-black">
                              ⚠️ 同日多筆（英雄榜僅計1場）
                            </span>
                          )}
                          {rec.__source && (
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">{rec.__source}</span>
                          )}
                        </div>
                        <div className="text-zinc-400 flex flex-wrap gap-x-3 gap-y-1">
                          <span>組別：{rec.category || rec.participating_categories || "—"}</span>
                          {rec.age_group && <span>分齡：{rec.age_group}</span>}
                          {rec.birth_year_min && rec.birth_year_max && (
                            <span>推算出生年：{rec.birth_year_min}–{rec.birth_year_max}</span>
                          )}
                          <span>團隊：{rec.team || "個人"}</span>
                          {rec.bib_number && <span>編號：{rec.bib_number}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-3 py-1 rounded-lg bg-zinc-950 border border-zinc-800 font-mono font-black text-emerald-400">
                          {rec.finish_time || "完賽"}
                        </span>
                        {(rec.claimed_user_id || rec.login_email) ? (
                          <span className="px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 text-[10px] font-bold">已認領</span>
                        ) : (
                          <span className="px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-[10px] font-bold">待認領</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-900/50 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-zinc-400">
                若上述明細包含您的賽事，請點擊右側按鈕進入安全單筆勾選認領（同名不誤領）。
              </span>
              <Link
                href={`/profile/claim?type=${sport}&name=${encodeURIComponent(selectedAthlete.athlete_name)}`}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow transition"
              >
                ⚡ 我是 {selectedAthlete.athlete_name}，前往勾選認領 →
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
