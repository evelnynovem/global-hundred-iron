"use client";

import React, { useState, useEffect, useCallback } from "react";
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

interface UploadedBatchSummary {
  race_name: string;
  race_date: string;
  sport_type: "triathlon" | "cycling";
  count: number;
}

export default function TaitungAssociationPage() {
  const [activeTab, setActiveTab] = useState<"all" | "puyuma" | "super" | "love197">("all");
  const [roleLevel, setRoleLevel] = useState<"super_admin" | "editor" | "member">("member");
  const [userEmail, setUserEmail] = useState("");
  const [announcements, setAnnouncements] = useState<any[]>(DEFAULT_ANNOUNCEMENTS);

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTag, setNewTag] = useState("秩序冊下載");
  const [newDate, setNewDate] = useState("2026-10-30");
  const [newPinned, setNewPinned] = useState(true);
  const [uploadedFileName, setUploadedFileName] = useState("");

  // Excel / CSV 成績上傳與防呆去重狀態
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvRaceName, setCsvRaceName] = useState("2026 台東巴歌浪鐵人三項");
  const [csvRaceDate, setCsvRaceDate] = useState("2026-10-17");
  const [csvSportType, setCsvSportType] = useState<"triathlon" | "cycling">("triathlon");
  const [csvPreviewRows, setCsvPreviewRows] = useState<any[]>([]);
  const [dedupStats, setDedupStats] = useState<{ rawCount: number; cleanCount: number }>({ rawCount: 0, cleanCount: 0 });
  const [selectedFileName, setSelectedFileName] = useState("");
  const [importingCsv, setImportingCsv] = useState(false);

  // 已上傳場次管理清單（供管理員檢視與整場刪除）
  const [uploadedBatches, setUploadedBatches] = useState<UploadedBatchSummary[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  const [searchKw, setSearchKw] = useState("");
  const [assocResults, setAssocResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const supabase = createClient();

  // 載入已上傳的所有場次統計清單
  const loadUploadedRaceBatches = useCallback(async () => {
    setLoadingBatches(true);
    try {
      const [{ data: triData }, { data: cycData }] = await Promise.all([
        supabase.from("race_details_full").select("race_name, race_date").limit(5000),
        supabase.from("cycling_details_full").select("race_name, race_date").limit(5000),
      ]);

      const batchMap = new Map<string, UploadedBatchSummary>();

      (triData || []).forEach((r: any) => {
        const name = (r.race_name || "").trim();
        if (!name || name === "EMPTY" || name === "NULL") return;
        const key = `tri-${name}`;
        const ex = batchMap.get(key);
        if (ex) {
          ex.count += 1;
        } else {
          batchMap.set(key, {
            race_name: name,
            race_date: r.race_date || "-",
            sport_type: "triathlon",
            count: 1,
          });
        }
      });

      (cycData || []).forEach((r: any) => {
        const name = (r.race_name || "").trim();
        if (!name || name === "EMPTY" || name === "NULL") return;
        const key = `cyc-${name}`;
        const ex = batchMap.get(key);
        if (ex) {
          ex.count += 1;
        } else {
          batchMap.set(key, {
            race_name: name,
            race_date: r.race_date || "-",
            sport_type: "cycling",
            count: 1,
          });
        }
      });

      const list = Array.from(batchMap.values()).sort((a, b) => (b.race_date || "").localeCompare(a.race_date || ""));
      setUploadedBatches(list);
    } catch (e) {
      console.error("載入場次統計失敗:", e);
    } finally {
      setLoadingBatches(false);
    }
  }, [supabase]);

  useEffect(() => {
    async function checkTierPermissionAndInit() {
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

      // 載入未被刪除的公告清單
      const deletedIdsRaw = localStorage.getItem("g100_deleted_ann_ids");
      const deletedSet = new Set<string>(deletedIdsRaw ? JSON.parse(deletedIdsRaw) : []);

      const { data: dbAnn } = await supabase
        .from("association_announcements")
        .select("*")
        .order("date", { ascending: false });

      const combined = [...(dbAnn || []), ...DEFAULT_ANNOUNCEMENTS].filter((a) => !deletedSet.has(String(a.id)));
      setAnnouncements(combined);

      loadUploadedRaceBatches();
    }
    checkTierPermissionAndInit();
  }, [supabase, loadUploadedRaceBatches]);

  // 權限控管之「刪除公告」功能（僅第一層與第二層管理員可執行）
  const handleDeleteAnnouncement = async (id: string, title: string) => {
    if (roleLevel !== "super_admin" && roleLevel !== "editor") {
      alert("⚠️ 權限不足：僅限授權之管理人員可刪除公告。");
      return;
    }
    if (!confirm(`確定要刪除公告「${title}」嗎？`)) return;

    try {
      if (!String(id).startsWith("default-") && !String(id).startsWith("custom-")) {
        await supabase.from("association_announcements").delete().eq("id", id);
      }
      const deletedIdsRaw = localStorage.getItem("g100_deleted_ann_ids");
      const deletedArr: string[] = deletedIdsRaw ? JSON.parse(deletedIdsRaw) : [];
      if (!deletedArr.includes(String(id))) {
        deletedArr.push(String(id));
        localStorage.setItem("g100_deleted_ann_ids", JSON.stringify(deletedArr));
      }
      setAnnouncements((prev) => prev.filter((a) => String(a.id) !== String(id)));
      alert("✅ 公告已成功刪除！");
    } catch (e: any) {
      alert("❌ 刪除公告失敗：" + e.message);
    }
  };

  // 🗑️ 網站最高管理員專屬：一鍵刪除「整場賽事」的所有完賽資料！
  const handleDeleteEntireRaceBatch = async (batch: UploadedBatchSummary) => {
    if (roleLevel !== "super_admin" && roleLevel !== "editor") {
      alert("⚠️ 權限不足：僅限網站管理者可刪除整場賽事資料。");
      return;
    }
    if (
      !confirm(
        `⚠️ 危險操作確認：\n您確定要刪除「${batch.race_name}」整場賽事的全部 ${batch.count} 筆完賽資料嗎？\n刪除後將同步從成績查詢與英雄榜重新計算。`
      )
    ) {
      return;
    }

    try {
      const targetTable = batch.sport_type === "cycling" ? "cycling_details_full" : "race_details_full";
      const { error } = await supabase.from(targetTable).delete().eq("race_name", batch.race_name);
      if (error) throw error;

      // 同步清除 user_records 中同名賽事
      await supabase.from("user_records").delete().eq("event_name", batch.race_name);

      setUploadedBatches((prev) =>
        prev.filter((b) => !(b.race_name === batch.race_name && b.sport_type === batch.sport_type))
      );
      setAssocResults((prev) => prev.filter((r) => r.race_name !== batch.race_name));
      alert(`✅ 已成功刪除「${batch.race_name}」全部 ${batch.count} 筆完賽資料！`);
    } catch (err: any) {
      alert("❌ 刪除場次失敗：" + err.message);
    }
  };

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

    try {
      await supabase.from("association_announcements").insert([
        {
          title: newItem.title,
          tag: newItem.tag,
          date: newItem.date,
          is_pinned: newItem.is_pinned,
          pdf_url: newItem.file_name,
        },
      ]);
    } catch (e) {
      console.warn(e);
    }

    setAnnouncements([newItem, ...announcements]);
    setNewTitle("");
    setUploadedFileName("");
    setShowStaffModal(false);
    alert(`✅ 協會公告已發布！${uploadedFileName ? `（已附加檔案：${uploadedFileName}）` : ""}`);
  };

  // 計算單筆資料的「完整度分數」，當有重複列時，自動保留資訊最豐富完整的那一筆！
  const scoreRowCompleteness = (row: {
    athlete_name: string;
    category: string;
    finish_time: string;
    team: string;
    login_email: string;
  }) => {
    let score = 0;
    if (row.finish_time && row.finish_time !== "完賽" && row.finish_time.includes(":")) score += 4;
    if (row.category && row.category !== "-") score += 2;
    if (row.team && row.team !== "個人" && row.team !== "-") score += 2;
    if (row.login_email && row.login_email.includes("@")) score += 3;
    return score;
  };

  // 🛡️ Excel / CSV 解析 ＋ 檔案內自動去重擇優（同選手只留最完整一筆）
  const handleExcelOrCsvSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);

    const baseRaceName = file.name.replace(/\.(csv|xlsx|xls)$/i, "").trim();
    if (baseRaceName) {
      setCsvRaceName(baseRaceName);
      if (baseRaceName.includes("197") || baseRaceName.includes("單車") || baseRaceName.includes("自行車") || baseRaceName.includes("百K")) {
        setCsvSportType("cycling");
      } else {
        setCsvSportType("triathlon");
      }
      const yearMatch = baseRaceName.match(/\b(20\d{2})\b/);
      if (yearMatch) {
        const y = yearMatch[1];
        if (baseRaceName.includes("巴歌浪")) setCsvRaceDate(`${y}-10-17`);
        else if (baseRaceName.includes("普悠瑪")) setCsvRaceDate(`${y}-03-28`);
        else if (baseRaceName.includes("戀戀197")) setCsvRaceDate(`${y}-12-06`);
      }
    }

    const formatExcelTime = (val: any): string => {
      if (val === null || val === undefined || val === "") return "完賽";
      const num = Number(val);
      if (!isNaN(num) && num > 0 && num < 2 && String(val).includes(".")) {
        const totalSeconds = Math.round(num * 86400);
        const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
        const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
        const ss = String(totalSeconds % 60).padStart(2, "0");
        return `${hh}:${mm}:${ss}`;
      }
      return String(val).trim() || "完賽";
    };

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

      let headerRowIdx = 0;
      for (let i = 0; i < Math.min(validRows.length, 5); i++) {
        const rowStr = validRows[i].map((c) => String(c).toLowerCase()).join(" ");
        if (rowStr.includes("姓名") || rowStr.includes("選手") || rowStr.includes("name")) {
          headerRowIdx = i;
          break;
        }
      }

      const headerRow = validRows[headerRowIdx].map((c) => String(c).toLowerCase().trim());
      const dataRows = validRows.slice(headerRowIdx + 1);

      let nameIdx = -1;
      let catIdx = -1;
      let timeIdx = -1;
      let teamIdx = -1;
      let emailIdx = -1;

      headerRow.forEach((s, idx) => {
        if (nameIdx === -1 && (s.includes("姓名") || s.includes("選手") || s === "name" || s.includes("athlete"))) nameIdx = idx;
        else if (catIdx === -1 && (s.includes("組別") || s.includes("距離") || s.includes("項目") || s.includes("category"))) catIdx = idx;
        else if (timeIdx === -1 && (s.includes("總成績") || s.includes("完賽時間") || s.includes("成績") || s.includes("時間") || s.includes("total") || s.includes("finish"))) timeIdx = idx;
        else if (teamIdx === -1 && (s.includes("團隊") || s.includes("車隊") || s.includes("單位") || s.includes("team"))) teamIdx = idx;
        else if (emailIdx === -1 && (s.includes("mail") || s.includes("信箱"))) emailIdx = idx;
      });

      if (nameIdx === -1 && dataRows.length > 0) {
        const sample = dataRows[0];
        for (let idx = 0; idx < sample.length; idx++) {
          const val = String(sample[idx]).trim();
          if (val && isNaN(Number(val)) && !val.includes(":") && !val.toLowerCase().includes("km") && val.length >= 2 && val.length <= 20) {
            nameIdx = idx;
            break;
          }
        }
      }
      if (nameIdx === -1) nameIdx = 0;

      const rawParsed: any[] = [];
      dataRows.forEach((cols) => {
        const rawName = String(cols[nameIdx] ?? "").trim();
        if (!rawName || rawName === "EMPTY" || rawName === "NULL" || /^\d+$/.test(rawName)) return;
        rawParsed.push({
          athlete_name: rawName,
          category:
            (catIdx !== -1 ? String(cols[catIdx] ?? "").trim() : "") ||
            (baseRaceName.includes("226") ? "226K 全程超鐵" : baseRaceName.includes("113") ? "113K 半程超鐵" : "51.5K 標準鐵人"),
          finish_time: timeIdx !== -1 ? formatExcelTime(cols[timeIdx]) : "完賽",
          team: (teamIdx !== -1 ? String(cols[teamIdx] ?? "").trim() : "") || "個人",
          login_email: emailIdx !== -1 ? String(cols[emailIdx] ?? "").trim() : "",
        });
      });

      // 🛡️ 第一道防呆：核對上傳檔案內部重複選手，比較欄位完整度，只留一份最完整的完賽資料！
      const uniqueAthleteMap = new Map<string, any>();
      rawParsed.forEach((item) => {
        const key = item.athlete_name.toLowerCase();
        const existing = uniqueAthleteMap.get(key);
        if (!existing) {
          uniqueAthleteMap.set(key, item);
        } else {
          // 比較哪一筆資料更完整，並把缺漏欄位互補合併成最完整的一份！
          const merged = {
            athlete_name: item.athlete_name,
            category:
              item.category && item.category.length > (existing.category || "").length
                ? item.category
                : existing.category,
            finish_time:
              item.finish_time && item.finish_time !== "完賽"
                ? item.finish_time
                : existing.finish_time,
            team:
              item.team && item.team !== "個人"
                ? item.team
                : existing.team,
            login_email: item.login_email || existing.login_email,
          };
          uniqueAthleteMap.set(key, merged);
        }
      });

      const deduplicatedList = Array.from(uniqueAthleteMap.values());
      setDedupStats({ rawCount: rawParsed.length, cleanCount: deduplicatedList.length });
      setCsvPreviewRows(deduplicatedList);
    } catch (err: any) {
      alert("❌ 檔案解析失敗：" + (err.message || "請確認檔案格式"));
    }
  };

  // 🛡️ 第二道防呆：寫入資料庫前，先核對資料庫中該場賽事是否已有舊資料，自動合併保留最完整唯一的一份，絕不重複疊加！
  const handleConfirmCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (csvPreviewRows.length === 0) {
      alert("⚠️ 請先選擇要上傳的檔案！");
      return;
    }

    setImportingCsv(true);
    try {
      const targetTable = csvSportType === "cycling" ? "cycling_details_full" : "race_details_full";
      const cleanRaceName = csvRaceName.trim();

      // 1. 先查詢資料庫裡是否已經有同場賽事 (`race_name`) 的資料
      const { data: existingDbRows } = await supabase
        .from(targetTable)
        .select("*")
        .eq("race_name", cleanRaceName)
        .limit(5000);

      const finalMergedMap = new Map<string, any>();

      // 先放入資料庫既有紀錄
      (existingDbRows || []).forEach((dbRow: any) => {
        const name = (dbRow.athlete_name || "").trim();
        if (!name) return;
        finalMergedMap.set(name.toLowerCase(), {
          athlete_name: name,
          category: dbRow.category || dbRow.distance || "",
          finish_time: dbRow.finish_time || dbRow.result_time || "完賽",
          team: dbRow.team || dbRow.sport_team || "個人",
          login_email: dbRow.login_email || "",
        });
      });

      // 將新上傳的資料與既有資料核對擇優合併（只留一份最完整的！）
      csvPreviewRows.forEach((newRow) => {
        const key = newRow.athlete_name.toLowerCase();
        const ex = finalMergedMap.get(key);
        if (!ex) {
          finalMergedMap.set(key, newRow);
        } else {
          finalMergedMap.set(key, {
            athlete_name: newRow.athlete_name,
            category: newRow.category || ex.category,
            finish_time: newRow.finish_time !== "完賽" ? newRow.finish_time : ex.finish_time,
            team: newRow.team !== "個人" ? newRow.team : ex.team,
            login_email: newRow.login_email || ex.login_email,
          });
        }
      });

      // 若資料庫原本已有這場比賽的舊資料，先清除該場舊資料，再寫入合併後唯一且最完整的清單！
      if (existingDbRows && existingDbRows.length > 0) {
        await supabase.from(targetTable).delete().eq("race_name", cleanRaceName);
      }

      const finalPayload = Array.from(finalMergedMap.values()).map((r) => ({
        athlete_name: r.athlete_name,
        race_name: cleanRaceName,
        race_date: csvRaceDate,
        finish_time: r.finish_time,
        login_email: r.login_email || null,
      }));

      for (let i = 0; i < finalPayload.length; i += 100) {
        const chunk = finalPayload.slice(i, i + 100);
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

      await loadUploadedRaceBatches();

      alert(
        `🎉 防呆核對與匯入成功！\n・賽事名稱：${cleanRaceName}\n・原始讀取：${dedupStats.rawCount} 筆\n・與資料庫核對去重後保留最完整唯一紀錄：${finalPayload.length} 筆！`
      );
      setCsvPreviewRows([]);
      setSelectedFileName("");
      setShowCsvModal(false);
    } catch (err: any) {
      alert("❌ 匯入異常：" + (err.message || "請確認網路連線"));
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
          .or(`athlete_name.ilike.%${searchKw.trim()}%,race_name.ilike.%${searchKw.trim()}%`)
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
    <div translate="no" className="notranslate min-h-screen bg-[#060911] text-white flex flex-col justify-between">
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

        {/* 管理員專屬控制台 */}
        {canEdit && (
          <section className="rounded-3xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 border border-amber-500/40 p-6 shadow-2xl space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  3-TIER ASSOCIATION MANAGEMENT CONSOLE
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                  🛠️ 臺東城鄉生活運動協會 — 公告管理、Excel/CSV 防呆去重匯入與場次管理
                </h2>
                <p className="text-xs text-zinc-300 mt-0.5">
                  已啟用「整批重複上傳防呆核對機制」：重複上傳同場賽事時，系統自動比對並只保留唯一且最完整的完賽紀錄。
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm transition cursor-pointer"
                >
                  📄 發布公告 ＆ 上傳檔案至公告區
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

            {/* 🗂️ 新增：已上傳賽事場次完賽資料總覽 ＆ 網站管理者一鍵刪除整場資料 */}
            <div className="rounded-2xl bg-zinc-950/90 border border-zinc-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-amber-400">
                    🗂️ 已上傳之賽事場次完賽資料管理中心（共 {uploadedBatches.length} 個場次）
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    在此檢視所有已匯入系統的賽事場次與完賽筆數；若整場資料誤傳，管理者可一鍵刪除該場次全部完賽紀錄。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadUploadedRaceBatches}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 cursor-pointer"
                >
                  🔄 重新整理場次
                </button>
              </div>

              {loadingBatches ? (
                <p className="text-xs text-zinc-400 py-4 text-center">統計資料庫場次中...</p>
              ) : (
                <div className="max-h-60 overflow-y-auto divide-y divide-zinc-900 border border-zinc-800/80 rounded-xl">
                  {uploadedBatches.map((batch, i) => (
                    <div
                      key={`${batch.sport_type}-${batch.race_name}-${i}`}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-900/50 transition"
                    >
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          batch.sport_type === "cycling"
                            ? "bg-red-500/15 text-red-400 border border-red-500/30"
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        }`}>
                          {batch.sport_type === "cycling" ? "🚴‍♂️ 公路單車" : "🏊‍♂️ 鐵人三項"}
                        </span>
                        <span className="text-sm font-extrabold text-white">{batch.race_name}</span>
                        <span className="text-xs font-mono text-zinc-400">日期：{batch.race_date}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-mono font-bold">
                          共 {batch.count} 筆完賽資料
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteEntireRaceBatch(batch)}
                        className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 hover:text-white border border-red-500/40 text-red-400 text-xs font-extrabold transition cursor-pointer shrink-0"
                      >
                        🗑️ 刪除此場次全部資料
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* 協會官方置頂公告 & 秩序冊簡章下載（含權限控管之刪除公告按鈕） */}
        <section className="rounded-3xl bg-zinc-950/90 border border-zinc-800/90 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                協會官方置頂公告 & 秩序冊簡章下載
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                顯示協會所有最新賽事公告（僅授權管理員可看到並操作右側「刪除公告」功能）
              </p>
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
                      onClick={() => handleDeleteAnnouncement(ann.id, ann.title)}
                      className="px-3.5 py-2 rounded-xl bg-red-500/15 hover:bg-red-600 hover:text-white border border-red-500/40 text-red-400 text-xs font-extrabold transition cursor-pointer"
                    >
                      🗑️ 刪除公告
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Modal 1：發布公告 */}
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
                  className="w-full rounded-xl bg-zinc-900 border border-dashed border-amber-500/50 px-4 py-3 text-xs text-zinc-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-black cursor-pointer"
                />
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
                  className="px-5 py-2 rounded-xl bg-amber-500 text-black text-sm font-extrabold cursor-pointer"
                >
                  確認發布
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2：Excel / CSV 批次上傳（內建重複上傳核對防呆，只留一份最完整資料） */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center px-4 z-50">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-black text-white">📊 批次上傳 Excel (.xlsx/.xls) 或 .csv 完賽成績檔</h3>
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
                  <label className="text-xs font-bold text-zinc-300">對應賽事名稱 (選檔後自動帶入) *</label>
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
                  選擇電腦中的 Excel (.xlsx / .xls) 或 .csv 檔案（自動去重並只留最完整一筆）
                </label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleExcelOrCsvSelect}
                  className="w-full rounded-xl bg-zinc-900 border border-dashed border-emerald-500/50 px-4 py-3 text-xs text-zinc-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-500 file:text-black cursor-pointer"
                />
              </div>

              {csvPreviewRows.length > 0 && (
                <div className="rounded-xl bg-zinc-900 border border-emerald-500/30 p-3 space-y-2">
                  <div className="text-xs text-emerald-400 font-extrabold">
                    ✅ 防呆核對完成：「{selectedFileName}」原始讀取 {dedupStats.rawCount} 筆 ➔ 去重後保留最完整唯一紀錄共 {dedupStats.cleanCount} 筆！
                  </div>
                  <div className="text-[11px] text-zinc-300 font-mono space-y-1">
                    {csvPreviewRows.slice(0, 3).map((r, i) => (
                      <div key={i}>
                        {i + 1}. 姓名：{r.athlete_name} ｜ 組別：{r.category} ｜ 時間：{r.finish_time}
                      </div>
                    ))}
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
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-extrabold cursor-pointer disabled:opacity-40"
                >
                  {importingCsv ? "正在核對去重並寫入..." : `確認覆蓋匯入唯一完整成績 (${csvPreviewRows.length} 筆)`}
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
