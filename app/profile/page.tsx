"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

function calculateAgeGroup(birthDateStr: string, gender: string): string {
  if (!birthDateStr || !gender) return "請先填寫性別與出生年月日";
  const birthYear = new Date(birthDateStr).getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;

  if (age < 18) return "青少年組 (U18)";
  if (age >= 18 && age <= 24) return `${gender}18-24`;
  if (age >= 25 && age <= 29) return `${gender}25-29`;
  if (age >= 30 && age <= 34) return `${gender}30-34`;
  if (age >= 35 && age <= 39) return `${gender}35-39`;
  if (age >= 40 && age <= 44) return `${gender}40-44`;
  if (age >= 45 && age <= 49) return `${gender}45-49`;
  if (age >= 50 && age <= 54) return `${gender}50-54`;
  if (age >= 55 && age <= 59) return `${gender}55-59`;
  if (age >= 60 && age <= 64) return `${gender}60-64`;
  if (age >= 65 && age <= 69) return `${gender}65-69`;
  return `${gender}70+`;
}

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [gender, setGender] = useState("M");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [violationCount, setViolationCount] = useState(0);
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    async function loadUserProfile() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUserId(user.id);
      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || user.user_metadata?.full_name || "");
        setTeamName(profile.team_name || "");
        setGender(profile.gender === "女" || profile.gender === "F" ? "F" : "M");
        setBirthDate(profile.birth_date || "");
        setPhone(profile.phone || "");
        setViolationCount(profile.violation_count || 0);
        setIsBanned(Boolean(profile.is_banned) || (profile.violation_count || 0) >= 2);
      } else {
        setFullName(user.user_metadata?.full_name || user.user_metadata?.name || "");
      }
      setLoading(false);
    }

    loadUserProfile();
  }, [supabase, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    setMessage(null);

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      email,
      full_name: fullName,
      team_name: teamName,
      gender,
      birth_date: birthDate || null,
      phone,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setMessage({ type: "error", text: "儲存失敗：" + error.message });
    } else {
      setMessage({ type: "success", text: "✅ 會員基本資料已更新！" });
    }
    setSaving(false);
  };

  const ageGroup = calculateAgeGroup(birthDate, gender);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-gray-500">
        載入會員資料中...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="全球百鐵認證"
              className="w-16 h-16 rounded-full border-2 border-amber-400 object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                  Member Profile
                </span>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                    isBanned
                      ? "bg-red-600 text-white"
                      : violationCount > 0
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {isBanned
                    ? `⛔ 已永久停權 (違規 ${violationCount} 次)`
                    : `🛡️ 信譽良好 (違規 ${violationCount} 次)`}
                </span>
              </div>
              <h1 className="text-2xl font-black text-gray-900 mt-0.5">會員中心</h1>
              <p className="text-sm text-gray-500">設定一次基本資料，鐵人與單車完賽登錄全面自動帶入</p>
            </div>
          </div>

          <Link
            href="/certifications"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow transition"
          >
            前往完賽登錄 →
          </Link>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-sm font-medium border ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                登入 Email (系統自動綁定)
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-500 border border-gray-200 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                真實姓名 <span className="text-red-500">*</span> (將印製於證書)
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="請輸入真實姓名"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                所屬運動團隊 / 俱樂部
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="例如：醫護鐵人"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                聯絡手機
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912-345-678"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                參賽性別 <span className="text-red-500">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:outline-none text-sm bg-white"
              >
                <option value="M">男 (Male)</option>
                <option value="F">女 (Female)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                出生年月日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-amber-800 uppercase">系統自動判定之本年度標準分齡組別</div>
              <div className="text-xs text-amber-700 mt-0.5">完賽登錄時將依各場賽事年份自動換算當場組別</div>
            </div>
            <div className="px-4 py-2 bg-gray-900 text-amber-400 font-black rounded-lg text-base tracking-wider">
              {ageGroup}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 text-sm"
            >
              {saving ? "儲存設定中..." : "儲存會員資料"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}