"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

interface HistoryResult {
  id: string;
  event_name: string;
  event_date: string;
  full_name: string;
  team_name: string;
  distance_type: string;
  finish_time: string;
}

export default function AssociationPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<"announcements" | "results">("announcements");

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [historyResults, setHistoryResults] = useState<HistoryResult[]>([]);
  const [searchKw, setSearchKw] = useState("");

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("公告");
  const [submittingAnn, setSubmittingAnn] = useState(false);

  const [resEventName, setResEventName] = useState("");
  const [resEventDate, setResEventDate] = useState("2025-10-18");
  const [resFullName, setResFullName] = useState("");
  const [resTeamName, setResTeamName] = useState("");
  const [resDistance, setResDistance] = useState("51.5K 標準鐵人");
  const [resFinishTime, setResFinishTime] = useState("02:45:00");
  const [submittingRes, setSubmittingRes] = useState(false);

  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);
  const [batchFileName, setBatchFileName] = useState("");

  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile && profile.role === "admin") {
          setIsAdmin(true);
        }
      }

      const { data: anns } = await supabase
        .from("association_announcements")
        .select("*")
        .order("created_at", { ascending: false });
      if (anns) setAnnouncements(anns);

      const { data: results } = await supabase
        .from("association_history_results")
        .select("*")
        .order("event_date", { ascending: false });
      if (results) setHistoryResults(results);

      setLoading(false);
    }
    loadData();
  }, [supabase]);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAnn(true);
    const { data, error } = await supabase
      .from("association_announcements")
      .insert([{ title: newTitle, content: newContent, category: newCategory }])
      .select()
      .single();

    if (error) {
      setFeedback("新增公告失敗：" + error.message);
    } else {
      setFeedback("✅ 成功發布新公告！");
      if (data) setAnnouncements([data, ...announcements]);
      setNewTitle("");
      setNewContent("");
    }
    setSubmittingAnn(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleCreateResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRes(true);
    const { data, error } = await supabase
      .from("association_history_results")
      .insert([
        {
          event_name: resEventName,
          event_date: resEventDate,
          full_name: resFullName,
          team_name: resTeamName,
          distance_type: resDistance,
          finish_time: resFinishTime,
        },
      ])
      .select()
      .single();

    if (error) {
      setFeedback("新增歷史成績失敗：" + error.message);
    } else {
      setFeedback("✅ 成功上傳歷史成績！");
      if (data) setHistoryResults([data, ...historyResults]);
      setResFullName("");
      setResTeamName("");
    }
    setSubmittingRes(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  // 透過原生瀏覽器 FileReader 解析 CSV 檔案
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBatchFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split("\n").filter((l) => l.trim() !== "");
        if (lines.length < 2) {
          setFeedback("❌ 檔案內容過少或格式不正確。");
          return;
        }

        const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
        const rows = [];

        for (let i = 1; i < lines.length; i++) {
          const currentLine = lines[i].split(",").map((val) => val.trim().replace(/^"|"$/g, ""));
          const rowObj: any = {};
          headers.forEach((h, idx) => {
            rowObj[h] = currentLine[idx] || "";
          });
          rows.push(rowObj);
        }

        const formatted = rows.map((row: any) => {
          return {
            event_name: row["賽事名稱（必填）"] || row["賽事名稱"] || "台東城鄉盃賽事",
            event_date: row["賽事日期（必填）"] || row["賽事日期"] || new Date().toISOString().split("T")[0],
            full_name: row["姓名（必填）"] || row["姓名"] || "未具名",
            team_name: row["所屬團隊（非必填）"] || row["所屬團隊"] || "",
            distance_type: row["參賽組別（必填）"] || row["參賽組別"] || "51.5K 標準鐵人",
            finish_time: row["完賽時間（必填）"] || row["完賽時間"] || "00:00:00",
          };
        });

        setParsedRows(formatted);
        setFeedback(`📁 成功解析檔案！共讀取到 ${formatted.length} 筆選手成績，請確認下方預覽無誤後點擊批次上傳。`);
      } catch (err: any) {
        setFeedback("❌ 檔案解析失敗：" + err.message);
      }
    };

    reader.readAsText(file, "utf-8");
  };

  const handleConfirmBatchUpload = async () => {
    if (parsedRows.length === 0) return;
    setIsUploadingBatch(true);

    const { error } = await supabase.from("association_history_results").insert(parsedRows);

    if (error) {
      setFeedback("❌ 批次上傳資料庫失敗：" + error.message);
    } else {
      setFeedback(`🎉 成功批次上傳 ${parsedRows.length} 筆選手歷史成績！`);
      const { data: results } = await supabase
        .from("association_history_results")
        .select("*")
        .order("event_date", { ascending: false });
      if (results) setHistoryResults(results);
      setParsedRows([]);
      setBatchFileName("");
    }
    setIsUploadingBatch(false);
  };

  const filteredResults = historyResults.filter((r) => {
    const kw = searchKw.trim().toLowerCase();
    return (
      !kw ||
      r.full_name.toLowerCase().includes(kw) ||
      r.event_name.toLowerCase().includes(kw) ||
      (r.team_name && r.team_name.toLowerCase().includes(kw))
    );
  });

  if (loading) {
    return <div className="min-h-[70vh] flex items-center justify-center text-gray-500">載入協會專區中...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <section className="border-b border-zinc-800 bg-gradient-to-b from-black to-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-black tracking-[0.25em] text-orange-500 uppercase">
              TAITUNG URBAN & RURAL SPORTS ASSOCIATION
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              台東城鄉生活運動協會專區
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              提供協會官方賽事公告事項發布、歷史選手完賽成績查詢與 CSV 成績批次上傳。
            </p>
          </div>
          {isAdmin && (
            <div className="px-3 py-1.5 bg-orange-500/20 text-orange-300 border border-orange-500/40 rounded-xl text-xs font-bold shrink-0">
              👑 工作人員模式已解鎖
            </div>
          )}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {feedback && (
          <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-200 text-sm font-bold leading-relaxed">
            {feedback}
          </div>
        )}

        <div className="flex bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 max-w-md">
          <button
            type="button"
            onClick={() => setActiveTab("announcements")}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === "announcements" ? "bg-orange-600 text-white shadow" : "text-zinc-400 hover:text-white"
            }`}
          >
            📢 賽事公告事項 ({announcements.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("results")}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === "results" ? "bg-orange-600 text-white shadow" : "text-zinc-400 hover:text-white"
            }`}
          >
            🏆 歷史選手成績 ({historyResults.length})
          </button>
        </div>

        {activeTab === "announcements" && (
          <div className="space-y-6">
            {isAdmin && (
              <div className="bg-zinc-900 border border-orange-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
                <h2 className="text-lg font-black text-orange-400">【工作人員專用】發布新賽事公告</h2>
                <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-zinc-300 mb-1">公告標題 *</label>
                      <input
                        type="text"
                        required
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="例如：2026台東城鄉盃鐵人三項競賽規程公告"
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">分類 *</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-sm text-white"
                      >
                        <option value="公告">一般公告</option>
                        <option value="賽事">賽事資訊</option>
                        <option value="成績">成績公告</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">公告內容詳細說明 *</label>
                    <textarea
                      required
                      rows={4}
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="請輸入公告內容..."
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-sm text-white"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingAnn}
                      className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl text-xs transition disabled:opacity-50 shadow"
                    >
                      {submittingAnn ? "發布中..." : "確認發布公告"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {announcements.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-sm">目前尚無任何賽事公告。</div>
              ) : (
                announcements.map((item) => (
                  <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-3 shadow">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30">
                        {item.category}
                      </span>
                      <span className="font-mono text-zinc-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "results" && (
          <div className="space-y-6">
            {isAdmin && (
              <div className="bg-zinc-900 border border-orange-500/30 rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="border-b border-zinc-800 pb-3">
                  <h2 className="text-lg font-black text-orange-400">【工作人員專用】歷史成績上傳中心</h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    支援上傳您的 .csv 成績單檔案，系統將自動解析與美化預覽。
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-zinc-950 border-2 border-dashed border-zinc-700 text-center space-y-3">
                  <div className="text-3xl">📁</div>
                  <div>
                    <label className="inline-block px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs cursor-pointer transition shadow">
                      選擇 CSV 成績檔案
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-zinc-400 mt-2">
                      {batchFileName ? `已選擇檔案：${batchFileName}` : "支援上傳您的賽事成績 CSV 檔案"}
                    </p>
                  </div>
                </div>

                {parsedRows.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-orange-300">
                        📊 檔案解析預覽（共準備匯入 {parsedRows.length} 筆選手成績）
                      </div>
                      <button
                        type="button"
                        disabled={isUploadingBatch}
                        onClick={handleConfirmBatchUpload}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-lg transition disabled:opacity-50"
                      >
                        {isUploadingBatch ? "批次寫入中..." : `確認批次匯入 ${parsedRows.length} 筆資料`}
                      </button>
                    </div>

                    <div className="max-h-60 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-900 sticky top-0 text-zinc-400 uppercase">
                          <tr>
                            <th className="py-2.5 px-3">日期</th>
                            <th className="py-2.5 px-3">賽事名稱</th>
                            <th className="py-2.5 px-3">姓名</th>
                            <th className="py-2.5 px-3">團隊</th>
                            <th className="py-2.5 px-3">組別</th>
                            <th className="py-2.5 px-3 text-right">完賽時間</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                          {parsedRows.slice(0, 50).map((row, idx) => (
                            <tr key={idx} className="hover:bg-zinc-900/50">
                              <td className="py-2 px-3 font-mono text-zinc-400">{row.event_date}</td>
                              <td className="py-2 px-3 text-white font-medium">{row.event_name}</td>
                              <td className="py-2 px-3 text-white font-bold">{row.full_name}</td>
                              <td className="py-2 px-3 text-zinc-400">{row.team_name || "個人"}</td>
                              <td className="py-2 px-3 text-orange-400">{row.distance_type}</td>
                              <td className="py-2 px-3 font-mono text-amber-400 text-right">{row.finish_time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-base font-black text-white">歷史選手完賽成績檢索 ({historyResults.length})</h2>
                <input
                  type="text"
                  value={searchKw}
                  onChange={(e) => setSearchKw(e.target.value)}
                  placeholder="輸入選手姓名、賽事或團隊搜尋..."
                  className="px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 w-full sm:w-72"
                />
              </div>

              {filteredResults.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-sm">查無符合條件的歷史成績紀錄。</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 text-xs text-zinc-400 uppercase bg-zinc-950">
                        <th className="py-3 px-3">賽事日期</th>
                        <th className="py-3 px-3">賽事名稱</th>
                        <th className="py-3 px-3">選手姓名</th>
                        <th className="py-3 px-3">團隊</th>
                        <th className="py-3 px-3">組別距離</th>
                        <th className="py-3 px-3 text-right">完賽時間</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {filteredResults.map((r) => (
                        <tr key={r.id} className="hover:bg-zinc-800/40 transition">
                          <td className="py-3 px-3 font-mono text-xs text-zinc-400">{r.event_date}</td>
                          <td className="py-3 px-3 text-zinc-200 font-medium">{r.event_name}</td>
                          <td className="py-3 px-3 font-bold text-white">{r.full_name}</td>
                          <td className="py-3 px-3 text-xs text-zinc-400">{r.team_name || "個人"}</td>
                          <td className="py-3 px-3 text-xs">
                            <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-bold">
                              {r.distance_type}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-black text-amber-400 text-right">
                            {r.finish_time}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}