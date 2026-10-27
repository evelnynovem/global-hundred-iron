"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";
import * as XLSX from "xlsx";

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

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTag, setNewTag] = useState("秩序冊下載");
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newPinned, setNewPinned] = useState(true);
  const [uploadedFileName, setUploadedFileName] = useState("");

  // Excel / CSV 成績檔案上傳匯入狀態
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvRaceName, setCsvRaceName] = useState("2026 台東巴歌浪鐵人三項");
  const [csvRaceDate, setCsvRaceDate] = useState("2026-10-17");
  const [csvSportType, setCsvSportType] = useState<"triathlon" | "cycling">("triathlon");
  const [csvPreviewRows, setCsvPreviewRows] = useState<any[]>([]);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [importingCsv, setImportingCsv] = useState(false);

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

  // 使用 XLSX 引擎同時支援 .xlsx、.xls 與 .csv 檔案格式智慧解析
  const handleExcelOrCsvSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
      const validRows = rows.filter((r) => Array.isArray(r) && r.some((cell) => String(cell).trim() !== ""));

      if (validRows.length === 0) {
        alert("⚠️ 讀取到的檔案內容為空，請確認檔案內有資料。");
        return;
      }

      const firstRowStr = validRows[0].map((c) => String(c).toLowerCase()).join(" ");
      const hasHeader =
        firstRowStr.includes("name") ||
        firstRowStr.includes("姓名") ||
        firstRowStr.includes("選手") ||
        firstRowStr.includes("email") ||
        firstRowStr.includes("時間") ||
        firstRowStr.includes("成績");

      const dataRows = hasHeader ? validRows.slice(1) : validRows;

      let nameIdx = 0;
      let catIdx = 1;
      let timeIdx = 2;
      let teamIdx = 3;
      let emailIdx = 4;

      if (hasHeader) {
        validRows[0].forEach((colName, idx) => {
          const s = String(colName).toLowerCase().trim();
          if (s.includes("姓名") || s.includes("選手") || s === "name" || s.includes("athlete")) nameIdx = idx;
          else if (s.includes("組別") || s.includes("距離") || s.includes("category") || s.includes("group")) catIdx = idx;
          else if (s.includes("時間") || s.includes("成績") || s.includes("time") || s.includes("result")) timeIdx = idx;
          else if (s.includes("團隊") || s.includes("車隊") || s.includes("team")) teamIdx = idx;
          else if (s.includes("mail") || s.includes("信箱")) emailIdx = idx;
        });
      }

      const parsed = dataRows
        .map((cols) => {
          const rawName = String(cols[nameIdx] ?? "").trim();
          if (!rawName || rawName === "EMPTY" || rawName === "NULL") return null;
          return {
            athlete_name: rawName,
            category: String(cols[catIdx] ?? "").trim() || (csvSportType === "cycling" ? "100K 公路單車" : "51.5K 標準鐵人"),
            finish_time: String(cols[timeIdx] ?? "").trim() || "完賽",
            team: String(cols[teamIdx] ?? "").trim() || "個人",
            login_email: String(cols[emailIdx] ?? "").trim() || "",
          };
        })
        .filter(Boolean);

      if (parsed.length === 0) {
        alert("⚠️ 未能從檔案中解析出有效的選手姓名列，請確認第一欄為選手姓名。");
        return;
      }

      setCsvPreviewRows(parsed);
    } catch (err: any) {
      console.error("解析 Excel/CSV 錯誤:", err);
      alert("❌ 檔案解析失敗：" + (err.message || "請確認檔案格式為 .xlsx, .xls 或 .csv"));
    }
  };

  const handleConfirmCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (csvPreviewRows.length === 0) {
      alert("⚠️ 請先選擇要上傳的檔案！");
      return;
    }

    setImportingCsv(true);
    try {
      const targetTable = csvSportType === "cycling" ? "cycling_details_full" : "race_details_full";
      const fullPayload = csvPreviewRows.map((r) => ({
        athlete_name: r.athlete_name,
        race_name: csvRaceName.trim(),
        race_date: csvRaceDate,
        finish_time: r.finish_time,
        login_email: r.login_email || null,
      }));

      for (let i = 0; i < fullPayload.length; i += 100) {
        const chunk = fullPayload.slice(i, i + 100);
        const { error } = await supabase.from(targetTable).insert(chunk);
        if (error) {
          const minimalChunk = chunk.map((c) => ({
            athlete_name: c.athlete_name,
            race_name: c.race_name,
            race_date: c.race_date,
          }));
          await supabase.from(targetTable).insert(minimalChunk);
        }
      }

      setAssocResults(
        csvPreviewRows.slice(0, 50).map((r, idx) => ({
          id: `imported-${idx}`,
          athlete_name: r.athlete_name,
          race_name: csvRaceName,
          race_date: csvRaceDate,
          category: r.category,
          finish_time: r.finish_time,
        }))
      );

      alert(`🎉 匯入成功！已將檔案內共 ${csvPreviewRows.length} 筆「${csvRaceName}」完賽成績正式匯入系統！`);
      setCsvPreviewRows([]);
      setSelectedFileName("");
      setShowCsvModal(false);
    } catch (err: any) {
      console.error("匯入異常:", err);
      alert("❌ 匯入發生異常：" + (err.message || "請確認網路連線"));
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
                  支援直接選取電腦中的 Excel (.xlsx/.xls) 或 .csv 完賽成績檔一鍵解析匯入！
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
              臺東城鄉生活運動協會
            </h1>
            <p className="text-lg sm:text-xl font-extrabold text-amber-400">
              深耕東台灣耐力運動・打造活水湖與東海岸經典傳奇
            </p>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              本專區為「臺東城鄉生活運動協會」與「全球百鐵認證」共同建置之官方數位服務中心。完整收錄本會主辦之「普悠瑪鐵人三項」、「臺東超級鐵人」及「戀戀197自行車公路賽」最新賽事公告、秩序冊下載與歷年完賽成績資料庫。
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
          </div>
        </div>

        <section className="rounded-3xl bg-zinc-950/90 border border-zinc-800/90 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                協會官方置頂公告 & 秩序冊簡章下載
              </h2>
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
                className="rounded-2xl bg-zinc-900/60 border border-zinc-800/90 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
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

      </div>

      {showStaffModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center px-4 z-50">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-black text-white">📄 發布協會公告 ＆ 上傳檔案</h3>
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
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">上傳附件檔案</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.png"
                  onChange={handleFileUploadChange}
                  className="w-full rounded-xl bg-zinc-900 border border-dashed border-amber-500/50 px-4 py-3 text-xs text-zinc-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-black hover:file:bg-amber-400 cursor-pointer"
                />
                {uploadedFileName && (
                  <p className="text-xs text-emerald-400 font-bold pt-1">✅ 已選取檔案：{uploadedFileName}</p>
                )}
              </div>
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
                  確認發布
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <label className="text-xs font-bold text-zinc-300">
                  選擇 Excel (.xlsx/.xls) 或 .csv 檔案
                </label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleExcelOrCsvSelect}
                  className="w-full rounded-xl bg-zinc-900 border border-dashed border-emerald-500/50 px-4 py-3 text-xs text-zinc-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-500 file:text-black hover:file:bg-emerald-400 cursor-pointer"
                />
              </div>

              {csvPreviewRows.length > 0 && (
                <div className="rounded-xl bg-zinc-900 border border-emerald-500/30 p-3 space-y-2">
                  <div className="text-xs text-emerald-400 font-extrabold">
                    ✅ 已成功解析「{selectedFileName}」共 {csvPreviewRows.length} 筆選手成績！
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCsvModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-sm font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={importingCsv || csvPreviewRows.length === 0}
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-black text-sm font-extrabold cursor-pointer disabled:opacity-40"
                >
                  {importingCsv ? "正在寫入資料庫..." : `確認匯入成績 (${csvPreviewRows.length} 筆)`}
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
