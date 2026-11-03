"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";
import * as XLSX from "xlsx";
import { UPCOMING_SERIES_RACES } from "@/components/AminoMaxPreOrderSection";

export default function AdminDashboardPage() {
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const supabase = createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureRaces = UPCOMING_SERIES_RACES.map((r) => {
    const daysLeft = Math.ceil((new Date(r.date + "T00:00:00").getTime() - today.getTime()) / 86400000);
    return { ...r, daysLeft, isCutoffLocked: daysLeft <= 30 };
  }).filter((r) => r.daysLeft >= 0);

  const loadData = useCallback(async () => {
    const map = new Map<string, any>();
    const raw = localStorage.getItem("g100_aminomax_all_bookings");
    if (raw) {
      try { JSON.parse(raw).forEach((b: any) => b.email && map.set(b.email, b)); } catch (e) {}
    }
    const { data } = await supabase.from("association_announcements").select("*").eq("tag", "AMINOMAX_BOOKING");
    (data || []).forEach((row: any) => {
      try { const p = JSON.parse(row.pdf_url || "{}"); if (p.email) map.set(p.email, p); } catch (e) {}
    });
    setAllBookings(Array.from(map.values()));
  }, [supabase]);

  useEffect(() => { loadData(); }, [loadData]);

  const rawRows: any[] = [];
  allBookings.forEach((b) => {
    (b.raceIds || []).forEach((rid: string) => {
      const rObj = UPCOMING_SERIES_RACES.find((x) => x.id === rid);
      rawRows.push({
        "選手姓名": b.athleteName || "認證選手",
        "所屬團隊": b.sportTeam || "個人",
        "會員Email": b.email || "-",
        "預計參加賽事名稱": rObj ? rObj.name : rid,
        "賽事日期": rObj ? rObj.date : "-",
        "主辦單位": rObj ? rObj.organizer : "-",
        "現場核銷方式": rObj ? rObj.verificationTool : "號碼布或安全帽貼",
        "兌換商品": rObj ? rObj.giftItem : "邁克仕補給組",
        "登記時間": b.updatedAt || "-",
      });
    });
  });

  const downloadExcel = () => {
    const summaryRows = futureRaces.map((r) => {
      const matched = allBookings.filter((b) => (b.raceIds || []).includes(r.id));
      return {
        "系列賽事名稱": r.name,
        "開賽日期": r.date,
        "接收物資主辦單位": r.organizer,
        "現場核銷工具": r.verificationTool,
        "統計狀態(前30天截止)": r.isCutoffLocked ? "已截止(可發貨)" : `開放中(剩${r.daysLeft}天)`,
        "預計發送統計數量(份)": matched.length,
        "預約選手名單": matched.map((m) => `${m.athleteName}(${m.sportTeam})`).join("、") || "尚無預約",
      };
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), "每場賽事預計發送統計數量");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rawRows.length ? rawRows : [{ "提示": "尚無選手勾選資料" }]), "選手勾選原始明細資料");
    XLSX.writeFile(wb, `邁克仕_每場預計發送統計與選手原始資料_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between overflow-x-hidden">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-black">SUPER ADMIN CONSOLE</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">👑 網站最高權限管理者總控中心</h1>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button onClick={downloadExcel} className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs sm:text-sm cursor-pointer shadow-lg">
              📥 下載 Excel 完整報表 (.xlsx 含發送統計數量+選手原始資料)
            </button>
            <Link href="/taitung-assoc" className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-bold">
              🗂️ 場次成績管理與整場刪除
            </Link>
          </div>
        </div>

        <section className="rounded-3xl bg-zinc-950 border border-amber-500/40 p-5 sm:p-6 space-y-4">
          <h2 className="text-base sm:text-lg font-black text-amber-400">1️⃣ 每場賽事預計發送統計數量表（開賽前30天截止統計）</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-zinc-800 text-zinc-400">
                <tr>
                  <th className="py-2.5 px-3">未來系列賽事</th>
                  <th className="py-2.5 px-3">日期</th>
                  <th className="py-2.5 px-3">主辦單位</th>
                  <th className="py-2.5 px-3">核銷憑證</th>
                  <th className="py-2.5 px-3">狀態</th>
                  <th className="py-2.5 px-3 text-right">預計發送統計數量</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {futureRaces.map((r) => {
                  const cnt = allBookings.filter((b) => (b.raceIds || []).includes(r.id)).length;
                  return (
                    <tr key={r.id}>
                      <td className="py-3 px-3 font-bold text-white">{r.name}</td>
                      <td className="py-3 px-3 font-mono text-zinc-300">{r.date}</td>
                      <td className="py-3 px-3 text-amber-400">{r.organizer}</td>
                      <td className="py-3 px-3 text-zinc-400">{r.verificationTool}</td>
                      <td className="py-3 px-3">{r.isCutoffLocked ? "🔒 已截止" : `✅ 開放中(${r.daysLeft}天)`}</td>
                      <td className="py-3 px-3 text-right font-mono font-black text-emerald-400">{cnt} 份</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5 sm:p-6 space-y-4">
          <h2 className="text-base sm:text-lg font-black text-emerald-400">2️⃣ 選手勾選未來系列賽事 原始資料明細表 (共 {rawRows.length} 筆)</h2>
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 text-zinc-400">
                <tr>
                  <th className="py-2 px-3">選手姓名</th>
                  <th className="py-2 px-3">團隊</th>
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3">勾選賽事</th>
                  <th className="py-2 px-3">賽事日期</th>
                  <th className="py-2 px-3">登記時間</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {rawRows.map((r, i) => (
                  <tr key={i}>
                    <td className="py-2.5 px-3 font-bold text-white">{r["選手姓名"]}</td>
                    <td className="py-2.5 px-3 text-amber-400">{r["所屬團隊"]}</td>
                    <td className="py-2.5 px-3 font-mono text-zinc-300">{r["會員Email"]}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">{r["預計參加賽事名稱"]}</td>
                    <td className="py-2.5 px-3 font-mono">{r["賽事日期"]}</td>
                    <td className="py-2.5 px-3 font-mono text-zinc-500">{r["登記時間"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
