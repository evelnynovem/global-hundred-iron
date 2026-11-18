"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";
import * as XLSX from "xlsx";

export default function EventManagerPage() {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedSport, setSelectedSport] = useState<"triathlon" | "cycling">("triathlon");
  const [customRaceName, setCustomRaceName] = useState("");
  const [events, setEvents] = useState<{ race_name: string; count: number; sport: string }[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("sport") === "cycling") setSelectedSport("cycling");
      else if (params.get("sport") === "triathlon") setSelectedSport("triathlon");
    }
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const { data: triData } = await supabase.from("race_details_full").select("race_name").not("athlete_name", "like", "__SYS_%");
    const { data: cycData } = await supabase.from("cycling_details_full").select("race_name").not("athlete_name", "like", "__SYS_%");

    const eventMap = new Map<string, { race_name: string; count: number; sport: string }>();

    (triData || []).forEach((r: any) => {
      if (!r.race_name) return;
      const key = "TRI_" + r.race_name;
      if (!eventMap.has(key)) eventMap.set(key, { race_name: r.race_name, count: 0, sport: "鐵人三項" });
      eventMap.get(key)!.count++;
    });

    (cycData || []).forEach((r: any) => {
      if (!r.race_name) return;
      const key = "CYC_" + r.race_name;
      if (!eventMap.has(key)) eventMap.set(key, { race_name: r.race_name, count: 0, sport: "鐵馬（自行車）" });
      eventMap.get(key)!.count++;
    });

    setEvents(Array.from(eventMap.values()).sort((a, b) => b.count - a.count));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, sport: "triathlon" | "cycling") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const recordsToInsert = [];
      let successCount = 0;

      for (const row of rows) {
        let name = String(row["姓名（必填）"] || row["Name"] || row["姓名"] || row["LastName"] || row["欄4"] || "").trim();
        let raceDate = String(row["賽事日期（必填）"] || row["Race date"] || row["賽事日期"] || "2024-01-01").trim();
        let raceName = customRaceName.trim() || String(row["賽事名稱（必填）"] || row["Race name"] || row["賽事名稱"] || "").trim();
        let category = String(row["參賽組別（必填）"] || row["Participating categories"] || row["組別"] || row["賽程"] || (sport === "triathlon" ? "113K" : "100K")).trim();
        let finishTime = String(row["完賽時間（必填）"] || row["Finish time"] || row["完賽成績"] || row["Time"] || row["完成時間"] || row["總成績"] || "").trim();
        let team = String(row["所屬團隊（非必填）"] || row["Sport team"] || row["所屬團體"] || row["團體"] || "個人").trim();
        let email = String(row["電子信箱（必填）（請輸入登入全球百鐵認證官網電郵）"] || row["Login email"] || "").trim().toLowerCase();

        if (!name || name === "nan" || name === "Name" || name === "姓名" || name.includes("Unnamed")) continue;
        if (!raceName) raceName = file.name.replace(/\.[^/.]+$/, "");
        if (!team || team === "nan") team = "個人";

        recordsToInsert.push({
          athlete_name: name,
          race_name: raceName,
          race_date: raceDate.replace(/\//g, "-"),
          category: category,
          finish_time: finishTime,
          team: team,
          login_email: email,
        });
        successCount++;
      }

      if (recordsToInsert.length === 0) {
        alert("⚠️ 無法讀取有效資料，請確認 CSV/Excel 欄位是否包含選手姓名。");
        setUploading(false);
        return;
      }

      const table = sport === "triathlon" ? "race_details_full" : "cycling_details_full";
      const chunkSize = 500;
      for (let i = 0; i < recordsToInsert.length; i += chunkSize) {
        const chunk = recordsToInsert.slice(i, i + chunkSize);
        const { error } = await supabase.from(table).insert(chunk);
        if (error) throw new Error(error.message);
      }

      await loadEvents();
      alert(`✅ 成功匯入 ${successCount} 筆【${sport === "triathlon" ? "鐵人三項" : "鐵馬（自行車）"}】成績資料！`);
    } catch (err: any) {
      alert("❌ 匯入失敗：" + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRace = async (raceName: string, sport: string) => {
    if (!confirm(`⚠️ 確定要刪除整批【${raceName}】（${sport}）的所有完賽資料嗎？此操作無法還原！`)) return;
    setDeleting(true);
    try {
      const table = sport === "鐵人三項" ? "race_details_full" : "cycling_details_full";
      const { error } = await supabase.from(table).delete().eq("race_name", raceName);
      if (error) throw new Error(error.message);
      await loadEvents();
      alert(`✅ 已成功刪除【${raceName}】的所有完賽資料！`);
    } catch (err: any) {
      alert("❌ 刪除失敗：" + err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between overflow-x-hidden">
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <span className="px-3.5 py-1 rounded-full bg-red-950/40 border border-red-600/50 text-red-400 text-xs font-black uppercase">
              ADMIN EVENT MANAGEMENT
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white mt-3">
              🗄️ 全球百鐵認證 賽事完賽資料庫管理中心
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              可選擇區分「鐵人三項賽事」或「鐵馬（自行車）賽事」上傳 (.csv / .xlsx / .xls)，查看已上傳賽事名稱，並支援管理員整批刪除。
            </p>
          </div>
          <Link href="/profile" className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold shrink-0">
            ← 返回會員中心
          </Link>
        </div>

        <section className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base sm:text-lg font-black text-amber-400">1️⃣ 請選擇要匯入的賽事類別與指定賽事名稱（選填）</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedSport("triathlon")}
                className={"px-4 py-2 rounded-xl text-xs font-black transition " + (selectedSport === "triathlon" ? "bg-amber-500 text-black" : "bg-zinc-900 text-zinc-400 border border-zinc-800")}
              >
                🏊‍♂️ 鐵人三項賽事
              </button>
              <button
                type="button"
                onClick={() => setSelectedSport("cycling")}
                className={"px-4 py-2 rounded-xl text-xs font-black transition " + (selectedSport === "cycling" ? "bg-blue-500 text-white" : "bg-zinc-900 text-zinc-400 border border-zinc-800")}
              >
                🚴 鐵馬（自行車）賽事
              </button>
            </div>
          </div>

          <input
            type="text"
            value={customRaceName}
            onChange={(e) => setCustomRaceName(e.target.value)}
            placeholder="選填：若舊版成績單內無「賽事名稱」欄位，請在此輸入賽事名稱（否則將自動使用檔案名稱）"
            className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-xs sm:text-sm text-white"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            <div className={"p-5 rounded-2xl border-2 space-y-3 transition " + (selectedSport === "triathlon" ? "bg-zinc-900/90 border-amber-500" : "bg-zinc-950 border-zinc-800 opacity-75")}>
              <div className="flex items-center gap-2">
                <span className="text-xl">🏊‍♂️</span>
                <h3 className="text-base font-black text-amber-400">上傳【鐵人三項】完賽檔案</h3>
              </div>
              <p className="text-xs text-zinc-400">支援 .csv / .xlsx / .xls，匯入後將計入「百鐵英雄榜」並開放選手一鍵認領。</p>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                disabled={uploading}
                onChange={(e) => handleFileUpload(e, "triathlon")}
                className="w-full text-zinc-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-amber-500 file:text-black file:font-black file:text-xs cursor-pointer bg-zinc-950 border border-zinc-800 rounded-xl"
              />
            </div>

            <div className={"p-5 rounded-2xl border-2 space-y-3 transition " + (selectedSport === "cycling" ? "bg-zinc-900/90 border-blue-500" : "bg-zinc-950 border-zinc-800 opacity-75")}>
              <div className="flex items-center gap-2">
                <span className="text-xl">🚴</span>
                <h3 className="text-base font-black text-blue-400">上傳【鐵馬（自行車）】完賽檔案</h3>
              </div>
              <p className="text-xs text-zinc-400">支援 .csv / .xlsx / .xls，匯入後將計入「百鐵馬英雄榜」並開放選手一鍵認領。</p>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                disabled={uploading}
                onChange={(e) => handleFileUpload(e, "cycling")}
                className="w-full text-zinc-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-500 file:text-white file:font-black file:text-xs cursor-pointer bg-zinc-950 border border-zinc-800 rounded-xl"
              />
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <h2 className="text-lg font-black text-amber-400">📋 目前已上傳之賽事名稱列表（支援整批刪除）</h2>
            <span className="text-xs font-bold text-zinc-400">共 {events.length} 場賽事</span>
          </div>

          <div className="max-h-[600px] overflow-y-auto pr-2 space-y-3">
            {events.map((ev, i) => (
              <div key={i} className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-4 hover:border-amber-500/30 transition">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={"px-2.5 py-0.5 rounded text-[10px] font-black " + (ev.sport === "鐵人三項" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-blue-500/20 text-blue-300 border border-blue-500/40")}>
                      {ev.sport}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-black">收錄 {ev.count} 筆完賽成績</span>
                  </div>
                  <div className="text-sm font-black text-white">{ev.race_name}</div>
                </div>
                <button
                  onClick={() => handleDeleteRace(ev.race_name, ev.sport)}
                  disabled={deleting}
                  className="px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-800 border border-red-700 text-red-200 text-xs font-black transition shrink-0 cursor-pointer"
                >
                  🗑️ 整批刪除
                </button>
              </div>
            ))}
            {events.length === 0 && (
              <div className="text-center py-10 text-zinc-500 font-bold text-sm">
                目前尚無已上傳之賽事紀錄
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
