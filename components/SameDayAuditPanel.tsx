"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

interface AuditRecord {
  id: string | number;
  sport: "triathlon" | "cycling";
  athlete_name: string;
  race_date: string;
  norm_date: string;
  race_name: string;
  category: string;
  finish_time: string;
  team: string;
  bib_number?: string;
}

interface ConflictGroup {
  key: string;
  sport: "triathlon" | "cycling";
  date: string;
  items: AuditRecord[];
}

function normDateStr(d: any): string {
  return String(d || "").trim().split("/").join("-").slice(0, 10);
}

export default function SameDayAuditPanel() {
  const supabase = createClient();
  const [conflicts, setConflicts] = useState<ConflictGroup[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string>("");

  const loadMemberDuplicates = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      const myEmail = String(user.email || "").trim().toLowerCase();
      const myUid = user.id;

      // 同時撈取「綁定此會員帳號（claimed_user_id 或 login_email）」之鐵人三項與鐵馬紀錄
      const buildOrFilter = () => {
        const parts: string[] = [];
        if (myUid) parts.push(`claimed_user_id.eq.${myUid}`);
        if (myEmail) parts.push(`login_email.ilike.${myEmail}`);
        return parts.join(",");
      };
      const orClause = buildOrFilter();
      if (!orClause) return;

      const [triRes, cycRes] = await Promise.all([
        supabase
          .from("race_details_full")
          .select("id, athlete_name, race_date, race_name, category, participating_categories, finish_time, team, bib_number")
          .or(orClause)
          .not("athlete_name", "like", "__SYS_%")
          .order("race_date", { ascending: false })
          .limit(400),
        supabase
          .from("cycling_details_full")
          .select("id, athlete_name, race_date, race_name, category, participating_categories, finish_time, team, bib_number")
          .or(orClause)
          .not("athlete_name", "like", "__SYS_%")
          .order("race_date", { ascending: false })
          .limit(400),
      ]);

      const groups = new Map<string, ConflictGroup>();

      const pushRows = (rows: any[], sport: "triathlon" | "cycling") => {
        (rows || []).forEach((r) => {
          const nd = normDateStr(r.race_date);
          if (!nd || nd.includes("#")) return;
          const key = `${sport}__${nd}`;
          if (!groups.has(key)) {
            groups.set(key, { key, sport, date: nd, items: [] });
          }
          groups.get(key)!.items.push({
            id: r.id,
            sport,
            athlete_name: r.athlete_name || "",
            race_date: r.race_date || "",
            norm_date: nd,
            race_name: r.race_name || "未命名賽事",
            category: r.category || r.participating_categories || "—",
            finish_time: r.finish_time || "完賽",
            team: r.team || "個人",
            bib_number: r.bib_number || "",
          });
        });
      };

      pushRows(triRes.data || [], "triathlon");
      pushRows(cycRes.data || [], "cycling");

      const dupGroups = Array.from(groups.values())
        .filter((g) => g.items.length >= 2)
        .sort((a, b) => b.date.localeCompare(a.date));

      setConflicts(dupGroups);
    } catch (e) {
      // 優雅降級：不影響會員中心原本的任何畫面
    }
  }, [supabase]);

  useEffect(() => {
    loadMemberDuplicates();
  }, [loadMemberDuplicates]);

  const handleUnclaimOrRemove = async (rec: AuditRecord) => {
    const ok = confirm(
      `確定要從您的完賽履歷中移除／取消認領此筆同日重複紀錄嗎？\n\n日期：${rec.norm_date}\n賽事：${rec.race_name}\n組別：${rec.category}\n成績：${rec.finish_time}`
    );
    if (!ok) return;

    const key = `${rec.sport}-${rec.id}`;
    setBusyId(key);
    setNotice("");

    try {
      const table = rec.sport === "triathlon" ? "race_details_full" : "cycling_details_full";
      // 優先嘗試解除與本會員的綁定（安全保留官方原始成績，或若為自行登錄則刪除）
      const { error: updErr } = await supabase
        .from(table)
        .update({ claimed_user_id: null, login_email: "", claim_status: "official_unclaimed" })
        .eq("id", rec.id);

      if (updErr) {
        const { error: delErr } = await supabase.from(table).delete().eq("id", rec.id);
        if (delErr) throw new Error(delErr.message);
      }

      setNotice(`✅ 已移除【${rec.norm_date} ${rec.race_name}】之同日重複項目，請重新整理頁面以更新下方完整列表。`);
      await loadMemberDuplicates();
    } catch (err: any) {
      setNotice("⚠️ 無法直接移除該筆紀錄（可能受資料庫保護限制），請聯繫管理員協助核銷。");
    } finally {
      setBusyId(null);
    }
  };

  // 若無同日多筆紀錄，完全不佔用版面空間，100% 保留原本會員中心設計
  if (conflicts.length === 0) return null;

  const totalDupItems = conflicts.reduce((acc, g) => acc + g.items.length, 0);

  return (
    <section className="mb-6 rounded-3xl bg-gradient-to-br from-orange-950/60 via-red-950/40 to-zinc-950 border-2 border-orange-500/70 p-5 sm:p-6 shadow-2xl space-y-5">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 border-b border-orange-500/30 pb-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-orange-500 text-black text-xs font-black">
              ⚠️ 同日多筆紀錄待查核（置頂並列）
            </span>
            <span className="text-xs font-mono font-bold text-orange-300">
              共偵測到 {conflicts.length} 個日期・{totalDupItems} 筆紀錄
            </span>
          </div>
          <h2 className="text-base sm:text-xl font-black text-white">
            同一天出現多項完賽紀錄 — 請選手自行查核核對
          </h2>
          <p className="text-xs sm:text-sm text-orange-100/85 leading-relaxed">
            系統偵測到您在以下相同日期名下共有多筆完賽紀錄。<strong className="text-amber-300">在百鐵／百鐵馬英雄榜統計中，同一日期系統嚴格僅採計 1 筆有效完賽</strong>。下方已將同日紀錄並列置頂供您核對，若屬重複登錄或同名選手誤領，可直接點選移除。
          </p>
        </div>
        <button
          type="button"
          onClick={loadMemberDuplicates}
          className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-orange-500/40 text-orange-200 text-xs font-bold shrink-0 cursor-pointer"
        >
          🔄 重新查核
        </button>
      </div>

      {notice && (
        <div className="rounded-xl bg-zinc-950/90 border border-emerald-500/50 px-4 py-2.5 text-xs font-bold text-emerald-300">
          {notice}
        </div>
      )}

      <div className="space-y-4">
        {conflicts.map((group) => (
          <div key={group.key} className="rounded-2xl bg-zinc-950/85 border border-orange-500/40 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-orange-500/20 border border-orange-400/50 text-orange-300 font-mono font-black text-xs sm:text-sm">
                  📅 {group.date}
                </span>
                <span className={"px-2.5 py-0.5 rounded-full text-[11px] font-black " + (group.sport === "triathlon" ? "bg-amber-500/20 text-amber-300" : "bg-blue-500/20 text-blue-300")}>
                  {group.sport === "triathlon" ? "🏊‍♂️ 鐵人三項" : "🚴 百鐵馬單車"}
                </span>
                <span className="text-xs font-bold text-zinc-300">
                  當日共 <strong className="text-orange-400">{group.items.length}</strong> 筆並列（英雄榜僅計 <strong className="text-emerald-400">1</strong> 場）
                </span>
              </div>
            </div>

            {/* 並列對照卡片（電腦雙欄並列、手機上下對照） */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {group.items.map((item, idx) => {
                const isBusy = busyId === `${item.sport}-${item.id}`;
                return (
                  <div
                    key={String(item.id)}
                    className="rounded-xl bg-zinc-900/90 border border-zinc-700/90 hover:border-orange-400/60 p-3.5 flex flex-col justify-between gap-3 transition"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-black text-orange-300">同日項目 #{idx + 1}</span>
                        <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 font-mono font-black text-emerald-400 text-xs">
                          {item.finish_time}
                        </span>
                      </div>
                      <div className="text-sm font-black text-white leading-snug">{item.race_name}</div>
                      <div className="text-xs text-zinc-400 flex flex-wrap gap-x-3 gap-y-1">
                        <span>組別：<strong className="text-zinc-200">{item.category}</strong></span>
                        <span>團隊：{item.team}</span>
                        {item.bib_number && <span>編號：{item.bib_number}</span>}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-zinc-500">請核對是否為重複或非本人紀錄</span>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleUnclaimOrRemove(item)}
                        className="px-3 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-800 border border-red-700/70 text-red-200 text-xs font-black transition cursor-pointer disabled:opacity-40"
                      >
                        {isBusy ? "處理中..." : "🗑️ 移除 / 取消認領"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
