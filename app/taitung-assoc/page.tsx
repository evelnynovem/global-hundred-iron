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
    file_name: "2026普悠瑪秩序冊.pdf",
  },
  {
    id: "default-2",
    is_pinned: true,
    tag: "交通管制公告",
    date: "2026-03-10",
    title: "【交通管制公告】臺東森林公園活水湖周邊暨中華大橋 賽事期間階段性封路說明",
    file_name: "",
  },
  {
    id: "default-3",
    is_pinned: false,
    tag: "賽事公告",
    date: "2026-02-20",
    title: "戀戀197東海岸自行車公路賽 歷年完賽選手榮譽榜已全數匯入系統，歡迎查詢下載電子證書",
    file_name: "",
  },
];

export default function TaitungAssociationPage() {
  const [activeTab, setActiveTab] = useState<"all" | "puyuma" | "super" | "love197">("all");
  const [roleLevel, setRoleLevel] = useState<"super_admin" | "editor" | "member">("member");
  const [userEmail, setUserEmail] = useState("");
  const [announcements, setAnnouncements] = useState<any[]>(DEFAULT_ANNOUNCEMENTS);

  // 新增/編輯公告與上傳檔案狀態
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTag, setNewTag] = useState("秩序冊下載");
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newPinned, setNewPinned] = useState(true);
  const [uploadedFileName, setUploadedFileName] = useState("");

  // Excel / CSV 成績檔案直接上傳匯入 Modal
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvRaceName, setCsvRaceName] = useState("2026 台東巴歌浪鐵人三項");
  const [csvRaceDate, setCsvRaceDate] = useState("2026-10-17");
  const [csvSportType, setCsvSportType] = useState<"triathlon" | "cycling">("triathlon");
  const [csvPreviewRows, setCsvPreviewRows] = useState<any[]>([]);
  const [importingCsv, setImportingCsv] = useState(false);

  // 協會歷年成績查詢狀態
  const [searchKw, setSearchKw] = useState("");
  const [assocResults, setAssocResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function checkTierPermission() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const email = (session.user.email || "").toLowerCase();
        const metaName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || "";
        setUserEmail(session.user.email || "");

        // 檢查第一層最高管理員與第二層編輯管理員
        if (
          email.includes("evelny") ||
          email.includes("pianopub") ||
          email.includes("novem") ||
          metaName.includes("洪緯欣") ||
          metaName.includes("Wei-hsin") ||
          metaName.includes("陳彥良")
        ) {
          setRoleLevel("super_admin");
        } else {
          const savedManagers = localStorage.getItem("g100_role_managers");
          if (savedManagers) {
            const parsed = JSON.parse(savedManagers);
            const matched = parsed.find((m: any) => (m.email || "").toLowerCase() === email);
            if (matched) setRoleLevel(matched.role);
          }
        }
      }
    }
    checkTierPermission();
  }, [supabase]);

  // 處理公告檔案上傳（本機選擇 PDF / Word / 簡章檔案）
  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
    }
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem = {
      id: `custom-${Date.now()}`,
      is_pinned: newPinned,
      tag: newTag,
      date: newDate,
      title: newTitle.trim(),
      file_name: uploadedFileName,
    };

    setAnnouncements([newItem, ...announcements]);
    setNewTitle("");
    setUploadedFileName("");
    setShowStaffModal(false);
    alert(`✅ 協會公告已發布！${uploadedFileName ? `（已附加檔案：${uploadedFileName}）` : ""}`);
  };

  // 解析上傳的 Excel / .csv 成績檔案並直接匯入資料庫
  const handleCsvFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      alert("⚠️ 檔案內容為空或格式不正確，請確認包含標題列與選手成績資料。");
      return;
    }

    const parsed: any[] = [];
    for (let i = 1; i < Math.min(lines.length, 500); i++) {
      const cols = lines[i].split(",").map((c) => c.replace(/^"|"$/g, "").trim());
      if (cols.length >= 1 && cols[0]) {
        parsed.push({
          athlete_name: cols[0],
          category: cols[1] || "51.5K 標準鐵人",
          finish_time: cols[2] || "完賽",
          team: cols[3] || "個人",
          login_email: cols[4] || "",
        });
      }
    }
    setCsvPreviewRows(parsed);
  };

  const handleConfirmCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (csvPreviewRows.length === 0) {
      alert("⚠️ 請先選擇要上傳的 Excel (.csv) 成績檔案！");
      return;
    }

    setImportingCsv(true);
    try {
      const targetTable = csvSportType === "cycling" ? "cycling_details_full" : "race_details_full";
      const payload = csvPreviewRows.map((r) => ({
        athlete_name: r.athlete_name,
        race_name: csvRaceName,
        race_date: csvRaceDate,
        category: r.category,
        finish_time: r.finish_time,
        team: r.team,
        login_email: r.login_email,
      }));

      const { error } = await supabase.from(targetTable).insert(payload);
      if (error) throw error;

      alert(`🎉 成功從檔案匯入 ${payload.length} 筆「${csvRaceName}」完賽成績至系統資料庫！`);
      setCsvPreviewRows([]);
      setShowCsvModal(false);
    } catch (err: any) {
      alert("❌ 匯入失敗：" + (err.message || "請確認欄位格式"));
    } finally {
      setImportingCsv(false);
    }
  };

  const handleSearchAssocResults = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    try {
      let q = supabase.from("race_details_full").select("*").limit(50);
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

  const canEdit = roleLevel === "super_admin" || roleLevel === "editor";

  return (
    <div className="min-h-screen bg-[#060911] text-white flex flex-col justify-between">
      <div className="max-w-6xl w-full mx-auto px-6 py-10 space-y-10">
        
        {/* 頂部導覽列 */}
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
            {canEdit && (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-extrabold">
                {roleLevel === "super_admin" ? "👑 第一層：最高管理員 (洪緯欣)" : "✏️ 第二層：公告與成績編輯管理員"}
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

        {/* 🛠️ 三層管理員控制面板（第一層可委派管理員＋編輯公告＋上傳Excel/CSV；第二層可編輯公告＋上傳Excel/CSV） */}
        {canEdit && (
          <section className="rounded-3xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 border border-amber-500/40 p-6 shadow-2xl space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  3-TIER ASSOCIATION MANAGEMENT CONSOLE
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                  🛠️ 臺東城鄉生活運動協會 — 公告檔案上傳、Excel/CSV 成績匯入與權限管理
                </h2>
                <p className="text-xs text-zinc-300 mt-0.5">
                  您可以直接上傳簡章/秩序冊檔案至公告區、使用 Excel / .csv 批次匯入選手完賽成績，或進入權限後台新增第二層編輯管理員。
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm transition cursor-pointer"
                >
                  📄 編輯公告 ＆ 上傳檔案至公告區
                </button>
                <button
                  type="button"
                  onClick={() => setShowCsvModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs sm:text-sm transition cursor-pointer"
                >
                  📊 上傳 Excel / .csv 完賽成績檔
                </button>
                {roleLevel === "super_admin" && (
                  <Link
                    href="/admin"
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-amber-500/40 text-amber-400 font-extrabold text-xs sm:text-sm transition"
                  >
                    👑 新增 / 委派三層管理者權限
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 主視覺區塊 */}
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

        {/* 四大賽事切換頁籤 */}
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
              <p className="text-xs text-zinc-400 mt-1">顯示協會所有最新賽事公告與附加檔案下載</p>
            </div>
            {canEdit && (
              <button
                type="button"
                onClick={() => setShowStaffModal(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 text-black text-xs font-extrabold hover:bg-amber-400 transition cursor-pointer"
              >
                ＋ 新增公告 / 上傳檔案
              </button>
            )}
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
                  {ann.file_name && (
                    <button
                      type="button"
                      onClick={() => alert(`📄 準備下載協會官方附件檔案：${ann.file_name}`)}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition cursor-pointer"
                    >
                      📄 下載附件：{ann.file_name}
                    </button>
                  )}
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => setAnnouncements(announcements.filter((a) => a.id !== ann.id))}
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
            </div>
            <div className="flex items-center gap-2">
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setShowCsvModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold transition cursor-pointer"
                >
                  📊 上傳 Excel / .csv 成績檔
                </button>
              )}
              <Link
                href="/profile/claim"
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-amber-400 text-xs font-extrabold transition shrink-0"
              >
                前往百鐵會員一鍵認領 →
              </Link>
            </div>
          </div>

          <form onSubmit={handleSearchAssocResults} className="flex gap-3">
            <input
              type="text"
              value={searchKw}
              onChange={(e) => setSearchKw(e.target.value)}
              placeholder="輸入選手姓名（例如：陳彥良、洪緯欣）檢索協會歷年完賽紀錄..."
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

      {/* Modal 1：新增公告與直接上傳檔案至公告區 */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center px-4 z-50">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-black text-white">📄 發布協會公告 ＆ 上傳檔案至公告區</h3>
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
                  placeholder="例如：【重要公告】2026 巴歌浪鐵人三項選手秩序冊下載"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">分類標籤</label>
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
                <label className="text-xs font-bold text-zinc-300">上傳附件檔案（支援 PDF / Word / Excel / 簡章秩序冊）</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.png"
                  onChange={handleFileUploadChange}
                  className="w-full rounded-xl bg-zinc-900 border border-dashed border-amber-500/50 px-4 py-3 text-xs text-zinc-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-black hover:file:bg-amber-400"
                />
                {uploadedFileName && (
                  <p className="text-xs text-emerald-400 font-bold pt-1">✅ 已選取檔案：{uploadedFileName}</p>
                )}
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
                  確認發布並上傳
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2：Excel / .csv 完賽成績檔案直接上傳匯入 */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center px-4 z-50">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-black text-white">📊 批次上傳 Excel / .csv 完賽成績檔</h3>
              <button
                type="button"
                onClick={() => setShowCsvModal(false)}
                className="text-zinc-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmCsvImport} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">對應賽事名稱 *</label>
                  <input
                    type="text"
                    required
                    value={csvRaceName}
                    onChange={(e) => setCsvRaceName(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">賽事日期 *</label>
                  <input
                    type="date"
                    required
                    value={csvRaceDate}
                    onChange={(e) => setCsvRaceDate(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-amber-400 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">賽事類別</label>
                <select
                  value={csvSportType}
                  onChange={(e) => setCsvSportType(e.target.value as "triathlon" | "cycling")}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-white font-bold"
                >
                  <option value="triathlon">🏊‍♂️ 鐵人三項成績匯入 (race_details_full)</option>
                  <option value="cycling">🚴‍♂️ 公路單車百鐵馬成績匯入 (cycling_details_full)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  選擇電腦中的 Excel / .csv 成績檔案（欄位順序：選手姓名, 組別, 完賽時間, 團隊, Email）
                </label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleCsvFileSelect}
                  className="w-full rounded-xl bg-zinc-900 border border-dashed border-emerald-500/50 px-4 py-3 text-xs text-zinc-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-500 file:text-black hover:file:bg-emerald-400"
                />
              </div>

              {csvPreviewRows.length > 0 && (
                <div className="rounded-xl bg-zinc-900 p-3 text-xs text-emerald-400 font-bold">
                  ✅ 已成功解析 {csvPreviewRows.length} 筆選手完賽成績，點擊下方按鈕即可正式匯入系統！
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCsvModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-sm font-bold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={importingCsv}
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-black text-sm font-extrabold cursor-pointer disabled:opacity-50"
                >
                  {importingCsv ? "匯入資料庫中..." : `確認匯入成績 (${csvPreviewRows.length} 筆)`}
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
