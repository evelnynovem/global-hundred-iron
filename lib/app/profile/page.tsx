"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    chinese_name: "",
    english_name: "",
    birth_date: "",
    gender: "生理男",
    nationality: "TW",
    national_id: "",
    phone: "",
    zip_code: "",
    city: "",
    district: "",
    address: "",
    shirt_size: "L",
    sock_size: "M (24-26cm)",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "配偶",
    has_medical_license: false,
    medical_license_type: "無",
    medical_license_expiry: "",
    privacy_agreed: false,
  });

  // 檢查登入狀態並載入已存檔的會員資料
  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data) {
          setFormData({
            chinese_name: data.chinese_name || "",
            english_name: data.english_name || "",
            birth_date: data.birth_date || "",
            gender: data.gender || "生理男",
            nationality: data.nationality || "TW",
            national_id: data.national_id || "",
            phone: data.phone || "",
            zip_code: data.zip_code || "",
            city: data.city || "",
            district: data.district || "",
            address: data.address || "",
            shirt_size: data.shirt_size || "L",
            sock_size: data.sock_size || "M (24-26cm)",
            emergency_contact_name: data.emergency_contact_name || "",
            emergency_contact_phone: data.emergency_contact_phone || "",
            emergency_contact_relation: data.emergency_contact_relation || "配偶",
            has_medical_license: data.has_medical_license || false,
            medical_license_type: data.medical_license_type || "醫師",
            medical_license_expiry: data.medical_license_expiry || "",
            privacy_agreed: data.privacy_agreed || false,
          });
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  // Google 第三方登入觸發
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/profile`,
      },
    });
  };

  // 儲存會員資料
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!formData.privacy_agreed) {
      alert("請先閱讀並勾選同意個人資料蒐集、處理及利用告知聲明！");
      return;
    }

    if (formData.phone && formData.phone === formData.emergency_contact_phone) {
      alert("為了您的賽事安全，緊急聯絡人電話不可與您本人的手機號碼相同！");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      ...formData,
      privacy_agreed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    setSaving(false);
    if (error) {
      setMessage("❌ 儲存失敗：" + error.message);
    } else {
      setMessage("✅ 會員資料已成功更新！未來報名百鐵認證、普悠瑪或輪躍台南賽事時將自動帶入。");
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-600">系統載入中...</div>;
  }

  // 未登入畫面：顯示三網合一登入入口
  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-xl shadow-lg border border-gray-100 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">全球百鐵認證｜會員通行證</h1>
        <p className="text-sm text-gray-500 mb-6">
          一組帳號通用於：全球百鐵認證、普悠瑪鐵人三項、輪躍台南。預填個人賽務與裝備尺碼，享受快速報名與完賽認證服務。
        </p>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-3 px-4 mb-3 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 shadow-sm transition"
        >
          <span>G</span> 使用 Google 帳號快速登入 / 註冊
        </button>

        <div className="mt-6 text-xs text-gray-400">
          登入即代表您同意本平台之
          <Link href="/legal/privacy" className="text-blue-600 underline ml-1">
            服務條款與個資隱私權政策
          </Link>
        </div>
      </div>
    );
  }

  // 已登入畫面：完整資料預填表單
  return (
    <div className="max-w-3xl mx-auto my-10 p-6 md:p-8 bg-white rounded-xl shadow-md border border-gray-200 text-gray-800">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">選手個人檔案與賽務預填中心</h1>
          <p className="text-sm text-gray-500">登入信箱：{user.email}</p>
        </div>
        <button
          onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
          className="text-sm text-red-600 hover:underline"
        >
          登出帳號
        </button>
      </div>

      {message && (
        <div className="mb-6 p-4 rounded-lg bg-blue-50 text-blue-800 font-medium text-sm">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 第一區：基本身分資訊 */}
        <section>
          <h2 className="text-lg font-semibold text-blue-900 border-l-4 border-blue-600 pl-3 mb-4">
            一、 基本身分與保險資料（賽事投保與證書印製用）
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">中文姓名 *</label>
              <input
                type="text"
                required
                value={formData.chinese_name}
                onChange={(e) => setFormData({ ...formData, chinese_name: e.target.value })}
                className="w-full p-2 border rounded-md"
                placeholder="請填寫真實姓名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">英文姓名 (護照拼音)</label>
              <input
                type="text"
                value={formData.english_name}
                onChange={(e) => setFormData({ ...formData, english_name: e.target.value })}
                className="w-full p-2 border rounded-md"
                placeholder="例：CHEN, YEN-LIANG"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">出生年月日 *</label>
              <input
                type="date"
                required
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                法定生理性別 * <span className="text-xs text-gray-400">(競賽分組與保險投保規定)</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full p-2 border rounded-md bg-white"
              >
                <option value="生理男">生理男</option>
                <option value="生理女">生理女</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">身分證字號 / 護照號碼 *</label>
              <input
                type="text"
                required
                value={formData.national_id}
                onChange={(e) => setFormData({ ...formData, national_id: e.target.value.toUpperCase() })}
                className="w-full p-2 border rounded-md"
                placeholder="僅供賽事公共意外險與旅平險投保使用"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">手機號碼 *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 border rounded-md"
                placeholder="例：0912345678"
              />
            </div>
          </div>
        </section>

        {/* 第二區：通訊與物資寄送地址 */}
        <section>
          <h2 className="text-lg font-semibold text-blue-900 border-l-4 border-blue-600 pl-3 mb-4">
            二、 賽事物資與商品寄送地址
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1">郵遞區號</label>
              <input
                type="text"
                value={formData.zip_code}
                onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                className="w-full p-2 border rounded-md"
                placeholder="例：804"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">縣市</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full p-2 border rounded-md"
                placeholder="例：高雄市"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">鄉鎮市區</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full p-2 border rounded-md"
                placeholder="例：鼓山區"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">詳細街道地址</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="請填寫路街名、巷弄號與樓層"
            />
          </div>
        </section>

        {/* 第三區：裝備尺寸與緊急聯絡人 */}
        <section>
          <h2 className="text-lg font-semibold text-blue-900 border-l-4 border-blue-600 pl-3 mb-4">
            三、 選手裝備尺寸與緊急聯絡人
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">紀念衫 / 賽衣尺寸</label>
              <select
                value={formData.shirt_size}
                onChange={(e) => setFormData({ ...formData, shirt_size: e.target.value })}
                className="w-full p-2 border rounded-md bg-white"
              >
                {["XS", "S", "M", "L", "XL", "2XL", "3XL"].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">運動襪尺寸</label>
              <select
                value={formData.sock_size}
                onChange={(e) => setFormData({ ...formData, sock_size: e.target.value })}
                className="w-full p-2 border rounded-md bg-white"
              >
                {["S (22-24cm)", "M (24-26cm)", "L (26-28cm)", "XL (28-30cm)"].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">緊急聯絡人姓名 *</label>
              <input
                type="text"
                required
                value={formData.emergency_contact_name}
                onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">與選手關係 *</label>
              <select
                value={formData.emergency_contact_relation}
                onChange={(e) => setFormData({ ...formData, emergency_contact_relation: e.target.value })}
                className="w-full p-2 border rounded-md bg-white"
              >
                {["配偶", "父母", "子女", "兄弟姊妹", "朋友", "其他"].map((rel) => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">緊急聯絡人電話 *</label>
              <input
                type="tel"
                required
                value={formData.emergency_contact_phone}
                onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                className="w-full p-2 border rounded-md"
                placeholder="不可與選手本人電話相同"
              />
            </div>
          </div>
        </section>

        {/* 第四區：醫護鐵人資格登錄 */}
        <section className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h2 className="text-lg font-semibold text-teal-800 border-l-4 border-teal-600 pl-3 mb-3">
            四、 醫護與救護執照登錄（醫護鐵人專屬）
          </h2>
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="has_medical"
              checked={formData.has_medical_license}
              onChange={(e) => setFormData({ ...formData, has_medical_license: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="has_medical" className="text-sm font-medium">
              我持有合格之醫事人員或緊急救護技術員（EMT）執照
            </label>
          </div>

          {formData.has_medical_license && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-sm font-medium mb-1">執照種類</label>
                <select
                  value={formData.medical_license_type}
                  onChange={(e) => setFormData({ ...formData, medical_license_type: e.target.value })}
                  className="w-full p-2 border rounded-md bg-white"
                >
                  {["醫師", "護理師", "專科護理師", "EMT-1", "EMT-2", "EMT-P", "物理治療師", "其他醫事人員"].map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">執照有效期限（展延到期日）</label>
                <input
                  type="date"
                  value={formData.medical_license_expiry}
                  onChange={(e) => setFormData({ ...formData, medical_license_expiry: e.target.value })}
                  className="w-full p-2 border rounded-md bg-white"
                />
              </div>
            </div>
          )}
        </section>

        {/* 第五區：個資法合規同意書 */}
        <section className="border-t pt-6">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="privacy_agreed"
              required
              checked={formData.privacy_agreed}
              onChange={(e) => setFormData({ ...formData, privacy_agreed: e.target.checked })}
              className="w-5 h-5 mt-0.5"
            />
            <label htmlFor="privacy_agreed" className="text-sm text-gray-600 leading-relaxed">
              我已詳細閱讀並同意《
              <Link href="/legal/privacy" target="_blank" className="text-blue-600 underline font-medium">
                個人資料蒐集、處理及利用告知聲明與隱私權政策
              </Link>
              》，同意本平台（全球醫鐵有限公司）於會員服務、百鐵認證核發、商品購物，以及本人主動參與之合作賽事（含台東城鄉生活運動協會主辦之普悠瑪鐵人三項、輪躍台南等系列活動）之賽務聯繫與保險投保範圍內使用本人資料。
            </label>
          </div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow transition disabled:opacity-50"
        >
          {saving ? "資料加密儲存中..." : "儲存個人檔案與賽務設定"}
        </button>
      </form>
    </div>
  );
}
