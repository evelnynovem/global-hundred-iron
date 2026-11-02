"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";

export interface SeriesEventItem {
  id: string;
  name: string;
  date: string;
  status: "open" | "upcoming"; // open: 已上架開放報名, upcoming: 年度預計聯賽(籌備預告中)
  sportType: "triathlon" | "cycling";
  organizer: string;
  location: string;
  distances: string;
  registrationUrl: string;
  posterUrl: string;
  verificationTool: "號碼布 (Bib)" | "安全帽號碼貼 或 號碼布";
}

const DEFAULT_SERIES_EVENTS: SeriesEventItem[] = [
  {
    id: "2026-puyuma",
    name: "臺東普悠瑪鐵人三項賽 (226K / 113K / 51.5K)",
    date: "2026-03-28 (2027年預計3月下旬)",
    status: "open",
    sportType: "triathlon",
    organizer: "臺東縣城鄉生活運動協會",
    location: "臺東森林公園活水湖",
    distances: "226km 超鐵 / 113km 半超鐵 / 51.5km 標準鐵人",
    registrationUrl: "https://www.taitung-assoc.org.tw",
    posterUrl: "/images/puyuma.jpg",
    verificationTool: "號碼布 (Bib)",
  },
  {
    id: "2026-pakelang",
    name: "台東巴歌浪鐵人三項暨越野三項賽",
    date: "2026-10-17 ~ 10-18",
    status: "open",
    sportType: "triathlon",
    organizer: "臺東縣城鄉生活運動協會 / 巴歌浪",
    location: "臺東長濱巴歌浪船屋",
    distances: "226km / 113km / 51.5km",
    registrationUrl: "https://www.eventpal.com.tw",
    posterUrl: "/images/pakelangTSTA.jpeg",
    verificationTool: "號碼布 (Bib)",
  },
  {
    id: "2026-kh-100k",
    name: "高雄百K自行車挑戰",
    date: "2026-11-29",
    status: "open",
    sportType: "cycling",
    organizer: "中華民國體適能健身運動發展協會",
    location: "高雄市世運主場館",
    distances: "100km 公路單車挑戰",
    registrationUrl: "https://www.eventpal.com.tw",
    posterUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80",
    verificationTool: "安全帽號碼貼 或 號碼布",
  },
  {
    id: "2026-love197",
    name: "戀戀197東海岸自行車公路賽",
    date: "2026-12-06 (2027年預計12月上旬)",
    status: "open",
    sportType: "cycling",
    organizer: "臺東縣城鄉生活運動協會",
    location: "臺東森林公園 / 197縣道縱谷",
    distances: "130km 競賽組 / 100km 挑戰組",
    registrationUrl: "https://www.eventpal.com.tw",
    posterUrl: "/images/love197.jpg",
    verificationTool: "安全帽號碼貼 或 號碼布",
  },
  {
    id: "2026-tainan",
    name: "輪躍台南單車嘉年華",
    date: "2026-12-06 (2027年預計12月)",
    status: "open",
    sportType: "cycling",
    organizer: "輪躍台南籌備委員會 / SYB昇陽",
    location: "臺南市安平戀愛廣場",
    distances: "100km 百K挑戰 / 府城逍遙遊",
    registrationUrl: "https://www.syb-cycling.com",
    posterUrl: "/images/tainan.png",
    verificationTool: "安全帽號碼貼 或 號碼布",
  },
  {
    id: "2027-meishan36",
    name: "2027 梅山36彎自行車挑戰賽",
    date: "2027-02-21 (預計春季開賽・年中開放報名)",
    status: "upcoming",
    sportType: "cycling",
    organizer: "中華民國體適能健身運動發展協會",
    location: "嘉義梅山太平雲梯",
    distances: "90km+ 經典爬坡百鐵馬認證",
    registrationUrl: "",
    posterUrl: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=900&q=80",
    verificationTool: "安全帽號碼貼 或 號碼布",
  },
  {
    id: "2027-lanyang",
    name: "2027 蘭陽百K單車挑戰",
    date: "2027-09-20 (預計秋季開賽・年中開放報名)",
    status: "upcoming",
    sportType: "cycling",
    organizer: "中華民國體適能健身運動發展協會",
    location: "宜蘭運動公園 / 蘭陽溪畔",
    distances: "100km 公路單車百鐵馬認證",
    registrationUrl: "",
    posterUrl: "https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?auto=format&fit=crop&w=900&q=80",
    verificationTool: "安全帽號碼貼 或 號碼布",
  },
  {
    id: "2027-shimen-roma",
    name: "2027 石門羅馬公路自行車挑戰",
    date: "2027-12-19 (預計冬季開賽・年中開放報名)",
    status: "upcoming",
    sportType: "cycling",
    organizer: "中華民國體適能健身運動發展協會",
    location: "桃園石門水庫 / 羅馬公路",
    distances: "100km 環湖與山道百鐵馬認證",
    registrationUrl: "",
    posterUrl: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=900&q=80",
    verificationTool: "安全帽號碼貼 或 號碼布",
  },
];

export default function SeriesEventsPage() {
  const [events, setEvents] = useState<SeriesEventItem[]>(DEFAULT_SERIES_EVENTS);
  const [filterTab, setFilterTab] = useState<"all" | "triathlon" | "cycling" | "upcoming">("all");
  const [isAdmin, setIsAdmin] = useState(false);

  // 管理員網頁直接新增/編輯 Modal 狀態
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<SeriesEventItem | null>(null);
  const [formName, setFormName] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formStatus, setFormStatus] = useState<"open" | "upcoming">("upcoming");
  const [formSport, setFormSport] = useState<"triathlon" | "cycling">("triathlon");
  const [formOrganizer, setFormOrganizer] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formDistances, setFormDistances] = useState("");
  const [formRegUrl, setFormRegUrl] = useState("");
  const [formPosterUrl, setFormPosterUrl] = useState("");
  const [formTool, setFormTool] = useState<"號碼布 (Bib)" | "安全帽號碼貼 或 號碼布">("號碼布 (Bib)");
  const [fetchingPoster, setFetchingPoster] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function initSeries() {
      const saved = localStorage.getItem("g100_custom_series_events_v2");
      if (saved) {
        try {
          setEvents(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const em = session.user.email.toLowerCase();
        const metaName = session.user.user_metadata?.full_name || "";
        if (em.includes("evelny") || em.includes("pianopub") || em.includes("novem") || metaName.includes("洪緯欣") || metaName.includes("陳彥良")) {
          setIsAdmin(true);
        }
      }
    }
    initSeries();
  }, [supabase]);

  // 🚀 當貼上報名網址時，自動抓取該網址的賽事主題海報 (og:image)！
  const handleAutoFetchPosterFromUrl = async (urlToFetch: string) => {
    const cleanUrl = urlToFetch.trim();
    if (!cleanUrl.startsWith("http")) return;
    setFetchingPoster(true);
    try {
      const res = await fetch(`/api/og-poster?url=${encodeURIComponent(cleanUrl)}`);
      const data = await res.json();
      if (data.posterUrl) {
        setFormPosterUrl(data.posterUrl);
        if (!formName && data.pageTitle) {
          setFormName(data.pageTitle);
        }
        setFormStatus("open");
      } else {
        // 備援：使用 Microlink 截圖與 메타 API
        const mlRes = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(cleanUrl)}&screenshot=true`);
        const mlData = await mlRes.json();
        const foundImg = mlData?.data?.image?.url || mlData?.data?.screenshot?.url;
        if (foundImg) {
          setFormPosterUrl(foundImg);
          setFormStatus("open");
        }
      }
    } catch (e) {
      console.warn("自動抓取海報預覽失敗，可使用預設圖或手動貼上圖片連結:", e);
    } finally {
      setFetchingPoster(false);
    }
  };

  const openAddNewModal = () => {
    setEditingItem(null);
    setFormName("");
    setFormDate("2027年預計場次 (待開放報名)");
    setFormStatus("upcoming");
    setFormSport("triathlon");
    setFormOrganizer("全球百鐵認證結盟主辦單位");
    setFormLocation("台灣");
    setFormDistances("51.5K / 113K / 226K");
    setFormRegUrl("");
    setFormPosterUrl("");
    setFormTool("號碼布 (Bib)");
    setShowEditModal(true);
  };

  const openEditExistModal = (item: SeriesEventItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDate(item.date);
    setFormStatus(item.status);
    setFormSport(item.sportType);
    setFormOrganizer(item.organizer);
    setFormLocation(item.location);
    setFormDistances(item.distances);
    setFormRegUrl(item.registrationUrl);
    setFormPosterUrl(item.posterUrl);
    setFormTool(item.verificationTool);
    setShowEditModal(true);
  };

  const handleSaveSeriesEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: SeriesEventItem = {
      id: editingItem ? editingItem.id : `series-${Date.now()}`,
      name: formName.trim(),
      date: formDate.trim(),
      status: formRegUrl.trim() ? "open" : formStatus,
      sportType: formSport,
      organizer: formOrganizer.trim(),
      location: formLocation.trim(),
      distances: formDistances.trim(),
      registrationUrl: formRegUrl.trim(),
      posterUrl:
        formPosterUrl.trim() ||
        (formSport === "cycling"
          ? "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=900&q=80"
          : "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=900&q=80"),
      verificationTool: formTool,
    };

    const updated = editingItem
      ? events.map((ev) => (ev.id === editingItem.id ? newItem : ev))
      : [newItem, ...events];

    setEvents(updated);
    localStorage.setItem("g100_custom_series_events_v2", JSON.stringify(updated));
    setShowEditModal(false);
    alert("✅ 系列賽事已更新！若已貼上報名網址，系統已自動開啟報名按鈕與海報展示。");
  };

  const handleDeleteSeriesEvent = (id: string, name: string) => {
    if (!confirm(`確定要從系列賽事移除「${name}」嗎？`)) return;
    const updated = events.filter((ev) => ev.id !== id);
    setEvents(updated);
    localStorage.setItem("g100_custom_series_events_v2", JSON.stringify(updated));
  };

  const filteredEvents = events.filter((ev) => {
    if (filterTab === "triathlon") return ev.sportType === "triathlon";
    if (filterTab === "cycling") return ev.sportType === "cycling";
    if (filterTab === "upcoming") return ev.status === "upcoming";
    return true;
  });

  return (
    <div translate="no" className="notranslate min-h-screen bg-[#070709] overflow-x-hidden text-white flex flex-col justify-between">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        
        {/* 頂部標題與管理員直接編輯控制台 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black">
                🚑 醫護鐵人 IRONMEDIC 創立統籌
              </span>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full uppercase">
                OFFICIAL SERIES CALENDAR (9~12 RACES)
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-3">
              全球百鐵認證 年度系列賽事一覽表
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              提前預告年度結盟之鐵人三項與百鐵馬系列賽事！已開放報名場次可直接點擊報名；登入會員預先勾選參賽場次，開賽當天還可免費兌換邁克仕（AminoMax）補給品！
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/profile#aminomax-preorder"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm transition shadow-lg"
            >
              🎁 前往會員中心預先勾選領取邁克仕 →
            </Link>
            {isAdmin && (
              <button
                type="button"
                onClick={openAddNewModal}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs sm:text-sm transition cursor-pointer shadow-lg"
              >
                ➕ 新增預計聯賽 / 貼上報名連結自動抓海報
              </button>
            )}
          </div>
        </div>

        {/* 篩選器 */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "all", label: `全部系列賽事 (${events.length})` },
            { key: "triathlon", label: "🏊‍♂️ 鐵人三項認證賽事" },
            { key: "cycling", label: "🚴‍♂️ 公路單車百鐵馬賽事" },
            { key: "upcoming", label: "📅 明年度預告籌備中場次" },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setFilterTab(t.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                filterTab === t.key
                  ? "bg-amber-500 text-black"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 賽事卡片網格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="rounded-3xl bg-zinc-950 border border-zinc-800/90 hover:border-amber-500/50 overflow-hidden flex flex-col justify-between shadow-2xl transition group"
            >
              <div>
                {/* 海報視覺區 */}
                <div className="relative h-48 w-full bg-zinc-900 overflow-hidden">
                  <img
                    src={ev.posterUrl}
                    alt={ev.name}
                    onError={(e) => {
                      e.currentTarget.src =
                        ev.sportType === "cycling"
                          ? "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=900&q=80"
                          : "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=900&q=80";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black ${
                      ev.sportType === "triathlon" ? "bg-amber-500 text-black" : "bg-red-600 text-white"
                    }`}>
                      {ev.sportType === "triathlon" ? "🏊‍♂️ 鐵人三項認證" : "🚴‍♂️ 百鐵馬單車認證"}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    {ev.registrationUrl ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-black text-[11px] font-black shadow">
                        🔥 已上架開放報名
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-zinc-900/90 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
                        📅 年度預計聯賽（預告中）
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-4 right-4">
                    <div className="text-xs font-mono text-amber-400 font-bold">{ev.date}</div>
                    <h3 className="text-lg font-black text-white leading-snug mt-0.5">{ev.name}</h3>
                  </div>
                </div>

                {/* 賽事資訊區 */}
                <div className="p-5 space-y-2.5 text-xs text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">主辦單位：</span>
                    <span className="font-bold text-white">{ev.organizer}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">舉辦地點：</span>
                    <span className="font-semibold text-zinc-200">{ev.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">認證距離：</span>
                    <span className="font-bold text-amber-400">{ev.distances}</span>
                  </div>
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-bold">🎁 支援邁克仕賽前30天預約兌換</span>
                    <span className="text-zinc-400">憑【{ev.verificationTool}】領取</span>
                  </div>
                </div>
              </div>

              {/* 底部按鈕與管理員直接編輯按鈕 */}
              <div className="p-5 pt-0 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {ev.registrationUrl ? (
                    <a
                      href={ev.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs text-center transition"
                    >
                      🔗 前往賽事報名 ↗
                    </a>
                  ) : (
                    <div className="py-2.5 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold text-xs text-center">
                      ⏳ 報名連結即將公開
                    </div>
                  )}
                  <Link
                    href="/profile#aminomax-preorder"
                    className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-amber-400 font-extrabold text-xs text-center transition"
                  >
                    ⚡ 勾選預訂邁克仕
                  </Link>
                </div>

                {isAdmin && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-900">
                    <button
                      type="button"
                      onClick={() => openEditExistModal(ev)}
                      className="px-3 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-black text-xs font-extrabold transition cursor-pointer"
                    >
                      ✏️ 網頁直接編輯 / 貼報名網址抓海報
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSeriesEvent(ev.id, ev.name)}
                      className="px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-600 text-red-400 hover:text-white text-xs font-bold transition cursor-pointer"
                    >
                      刪除
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 管理員網頁端直接編輯 / 貼上報名網址自動抓取海報 Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center px-4 z-50">
          <div className="bg-zinc-950 border border-amber-500/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">
                  {editingItem ? "✏️ 編輯系列賽事 / 貼上報名連結" : "➕ 新增年度預計系列賽事"}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  直接貼上活動咖、伊貝特或協會報名網址，系統將自動為您抓取該網頁的賽事主題海報！
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-zinc-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSeriesEvent} className="space-y-4">
              {/* 貼上報名連結自動抓取海報區 */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <label className="text-xs font-extrabold text-amber-400 block">
                  🔗 賽事報名網址（若明年年中才開放報名可先留空；一旦貼上網址即自動抓取海報！）
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formRegUrl}
                    onChange={(e) => {
                      setFormRegUrl(e.target.value);
                      if (e.target.value.startsWith("http")) {
                        handleAutoFetchPosterFromUrl(e.target.value);
                      }
                    }}
                    placeholder="貼上 https://... 報名網址，自動擷取賽事主題海報"
                    className="flex-1 rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleAutoFetchPosterFromUrl(formRegUrl)}
                    disabled={fetchingPoster || !formRegUrl}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 text-black font-extrabold text-xs cursor-pointer disabled:opacity-40 shrink-0"
                  >
                    {fetchingPoster ? "抓取中..." : "⚡ 自動抓海報"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">賽事名稱 *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="例如：2027 輪躍台南單車嘉年華"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2.5 text-sm text-white font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">預計日期或確定開賽日 *</label>
                  <input
                    type="text"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    placeholder="例如：2027-12-12 或 2027年預計10月"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2.5 text-sm text-amber-400 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">運動類別</label>
                  <select
                    value={formSport}
                    onChange={(e) => setFormSport(e.target.value as "triathlon" | "cycling")}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2.5 text-sm text-white font-bold"
                  >
                    <option value="triathlon">🏊‍♂️ 鐵人三項</option>
                    <option value="cycling">🚴‍♂️ 公路單車 (百鐵馬)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">邁克仕現場核銷憑證</label>
                  <select
                    value={formTool}
                    onChange={(e) => setFormTool(e.target.value as any)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2.5 text-sm text-emerald-400 font-bold"
                  >
                    <option value="號碼布 (Bib)">憑「號碼布 (Bib)」做記號領取</option>
                    <option value="安全帽號碼貼 或 號碼布">憑「安全帽號碼貼 或 號碼布」做記號領取</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">主辦單位名稱</label>
                  <input
                    type="text"
                    value={formOrganizer}
                    onChange={(e) => setFormOrganizer(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">舉辦地點 / 認證距離</label>
                  <input
                    type="text"
                    value={formDistances}
                    onChange={(e) => setFormDistances(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">海報圖片網址 (貼上報名網址後會自動填入，亦可手動微調)</label>
                <input
                  type="text"
                  value={formPosterUrl}
                  onChange={(e) => setFormPosterUrl(e.target.value)}
                  placeholder="/images/puyuma.jpg 或 https://..."
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2 text-xs text-zinc-300 font-mono"
                />
                {formPosterUrl && (
                  <img src={formPosterUrl} alt="Preview" className="h-28 w-full object-cover rounded-xl border border-zinc-700 mt-2" />
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 text-zinc-300 text-sm font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-black text-sm font-extrabold cursor-pointer"
                >
                  💾 儲存並發布至系列賽事頁面
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
