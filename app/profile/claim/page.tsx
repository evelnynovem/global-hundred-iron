"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface ClaimableRecord {
  id: string | number;
  event_name: string;
  category: string;
  match_date: string;
  result_time: string;
  bib_number: string;
  team_name: string;
  selected: boolean;
}

export default function ClaimRecordsPage() {
  const [records, setRecords] = useState<ClaimableRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAllSelected, setIsAllSelected] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    async function fetchClaimableData() {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setErrorMessage("請先登入會員才能進行成績認領。");
          setIsLoading(false);
          return;
        }

        const userEmail = user.email;
        const userName = user.user_metadata?.name || "";
        const userBirthday = user.user_metadata?.birthday || "";

        let query = supabase.from("legacy_results").select("*").eq("claimed", false);

        if (userEmail && userName && userBirthday) {
          query = query.or(`email.eq.${userEmail},and(name.eq.${userName},birthday.eq.${userBirthday})`);
        } else if (userEmail) {
          query = query.eq("email", userEmail);
        } else {
          query = query.and(`name.eq.${userName},birthday.eq.${userBirthday}`);
        }

        const { data, error } = await query;

        if (error) {
          console.error("查詢舊成績發生錯誤:", error);
          setErrorMessage("無法讀取歷史成績，請稍後再試。");
        } else if (data) {
          const formatted = data.map((item: any) => ({
            ...item,
            selected: true,
          }));
          setRecords(formatted);
          setIsAllSelected(true);
        }
      } catch (err) {
        console.error(err);
        setErrorMessage("系統發生未預期錯誤。");
      } finally {
        setIsLoading(false);
      }
    }

    fetchClaimableData();
  }, []);

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
      if (!user) throw new Error("尚未登入");

      const insertData = selectedRecords.map(r => ({
        user_id: user.id,
        event_name: r.event_name,
        category: r.category,
        match_date: r.match_date,
        result_time: r.result_time,
        bib_number: r.bib_number,
        team_name: r.team_name,
      }));

      const { error: insertError } = await supabase.from("user_records").insert(insertData);
      if (insertError) throw insertError;

      const selectedIds = selectedRecords.map(r => r.id);
      const { error: updateError } = await supabase
        .from("legacy_results")
        .update({ claimed: true })
        .in("id", selectedIds);

      if (updateError) throw updateError;

      setSuccessMessage(`成功認領 ${selectedRecords.length} 筆歷史完賽紀錄！已自動匯入您的個人百鐵履歷。`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage("認領失敗：" + (err.message || "未知錯誤"));
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
            我們已透過您的 Email 與身分資料自動對應到您過去在舊網站的完賽紀錄（包含號碼布與運動團體）。請確認下方清單後進行認領。
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm">
            {errorMessage}
          </div>
        )}

        {successMessage ? (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-8 text-center space-y-4">
            <div className="text-emerald-400 font-bold text-lg">🎉 認領成功！</div>
            <p className="text-sm text-slate-300">{successMessage}</p>
            <Link
              href="/profile"
              className="inline-block rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition"
            >
              返回會員個人中心
            </Link>
          </div>
        ) : isLoading ? (
          <div className="text-center py-20 text-slate-400">正在智慧比對您的舊成績資料庫，請稍候...</div>
        ) : records.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
            <p className="text-slate-300">目前沒有找到尚未認領的歷史完賽紀錄，或您的資料已全部認領完畢。</p>
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
                找到 <span className="font-bold text-amber-400">{records.length}</span> 筆符合您身分的歷史完賽資料
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
                        <div className="font-bold text-white text-base">{record.event_name}</div>
                        <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                          <span>組別：{record.category}</span>
                          <span>日期：{record.match_date}</span>
                          <span>時間：{record.result_time}</span>
                          {record.bib_number && <span className="text-amber-400/90">號碼布：{record.bib_number}</span>}
                          {record.team_name && <span className="text-amber-400/90">運動團體：{record.team_name}</span>}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        record.selected ? "bg-amber-500/20 text-amber-400" : "bg-slate-800 text-slate-400"
                      }`}>
                        {record.selected ? "將會認領" : "不認領"}
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
                暫不認領，返回
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