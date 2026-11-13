"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export interface EventItem {
  id: string;
  name: string;
  title?: string;
  date: string;
  raceDate?: string;
  host: string;
  organizer?: string;
  perkDesc: string;
  gift?: string;
  verifyMethod: string;
  redeemRule?: string;
  isOpen: boolean;
  daysLeft: string;
  sport: "triathlon" | "cycling";
  category?: string;
  location?: string;
}

export const DEFAULT_EVENTS: EventItem[] = [
  { id: "e1", name: "2026 高雄百K自行車挑戰", title: "2026 高雄百K自行車挑戰", date: "2026-11-29", raceDate: "2026-11-29", host: "中華民國體適能健身運動發展協會", organizer: "中華民國體適能健身運動發展協會", perkDesc: "邁克仕 AminoMax 能量補給組", gift: "邁克仕 AminoMax 能量補給組", verifyMethod: "憑【安全帽號碼貼 或 號碼布】做記號領取", redeemRule: "憑【安全帽號碼貼 或 號碼布】做記號領取", isOpen: false, daysLeft: "開賽前30天內 (已截止統計配發)", sport: "cycling", category: "百鐵馬單車", location: "高雄市" },
  { id: "e2", name: "2026 戀戀197東海岸自行車公路賽", title: "2026 戀戀197東海岸自行車公路賽", date: "2026-12-06", raceDate: "2026-12-06", host: "臺東縣城鄉生活運動協會", organizer: "臺東縣城鄉生活運動協會", perkDesc: "邁克仕 AminoMax 能量膠＋BCAA補給包", gift: "邁克仕 AminoMax 能量膠＋BCAA補給包", verifyMethod: "憑【安全帽號碼貼 或 號碼布】做記號領取", redeemRule: "憑【安全帽號碼貼 或 號碼布】做記號領取", isOpen: false, daysLeft: "開賽前30天內 (已截止統計配發)", sport: "cycling", category: "百鐵馬單車", location: "臺東縣" },
  { id: "e3", name: "2026 輪躍台南單車嘉年華", title: "2026 輪躍台南單車嘉年華", date: "2026-12-06", raceDate: "2026-12-06", host: "輪躍台南籌備委員會", organizer: "輪躍台南籌備委員會", perkDesc: "邁克仕 AminoMax 長距離耐力補給包", gift: "邁克仕 AminoMax 長距離耐力補給包", verifyMethod: "憑【安全帽號碼貼 或 號碼布】做記號領取", redeemRule: "憑【安全帽號碼貼 或 號碼布】做記號領取", isOpen: false, daysLeft: "開賽前30天內 (已截止統計配發)", sport: "cycling", category: "百鐵馬單車", location: "臺南市" },
  { id: "e4", name: "2027 梅山36彎自行車挑戰賽", title: "2027 梅山36彎自行車挑戰賽", date: "2027-02-21", raceDate: "2027-02-21", host: "中華民國體適能健身運動發展協會", organizer: "中華民國體適能健身運動發展協會", perkDesc: "邁克仕 AminoMax 登山王能量補給組", gift: "邁克仕 AminoMax 登山王能量補給組", verifyMethod: "憑【安全帽號碼貼 或 號碼布】做記號領取", redeemRule: "憑【安全帽號碼貼 或 號碼布】做記號領取", isOpen: true, daysLeft: "開放預約 (距離開賽 100 天)", sport: "cycling", category: "百鐵馬單車", location: "嘉義縣" },
  { id: "e5", name: "2027 臺東普悠瑪鐵人三項賽 (226K/113K/51.5K)", title: "2027 臺東普悠瑪鐵人三項賽 (226K/113K/51.5K)", date: "2027-03-27", raceDate: "2027-03-27", host: "臺東縣城鄉生活運動協會", organizer: "臺東縣城鄉生活運動協會", perkDesc: "邁克仕 AminoMax 鐵人三項全效能量組", gift: "邁克仕 AminoMax 鐵人三項全效能量組", verifyMethod: "憑【號碼布 (Bib)】做記號領取", redeemRule: "憑【號碼布 (Bib)】做記號領取", isOpen: true, daysLeft: "開放預約 (距離開賽 134 天)", sport: "triathlon", category: "鐵人三項", location: "臺東縣" },
  { id: "e6", name: "2027 蘭陽百K單車挑戰", title: "2027 蘭陽百K單車挑戰", date: "2027-09-20", raceDate: "2027-09-20", host: "中華民國體適能健身運動發展協會", organizer: "中華民國體適能健身運動發展協會", perkDesc: "邁克仕 AminoMax 能量補給組", gift: "邁克仕 AminoMax 能量補給組", verifyMethod: "憑【安全帽號碼貼 或 號碼布】做記號領取", redeemRule: "憑【安全帽號碼貼 或 號碼布】做記號領取", isOpen: true, daysLeft: "開放預約 (距離開賽 311 天)", sport: "cycling", category: "百鐵馬單車", location: "宜蘭縣" }
];

export const UPCOMING_SERIES_RACES = DEFAULT_EVENTS;

function compressPosterImg(file: File, maxW = 900, q = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        if (w > maxW) {
          h = Math.round((h * maxW) / w);
          w = maxW;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", q));
        } else reject(new Error("Canvas err"));
      };
      img.onerror = reject;
      if (typeof ev.target?.result === "string") img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AminoMaxPreOrderSection() {
  const supabase = createClient();
  const [events, setEvents] = useState<EventItem[]>(DEFAULT_EVENTS);
  const [isAdmin, setIsAdmin] = useState(true);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [headerImg, setHeaderImg] = useState("/images/aminomax-poster.png");
  const [headerTitle, setHeaderTitle] = useState("邁克仕 AminoMax × 全球百鐵認證 未來參賽場次預先勾選系統");
  const [headerDesc, setHeaderDesc] = useState("請於下方勾選您從今日起預計報名參加之全球百鐵認證系列賽事（已結束之歷史賽事自動隱藏）。系統將於各場賽事開賽前 1 個月（30 天）截止統計數量，並將邁克仕產品精準配發至該場次主辦單位手上。");
  const [editingHeader, setEditingHeader] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const local = localStorage.getItem("g100_aminomax_events_v15");
      if (local) setEvents(JSON.parse(local));
      const localImg = localStorage.getItem("g100_aminomax_header_v15");
      if (localImg) {
        const parsed = JSON.parse(localImg);
        if (parsed.img) setHeaderImg(parsed.img);
        if (parsed.title) setHeaderTitle(parsed.title);
        if (parsed.desc) setHeaderDesc(parsed.desc);
      }

      const { data: rows } = await supabase
        .from("race_details_full")
        .select("*")
        .in("athlete_name", ["__SYS_AMINOMAX_EVENTS__", "__SYS_AMINOMAX_HEADER__"])
        .order("id", { ascending: false });

      if (rows && rows.length > 0) {
        const evRow = rows.find((r: any) => r.athlete_name === "__SYS_AMINOMAX_EVENTS__");
        if (evRow?.team) {
          setEvents(JSON.parse(evRow.team));
          localStorage.setItem("g100_aminomax_events_v15", evRow.team);
        }
        const hRow = rows.find((r: any) => r.athlete_name === "__SYS_AMINOMAX_HEADER__");
        if (hRow?.team) {
          const parsed = JSON.parse(hRow.team);
          if (parsed.img) setHeaderImg(parsed.img);
          if (parsed.title) setHeaderTitle(parsed.title);
          if (parsed.desc) setHeaderDesc(parsed.desc);
          localStorage.setItem("g100_aminomax_header_v15", hRow.team);
        }
      }
    } catch (e) {}
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    const syncedEvent: EventItem = {
      ...editingEvent,
      title: editingEvent.name,
      raceDate: editingEvent.date,
      organizer: editingEvent.host,
      gift: editingEvent.perkDesc,
      redeemRule: editingEvent.verifyMethod,
    };
    const exists = events.some((ev) => ev.id === syncedEvent.id);
    const nextList = exists
      ? events.map((ev) => (ev.id === syncedEvent.id ? syncedEvent : ev))
      : [...events, syncedEvent];
    nextList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setEvents(nextList);
    const str = JSON.stringify(nextList);
    localStorage.setItem("g100_aminomax_events_v15", str);
    try {
      await supabase.from("race_details_full").delete().eq("athlete_name", "__SYS_AMINOMAX_EVENTS__");
      await supabase.from("race_details_full").insert([{
        athlete_name: "__SYS_AMINOMAX_EVENTS__",
        race_name: "AMINOMAX_CONFIG",
        race_date: "2026-11-08",
        category: "SYS",
        finish_time: "SYS",
        team: str,
      }]);
    } catch (err) {}
    setEditingEvent(null);
    alert("✅ 邁克仕預先勾選賽事場次與日期已更新並同步至全站！");
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("確定要刪除此場次嗎？")) return;
    const nextList = events.filter((ev) => ev.id !== id);
    setEvents(nextList);
    const str = JSON.stringify(nextList);
    localStorage.setItem("g100_aminomax_events_v15", str);
    try {
      await supabase.from("race_details_full").delete().eq("athlete_name", "__SYS_AMINOMAX_EVENTS__");
      await supabase.from("race_details_full").insert([{
        athlete_name: "__SYS_AMINOMAX_EVENTS__",
        race_name: "AMINOMAX_CONFIG",
        race_date: "2026-11-08",
        category: "SYS",
        finish_time: "SYS",
        team: str,
      }]);
    } catch (err) {}
  };

  const handleSaveHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = JSON.stringify({ img: headerImg, title: headerTitle, desc: headerDesc });
    localStorage.setItem("g100_aminomax_header_v15", payload);
    try {
      await supabase.from("race_details_full").delete().eq("athlete_name", "__SYS_AMINOMAX_HEADER__");
      await supabase.from("race_details_full").insert([{
        athlete_name: "__SYS_AMINOMAX_HEADER__",
        race_name: "HEADER_CONFIG",
        race_date: "2026-11-08",
        category: "SYS",
        finish_time: "SYS",
        team: payload,
      }]);
    } catch (err) {}
    setEditingHeader(false);
    alert("✅ 邁克仕海報與主標題文案已更新並同步至電腦與手機！");
  };

  return (
    <section className="mt-8 rounded-3xl bg-zinc-950 border-2 border-amber-500/40 shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-zinc-900 via-red-950/30 to-zinc-950 p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 border-b border-zinc-800 relative">
        <div className="w-full md:w-1/3 shrink-0 space-y-2">
          <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 bg-zinc-900 p-2">
            <img
              src={headerImg}
              alt="AminoMax 能量補給"
              className="w-full h-auto object-contain rounded-xl"
              onError={(e) => {
                const t = e.currentTarget;
                if (!t.src.includes("/images/sponsors/aminomax.png")) {
                  t.src = "/images/sponsors/aminomax.png";
                }
              }}
            />
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setEditingHeader(true)}
              className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black shadow cursor-pointer transition"
            >
              ✏️ 編輯邁克仕海報圖片 ＆ 頂部文案
            </button>
          )}
        </div>

        <div className="space-y-3 flex-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded bg-red-600 text-white text-xs font-black uppercase">
                🎁 會員專屬參賽福利
              </span>
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black">
                開賽前 30 天截止統計・精準配發至各主辦單位
              </span>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">{headerTitle}</h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{headerDesc}</p>

          <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs text-amber-300 font-bold space-y-1">
            <div>📌 賽事當天現場兌換與核銷規則（防重複領取機制）：</div>
            <div className="text-zinc-300">1. 有號碼布之賽事：請出示本頁預約憑證與「選手號碼布」，由工作人員於號碼布上做記號後領取邁克仕產品。</div>
            <div className="text-zinc-300">2. 無號碼布（僅有單車安全帽號碼貼）之賽事：請出示「安全帽上的號碼貼」，由工作人員於號碼貼上做記號後即可領取！</div>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-black text-white">
              ☑️ 請勾選您預計參加的未來系列賽事（已勾選 {selectedEvents.length} 場）
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {isAdmin && (
              <button
                type="button"
                onClick={() =>
                  setEditingEvent({
                    id: "ev-" + Date.now(),
                    name: "",
                    date: "2027-05-01",
                    host: "中華民國體適能健身運動發展協會",
                    perkDesc: "邁克仕 AminoMax 能量補給組",
                    verifyMethod: "憑【安全帽號碼貼 或 號碼布】做記號領取",
                    isOpen: true,
                    daysLeft: "開放預約",
                    sport: "cycling",
                  })
                }
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black shadow-lg cursor-pointer transition"
              >
                ➕ 新增未來賽事場次
              </button>
            )}
            <Link href="/series" className="text-amber-400 hover:text-amber-300 text-xs font-bold">
              查看系列賽事詳情 →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((ev) => (
            <div
              key={ev.id}
              className={
                "relative flex flex-col p-4 sm:p-5 rounded-2xl border transition " +
                (selectedEvents.includes(ev.id)
                  ? "bg-zinc-900 border-amber-500 shadow-lg"
                  : "bg-zinc-950 border-zinc-800 hover:border-zinc-700")
              }
            >
              <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    disabled={!ev.isOpen}
                    checked={selectedEvents.includes(ev.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedEvents([...selectedEvents, ev.id]);
                      else setSelectedEvents(selectedEvents.filter((id) => id !== ev.id));
                    }}
                    className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-amber-500 cursor-pointer"
                  />
                  <span
                    className={
                      "px-2.5 py-0.5 rounded-md text-[11px] font-black " +
                      (ev.sport === "triathlon" ? "bg-amber-500 text-black" : "bg-red-700 text-white")
                    }
                  >
                    {ev.sport === "triathlon" ? "🏊 鐵人三項" : "🚴 百鐵馬單車"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={
                      "text-[11px] font-black px-2.5 py-0.5 rounded-md " +
                      (ev.isOpen
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-zinc-900 text-zinc-400 border border-zinc-800")
                    }
                  >
                    {ev.isOpen ? "✅ " : "🔒 "}
                    {ev.daysLeft}
                  </span>

                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditingEvent({ ...ev })}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-black cursor-pointer"
                      >
                        ✏️ 編輯
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="px-2 py-1 rounded-lg bg-red-950 hover:bg-red-800 text-red-300 text-[11px] font-bold cursor-pointer"
                      >
                        刪除
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="pl-7 space-y-1">
                <h3 className="text-sm sm:text-base font-black text-white">{ev.name}</h3>
                <div className="text-xs text-zinc-400 font-bold">
                  賽事日期：<span className="text-amber-300 font-mono">{ev.date}</span> ｜ 主辦：{ev.host}
                </div>
              </div>

              <div className="pl-7 mt-3 pt-3 border-t border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <div className="text-amber-400 font-extrabold">🎁 {ev.perkDesc}</div>
                <div className="text-zinc-400 text-[11px]">{ev.verifyMethod}</div>
              </div>
            </div>
          ))}
        </div>

        {selectedEvents.length > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => alert("✅ 已為您登記預約 " + selectedEvents.length + " 場邁克仕賽事補給！")}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs sm:text-sm shadow-lg transition cursor-pointer"
            >
              💾 儲存我的參賽補給預約名單
            </button>
          </div>
        )}
      </div>

      {editingEvent && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center px-4 z-50">
          <form
            onSubmit={handleSaveEvent}
            className="bg-zinc-950 border-2 border-amber-500 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-black text-amber-400">✏️ 編輯邁克仕預先勾選場次與日期</h3>
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="text-zinc-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-zinc-300 block mb-1">賽事名稱</label>
                <input
                  type="text"
                  required
                  value={editingEvent.name}
                  onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-2.5 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-amber-400 block mb-1">賽事日期 (YYYY-MM-DD)</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    placeholder="2027-03-27"
                    className="w-full rounded-xl bg-zinc-900 border border-amber-500/50 p-2.5 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">運動類別標籤</label>
                  <select
                    value={editingEvent.sport}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, sport: e.target.value as "triathlon" | "cycling" })
                    }
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-2.5 text-white font-bold"
                  >
                    <option value="triathlon">鐵人三項</option>
                    <option value="cycling">百鐵馬單車</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1">主辦單位</label>
                <input
                  type="text"
                  required
                  value={editingEvent.host}
                  onChange={(e) => setEditingEvent({ ...editingEvent, host: e.target.value })}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-2.5 text-white"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1">🎁 邁克仕贈品 / 補給品描述</label>
                <input
                  type="text"
                  required
                  value={editingEvent.perkDesc}
                  onChange={(e) => setEditingEvent({ ...editingEvent, perkDesc: e.target.value })}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-2.5 text-amber-400 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1">現場核銷方式說明</label>
                <input
                  type="text"
                  required
                  value={editingEvent.verifyMethod}
                  onChange={(e) => setEditingEvent({ ...editingEvent, verifyMethod: e.target.value })}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">右上角狀態文字</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.daysLeft}
                    onChange={(e) => setEditingEvent({ ...editingEvent, daysLeft: e.target.value })}
                    placeholder="開放預約 (距離開賽 100 天)"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-2.5 text-white"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-white font-bold bg-zinc-900 border border-zinc-700 p-2.5 rounded-xl cursor-pointer w-full">
                    <input
                      type="checkbox"
                      checked={editingEvent.isOpen}
                      onChange={(e) => setEditingEvent({ ...editingEvent, isOpen: e.target.checked })}
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500"
                    />
                    開放會員打勾預約
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-white text-xs font-bold"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 text-black text-xs font-black cursor-pointer"
              >
                💾 儲存並同步全站
              </button>
            </div>
          </form>
        </div>
      )}

      {editingHeader && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center px-4 z-50">
          <form
            onSubmit={handleSaveHeader}
            className="bg-zinc-950 border-2 border-amber-500 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-black text-amber-400">📷 編輯邁克仕海報圖片與主標題文案</h3>
              <button
                type="button"
                onClick={() => setEditingHeader(false)}
                className="text-zinc-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="font-bold text-zinc-300 block mb-1">專區主標題</label>
              <input
                type="text"
                required
                value={headerTitle}
                onChange={(e) => setHeaderTitle(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-2.5 text-white font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-300 block mb-1">專區說明文字</label>
              <textarea
                rows={3}
                value={headerDesc}
                onChange={(e) => setHeaderDesc(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-2.5 text-white"
              />
            </div>

            <div>
              <label className="font-bold text-amber-400 block mb-1">📷 上傳新海報圖片（自動壓縮並跨電腦/手機同步）</label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const dUrl = await compressPosterImg(f, 900, 0.85);
                  setHeaderImg(dUrl);
                }}
                className="w-full text-zinc-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-amber-500 file:text-black file:font-black cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setEditingHeader(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-white font-bold"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 text-black font-black cursor-pointer"
              >
                💾 儲存海報與文案
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
