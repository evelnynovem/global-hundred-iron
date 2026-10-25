"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface CertRecord {
  id: string;
  user_id: string;
  full_name: string;
  team_name: string;
  age_group: string;
  sport_category: string;
  distance_type: string;
  event_name: string;
  event_date: string;
  finish_time: string;
  status: string;
  report_count?: number;
  is_estimated_time?: boolean;
}

export default function RankingsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [myRecords, setMyRecords] = useState<CertRecord[]>([]);
  const [allRecords, setAllRecords] = useState<CertRecord[]>([]);
  const [violationMap, setViolationMap] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<"all" | "triathlon" | "cycling">("all");
  const [searchKeyword, setSearchKeyword] = useState("");

  // 檢舉彈窗狀態
  const [reportingRecord, setReportingRecord] = useState<CertRecord | null>(null);
  const [reportReason, setReportReason] = useState("fake_entry");
  const [reportDetails, setReportDetails] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRankingData() {
      setLoading(true);

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      if (currentUser?.email) {
        setReporterEmail(currentUser.email);
      }

      // 1. 讀取所有公開會員的違規次數統計
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, violation_count");

      if (profilesData) {
        const vMap: Record<string, number> = {};
        profilesData.forEach((p: any) => {
          vMap[p.id] = p.violation_count || 0;
        });
        setViolationMap(vMap);
      }

      // 2. 讀取全站所有完賽紀錄 (由新到舊排序)
      const { data: certs } = await supabase
        .from("certifications")
        .select("*")
        .order("event_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (certs) {
        setAllRecords(certs);
        if (currentUser) {
          setMyRecords(certs.filter((c) => c.user_id === currentUser.id));
        }
      }

      setLoading(false);
    }

    fetchRankingData();
  }, [supabase]);

  // 選手自行刪除誤填紀錄
  const handleDeleteMyRecord = async (recordId: string, eventName: string) => {
    if (!confirm(`確定要刪除「${eventName}」這筆完賽登錄嗎？`)) return;

    const { error } = await supabase
      .from("certifications")
      .delete()
      .eq("id", recordId);

    if (!error) {
      setMyRecords((prev) => prev.filter((r) => r.id !== recordId));
      setAllRecords((prev) => prev.filter((r) => r.id !== recordId));
      setFeedbackMsg(`已成功移除「${eventName}」紀錄。`);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  // 送出檢舉表單
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingRecord) return;

    setReportSubmitting(true);

    // 1. 寫入檢舉資料表
    const { error: reportErr } = await supabase.from("certification_reports").insert([
      {
        certification_id: reportingRecord.id,
        reported_user_id: reportingRecord.user_id,
        reporter_user_id: user?.id || null,
        reporter_email: reporterEmail || null,
        reason_type: reportReason,
        details: reportDetails,
      },
    ]);

    // 2. 將該筆紀錄的被檢舉次數 +1
    const newCount = (reportingRecord.report_count || 0) + 1;
    await supabase
      .from("certifications")
      .update({ report_count: newCount })
      .eq("id", reportingRecord.id);

    if (!reportErr) {
      setAllRecords((prev) =>
        prev.map((r) => (r.id === reportingRecord.id ? { ...r, report_count: newCount } : r))
      );
      setFeedbackMsg(
        `✅ 檢舉已送出！系統已標記「${reportingRecord.full_name} - ${reportingRecord.event_name}」進行查核。`
      );
      setReportingRecord(null);
      setReportDetails("");
      setTimeout(() => setFeedbackMsg(null), 5000);
    }

    setReportSubmitting(false);
  };

  const filteredAllRecords = allRecords.filter((rec) => {
    const matchCategory = activeTab === "all" ? true : rec.sport_category === activeTab;
    const kw = searchKeyword.trim().toLowerCase();
    const matchKeyword =
      !kw ||
      (rec.full_name && rec.full_name.toLowerCase().includes(kw)) ||
      (rec.team_name && rec.team_name.toLowerCase().includes(kw)) ||
      (rec.event_name && rec.event_name.toLowerCase().includes(kw)) ||
      (rec.age_group && rec.age_group.toLowerCase().includes(kw));

    return matchCategory && matchKeyword;
  });

  const myTriCount = myRecords.filter((r) => r.sport_category === "triathlon").length;
  const myCyclingCount = myRecords.filter((r) => r.sport_category === "cycling").length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* 頂部精簡版 Hero 橫幅 */}
      <section className="border-b border-zinc-800 bg-gradient-to-b from-black to-zinc-950 pt-8 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-black tracking-[0.25em] text-red-500 uppercase">
                GLOBAL RANKINGS & HONOR SYSTEM
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mt-1 text-white">
                看見每一段堅持的累積。
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-2xl">
                本平台採「榮譽自律認證制」，無官方事前審查；開放全體選手共同監督，維護百鐵榮耀公信力。
              </p>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href="/certifications/triathlon"
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition shadow"
              >
                + 登錄鐵人成績
              </Link>
              <Link
                href="/certifications/cycling"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow"
              >
                + 登錄單車成績
              </Link>
            </div>
          </div>

          {/* 榮譽自律與檢舉處置規範橫幅 */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 leading-relaxed flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                🛡️ 榮譽認證彈性與不實資料檢舉機制說明
              </div>
              <p>
                早期賽事年代久遠，若選手遺忘確切完賽秒數允許填寫印象約略時間。但若發現<strong>「未參賽造假」</strong>或<strong>「未完賽（DNF/DNS）冒稱完賽」</strong>，歡迎點選紀錄右側之「檢舉」按鈕。查證屬實除刪除紀錄並公開累計該員違規次數外，嚴重或累犯者將<strong>永久拒絕登錄</strong>。
              </p>
            </div>
          </div>

          {/* 雙欄分類導覽卡 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setActiveTab("triathlon")}
              className={`text-left p-5 rounded-2xl border transition relative overflow-hidden group ${
                activeTab === "triathlon"
                  ? "bg-red-600 border-red-400 shadow-lg"
                  : "bg-red-700/80 hover:bg-red-600 border-red-600/50"
              }`}
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black tracking-widest uppercase text-red-100">
                    RANKING 01
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                    鐵人三項 百鐵排名與紀錄
                  </h2>
                  <p className="text-xs text-red-100 mt-1">
                    查看 51.5K / 113K / 226K 鐵人完賽紀錄與分組數據
                  </p>
                </div>
                <span className="text-xl font-bold text-white group-hover:translate-x-1 transition">
                  →
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("cycling")}
              className={`text-left p-5 rounded-2xl border transition relative overflow-hidden group ${
                activeTab === "cycling"
                  ? "bg-white text-zinc-950 border-amber-400 shadow-lg"
                  : "bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-800"
              }`}
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <span
                    className={`text-[10px] font-black tracking-widest uppercase ${
                      activeTab === "cycling" ? "text-emerald-600" : "text-emerald-400"
                    }`}
                  >
                    RANKING 02
                  </span>
                  <h2 className="text-lg sm:text-xl font-black mt-0.5">
                    單車挑戰 百鐵排名與紀錄
                  </h2>
                  <p
                    className={`text-xs mt-1 ${
                      activeTab === "cycling" ? "text-zinc-600" : "text-zinc-400"
                    }`}
                  >
                    查看 100K+ / 200K+ / 300K+ 公路車與 KOM 完賽紀錄
                  </p>
                </div>
                <span className="text-xl font-bold group-hover:translate-x-1 transition">
                  →
                </span>
              </div>
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {feedbackMsg && (
          <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-200 text-sm font-bold">
            {feedbackMsg}
          </div>
        )}

        {/* 區塊一：已登入選手專屬「我的已登錄完賽紀錄（由新到舊）」 */}
        {user && (
          <div className="bg-zinc-900/90 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-8 bg-amber-400 rounded-full" />
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white flex flex-wrap items-center gap-2">
                    個人已登錄完賽紀錄總覽
                    <span className="text-xs px-2.5 py-0.5 bg-amber-400/20 text-amber-300 rounded-full font-bold">
                      由新到舊排序
                    </span>
                    <span className="text-xs px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-bold">
                      違規紀錄：{violationMap[user.id] || 0} 次
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    登入帳號：{user.email} ｜ 您目前累計登錄：鐵人 {myTriCount} 場、百K單車 {myCyclingCount} 場
                  </p>
                </div>
              </div>
              <Link
                href="/profile"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 underline shrink-0"
              >
                管理會員基本資料 →
              </Link>
            </div>

            {myRecords.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 text-sm">
                您目前尚未登錄任何完賽成績，立即點選上方按鈕新增您的第一場紀錄吧！
              </div>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 text-xs text-zinc-400 uppercase">
                        <th className="py-3 px-3">賽事日期</th>
                        <th className="py-3 px-3">類別 / 距離</th>
                        <th className="py-3 px-3">賽事名稱</th>
                        <th className="py-3 px-3">運動團隊</th>
                        <th className="py-3 px-3">分齡組別</th>
                        <th className="py-3 px-3">完賽時間</th>
                        <th className="py-3 px-3">認證狀態</th>
                        <th className="py-3 px-3 text-right">管理</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {myRecords.map((rec) => (
                        <tr key={rec.id} className="hover:bg-zinc-800/40 transition">
                          <td className="py-3 px-3 font-mono text-xs text-zinc-300">{rec.event_date}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                rec.sport_category === "triathlon"
                                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              }`}
                            >
                              {rec.distance_type}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-white">{rec.event_name}</td>
                          <td className="py-3 px-3 text-xs text-zinc-300">{rec.team_name || "個人"}</td>
                          <td className="py-3 px-3 text-xs font-semibold text-amber-400">
                            {rec.age_group || "-"}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-white">{rec.finish_time}</td>
                          <td className="py-3 px-3">
                            {(rec.report_count || 0) > 0 ? (
                              <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                                ⚠️ 被檢舉 ({rec.report_count})
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-300">
                                🛡️ 榮譽認證
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteMyRecord(rec.id, rec.event_name)}
                              className="text-xs text-zinc-500 hover:text-red-400 transition"
                            >
                              刪除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 gap-3 md:hidden">
                  {myRecords.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-zinc-400">{rec.event_date}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold ${
                            rec.sport_category === "triathlon"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-emerald-500/20 text-emerald-300"
                          }`}
                        >
                          {rec.distance_type}
                        </span>
                      </div>
                      <div className="font-bold text-white text-sm">{rec.event_name}</div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-900">
                        <span className="text-zinc-400">
                          團隊：{rec.team_name || "個人"} ｜ 組別：{rec.age_group || "-"}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-amber-400 text-sm">
                            {rec.finish_time}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteMyRecord(rec.id, rec.event_name)}
                            className="text-zinc-500 hover:text-red-400"
                          >
                            刪除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* 區塊二：全站百鐵認證賽事登錄即時查詢系統 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
            <div>
              <h2 className="text-xl font-black text-amber-400">
                全球百鐵認證賽事登錄查詢系統
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                即時公開全站選手榮譽登錄之完賽紀錄（依賽事日期由新到舊排列，開放社群共同監督）
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-2 rounded-lg transition ${
                    activeTab === "all" ? "bg-amber-400 text-black" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  全部項目 ({allRecords.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("triathlon")}
                  className={`px-3 py-2 rounded-lg transition ${
                    activeTab === "triathlon" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  鐵人三項
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("cycling")}
                  className={`px-3 py-2 rounded-lg transition ${
                    activeTab === "cycling" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  單車挑戰
                </button>
              </div>

              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜尋姓名、團隊、賽事或分組..."
                className="px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 w-full sm:w-64"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-zinc-400 text-sm">載入賽事登錄資料中...</div>
          ) : filteredAllRecords.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-sm">
              查無符合條件的賽事登錄紀錄。
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-xs text-zinc-400 uppercase bg-zinc-950/50">
                      <th className="py-3.5 px-3">#</th>
                      <th className="py-3.5 px-3">選手姓名 / 信譽</th>
                      <th className="py-3.5 px-3">運動團隊</th>
                      <th className="py-3.5 px-3">賽事日期</th>
                      <th className="py-3.5 px-3">距離項目</th>
                      <th className="py-3.5 px-3">賽事名稱</th>
                      <th className="py-3.5 px-3">參賽組別</th>
                      <th className="py-3.5 px-3">完賽時間</th>
                      <th className="py-3.5 px-3 text-right">認證狀態 / 監督</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredAllRecords.map((rec, index) => {
                      const vCount = violationMap[rec.user_id] || 0;
                      const rCount = rec.report_count || 0;
                      return (
                        <tr key={rec.id} className="hover:bg-zinc-800/40 transition">
                          <td className="py-3.5 px-3 font-mono text-xs text-zinc-500">{index + 1}</td>
                          <td className="py-3.5 px-3">
                            <div className="font-bold text-white flex items-center gap-2">
                              {rec.full_name}
                              {vCount > 0 ? (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/30 text-red-300 border border-red-500/40 font-bold">
                                  ⚠️ 違規 {vCount} 次
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                                  0 違規
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-xs text-zinc-300">{rec.team_name || "個人"}</td>
                          <td className="py-3.5 px-3 font-mono text-xs text-zinc-300">{rec.event_date}</td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                rec.sport_category === "triathlon"
                                  ? "bg-red-500/20 text-red-300"
                                  : "bg-emerald-500/20 text-emerald-300"
                              }`}
                            >
                              {rec.distance_type}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-zinc-200 font-medium">{rec.event_name}</td>
                          <td className="py-3.5 px-3 text-xs font-bold text-amber-400">
                            {rec.age_group || "-"}
                          </td>
                          <td className="py-3.5 px-3 font-mono font-black text-white">
                            {rec.finish_time}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {rCount > 0 ? (
                                <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  🔍 查核中 ({rCount})
                                </span>
                              ) : (
                                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                                  🛡️ 榮譽認證
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => setReportingRecord(rec)}
                                className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-red-950 text-zinc-300 hover:text-red-300 border border-zinc-700 hover:border-red-700 transition"
                              >
                                🚩 檢舉
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 gap-3 md:hidden">
                {filteredAllRecords.map((rec, index) => {
                  const vCount = violationMap[rec.user_id] || 0;
                  const rCount = rec.report_count || 0;
                  return (
                    <div
                      key={rec.id}
                      className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base">
                            #{index + 1} {rec.full_name}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              vCount > 0
                                ? "bg-red-500/30 text-red-300"
                                : "bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            違規 {vCount} 次
                          </span>
                        </div>
                        <span className="font-mono font-black text-amber-400 text-base">
                          {rec.finish_time}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-200 font-medium">{rec.event_name}</div>
                      <div className="flex flex-wrap items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-900 gap-2">
                        <span>📅 {rec.event_date} ｜ 🛡️ {rec.team_name || "個人"}</span>
                        <div className="flex items-center gap-2">
                          {rCount > 0 && (
                            <span className="text-[11px] text-amber-400">查核中({rCount})</span>
                          )}
                          <button
                            type="button"
                            onClick={() => setReportingRecord(rec)}
                            className="px-2.5 py-1 rounded bg-zinc-800 text-red-300 text-xs"
                          >
                            🚩 檢舉不實
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 檢舉不實資料彈出視窗 (Modal) */}
      {reportingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full p-6 space-y-5 text-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                  COMMUNITY REPORT SYSTEM
                </span>
                <h3 className="text-lg font-black mt-0.5">檢舉不實完賽紀錄</h3>
              </div>
              <button
                type="button"
                onClick={() => setReportingRecord(null)}
                className="text-zinc-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-1">
              <div className="text-zinc-400">
                被檢舉選手：<strong className="text-white">{reportingRecord.full_name}</strong>（目前累計違規：{violationMap[reportingRecord.user_id] || 0} 次）
              </div>
              <div className="text-zinc-400">
                賽事名稱：<strong className="text-amber-400">{reportingRecord.event_name}</strong> ({reportingRecord.event_date})
              </div>
              <div className="text-zinc-400">
                登錄成績：<strong className="text-white font-mono">{reportingRecord.finish_time}</strong>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
              💡 <strong>友善提醒：</strong>本平台為榮譽認證，許多早期完賽選手已遺忘多年前的確切完賽秒數。<strong>若該選手確實有完賽、僅為時間記憶誤差，請勿檢舉</strong>；本機制專為打擊「未參賽造假」或「DNF/DNS 未完賽冒充完賽」而設。
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  檢舉事由類別 *
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-sm text-white"
                >
                  <option value="fake_entry">未參賽卻虛偽造假登錄（查無此人參賽）</option>
                  <option value="dnf_dns">未完賽（DNF 失格 / DNS 未出賽）卻冒稱完賽</option>
                  <option value="other">其他嚴重影響百鐵榮譽之造假情事</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  具體說明或官方成績佐證連結 *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="請簡述檢舉理由（例如：附上該場比賽官方成績查詢結果、號碼布不符或未完賽證明）..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-sm text-white placeholder-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  您的聯絡 Email（選填，僅供內部查核聯繫，絕不公開）
                </label>
                <input
                  type="email"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-sm text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReportingRecord(null)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={reportSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-black text-white shadow-lg disabled:opacity-50"
                >
                  {reportSubmitting ? "送出檢舉中..." : "確認送出檢舉"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}