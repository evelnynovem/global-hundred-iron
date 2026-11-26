"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/client";
import { isUltraTriathlon90K } from "@/utils/cloudAssetSync";

interface ClaimRecord {
  id: string | number;
  athlete_name: string;
  race_date: string;
  race_name: string;
  category?: string;
  participating_categories?: string;
  finish_time?: string;
  team?: string;
  gender?: string;
  age_group?: string;
  birth_year_min?: number | null;
  birth_year_max?: number | null;
  bib_number?: string | null;
  claimed_user_id?: string | null;
  login_email?: string | null;
  claim_status?: string | null;
}

function sanitizeKeyword(val: string): string {
  return String(val || "")
    .trim()
    .replace(/[%_,()'"\\;]/g, "")
    .slice(0, 40);
}

export default function ClaimHistoryPage() {
  const supabase = createClient();

  const [sport, setSport] = useState<"triathlon" | "cycling">("triathlon");
  const [searchName, setSearchName] = useState("");
  const [birthYearFilter, setBirthYearFilter] = useState("");
  const [onlyUnclaimed, setOnlyUnclaimed] = useState(false);
  const [records, setRecords] = useState<ClaimRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [searchedOnce, setSearchedOnce] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const searchRecords = useCallback(
    async (targetName: string, targetSport: "triathlon" | "cycling") => {
      const clean = sanitizeKeyword(targetName);
      if (clean.length < 2) {
        setStatusBanner({ type: "info", text: "請輸入至少 2 個字元的選手姓名進行查詢。" });
        return;
      }

      setLoading(true);
      setStatusBanner(null);
      setSearchedOnce(true);
      setSelectedIds(new Set());

      try {
        const table = targetSport === "triathlon" ? "race_details_full" : "cycling_details_full";
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .eq("athlete_name", clean)
          .order("race_date", { ascending: false })
          .limit(200);

        if (error) throw new Error(error.message);

        if (!data || data.length === 0) {
          const { data: fuzzyData, error: fuzzyErr } = await supabase
            .from(table)
            .select("*")
            .ilike("athlete_name", `%${clean}%`)
            .order("race_date", { ascending: false })
            .limit(100);
          if (fuzzyErr) throw new Error(fuzzyErr.message);
          setRecords((fuzzyData as ClaimRecord[]) || []);
        } else {
          setRecords((data as ClaimRecord[]) || []);
        }
      } catch (err: any) {
        setRecords([]);
        setStatusBanner({ type: "error", text: "查詢失敗，請稍後再試或檢查網路連線。" });
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  useEffect(() => {
    let active = true;
    const init = async () => {
      let urlSport: "triathlon" | "cycling" = "triathlon";
      let urlName = "";

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const t = params.get("type") || params.get("sport");
        if (t === "cycling") urlSport = "cycling";
        urlName = params.get("name") || "";
        if (params.get("onlyUnclaimed") === "1") {
          setOnlyUnclaimed(true);
        }
      }

      if (active) setSport(urlSport);

      const { data: { session } } = await supabase.auth.getSession();
      const loggedUser = session?.user || null;
      if (active) setUser(loggedUser);

      const initialName = urlName || loggedUser?.user_metadata?.full_name || "";
      if (active && initialName) {
        setSearchName(initialName);
        searchRecords(initialName, urlSport);
      }
    };
    init();
    return () => { active = false; };
  }, [supabase, searchRecords]);

  const isClaimedByMe = useCallback(
    (r: ClaimRecord) => {
      if (!user) return false;
      const myEmail = String(user.email || "").trim().toLowerCase();
      return (
        (r.claimed_user_id && r.claimed_user_id === user.id) ||
        (myEmail && String(r.login_email || "").trim().toLowerCase() === myEmail)
      );
    },
    [user]
  );

  const isClaimedByOther = useCallback(
    (r: ClaimRecord) => {
      const hasOwner = Boolean(r.claimed_user_id || (r.login_email && String(r.login_email).trim() !== ""));
      return hasOwner && !isClaimedByMe(r);
    },
    [isClaimedByMe]
  );

  // 1. 依出生年區間篩選 + 2. 強制排序：「未認領（可認領）排最上方」-> 「已認領」-> 「已由同名會員認領」
  const sortedRecords = useMemo(() => {
    const by = parseInt(birthYearFilter, 10);
    const hasByFilter = !isNaN(by) && by >= 1920 && by <= 2020;

    const base = hasByFilter
      ? records.filter((r) => {
          if (!r.birth_year_min || !r.birth_year_max) return true;
          return by >= r.birth_year_min - 1 && by <= r.birth_year_max + 1;
        })
      : [...records];

    const getPriority = (r: ClaimRecord) => {
      if (!isClaimedByMe(r) && !isClaimedByOther(r)) return 0; // 未認領：最上方！
      if (isClaimedByMe(r)) return 1;                          // 已認領：排在下方
      return 2;                                                // 同名他人已認領：排在最底
    };

    return base.sort((a, b) => {
      const pa = getPriority(a);
      const pb = getPriority(b);
      if (pa !== pb) return pa - pb;
      return String(b.race_date || "").localeCompare(String(a.race_date || ""));
    });
  }, [records, birthYearFilter, isClaimedByMe, isClaimedByOther]);

  const claimableRecords = useMemo(
    () => sortedRecords.filter((r) => !isClaimedByMe(r) && !isClaimedByOther(r)),
    [sortedRecords, isClaimedByMe, isClaimedByOther]
  );

  // 一鍵「僅顯示未認領賽事」檢視清單
  const visibleRecords = useMemo(
    () => (onlyUnclaimed ? claimableRecords : sortedRecords),
    [onlyUnclaimed, claimableRecords, sortedRecords]
  );

  const sameDayConflictDates = useMemo(() => {
    const dateCount = new Map<string, number>();
    sortedRecords.forEach((r) => {
      if (!selectedIds.has(String(r.id))) return;
      const d = String(r.race_date || "").trim().replace(/\//g, "-").slice(0, 10);
      dateCount.set(d, (dateCount.get(d) || 0) + 1);
    });
    return Array.from(dateCount.entries())
      .filter(([, cnt]) => cnt > 1)
      .map(([d]) => d);
  }, [sortedRecords, selectedIds]);

  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllClaimable = () => {
    if (selectedIds.size > 0) {
      setSelectedIds(new Set());
    } else {
      const seenDates = new Set<string>();
      const safeSet = new Set<string>();
      claimableRecords.forEach((r) => {
        const d = String(r.race_date || "").trim().replace(/\//g, "-").slice(0, 10);
        if (!seenDates.has(d)) {
          seenDates.add(d);
          safeSet.add(String(r.id));
        }
      });
      setSelectedIds(safeSet);
    }
  };

  // 前端雙重保障：將認領之 113K/226K/70.3 鐵人三項自動同步為百鐵馬已認領（避免未安裝 v4 Trigger 時仍需重複認領）
  const fallbackSyncUltraToCycling = async (claimedTriRows: ClaimRecord[], myUid: string, myEmail: string) => {
    let synced = 0;
    for (const r of claimedTriRows) {
      const cat = r.category || r.participating_categories || "";
      if (!isUltraTriathlon90K(r.race_name, cat)) continue;
      const normDate = String(r.race_date || "").trim().replace(/\//g, "-").slice(0, 10);
      try {
        const { data: existing } = await supabase
          .from("cycling_details_full")
          .select("id, claimed_user_id")
          .eq("athlete_name", r.athlete_name)
          .eq("race_date", normDate)
          .limit(5);

        if (existing && existing.length > 0) {
          const unclaimedIds = existing.filter((x: any) => !x.claimed_user_id).map((x: any) => x.id);
          if (unclaimedIds.length > 0) {
            await supabase
              .from("cycling_details_full")
              .update({ claimed_user_id: myUid, login_email: myEmail, claim_status: "verified_claimed" })
              .in("id", unclaimedIds);
          }
          synced++;
        } else {
          await supabase.from("cycling_details_full").insert([
            {
              athlete_name: r.athlete_name,
              race_name: r.race_name.includes("超鐵單車90K+同步認證")
                ? r.race_name
                : `${r.race_name} (超鐵單車90K+同步認證)`,
              race_date: normDate,
              category: String(cat + r.race_name).includes("226") ? "180K 超鐵單車同步認證" : "90K+ 超鐵單車同步認證",
              finish_time: r.finish_time || "完賽",
              team: r.team || "個人",
              login_email: myEmail,
              claimed_user_id: myUid,
              claim_status: "verified_claimed",
            },
          ]);
          synced++;
        }
      } catch (e) {}
    }
    return synced;
  };

  const handleClaimSelected = async () => {
    if (!user) {
      setStatusBanner({ type: "error", text: "請先登入會員帳號後，再執行賽事認領！" });
      return;
    }
    const idsToClaim = Array.from(selectedIds);
    if (idsToClaim.length === 0) {
      setStatusBanner({ type: "info", text: "請至少勾選 1 筆屬於您的完賽紀錄。" });
      return;
    }

    if (sameDayConflictDates.length > 0) {
      const ok = confirm(
        `⚠️ 同日防呆提醒：您勾選的紀錄中，於【${sameDayConflictDates.join("、")}】同一天有超過 1 筆賽事（可能是同名不同人的紀錄）。\n\n系統在英雄榜計算時，同一天嚴格只會採計 1 場。確定這些全都是您本人的紀錄並繼續認領嗎？`
      );
      if (!ok) return;
    }

    setClaiming(true);
    setStatusBanner(null);

    try {
      const myEmail = String(user.email || "").trim().toLowerCase();
      const chosenRows = sortedRecords.filter((r) => selectedIds.has(String(r.id)));

      const { data: rpcData, error: rpcErr } = await supabase.rpc("claim_athlete_records", {
        p_sport: sport,
        p_record_ids: idsToClaim,
      });

      if (!rpcErr && rpcData) {
        const updatedCnt = Number((rpcData as any).updated_count || 0);
        const syncedCyc = Number((rpcData as any).synced_cycling_count || 0);
        const syncNote =
          sport === "triathlon" && syncedCyc > 0
            ? `（其中 ${syncedCyc} 筆 113K／226K 超鐵已自動同步完成百鐵馬 90K+ 認證，無須重複認領！）`
            : "";
        setStatusBanner({
          type: "success",
          text: `✅ 認領成功！已將 ${updatedCnt} 筆【${sport === "triathlon" ? "鐵人三項" : "鐵馬（自行車）"}】官方賽事安全綁定至您的會員帳號${syncNote}`,
        });
        await searchRecords(searchName, sport);
        return;
      }

      // 降級容錯（若 v4 SQL 尚未執行）
      const table = sport === "triathlon" ? "race_details_full" : "cycling_details_full";
      const { error: updErr } = await supabase
        .from(table)
        .update({
          claimed_user_id: user.id,
          login_email: myEmail,
          claim_status: "verified_claimed",
        })
        .in("id", idsToClaim)
        .is("claimed_user_id", null);

      if (updErr) throw new Error(updErr.message);

      let syncedCyc = 0;
      if (sport === "triathlon") {
        syncedCyc = await fallbackSyncUltraToCycling(chosenRows, user.id, myEmail);
      }

      const syncNote =
        syncedCyc > 0 ? `（含 ${syncedCyc} 筆 113K／226K 已自動同步百鐵馬 90K+，免重複認領！）` : "";
      setStatusBanner({
        type: "success",
        text: `✅ 認領成功！已將 ${idsToClaim.length} 筆【${sport === "triathlon" ? "鐵人三項" : "鐵馬（自行車）"}】賽事綁定至您的會員帳號${syncNote}`,
      });
      await searchRecords(searchName, sport);
    } catch (err: any) {
      setStatusBanner({
        type: "error",
        text: "認領寫入未完成：請管理員於 Supabase SQL Editor 執行 supabase_sync_and_claim_v4.sql 啟用安全認領與 113K 自動同步函式。",
      });
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between overflow-x-hidden">
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-7">
        {/* 頂部橫幅 */}
        <section className="rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-amber-500/40 p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-block px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-[11px] font-black uppercase tracking-wider">
                ZERO-TRUST RECORD CLAIM・AUTO 113K/226K DUAL-TRACK SYNC
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                ⚡ 個人歷史官方賽事・安全勾選認領中心
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                未認領之賽事自動優先置頂顯示；認領 <strong className="text-emerald-400">113K／226K 超級鐵人三項</strong>時，系統將自動同步完成百鐵馬（90K+）認證，無須重複認領！
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link href="/rankings" className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold transition">
                ← 返回百鐵英雄榜
              </Link>
              <Link href="/profile" className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-300 text-xs font-bold transition">
                👤 前往會員中心
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={() => {
                setSport("triathlon");
                if (searchName.trim().length >= 2) searchRecords(searchName, "triathlon");
              }}
              className={
                "px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer " +
                (sport === "triathlon"
                  ? "bg-amber-500 text-black shadow-lg"
                  : "bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800")
              }
            >
              🏊‍♂️ 認領【鐵人三項】歷史賽事（113K/226K 自動同步百鐵馬）
            </button>
            <button
              type="button"
              onClick={() => {
                setSport("cycling");
                if (searchName.trim().length >= 2) searchRecords(searchName, "cycling");
              }}
              className={
                "px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer " +
                (sport === "cycling"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800")
              }
            >
              🚴 認領【鐵馬（自行車 90K+）】歷史賽事
            </button>
          </div>
        </section>

        {!user && (
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs sm:text-sm text-amber-200 font-bold">
              🔐 您目前為訪客狀態：您可以先免費查詢官方資料庫中的歷史成績，登入會員後即可一鍵綁定認領並點亮「✓ 已實名認證」徽章！
            </div>
            <Link href="/auth/login" className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shrink-0 text-center">
              前往登入 / 免費註冊 →
            </Link>
          </div>
        )}

        {/* 查詢表單 */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            searchRecords(searchName, sport);
          }}
          className="rounded-2xl bg-zinc-950 border border-zinc-800 p-5 grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
        >
          <div className="md:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 block">選手真實姓名（必填）</label>
            <input
              type="text"
              required
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="請輸入參賽姓名，例如：陳彥良"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 focus:border-amber-500 focus:outline-none px-4 py-2.5 text-sm text-white font-bold"
            />
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 block">西元出生年（選填・防同名過濾）</label>
            <input
              type="number"
              min={1925}
              max={2020}
              value={birthYearFilter}
              onChange={(e) => setBirthYearFilter(e.target.value)}
              placeholder="例如：1982"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 focus:border-amber-500 focus:outline-none px-4 py-2.5 text-sm text-white font-mono"
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={loading}
              className={
                "w-full py-2.5 px-4 rounded-xl font-black text-sm shadow-lg transition cursor-pointer disabled:opacity-50 " +
                (sport === "triathlon" ? "bg-amber-500 hover:bg-amber-400 text-black" : "bg-blue-500 hover:bg-blue-400 text-white")
              }
            >
              {loading ? "搜尋中..." : "🔍 查詢官方成績"}
            </button>
          </div>
        </form>

        {statusBanner && (
          <div
            className={
              "rounded-2xl p-4 text-xs sm:text-sm font-bold border " +
              (statusBanner.type === "success"
                ? "bg-emerald-950/60 border-emerald-600/50 text-emerald-200"
                : statusBanner.type === "error"
                ? "bg-red-950/60 border-red-600/50 text-red-200"
                : "bg-zinc-900 border-zinc-700 text-zinc-200")
            }
          >
            {statusBanner.text}
          </div>
        )}

        {sameDayConflictDates.length > 0 && (
          <div className="rounded-2xl bg-orange-950/50 border border-orange-500/50 p-4 text-xs text-orange-200 font-bold">
            ⚠️ 偵測到您在【{sameDayConflictDates.join("、")}】勾選了多筆同一日期的賽事。請核對分齡組別、車隊與完賽時間，取消勾選不屬於您本人的同名選手紀錄！
          </div>
        )}

        {/* 查詢結果與一鍵「只顯示未認領賽事」控制列 */}
        <section className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5 sm:p-6 space-y-4 shadow-2xl">
          <div className="flex flex-col gap-4 border-b border-zinc-800 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  📋 查詢結果（共 {sortedRecords.length} 筆｜未認領置頂 <span className="text-amber-400">{claimableRecords.length}</span> 筆）
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  未認領賽事已自動排在最上方；勾選後點擊確認即可安全綁定至您的會員履歷。
                </p>
              </div>

              {/* 一鍵只顯示未認領賽事切換按鈕 */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOnlyUnclaimed((v) => !v)}
                  className={
                    "px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer border " +
                    (onlyUnclaimed
                      ? "bg-emerald-500 text-black border-emerald-400 shadow-lg"
                      : "bg-zinc-900 hover:bg-zinc-800 text-amber-300 border-amber-500/50")
                  }
                >
                  {onlyUnclaimed
                    ? `🎯 目前僅顯示未認領 (${claimableRecords.length} 筆) · 點此顯示全部`
                    : `🎯 一鍵只顯示未認領賽事 (${claimableRecords.length} 筆)`}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                {claimableRecords.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllClaimable}
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold cursor-pointer"
                  >
                    {selectedIds.size > 0 ? "取消全選" : "智慧全選未認領（自動避開同日重覆）"}
                  </button>
                )}
              </div>
              <button
                type="button"
                disabled={!user || selectedIds.size === 0 || claiming}
                onClick={handleClaimSelected}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-black text-xs sm:text-sm shadow-lg transition cursor-pointer"
              >
                {claiming ? "認領寫入中..." : `✓ 確認送出勾選認領 (${selectedIds.size} 筆)`}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-zinc-400 text-sm font-bold">正在檢索官方成績庫...</div>
          ) : !searchedOnce ? (
            <div className="py-12 text-center text-zinc-500 text-sm">請輸入您的參賽姓名並點擊「查詢官方成績」。</div>
          ) : visibleRecords.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm space-y-2">
              {onlyUnclaimed && sortedRecords.length > 0 ? (
                <>
                  <p className="text-emerald-400 font-bold">🎉 太棒了！此姓名的官方收錄賽事已全數完成認領，目前沒有未認領項目。</p>
                  <button
                    type="button"
                    onClick={() => setOnlyUnclaimed(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-bold cursor-pointer"
                  >
                    顯示已認領紀錄 ({sortedRecords.length} 筆)
                  </button>
                </>
              ) : (
                <>
                  <p>查無符合「{searchName}」的【{sport === "triathlon" ? "鐵人三項" : "鐵馬（自行車）"}】官方紀錄。</p>
                  <p className="text-xs">
                    若您參加的是其他未匯入賽事，請直接前往{" "}
                    <Link href="/profile/new-record" className="text-amber-400 underline">手動完賽登錄</Link>。
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[650px] overflow-y-auto pr-1">
              {visibleRecords.map((rec) => {
                const idStr = String(rec.id);
                const mine = isClaimedByMe(rec);
                const others = isClaimedByOther(rec);
                const checked = selectedIds.has(idStr);
                const catText = rec.category || rec.participating_categories || "";
                const willAutoSyncCyc = sport === "triathlon" && isUltraTriathlon90K(rec.race_name, catText);

                return (
                  <label
                    key={idStr}
                    className={
                      "flex items-start gap-3.5 p-4 rounded-2xl border transition " +
                      (mine
                        ? "bg-emerald-950/20 border-emerald-800/40 opacity-80 cursor-default"
                        : others
                        ? "bg-zinc-900/40 border-zinc-800/70 opacity-55 cursor-not-allowed"
                        : checked
                        ? "bg-amber-500/15 border-amber-400 shadow-lg cursor-pointer"
                        : "bg-zinc-900/90 border-amber-500/35 hover:border-amber-400 cursor-pointer")
                    }
                  >
                    <input
                      type="checkbox"
                      disabled={mine || others}
                      checked={mine || checked}
                      onChange={() => toggleId(idStr)}
                      className="mt-1 h-4 w-4 accent-amber-500 rounded shrink-0"
                    />

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-black text-amber-400 text-xs sm:text-sm">
                            {String(rec.race_date || "").slice(0, 10)}
                          </span>
                          <span className="font-black text-white text-sm sm:text-base">{rec.race_name}</span>
                          {willAutoSyncCyc && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-black">
                              🚴 含90K+單車・同步認證百鐵馬
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono font-black text-emerald-400 text-xs">
                            {rec.finish_time || "完賽"}
                          </span>
                          {mine ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-black">
                              ✓ 已認領
                            </span>
                          ) : others ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[11px] font-bold">
                              🔒 已由同名會員認領
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[11px] font-black">
                              點擊勾選認領
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-zinc-400 flex flex-wrap gap-x-4 gap-y-1">
                        <span>姓名：<strong className="text-zinc-200">{rec.athlete_name}</strong></span>
                        <span>組別：{catText || "—"}</span>
                        {rec.age_group && <span>分齡組：<strong className="text-amber-300">{rec.age_group}</strong></span>}
                        {rec.birth_year_min && rec.birth_year_max && (
                          <span>推算出生年：{rec.birth_year_min}–{rec.birth_year_max}</span>
                        )}
                        <span>車隊/團體：{rec.team || "個人"}</span>
                        {rec.bib_number && <span>選手編號：{rec.bib_number}</span>}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}
