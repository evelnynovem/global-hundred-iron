"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

function calculateEventAgeGroup(birthDateStr: string, gender: string, eventDateStr: string): string {
  if (!birthDateStr || !gender) return "請先至會員中心設定生日與性別";
  
  const birthYear = new Date(birthDateStr).getFullYear();
  const targetYear = eventDateStr ? new Date(eventDateStr).getFullYear() : new Date().getFullYear();
  const age = targetYear - birthYear;

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

const CYCLING_DATABASE = [
  { name: "2026 台灣KOM自行車登山王挑戰", date: "2026-10-23", distance: "105K 登山王" },
  { name: "2026 環花東自行車 365 挑戰賽", date: "2026-04-18", distance: "300K+ 極限單車認證" },
  { name: "2026 不厭亭百K自行車挑戰賽", date: "2026-05-16", distance: "100K+ 長途單車認證" },
  { name: "2025 台灣KOM自行車登山王挑戰", date: "2025-10-24", distance: "105K 登山王" },
  { name: "2025 環花東自行車挑戰賽", date: "2025-04-19", distance: "100K+ 長途單車認證" },
  { name: "2024 台灣KOM自行車登山王挑戰", date: "2024-10-25", distance: "105K 登山王" },
  { name: "2024 雙塔520極限自行車挑戰", date: "2024-12-14", distance: "300K+ 極限單車認證" },
];

interface CertRecord {
  id: string;
  distance_type: string;
  event_name: string;
  event_date: string;
  finish_time: string;
  age_group?: string;
}

export default function CyclingCertificationPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [fullName, setFullName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [gender, setGender] = useState("M");
  const [birthDate, setBirthDate] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [violationCount, setViolationCount] = useState(0);
  const [isBanned, setIsBanned] = useState(false);

  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [distanceType, setDistanceType] = useState("100K+ 長途單車認證");
  
  const [hour, setHour] = useState("04");
  const [minute, setMinute] = useState("15");
  const [second, setSecond] = useState("00");
  const [isEstimatedTime, setIsEstimatedTime] = useState(false);

  const [bibNumber, setBibNumber] = useState("");
  const [certificateUrl, setCertificateUrl] = useState("");
  const [records, setRecords] = useState<CertRecord[]>([]);

  const [filteredEvents, setFilteredEvents] = useState<typeof CYCLING_DATABASE>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
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
          setGender(profile.gender || "M");
          setBirthDate(profile.birth_date || "");
          setViolationCount(profile.violation_count || 0);
          setIsBanned(Boolean(profile.is_banned) || (profile.violation_count || 0) >= 2);
        } else {
          setFullName(user.user_metadata?.full_name || user.user_metadata?.name || "");
        }

        const { data: certList } = await supabase
          .from("certifications")
          .select("*")
          .eq("user_id", user.id)
          .eq("sport_category", "cycling")
          .order("event_date", { ascending: false });

        if (certList) setRecords(certList);
      }
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  useEffect(() => {
    const calculated = calculateEventAgeGroup(birthDate, gender, eventDate);
    setAgeGroup(calculated);
  }, [birthDate, gender, eventDate]);

  const handleEventNameChange = (val: string) => {
    setEventName(val);
    if (val.trim() === "") {
      setFilteredEvents([]);
      setShowSuggestions(false);
    } else {
      const matches = CYCLING_DATABASE.filter((item) =>
        item.name.toLowerCase().includes(val.toLowerCase())
      );
      setFilteredEvents(matches);
      setShowSuggestions(true);
    }
  };

  const handleSelectSuggestion = (item: typeof CYCLING_DATABASE[0]) => {
    setEventName(item.name);
    setEventDate(item.date);
    setDistanceType(item.distance);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (isBanned) {
      setMessage({
        type: "error",
        text: "⛔ 您的帳號因累計嚴重違規造假紀錄，已被系統永久拒絕登錄。",
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    const finishTimeStr = isEstimatedTime
      ? `${hour}:${minute}:${second} (印象估算)`
      : `${hour}:${minute}:${second}`;

    const newRecord = {
      user_id: userId,
      email: email,
      full_name: fullName,
      team_name: teamName,
      age_group: ageGroup,
      sport_category: "cycling",
      distance_type: distanceType,
      event_name: eventName,
      event_date: eventDate,
      bib_number: bibNumber || null,
      finish_time: finishTimeStr,
      certificate_url: certificateUrl || null,
      is_estimated_time: isEstimatedTime,
      status: "active",
    };

    const { data, error } = await supabase.from("certifications").insert([newRecord]).select().single();

    if (error) {
      setMessage({ type: "error", text: "登錄失敗：" + error.message });
    } else {
      setMessage({
        type: "success",
        text: `🎉 榮譽登錄成功！公路車賽事「${eventName}」已即時公開於查詢系統中。`,
      });
      if (data) setRecords([data, ...records]);
      setEventName("");
      setBibNumber("");
      setCertificateUrl("");
      setIsEstimatedTime(false);
    }
    setSubmitting(false);
  };

  if (loading) return <div className="min-h-[70vh] flex items-center justify-center text-gray-500">載入中...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div className="bg-gradient-to-r from-emerald-900 to-black text-white rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Cycling Honor System
            </span>
            <span
              className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                violationCount === 0
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-red-500/30 text-red-300 border border-red-500/50"
              }`}
            >
              違規紀錄：{violationCount} 次
            </span>
          </div>
          <h1 className="text-2xl font-black mt-1">公路車百K長途完賽榮譽登錄</h1>
          <p className="text-xs text-gray-300 mt-1">
            選手：{fullName || "未設定"} ｜ 團隊：{teamName || "個人"} ｜ 當場分組：{ageGroup}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href="/rankings" className="px-4 py-2 bg-emerald-400 hover:bg-emerald-500 text-black text-xs font-bold rounded-xl transition">
            查看成績查詢 →
          </Link>
          <Link href="/certifications" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition">
            ← 返回
          </Link>
        </div>
      </div>

      {isBanned && (
        <div className="p-5 rounded-2xl bg-red-950 text-red-200 border border-red-700 text-sm font-medium">
          ⛔ <strong>永久拒絕登錄通知：</strong>您的帳號因累計查證屬實之不實造假紀錄達 {violationCount} 次，已違反榮譽公約，系統已永久鎖定您的登錄權限。
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-xl font-black text-gray-900">填寫公路車單車完賽成績</h2>
            <p className="text-xs text-gray-500 mt-1">
              採榮譽自律制，送出後即刻生效公開，無須等待官方審核。
            </p>
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-sm font-medium border ${message.type === "success" ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative">
            <div className="relative">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                賽事名稱 (輸入「KOM」、「環花東」或「雙塔」自動推薦歷年賽事) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isBanned}
                value={eventName}
                onChange={(e) => handleEventNameChange(e.target.value)}
                placeholder="例如：2026 台灣KOM自行車登山王挑戰"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-gray-100"
              />

              {showSuggestions && filteredEvents.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-60 overflow-y-auto">
                  {filteredEvents.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectSuggestion(item)}
                      className="px-4 py-3 hover:bg-emerald-50 cursor-pointer border-b border-gray-100 text-xs flex justify-between items-center"
                    >
                      <span className="font-bold text-gray-800">{item.name}</span>
                      <span className="text-gray-400 font-mono">📅 {item.date} ({item.distance})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">賽事日期 (預設今日) *</label>
                <input
                  type="date"
                  required
                  disabled={isBanned}
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">認證距離組別 *</label>
                <select
                  disabled={isBanned}
                  value={distanceType}
                  onChange={(e) => setDistanceType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="100K+ 長途單車認證">100K+ 百K自行車挑戰</option>
                  <option value="200K+ 長途單車認證">200K+ 長途單車挑戰</option>
                  <option value="300K+ 極限單車認證">300K+ 極限長途挑戰</option>
                  <option value="105K 登山王">105K 台灣KOM登山王</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="block text-xs font-bold text-gray-700 uppercase">
                  完賽總時間 (時 / 分 / 秒) *
                </label>
                <label className="inline-flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEstimatedTime}
                    onChange={(e) => setIsEstimatedTime(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>早期賽事已遺忘確切秒數（填寫印象約略時間）</span>
                </label>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-gray-400 block mb-1">小時 (Hours)</span>
                  <input type="number" min="0" max="23" disabled={isBanned} value={hour} onChange={(e) => setHour(e.target.value.padStart(2, "0"))} className="w-full px-4 py-3 rounded-xl border text-center font-mono font-bold" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block mb-1">分鐘 (Minutes)</span>
                  <input type="number" min="0" max="59" disabled={isBanned} value={minute} onChange={(e) => setMinute(e.target.value.padStart(2, "0"))} className="w-full px-4 py-3 rounded-xl border text-center font-mono font-bold" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block mb-1">秒鐘 (Seconds)</span>
                  <input type="number" min="0" max="59" disabled={isBanned} value={second} onChange={(e) => setSecond(e.target.value.padStart(2, "0"))} className="w-full px-4 py-3 rounded-xl border text-center font-mono font-bold" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">參賽號碼布 (選填)</label>
                <input
                  type="text"
                  disabled={isBanned}
                  value={bibNumber}
                  onChange={(e) => setBibNumber(e.target.value)}
                  placeholder="早期賽事若遺忘可免填"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">成績證明或相片連結 (選填)</label>
                <input
                  type="url"
                  disabled={isBanned}
                  value={certificateUrl}
                  onChange={(e) => setCertificateUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || isBanned}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg transition disabled:opacity-50"
            >
              {isBanned ? "帳號已停權禁止登錄" : submitting ? "送出中..." : "確認送出公路車完賽登錄"}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-950 text-white rounded-2xl p-6 space-y-3 shadow-lg border border-zinc-800">
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">
              🛡️ 榮譽認證與檢舉規範
            </h3>
            <ul className="text-xs space-y-2.5 text-zinc-300 leading-relaxed">
              <li>
                <strong className="text-white">1. 免事前審查：</strong>本平台採榮譽自律制，登錄後即刻生效，不設官方事前審核。
              </li>
              <li>
                <strong className="text-white">2. 歷史成績彈性：</strong>早期賽事若已遺失證書或忘記確切時間，可勾選「印象約略時間」完成登錄。
              </li>
              <li>
                <strong className="text-white">3. 公開檢舉與永久停權：</strong>開放全體車友檢舉「未參賽造假」或「未完賽(DNF/DNS)」。查證屬實除刪除紀錄並累計違規次數外，嚴重或累犯者將<span className="text-red-400 font-bold">永久拒絕登錄</span>。
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
            <h3 className="text-base font-black text-gray-900">我的單車完賽紀錄 ({records.length})</h3>
            {records.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">尚無紀錄</p>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {records.map((r) => (
                  <div key={r.id} className="p-3 rounded-xl bg-gray-50 border text-xs space-y-1">
                    <div className="font-bold text-gray-900">{r.event_name}</div>
                    <div className="text-gray-500 flex justify-between items-center">
                      <span>{r.event_date} ｜ {r.distance_type}</span>
                      <span className="font-mono font-bold text-emerald-600">{r.finish_time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}