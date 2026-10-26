"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function ClaimRecordsPage() {
  const [tab, setTab] = useState<"triathlon" | "cycling">("triathlon");
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

        // 根據目前的分頁選擇查詢 triathlon 或 cycling 資料表
        const tableName = tab === "triathlon" ? "race_details_full" : "cycling_details_full";
        const { data, error } = await supabase
          .from(tableName)
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
          setIsAllSelected(false);
        }
      } catch (err: any) {
        console.error(err);
        setErrorMessage("系統發生未預期錯誤：" + err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchClaimableData();
  }, [tab, supabase]);

  const handleToggleSelectAll = () => {
    const nextState = !isAllSelected;
    setIsAllSelected(nextState);
    setRecords(records.map(r => ({ ...r, selected: nextState })));
  };

  const handleToggleOne = (id: string | number) => {
    setRecords(records.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  const handleSubmitClaim = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const selectedRecords = records.filter(r => r.selected);

    if (selectedRecords.length === 0) {
      alert("⚠️ 請至少勾選一筆要認領的完賽紀錄！");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("尚未登入，請重新登入會員。");

      const insertData = selectedRecords.map(r => ({
        user_id: user.id,
        event_name: r.race_name || "",
        category: r.participating_categories || "",
        match_date: r.race_date || "",
        result_time: r.finish_time || "",
        sport_type: tab, // 標記是 triathlon 還是 cycling
      }));

      // 防呆檢查：確認同日是否有重複
      for (const item of insertData) {
        const { data: dup } = await supabase
          .from("user_records")
          .select("id")
          .eq("user_id", user.id)
          .eq("match_date", item.match_date)
          .eq("event_name", item.event_name);
        
        if (dup && dup.length > 0) {
          throw new Error(`防呆攔截：賽事「${item.event_name}」於 ${item.match_date} 已在您的履歷中，無法重複認領！`);
        }
      }

      const { error: insertError } = await supabase.from("user_records").insert(insertData);
      if (insertError) {
        throw new Error("資料庫寫入失敗: " + insertError.message);
      }

      const msg = `🎉 成功認領 ${selectedRecords.length} 筆${tab === 'triathlon' ? '鐵人三項' : '公路車'}歷史完賽紀錄！`;
      setSuccessMessage(msg);
      alert(msg);
    } catch (err: any) {
      console.error("認領異常:", err);
      setErrorMessage("認領失敗：" + (err.message || "未知錯誤"));
      alert("❌ 認領失敗：" + (err.message || "未知錯誤"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
              Legacy Records Claim
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-2">
              歷史成績智慧認領
            </h1>
          </div>
          <Link href="/profile" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-xl transition">
            ← 返回會員中心
          </Link>
        </div>

        {/* 切換三鐵 / 公路車分頁 */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setTab("triathlon")}
            className={`flex-1 py-3 text-center font-bold text-sm transition border-b-2 ${
              tab === "triathlon" ? "border-amber-400 text-amber-400 bg-amber-500/5" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            🏊‍♂️ 鐵人三項歷史成績認領
          </button>
          <button
            onClick={() => setTab("cycling")}
            className={`flex-1 py-3 text-center font-bold text-sm transition border-b-2 ${
              tab === "cycling" ? "border-amber-400 text-amber-400 bg-amber-500/5" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            🚴‍♂️ 公路單車(百鐵馬)歷史成績認領
          </button>
        </div>

        {errorMessage && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm font-semibold">
            ⚠️ {errorMessage}
          </div>
        )}

        {successMessage ? (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-8 text-center space-y-4">
            <div className="text-emerald-400 font-bold text-xl">{successMessage}</div>
            <Link
              href="/profile"
              className="inline-block rounded-lg bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition"
            >
              返回會員個人中心查看履歷
            </Link>
          </div>
        ) : isLoading ? (
          <div className="text-center py-20 text-slate-400">正在讀取您的專屬完賽資料庫，請稍候...</div>
        ) : records.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
            <p className="text-slate-300">目前沒有找到與您的登入信箱 ({userEmail}) 相符的{tab === 'triathlon' ? '鐵人三項' : '公路車'}歷史完賽紀錄。</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="text-sm text-slate-300">
                找到 <span className="font-bold text-amber-400">{records.length}</span> 筆紀錄，已勾選 <span className="font-bold text-emerald-400">{records.filter(r => r.selected).length}</span> 筆
              </div>
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
              >
                {isAllSelected ? "取消全選" : "一鍵全選"}
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
              <div className="divide-y divide-slate-800/80">
                {records.map((record) => (
                  <div
                    key={record.id}
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
                          {record.sport_team && <span className="text-amber-400/90">團隊：{record.sport_team}</span>}
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
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitClaim}
                className="rounded-lg bg-amber-500 px-8 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 transition disabled:opacity-50 cursor-pointer shadow-lg"
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
