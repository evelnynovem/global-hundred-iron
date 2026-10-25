"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function MemberProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("女 (Female)");
  const [birthday, setBirthday] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [message, setMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        setEmail(user.email || "");
        setName(user.user_metadata?.name || "");
        setTeamName(user.user_metadata?.team_name || "");
        setPhone(user.user_metadata?.phone || "");
        setGender(user.user_metadata?.gender || "女 (Female)");
        setBirthday(user.user_metadata?.birthday || "");
        setAvatarUrl(user.user_metadata?.avatar_url || "");
      } catch (error) {
        console.error("載入會員資料失敗", error);
      } finally {
        setLoading(false);
      }
    }
    getProfile();
  }, [router]);

  // 登出功能
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // 🖼️ 圖片極致壓縮與上傳處理
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessage("正在極致壓縮圖片...");

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        const MAX_SIZE = 300;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/webp", 0.7);

        const blobBin = atob(compressedDataUrl.split(",")[1]);
        const array = [];
        for (let i = 0; i < blobBin.length; i++) {
          array.push(blobBin.charCodeAt(i));
        }
        const fileBlob = new Blob([new Uint8Array(array)], { type: "image/webp" });

        const fileName = `avatar_${Date.now()}.webp`;
        const { error } = await supabase.storage
          .from("avatars")
          .upload(fileName, fileBlob, { contentType: "image/webp", upsert: true });

        if (error) {
          console.error("上傳失敗：", error);
          setMessage("圖片上傳失敗：" + error.message);
          return;
        }

        const { data: publicURLData } = supabase.storage.from("avatars").getPublicUrl(fileName);
        setAvatarUrl(publicURLData.publicUrl);
        setMessage("圖片極致壓縮與上傳成功！");
      };
    };
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name,
          team_name: teamName,
          phone,
          gender,
          birthday,
          avatar_url: avatarUrl,
        },
      });

      if (error) throw error;
      setMessage("會員資料儲存成功！");
    } catch (error: any) {
      setMessage("儲存失敗：" + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">載入中...</div>;
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 pb-20">
      <div className="mx-auto max-w-3xl w-full px-4 sm:px-6 pt-8 sm:pt-12 space-y-6 sm:space-y-8">
        
        {/* 🚀 歷史賽事認領專屬橫幅 */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 p-5 sm:p-6 text-slate-950 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="bg-slate-950 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
              Legacy Claim
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold mt-2 text-white">您有尚未認領的舊官網歷史賽事成績？</h2>
            <p className="text-xs text-amber-100 mt-1">系統已自動比對您的 Email 與身分，點擊右側即可一鍵勾選認領至個人履歷。</p>
          </div>
          <Link
            href="/profile/claim"
            className="w-full md:w-auto text-center shrink-0 rounded-xl bg-slate-950 px-5 py-3 text-xs font-bold text-white hover:bg-slate-900 transition shadow"
          >
            前往認領舊成績 →
          </Link>
        </div>

        {/* 會員中心表單區 */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="h-20 w-20 rounded-full bg-slate-200 overflow-hidden border-2 border-amber-500 flex items-center justify-center shadow-inner">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-slate-400">{name ? name.charAt(0) : "用"}</span>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-[10px] font-bold">
                  更換照片
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-xl font-extrabold text-slate-900">會員中心</span>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    信譽良好 (違規 0 次)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">設定一次基本資料，鐵人與單車完賽登錄全面自動帶入</p>
              </div>
            </div>

            {/* 登出按鈕 */}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition"
            >
              登出會員
            </button>
          </div>

          {message && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg">
              {message}
            </div>
          )}

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">登入 EMAIL (系統自動綁定)</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">真實姓名 * (將印製於證書)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">所屬運動團隊 / 俱樂部</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">聯絡手機</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">參賽性別 *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none bg-white"
              >
                <option value="女 (Female)">女 (Female)</option>
                <option value="男 (Male)">男 (Male)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">出生年月日 *</label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2 rounded-xl bg-amber-50/60 border border-amber-200/60 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-amber-800">系統自動判定之本年度標準分齡組別</div>
                <div className="text-[11px] text-amber-600 mt-0.5">完賽登錄時將依各賽事年份自動換算當場組別</div>
              </div>
              <span className="rounded-lg bg-slate-900 text-amber-400 font-extrabold px-3 py-1.5 text-sm">
                F40-44
              </span>
            </div>

            <div className="md:col-span-2 flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto rounded-xl bg-slate-900 px-8 py-3 text-sm font-bold text-white hover:bg-slate-800 transition shadow"
              >
                {saving ? "儲存中..." : "儲存會員資料"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}