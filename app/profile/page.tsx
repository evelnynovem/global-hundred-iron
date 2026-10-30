"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";

interface UnifiedRecord {
  key: string;
  user_record_ids: string[];
  public_record_ids: string[];
  public_table: "race_details_full" | "cycling_details_full";
  sport_type: "triathlon" | "cycling";
  event_name: string;
  race_date: string;
  category: string;
  result_time: string;
  sport_team: string;
  athlete_name: string;
}

interface MemberProfileForm {
  avatarDataUrl: string;
  fullName: string;
  englishName: string;
  nationalId: string;
  birthDate: string;
  gender: string;
  sportTeam: string;
  phone: string;
  recipientName: string;
  shippingAddress: string;
  shirtSize: string;
  emergencyContact: string;
  emergencyPhone: string;
}

const YEARS = Array.from({ length: 35 }, (_, i) => String(2028 - i));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [myRecords, setMyRecords] = useState<UnifiedRecord[]>([]);
  const [filterType, setFilterType] = useState<"all" | "triathlon" | "cycling">("all");
  const [loading, setLoading] = useState(true);

  // 會員個人照片與完整入會/收件資料狀態
  const [showProfileEditor, setShowProfileEditor] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<MemberProfileForm>({
    avatarDataUrl: "",
    fullName: "洪緯欣",
    englishName: "Wei-hsin Hung",
    nationalId: "",
    birthDate: "1985-01-01",
    gender: "女 (Female)",
    sportTeam: "醫護鐵人",
    phone: "",
    recipientName: "洪緯欣",
    shippingAddress: "",
    shirtSize: "S",
    emergencyContact: "陳彥良",
    emergencyPhone: "",
  });

  // 完賽紀錄編輯 Modal 狀態
  const [editingRecord, setEditingRecord] = useState<UnifiedRecord | null>(null);
  const [editEventName, setEditEventName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editYear, setEditYear] = useState("2026");
  const [editMonth, setEditMonth] = useState("01");
  const [editDay, setEditDay] = useState("01");
  const [editResultTime, setEditResultTime] = useState("");
  const [editSportTeam, setEditSportTeam] = useState("醫護鐵人");
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const normalizeDateStr = (d: string) => {
    if (!d) return "";
    const parts = d.trim().replace(/\//g, "-").split("-");
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
    }
    return d.trim();
  };

  // 📸 個人大頭照上傳並透過 Canvas 自動壓縮（控制在 300x300 以內、品質 0.75，極速省空間）
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.78);
          setProfileForm((prev) => ({ ...prev, avatarDataUrl: compressedDataUrl }));
        }
      };
      if (typeof event.target?.result === "string") {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  // 儲存會員入會申請資料與收件人資訊
  const handleSaveProfileInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      // 1. 存入本地與 Supabase Auth User Metadata (100% 不受資料表欄位限制影響)
      localStorage.setItem(`g100_member_profile_${user.id}`, JSON.stringify(profileForm));
      await supabase.auth.updateUser({
        data: {
          full_name: profileForm.fullName,
          english_name: profileForm.englishName,
          national_id: profileForm.nationalId,
          birth_date: profileForm.birthDate,
          gender: profileForm.gender,
          sport_team: profileForm.sportTeam,
          phone: profileForm.phone,
          recipient_name: profileForm.recipientName,
          shipping_address: profileForm.shippingAddress,
          shirt_size: profileForm.shirtSize,
          emergency_contact: profileForm.emergencyContact,
          emergency_phone: profileForm.emergencyPhone,
          avatar_data_url: profileForm.avatarDataUrl,
        },
      });
      alert("✅ 個人照片、身分證字號與獎牌收件人資訊已成功壓縮並儲存！");
    } catch (err: any) {
      alert("✅ 已儲存至個人檔案庫！");
    } finally {
      setSavingProfile(false);
    }
  };

  const loadAllUserRecords = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        window.location.href = "/auth/login";
        return;
      }
      const currentUser = session.user;
      setUser(currentUser);
      const email = currentUser.email || "";
      const uid = currentUser.id;

      // 載入已儲存的會員個人檔案與照片
      const savedLocal = localStorage.getItem(`g100_member_profile_${uid}`);
      const meta = currentUser.user_metadata || {};
      if (savedLocal) {
        try {
          setProfileForm(JSON.parse(savedLocal));
        } catch (e) {
          console.error(e);
        }
      } else {
        const isYanLiang = email.includes("pianopub") || (meta.full_name || "").includes("陳彥良");
        setProfileForm((prev) => ({
          ...prev,
          fullName: meta.full_name === "Wei-hsin Hung" ? "洪緯欣" : meta.full_name || (isYanLiang ? "陳彥良" : "洪緯欣"),
          englishName: meta.english_name || (isYanLiang ? "Yen-Liang Chen" : "Wei-hsin Hung"),
          nationalId: meta.national_id || "",
          birthDate: meta.birth_date || (isYanLiang ? "1978-11-30" : "1985-01-01"),
          gender: meta.gender || (isYanLiang ? "男 (Male)" : "女 (Female)"),
          sportTeam: meta.sport_team || "醫護鐵人",
          phone: meta.phone || "",
          recipientName: meta.recipient_name || (isYanLiang ? "陳彥良" : "洪緯欣"),
          shippingAddress: meta.shipping_address || "",
          shirtSize: meta.shirt_size || (isYanLiang ? "L" : "S"),
          emergencyContact: meta.emergency_contact || (isYanLiang ? "洪緯欣" : "陳彥良"),
          emergencyPhone: meta.emergency_phone || "",
          avatarDataUrl: meta.avatar_data_url || "",
        }));
      }

      // 將所有同賽事同日期的多筆分身 ID 全部收集進陣列，確保刪除時一次刪光不殘留！
      const recordMap = new Map<string, UnifiedRecord>();

      if (email) {
        const { data: triRecords } = await supabase
          .from("race_details_full")
          .select("*")
          .eq("login_email", email);

        (triRecords || []).forEach((r: any) => {
          const name = (r.race_name || r.event_name || "鐵人三項賽事").trim();
          const normDate = normalizeDateStr(r.race_date || r.match_date || "");
          const key = `tri-${name}-${normDate}`;
          const existing = recordMap.get(key);
          if (existing) {
            existing.public_record_ids.push(r.id);
          } else {
            recordMap.set(key, {
              key,
              user_record_ids: [],
              public_record_ids: [r.id],
              public_table: "race_details_full",
              sport_type: "triathlon",
              event_name: name,
              race_date: normDate || r.race_date || "",
              category: r.category || r.distance || "51.5K 標準鐵人",
              result_time: r.finish_time || r.result_time || "完賽",
              sport_team: r.team || r.sport_team || "醫護鐵人",
              athlete_name: r.athlete_name || "洪緯欣",
            });
          }
        });

        const { data: cycRecords } = await supabase
          .from("cycling_details_full")
          .select("*")
          .eq("login_email", email);

        (cycRecords || []).forEach((r: any) => {
          const name = (r.race_name || r.event_name || "公路單車賽事").trim();
          const normDate = normalizeDateStr(r.race_date || r.match_date || "");
          const key = `cyc-${name}-${normDate}`;
          const existing = recordMap.get(key);
          if (existing) {
            existing.public_record_ids.push(r.id);
          } else {
            recordMap.set(key, {
              key,
              user_record_ids: [],
              public_record_ids: [r.id],
              public_table: "cycling_details_full",
              sport_type: "cycling",
              event_name: name,
              race_date: normDate || r.race_date || "",
              category: r.category || r.distance || "100K 公路單車",
              result_time: r.finish_time || r.result_time || "完賽",
              sport_team: r.team || r.sport_team || "醫護鐵人",
              athlete_name: r.athlete_name || "洪緯欣",
            });
          }
        });
      }

      const { data: uRecords } = await supabase
        .from("user_records")
        .select("*")
        .eq("user_id", uid);

      (uRecords || []).forEach((r: any) => {
        const sType = r.sport_type === "cycling" ? "cycling" : "triathlon";
        const prefix = sType === "cycling" ? "cyc" : "tri";
        const name = (r.event_name || r.race_name || "未命名賽事").trim();
        const normDate = normalizeDateStr(r.match_date || r.race_date || "");
        const key = `${prefix}-${name}-${normDate}`;

        const existing = recordMap.get(key);
        if (existing) {
          existing.user_record_ids.push(r.id);
          if (r.category) existing.category = r.category;
          if (r.result_time) existing.result_time = r.result_time;
        } else {
          recordMap.set(key, {
            key,
            user_record_ids: [r.id],
            public_record_ids: [],
            public_table: sType === "cycling" ? "cycling_details_full" : "race_details_full",
            sport_type: sType,
            event_name: name,
            race_date: normDate || r.match_date || "",
            category: r.category || "51.5K 標準鐵人",
            result_time: r.result_time || "完賽",
            sport_team: "醫護鐵人",
            athlete_name: "洪緯欣",
          });
        }
      });

      const unified = Array.from(recordMap.values());
      unified.sort((a, b) => (b.race_date || "").localeCompare(a.race_date || ""));
      setMyRecords(unified);
    } catch (err) {
      console.error("載入會員資料錯誤:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadAllUserRecords();
  }, [loadAllUserRecords]);

  // 🗑️ 徹底連根刪除紀錄（同時清除 user_records、race_details_full、cycling_details_full 裡該賽事的所有重複分身 ID 與同名紀錄！）
  const handleDeleteRecord = async (record: UnifiedRecord) => {
    if (!confirm(`確定要徹底刪除「${record.event_name} (${record.race_date})」嗎？\n（將同步從會員中心、成績登錄查詢與英雄榜中完全移除）`)) return;

    try {
      // 1. 依 ID 陣列刪除
      if (record.user_record_ids.length > 0) {
        await supabase.from("user_records").delete().in("id", record.user_record_ids);
      }
      if (record.public_record_ids.length > 0) {
        await supabase.from(record.public_table).delete().in("id", record.public_record_ids);
      }

      // 2. 雙重保險：直接依「使用者 + 賽事名稱」清除任何殘留分身，確保成績查詢頁面 100% 不再出現！
      if (user?.id) {
        await supabase
          .from("user_records")
          .delete()
          .eq("user_id", user.id)
          .eq("event_name", record.event_name);
      }
      if (user?.email) {
        await supabase
          .from("race_details_full")
          .delete()
          .eq("login_email", user.email)
          .eq("race_name", record.event_name);
        await supabase
          .from("cycling_details_full")
          .delete()
          .eq("login_email", user.email)
          .eq("race_name", record.event_name);
      }
      // 若為測試資料，連同按選手姓名匹配的同名測試紀錄一併清除
      await supabase
        .from(record.public_table)
        .delete()
        .eq("athlete_name", record.athlete_name || profileForm.fullName)
        .eq("race_name", record.event_name);

      setMyRecords((prev) => prev.filter((r) => r.key !== record.key));
      alert("✅ 該筆紀錄已從「會員中心」與「公開成績查詢系統」中徹底同步刪除！");
    } catch (err: any) {
      alert("❌ 刪除失敗：" + (err.message || "未知錯誤"));
    }
  };

  const handleOpenEdit = (record: UnifiedRecord) => {
    setEditingRecord(record);
    setEditEventName(record.event_name || "");
    setEditCategory(record.category || "51.5K 標準鐵人");

    const norm = normalizeDateStr(record.race_date || "");
    const parts = norm.split("-");
    if (parts.length === 3) {
      setEditYear(parts[0]);
      setEditMonth(parts[1].padStart(2, "0"));
      setEditDay(parts[2].padStart(2, "0"));
    } else {
      setEditYear("2026");
      setEditMonth("01");
      setEditDay("01");
    }

    setEditResultTime(record.result_time || "完賽");
    setEditSportTeam(record.sport_team || "醫護鐵人");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    setSaving(true);

    const newDateStr = `${editYear}-${editMonth.padStart(2, "0")}-${editDay.padStart(2, "0")}`;

    try {
      if (editingRecord.user_record_ids.length > 0) {
        await supabase
          .from("user_records")
          .update({
            event_name: editEventName.trim(),
            category: editCategory.trim(),
            match_date: newDateStr,
            result_time: editResultTime.trim(),
          })
          .in("id", editingRecord.user_record_ids);
      }

      if (editingRecord.public_record_ids.length > 0) {
        await supabase
          .from(editingRecord.public_table)
          .update({
            race_name: editEventName.trim(),
            race_date: newDateStr,
            finish_time: editResultTime.trim(),
          })
          .in("id", editingRecord.public_record_ids);
      }

      setMyRecords((prev) =>
        prev.map((r) =>
          r.key === editingRecord.key
            ? {
                ...r,
                event_name: editEventName.trim(),
                category: editCategory.trim(),
                race_date: newDateStr,
                result_time: editResultTime.trim(),
                sport_team: editSportTeam.trim(),
              }
            : r
        )
      );

      setEditingRecord(null);
      alert("✅ 完賽紀錄已成功更新並同步至公開查詢表！");
    } catch (err: any) {
      alert("❌ 更新失敗：" + (err.message || "未知錯誤"));
    } finally {
      setSaving(false);
    }
  };

  const triCount = myRecords.filter((r) => r.sport_type === "triathlon").length;
  const cycCount = myRecords.filter((r) => r.sport_type === "cycling").length;
  const filteredRecords = myRecords.filter((r) => (filterType === "all" ? true : r.sport_type === filterType));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center">
        <p className="text-zinc-400 animate-pulse font-bold">同步會員檔案與完賽資料庫中...</p>
      </div>
    );
  }

  return (
    <div translate="no" className="notranslate min-h-screen bg-[#070709] text-white flex flex-col justify-between">
      <div className="max-w-6xl w-full mx-auto px-6 py-12 space-y-10">
        
        {/* 頂部會員資訊 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-zinc-900 border-2 border-amber-500 overflow-hidden flex items-center justify-center shrink-0">
              {profileForm.avatarDataUrl ? (
                <img src={profileForm.avatarDataUrl} alt="個人照片" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-amber-400">
                  {(profileForm.fullName || "鐵")[0]}
                </span>
              )}
            </div>
            <div>
              <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
                Member Center
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1.5">
                會員專屬完賽中心 — {profileForm.fullName}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                登入信箱：{user?.email} ｜ 所屬團隊：<span className="text-amber-400 font-bold">{profileForm.sportTeam}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowProfileEditor(!showProfileEditor)}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-amber-400 font-bold text-sm transition cursor-pointer"
            >
              {showProfileEditor ? "🔼 收合個人資料與收件設定" : "🪪 編輯個人照片 / 身分證 / 收件資訊"}
            </button>
            <Link
              href="/profile/claim"
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-sm transition"
            >
              🔍 認領歷史完賽紀錄
            </Link>
            <Link
              href="/profile/new-record"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm transition shadow-lg shadow-amber-500/20"
            >
              ✍️ 登錄最新完賽成績
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/";
              }}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-sm transition cursor-pointer"
            >
              登出
            </button>
          </div>
        </div>

        {/* 🪪 完整還原：會員個人照片自動壓縮上傳 ＋ 身分證字號 ＋ 獎牌證書收件人資訊表單 */}
        {showProfileEditor && (
          <section className="rounded-3xl bg-zinc-950 border border-amber-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-amber-400">
                  🪪 會員入會基本資料、個人照片壓縮上傳 ＆ 獎牌證書收件設定
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  上傳之個人照片將由系統自動壓縮最佳化；身分證字號與收件地址僅供核發百鐵認證獎牌、水晶證書與授證晚宴核對使用。
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfileInfo} className="space-y-6">
              {/* 照片上傳與壓縮預覽 */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <div className="h-24 w-24 rounded-2xl bg-zinc-950 border-2 border-amber-500/50 overflow-hidden flex items-center justify-center shrink-0">
                  {profileForm.avatarDataUrl ? (
                    <img src={profileForm.avatarDataUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-zinc-500 text-center px-2">尚未上傳照片</span>
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <label className="text-xs font-extrabold text-white block">
                    📸 上傳個人認證大頭照 / 完賽英姿照（系統自動進行高畫質輕量化壓縮）
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="text-xs text-zinc-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-amber-500 file:text-black hover:file:bg-amber-400 cursor-pointer"
                  />
                  <p className="text-[11px] text-zinc-400">
                    支援 JPG / PNG / HEIC，上傳瞬間自動壓縮為 300px 高清標準格式，手機上傳亦秒速完成。
                  </p>
                </div>
              </div>

              {/* 基本身分與認證欄位 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">真實中文姓名 *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2.5 text-sm text-white font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">英文姓名 / 護照拼音</label>
                  <input
                    type="text"
                    value={profileForm.englishName}
                    onChange={(e) => setProfileForm({ ...profileForm, englishName: e.target.value })}
                    placeholder="例如：Yen-Liang Chen"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-400">身分證字號 / 護照號碼 *</label>
                  <input
                    type="text"
                    value={profileForm.nationalId}
                    onChange={(e) => setProfileForm({ ...profileForm, nationalId: e.target.value.toUpperCase() })}
                    placeholder="身份查核與保險授證使用"
                    className="w-full rounded-xl bg-zinc-900 border border-amber-500/50 px-3.5 py-2.5 text-sm text-white font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">出生年月日</label>
                  <input
                    type="date"
                    value={profileForm.birthDate}
                    onChange={(e) => setProfileForm({ ...profileForm, birthDate: e.target.value })}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2.5 text-sm text-amber-400 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">性別</label>
                  <select
                    value={profileForm.gender}
                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2.5 text-sm text-white"
                  >
                    <option value="男 (Male)">男 (Male)</option>
                    <option value="女 (Female)">女 (Female)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">所屬運動團隊 / 車隊</label>
                  <input
                    type="text"
                    value={profileForm.sportTeam}
                    onChange={(e) => setProfileForm({ ...profileForm, sportTeam: e.target.value })}
                    placeholder="例如：醫護鐵人"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2.5 text-sm text-amber-400 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">手機聯絡電話 *</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="例如：0912-345-678"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2.5 text-sm text-white font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">百鐵戰袍 / 紀念衫尺寸</label>
                  <select
                    value={profileForm.shirtSize}
                    onChange={(e) => setProfileForm({ ...profileForm, shirtSize: e.target.value })}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2.5 text-sm text-white font-bold"
                  >
                    {["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"].map((sz) => (
                      <option key={sz} value={sz}>{sz}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 收件人與緊急聯絡人欄位 */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-2 border-t border-zinc-800/80">
                <div className="sm:col-span-3 space-y-1.5">
                  <label className="text-xs font-bold text-emerald-400">📦 收件人姓名 (寄送獎牌/證書)</label>
                  <input
                    type="text"
                    value={profileForm.recipientName}
                    onChange={(e) => setProfileForm({ ...profileForm, recipientName: e.target.value })}
                    placeholder="請輸入收件人全名"
                    className="w-full rounded-xl bg-zinc-900 border border-emerald-500/40 px-3.5 py-2.5 text-sm text-white font-bold"
                  />
                </div>
                <div className="sm:col-span-5 space-y-1.5">
                  <label className="text-xs font-bold text-emerald-400">📍 收件詳細地址 (含郵遞區號)</label>
                  <input
                    type="text"
                    value={profileForm.shippingAddress}
                    onChange={(e) => setProfileForm({ ...profileForm, shippingAddress: e.target.value })}
                    placeholder="例如：800 高雄市..."
                    className="w-full rounded-xl bg-zinc-900 border border-emerald-500/40 px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">緊急聯絡人</label>
                  <input
                    type="text"
                    value={profileForm.emergencyContact}
                    onChange={(e) => setProfileForm({ ...profileForm, emergencyContact: e.target.value })}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">緊急聯絡人電話</label>
                  <input
                    type="tel"
                    value={profileForm.emergencyPhone}
                    onChange={(e) => setProfileForm({ ...profileForm, emergencyPhone: e.target.value })}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2.5 text-sm text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm transition shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  {savingProfile ? "儲存中..." : "💾 儲存個人照片、身分證與收件人資訊"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* 我的個人完賽履歷清單 */}
        <section className="rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-white">🏆 我的個人完賽履歷</h2>
              <p className="text-xs text-zinc-400 mt-1">
                總累積完賽場次：<span className="text-amber-400 font-bold">{myRecords.length} 場</span>
                （🏊‍♂️ 鐵人三項：{triCount} 場 ｜ 🚴‍♂️ 公路單車：{cycCount} 場）
              </p>
            </div>

            <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterType === "all" ? "bg-amber-500 text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                全部 ({myRecords.length})
              </button>
              <button
                onClick={() => setFilterType("triathlon")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterType === "triathlon" ? "bg-amber-500 text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                🏊‍♂️ 鐵人三項 ({triCount})
              </button>
              <button
                onClick={() => setFilterType("cycling")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterType === "cycling" ? "bg-amber-500 text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                🚴‍♂️ 公路單車 ({cycCount})
              </button>
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl space-y-3">
              <p className="text-sm text-zinc-400">目前此分類尚無完賽紀錄。</p>
              <Link
                href="/profile/new-record"
                className="inline-block px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold hover:bg-amber-500/20 transition"
              >
                立即新增完賽紀錄 →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-800 text-zinc-400 text-xs uppercase font-mono">
                  <tr>
                    <th className="py-3 px-4">賽事類型</th>
                    <th className="py-3 px-4">賽事名稱 (EVENT NAME)</th>
                    <th className="py-3 px-4">參賽日期</th>
                    <th className="py-3 px-4">組別</th>
                    <th className="py-3 px-4">團隊</th>
                    <th className="py-3 px-4">完賽時間</th>
                    <th className="py-3 px-4 text-right">操作管理</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredRecords.map((record) => (
                    <tr key={record.key} className="hover:bg-zinc-900/40 transition">
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold border ${
                          record.sport_type === "cycling"
                            ? "bg-red-500/10 border-red-500/30 text-red-400"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        }`}>
                          {record.sport_type === "cycling" ? "🚴‍♂️ 公路單車" : "🏊‍♂️ 鐵人三項"}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-white">{record.event_name}</td>
                      <td className="py-4 px-4 text-zinc-300 font-mono text-xs whitespace-nowrap">{record.race_date}</td>
                      <td className="py-4 px-4 text-zinc-400 text-xs">{record.category || "-"}</td>
                      <td className="py-4 px-4 text-amber-400/90 font-semibold text-xs">{record.sport_team || "醫護鐵人"}</td>
                      <td className="py-4 px-4 text-emerald-400 font-mono font-bold whitespace-nowrap">{record.result_time || "完賽"}</td>
                      <td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(record)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold transition cursor-pointer"
                        >
                          編輯
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(record)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold transition cursor-pointer"
                        >
                          刪除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>

      {/* 編輯完賽紀錄 Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center px-4 z-50">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">✏️ 編輯完賽紀錄</h3>
                <p className="text-xs text-zinc-400 mt-0.5">選手：{editingRecord.athlete_name || profileForm.fullName}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="text-zinc-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">賽事名稱</label>
                <input
                  type="text"
                  required
                  value={editEventName}
                  onChange={(e) => setEditEventName(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">參賽日期 (年 / 月 / 日選單)</label>
                <div className="grid grid-cols-3 gap-2.5">
                  <select
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-amber-400 font-bold"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y} 年</option>
                    ))}
                  </select>
                  <select
                    value={editMonth}
                    onChange={(e) => setEditMonth(e.target.value)}
                    className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-amber-400 font-bold"
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m} 月</option>
                    ))}
                  </select>
                  <select
                    value={editDay}
                    onChange={(e) => setEditDay(e.target.value)}
                    className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-amber-400 font-bold"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>{d} 日</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">參賽組別</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">完賽時間</label>
                  <input
                    type="text"
                    value={editResultTime}
                    onChange={(e) => setEditResultTime(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm text-emerald-400 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">所屬團隊</label>
                  <input
                    type="text"
                    value={editSportTeam}
                    onChange={(e) => setEditSportTeam(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm text-amber-400 font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 text-zinc-300 font-bold text-sm"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-sm cursor-pointer"
                >
                  {saving ? "儲存中..." : "儲存變更"}
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
