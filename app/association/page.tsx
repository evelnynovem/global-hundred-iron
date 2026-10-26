"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: "default-1",
    is_pinned: true,
    tag: "秩序冊下載",
    date: "2026-03-15",
    title: "【重要置頂】2026 臺東普悠瑪鐵人三項 選手秩序冊與晶片領取須知（請選手務必詳閱）",
    pdf_url: "/series",
  },
  {
    id: "default-2",
    is_pinned: true,
    tag: "交通管制公告",
    date: "2026-03-10",
    title: "【交通管制公告】臺東森林公園活水湖周邊暨中華大橋 賽事期間階段性封路說明",
    pdf_url: "",
  },
  {
    id: "default-3",
    is_pinned: false,
    tag: "賽事公告",
    date: "2026-02-20",
    title: "戀戀197東海岸自行車公路賽 歷年完賽選手榮譽榜已全數匯入系統，歡迎查詢下載電子證書",
    pdf_url: "",
  },
];

export default function TaitungAssociationPage() {
  const [activeTab, setActiveTab] = useState<"all" | "puyuma" | "super" | "love197">("all");
  const [isStaffAdmin, setIsStaffAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [announcements, setAnnouncements] = useState<any[]>(DEFAULT_ANNOUNCEMENTS);

  // 工作人員新增公告表單狀態
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTag, setNewTag] = useState("賽事公告");
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newPinned, setNewPinned] = useState(true);
  const [newPdfUrl, setNewPdfUrl] = useState("");

  // 協會歷年成績查詢狀態
  const [searchKw, setSearchKw] = useState("");
  const [assocResults, setAssocResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function checkStaffAndLoad() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const email = (session.user.email || "").toLowerCase();
        const metaName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || "";
        setUserEmail(session.user.email || "");

        // 預設管理員與協會工作人員權限判定（包含洪緯欣醫師帳號與陳彥良創辦人帳號）
        if (
          email.includes("evelny") ||
          email.includes("novem") ||
          email.includes("ironmedic") ||
          email.includes("admin") ||
          metaName.includes("洪緯欣") ||
          metaName.includes("Wei-hsin") ||
          metaName.includes("陳彥良")
        ) {
          setIsStaffAdmin(true);
        } else {
          // 檢查 profiles 表是否有 admin / staff 角色
          const { data: prof } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();
          if (prof && (prof.role === "admin" || prof.role === "staff")) {
            setIsStaffAdmin(true);
          }
        }
      }

      // 載入資料庫中的協會公告
      const { data: dbAnn } = await supabase
        .from("association_announcements")
        .select("*")
        .order("date", { ascending: false });

      if (dbAnn && dbAnn.length > 0) {
        setAnnouncements([...dbAnn, ...DEFAULT_ANNOUNCEMENTS]);
      }
    }
    checkStaffAndLoad();
  }, [supabase]);

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem = {
      id: `custom-${Date.now()}`,
      is_pinned: newPinned,
      tag: newTag,
      date: newDate,
      title: newTitle.trim(),
      pdf_url: newPdfUrl.trim(),
    };

    try {
      await supabase.from("association_announcements").insert([
        {
          title: newItem.title,
          tag: newItem.tag,
          date: newItem.date,
          is_pinned: newItem.is_pinned,
          pdf_url: newItem.pdf_url,
        },
      ]);
    } catch (err) {
      console.warn("寫入 association_announcements 本地更新:", err);
    }

    setAnnouncements([newItem, ...announcements]);
    setNewTitle("");
    setNewPdfUrl("");
    setShowStaffModal(false);
    alert("✅ 協會公告已成功發布！");
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("確定要刪除這則協會公告嗎？")) return;
    try {
      if (!String(id).startsWith("default-")) {
        await supabase.from("association_announcements").delete().eq("id", id);
      }
    } catch (e) {
      console.warn(e);
    }
    setAnnouncements(announcements.filter((a) => a.id !== id));
  };

  const handleSearchAssocResults = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    try {
      let q = supabase
        .from("race_details_full")
        .select("*")
        .or("race_name.ilike.%普悠瑪%,race_name.ilike.%巴歌浪%,race_name.ilike.%台東%,race_name.ilike.%戀戀197%")
        .limit(50);

      if (searchKw.trim()) {
        q = supabase
          .from("race_details_full")
          .select("*")
          .ilike("athlete_name", `%${searchKw.trim()}%`)
          .limit(50);
      }
      const { data } = await q;
      setAssocResults(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060911] text-white flex flex-col justify-between">
      <div className="max-w-6xl w-full mx-auto px-6 py-10 space-y-10">
        
        {/* 頂部導覽列（維持原版設計） */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-black uppercase tracking-wider">
              OFFICIAL PORTAL
            </span>
            <span className="text-xs sm:text-sm font-bold text-amber-400">
              臺東城鄉生活運動協會 × 全球百鐵認證 官方指定數位賽事總站
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isStaffAdmin && (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-extrabold flex items-center gap-1.5">
                🛡️ 工作人員管理權限已啟用 ({userEmail || "洪緯欣"})
              </span>
            )}
            <Link
              href="/profile"
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold transition"
            >
              選手個人中心
            </Link>
          </div>
        </div>

        {/* 🛠️ 工作人員專屬管理控制面板（當登入洪緯欣/管理員帳號時自動顯示） */}
        {isStaffAdmin && (
          <section className="rounded-3xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 border border-amber-500/40 p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  STAFF & ADMIN CONTROL PANEL
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                  🛠️ 臺東城鄉生活運動協會 — 工作人員賽事與公告管理後台
                </h2>
                <p className="text-xs text-zinc-300 mt-0.5">
                  您目前使用預設管理員帳號（洪緯欣），可直接新增置頂公告、上傳秩序冊連結、管理成績匯入與維護協會賽事。
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm transition shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  ＋ 新增協會置頂公告 / 秩序冊
                </button>
                <Link
                  href="/admin"
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white font-bold text-xs sm:text-sm transition"
                >
                  ⚙️ 進入總站系統管理後台
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* 主視覺區塊（完全維持圖3設計） */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
              臺東城鄉生活運動協會
            </h1>
            <p className="text-lg sm:text-xl font-extrabold text-amber-400">
              深耕東台灣耐力運動・打造活水湖與東海岸經典傳奇
            </p>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              本專區為「臺東城鄉生活運動協會」與「全球百鐵認證」共同建置之官方數位服務中心。完整收錄本會主辦之「普悠瑪鐵人三項」、「臺東超級鐵人」及「戀戀197自行車公路賽」最新賽事公告、秩序冊下載與歷年完賽成績資料庫。所有完賽紀錄皆可直接勾稽匯入全球百鐵認證個人履歷。
            </p>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-zinc-900/80 border border-amber-500/20 p-5 text-center space-y-1">
              <div className="text-3xl font-black text-amber-400">3 大</div>
              <div className="text-xs text-zinc-400 font-bold">東台灣指標經典賽事</div>
            </div>
            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 text-center space-y-1">
              <div className="text-3xl font-black text-white">100%</div>
              <div className="text-xs text-zinc-400 font-bold">成績直通百鐵認證</div>
            </div>
            <div className="col-span-2 rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-emerald-400">● 數位無紙化服務已啟用</div>
                <div className="text-[11px] text-zinc-400">提供選手歷年成績秒查與電子證書下載</div>
              </div>
              <span className="px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-bold">
                官方認證
              </span>
            </div>
          </div>
        </div>

        {/* 四大賽事切換頁籤（完全維持圖3設計） */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/60 p-2 rounded-2xl border border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`p-4 rounded-xl text-left transition cursor-pointer ${
              activeTab === "all" ? "bg-amber-500 text-black font-black" : "hover:bg-zinc-800/60 text-white"
            }`}
          >
            <div className="text-sm font-extrabold">🏆 協會總覽與全部賽事</div>
            <div className={`text-[11px] mt-0.5 ${activeTab === "all" ? "text-black/80" : "text-zinc-400"}`}>
              All Association Events
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("puyuma")}
            className={`p-4 rounded-xl text-left transition cursor-pointer ${
              activeTab === "puyuma" ? "bg-amber-500 text-black font-black" : "hover:bg-zinc-800/60 text-white"
            }`}
          >
            <div className="text-sm font-extrabold">🏊‍♂️ 普悠瑪鐵人三項</div>
            <div className={`text-[11px] mt-0.5 ${activeTab === "puyuma" ? "text-black/80" : "text-zinc-400"}`}>
              226K / 113K / 51.5K
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("super")}
            className={`p-4 rounded-xl text-left transition cursor-pointer ${
              activeTab === "super" ? "bg-amber-500 text-black font-black" : "hover:bg-zinc-800/60 text-white"
            }`}
          >
            <div className="text-sm font-extrabold">🏃‍♂️ 臺東超級鐵人賽</div>
            <div className={`text-[11px] mt-0.5 ${activeTab === "super" ? "text-black/80" : "text-zinc-400"}`}>
              秋季活水湖經典賽
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("love197")}
            className={`p-4 rounded-xl text-left transition cursor-pointer ${
              activeTab === "love197" ? "bg-amber-500 text-black font-black" : "hover:bg-zinc-800/60 text-white"
            }`}
          >
            <div className="text-sm font-extrabold">🚴‍♂️ 戀戀197自行車賽</div>
            <div className={`text-[11px] mt-0.5 ${activeTab === "love197" ? "text-black/80" : "text-zinc-400"}`}>
              197縣道東海岸公路賽
            </div>
          </button>
        </div>

        {/* 協會官方置頂公告 & 秩序冊簡章下載 */}
        <section className="rounded-3xl bg-zinc-950/90 border border-zinc-800/90 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                協會官方置頂公告 & 秩序冊簡章下載
              </h2>
              <p className="text-xs text-zinc-400 mt-1">顯示協會所有最新賽事公告</p>
            </div>
            <div className="flex items-center gap-2">
              {isStaffAdmin && (
                <button
                  type="button"
                  onClick={() => setShowStaffModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold hover:bg-amber-500/30 transition cursor-pointer"
                >
                  ＋ 工作人員新增公告
                </button>
              )}
              <span className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-bold">
                賽事行政公告板
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="rounded-2xl bg-zinc-900/60 border border-zinc-800/90 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-700 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {ann.is_pinned && (
                      <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[11px] font-extrabold">
                        置頂重要公告
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-bold">
                      {ann.tag}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">{ann.date}</span>
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-white">
                    {ann.title}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {ann.pdf_url && (
                    <Link
                      href={ann.pdf_url}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition"
                    >
                      📄 下載簡章 / 秩序冊 (PDF)
                    </Link>
                  )}
                  {isStaffAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold transition cursor-pointer"
                    >
                      刪除
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 臺東城鄉協會 — 歷年賽事成績查詢暨電子證書系統 */}
        <section className="rounded-3xl bg-zinc-950/90 border border-zinc-800/90 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <div className="text-xs font-black text-amber-400 uppercase tracking-wider">
                OFFICIAL RESULTS & E-CERTIFICATE
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                臺東城鄉協會 — 歷年賽事成績查詢暨電子證書系統
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                支援查詢普悠瑪鐵人、臺東超鐵、戀戀197歷年完賽紀錄，查詢後可直接預覽聯名電子證書或一鍵匯入百鐵履歷。
              </p>
            </div>
            <Link
              href="/profile/claim"
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-amber-400 text-xs font-extrabold transition shrink-0"
            >
              前往百鐵會員一鍵認領 →
            </Link>
          </div>

          <form onSubmit={handleSearchAssocResults} className="flex gap-3">
            <input
              type="text"
              value={searchKw}
              onChange={(e) => setSearchKw(e.target.value)}
              placeholder="輸入選手姓名（例如：洪緯欣）檢索協會歷年完賽紀錄..."
              className="flex-1 rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm transition cursor-pointer"
            >
              {searching ? "查詢中..." : "查詢協會成績"}
            </button>
          </form>

          {assocResults.length > 0 && (
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-800 text-zinc-400 text-xs">
                  <tr>
                    <th className="py-2.5 px-3">選手姓名</th>
                    <th className="py-2.5 px-3">賽事名稱</th>
                    <th className="py-2.5 px-3">參賽日期</th>
                    <th className="py-2.5 px-3">組別</th>
                    <th className="py-2.5 px-3">完賽時間</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {assocResults.map((r, i) => (
                    <tr key={r.id || i} className="hover:bg-zinc-900/40">
                      <td className="py-3 px-3 font-bold text-amber-400">{r.athlete_name}</td>
                      <td className="py-3 px-3 font-bold text-white">{r.race_name}</td>
                      <td className="py-3 px-3 font-mono text-xs text-zinc-300">{r.race_date}</td>
                      <td className="py-3 px-3 text-xs text-zinc-300">{r.category || "-"}</td>
                      <td className="py-3 px-3 font-mono text-xs font-bold text-emerald-400">{r.finish_time || "完賽"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>

      {/* 工作人員新增公告 Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center px-4 z-50">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-black text-white">🛠️ 工作人員發布協會公告</h3>
              <button
                type="button"
                onClick={() => setShowStaffModal(false)}
                className="text-zinc-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddAnnouncement} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">公告標題 *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="例如：【重要公告】2026 巴歌浪鐵人三項選手秩序冊公告"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">公告分類標籤</label>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-white"
                  >
                    <option value="秩序冊下載">秩序冊下載</option>
                    <option value="交通管制公告">交通管制公告</option>
                    <option value="賽事公告">賽事公告</option>
                    <option value="成績公告">成績公告</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">發布日期</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-amber-400 font-bold"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">簡章 / 秩序冊連結 (選填)</label>
                <input
                  type="text"
                  value={newPdfUrl}
                  onChange={(e) => setNewPdfUrl(e.target.value)}
                  placeholder="例如：https://... 或留空"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm text-white"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-amber-400 font-bold cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newPinned}
                  onChange={(e) => setNewPinned(e.target.checked)}
                />
                設為置頂重要公告
              </label>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-sm font-bold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-black text-sm font-extrabold"
                >
                  確認發布公告
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
