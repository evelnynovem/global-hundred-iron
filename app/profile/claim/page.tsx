"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function ClaimRecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchClaimableData() {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user;

        if (!currentUser || !currentUser.email) {
          setErrorMessage("請先登入會員才能進行成績認領。");
          setIsLoading(false);
          return;
        }

        const email = currentUser.email;
        setUserEmail(email);

        const { data, error } = await supabase
          .from("race_details_full")
          .select("*")
          .eq("login_email", email);

        if (error) {
          console.error("查詢歷史成績發生錯誤:", error);
          setErrorMessage("無法讀取歷史成績：" + error.message);
        } else if (data) {
          const formatted = data.map((item: any) => ({
            ...item,
            selected: false,
          }));
          setRecords(formatted);
        }
      } catch (err: any) {
        console.error(err);
        setErrorMessage("系統發生未預期錯誤：" + err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchClaimableData();
  }, [supabase]);

  const handleToggleSelectAll = () => {
    const nextState = !isAllSelected;
    setIsAllSelected(nextState);
    setRecords(records.map(r => ({ ...r, selected: nextState })));
  };

  const handleToggleOne = (id: string | number) => {
    setRecords(records.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  const handleSubmitClaim = async () => {
    const selectedRecords = records.filter(r => r.selected);
    if (selectedRecords.length === 0) {
      alert("請至少選擇一筆要認領的紀錄！");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("尚未登入，請重新整理頁面。");

      // 檢查 user_records 表格寫入
      const insertData = selectedRecords.map(r => ({
        user_id: user.id,
        event_name: r.race_name || "",
        category: r.participating_categories || "",
        match_date: r.race_date || "",
        result_time: r.finish_time || "",
        bib_number: r.bib || "",
        team_name: r.sport_team || "",
      }));

      console.log("準備寫入認領資料:", insertData);

      const { error: insertError } = await supabase.from("user_records").insert(insertData);
      if (insertError) {
        throw new Error("資料庫寫入失敗: " + insertError.message);
      }

      setSuccessMessage(`🎉 成功認領 ${selectedRecords.length} 筆歷史完賽紀錄！已自動匯入您的個人百鐵履歷。`);
    } catch (err: any) {
      console.error("認領異常:", err);
      setErrorMessage("認領失敗：" + (err.message || "未知錯誤"));
      alert("認領失敗：" + (err.message || "未知錯誤"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="border-b border-slate-800 pb-6">
          <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
            Legacy Records Claim
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-2">
            舊官網歷史成績智慧認領
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            目前登入帳號：<span className="text-amber-400 font-mono">{userEmail || "載入中..."}</span>。請自由勾選您想認領的特定完賽紀錄。
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm font-semibold">
            ⚠️ {errorMessage}
          </div>
        )}

        {successMessage ? (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-8 text-center space-y-4">
            <div className="text-emerald-400 font-bold text-lg">{successMessage}</div>
            <Link
              href="/profile"
              className="inline-block rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition"
            >
              返回會員個人中心
            </Link>
          </div>
        ) : isLoading ? (
          <div className="text-center py-20 text-slate-400">正在讀取您的專屬完賽資料庫，請稍候...</div>
        ) : records.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
            <p className="text-slate-300">目前沒有找到與您的登入信箱 ({userEmail}) 相符的歷史完賽紀錄。</p>
            <Link
              href="/profile"
              className="inline-block rounded-lg bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition"
            >
              返回個人中心
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="text-sm text-slate-300">
                總共找到 <span className="font-bold text-amber-400">{records.length}</span> 筆完賽資料，已勾選 <span className="font-bold text-emerald-400">{records.filter(r => r.selected).length}</span> 筆
              </div>
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
              >
                {isAllSelected ? "取消全選" : "一鍵全選所有紀錄"}
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
              <div className="divide-y divide-slate-800/80">
                {records.map((record) => (
                  <div
                    key={record.id || record.race_name + record.race_date}
                    onClick={() => handleToggleOne(record.id)}
                    className={`flex items-center justify-between p-4 sm:p-6 cursor-pointer transition ${
                      record.selected ? "bg-amber-500/5" : "hover:bg-slate-900/80"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={record.selected}
                        onChange={() => {}} 
                        className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500 cursor-pointer"
                      />
                      <div>
                        <div className="font-bold text-white text-base">{record.race_name}</div>
                        <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                          <span>組別：{record.participating_categories}</span>
                          <span>日期：{record.race_date}</span>
                          <span>時間：{record.finish_time || "完賽"}</span>
                          {record.bib && <span className="text-amber-400/90">號碼布：{record.bib}</span>}
                          {record.sport_team && <span className="text-amber-400/90">運動團體：{record.sport_team}</span>}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        record.selected ? "bg-amber-500/20 text-amber-400" : "bg-slate-800 text-slate-400"
                      }`}>
                        {record.selected ? "將會認領" : "略過"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Link
                href="/profile"
                className="rounded-lg border border-slate-700 bg-slate-800 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition"
              >
                返回個人中心
              </Link>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitClaim}
                className="rounded-lg bg-amber-500 px-8 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 transition disabled:opacity-50"
              >
                {isSubmitting ? "認領處理中..." : "確認送出勾選認領"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
