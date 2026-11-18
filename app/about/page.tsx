"use client";
import React from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

const SIX_FOUNDING_ORGS = [
  { name: "醫護鐵人 (IronMedic)", role: "創始總召集機構", desc: "全球百鐵認證創始發起團隊，結合醫療專業與耐力運動安全防護。" },
  { name: "臺東縣城鄉生活運動協會 (TURAA)", role: "共同發起機構", desc: "臺東普悠瑪國際鐵人三項賽主辦單位，串聯歷年完賽成績資料庫。" },
  { name: "活動咖 (EventPal)", role: "共同發起機構", desc: "國內指標性運動賽事報名與成績數據資訊平台夥伴。" },
  { name: "臺東縣超級鐵人三項協會", role: "共同發起機構", desc: "深耕東海岸鐵人三項運動推廣與巴歌浪經典賽事協辦。" },
  { name: "輪動台灣運動協會", role: "共同發起機構", desc: "推動長距離公路單車挑戰與百鐵馬榮耀認證體系。" },
  { name: "昇陽自行車 (SYB Cycling)", role: "共同發起機構", desc: "國際頂級自行車與三鐵裝備代理，打造百鐵專屬榮耀戰袍。" }
];

const INITIAL_100 = [
  { id: "init-1", name: "陳彥良", title: "醫護鐵人創辦人" },
  { id: "init-2", name: "洪緯欣", title: "醫護鐵人共同創辦人・胸腔內科主治醫師" },
  { id: "init-3", name: "吳盈進", title: "桂盟國際董事長" },
  { id: "init-4", name: "蔡邦權", title: "前高市體育總會鐵人三項主委" },
  { id: "init-5", name: "侯以理", title: "知名鐵人體育主播" },
  { id: "init-6", name: "劉祖寧", title: "知本老爺酒店總經理" },
  { id: "init-7", name: "黃柏青", title: "焦耳極限訓練中心＆DWD創辦人" },
  { id: "init-8", name: "王臨哲", title: "知名耐力賽事總監" },
  { id: "init-9", name: "周淑芳", title: "台灣自行車協會秘書長" },
  { id: "init-10", name: "宋城希", title: "226K超鐵跨界藝人倡議人" },
  { id: "init-11", name: "丁寧", title: "金馬獎演員・鐵人運動倡議人" },
  { id: "init-12", name: "馬國畢", title: "演藝界三鐵完賽倡議人" },
  { id: "init-13", name: "姚黛瑋", title: "資深藝人・耐力運動倡議人" },
  { id: "init-14", name: "劉至翰", title: "演藝界單車與三鐵倡議人" },
  { id: "init-15", name: "安乙蕎", title: "演員・鐵人三項倡議人" },
  { id: "init-16", name: "鄭旭劭", title: "康軒鐵人隊・百鐵認證創始倡議人" },
  { id: "init-17", name: "劉光武", title: "KUANGYU光聿・百鐵認證創始倡議人" },
  { id: "init-18", name: "孟亞輝", title: "高雄鐵人・百鐵認證創始倡議人" },
  { id: "init-19", name: "曾亭彬", title: "台灣大腳丫・百鐵認證創始倡議人" },
  { id: "init-20", name: "韓德安", title: "醫護鐵人・百鐵認證創始倡議人" },
  { id: "init-21", name: "蘇耀宗", title: "百鐵認證創始倡議人" },
  { id: "init-22", name: "黃偉靈", title: "百鐵認證創始倡議人" },
  { id: "init-23", name: "梁忠仁", title: "超級鐵止汗鐵人隊・百鐵認證創始倡議人" },
  { id: "init-24", name: "林揚智", title: "百鐵認證創始倡議人" },
  { id: "init-25", name: "呂正宇", title: "台積電鐵人幫・百鐵認證創始倡議人" },
  { id: "init-26", name: "羅義清", title: "醫護鐵人・百鐵認證創始倡議人" },
  { id: "init-27", name: "葉永南", title: "百鐵認證創始倡議人" },
  { id: "init-28", name: "蘇啟釗", title: "TRBB・百鐵認證創始倡議人" },
  { id: "init-29", name: "陳威仲", title: "百鐵認證創始倡議人" },
  { id: "init-30", name: "許航紹", title: "醫護鐵人・百鐵認證創始倡議人" },
  ...Array.from({ length: 70 }, (_, i) => ({
    id: "init-" + (i + 31),
    name: "百鐵創始倡議人 " + (i + 31),
    title: "全球百鐵認證創始倡議人"
  }))
].map((p, idx) => ({ ...p, avatarUrl: "/images/initiators/" + (idx + 1) + ".jpg" }));

export default function AboutPage() {
  const [initiators, setInitiators] = React.useState(INITIAL_100);
  const [editingIdx, setEditingIdx] = React.useState<number | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editTitle, setEditTitle] = React.useState("");
  const [editAvatar, setEditAvatar] = React.useState("");

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("g100_initiators_v18");
      if (saved) setInitiators(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIdx === null) return;
    const next = initiators.map((item, i) => i === editingIdx ? { ...item, name: editName, title: editTitle, avatarUrl: editAvatar } : item);
    setInitiators(next);
    try { localStorage.setItem("g100_initiators_v18", JSON.stringify(next)); } catch (err) {}
    setEditingIdx(null);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between overflow-x-hidden">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
        <section className="rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-amber-500/40 p-6 sm:p-10 shadow-2xl space-y-4">
          <span className="px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-extrabold uppercase">
            FOUNDED BY IRONMEDIC・GLOBAL 100 TRIATHLON CERTIFICATION
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            關於全球百鐵認證 ＆ 百位創始倡議人
          </h1>
          <p className="text-xs sm:text-base text-zinc-300 leading-relaxed max-w-4xl">
            「全球百鐵認證（Global 100 Triathlon Certification）」由醫護鐵人創辦人陳彥良與洪緯欣醫師共同發起，串聯國內外指標性鐵人三項與長距離公路單車賽事，打造華人界最具公信力的耐力運動名人堂。
          </p>
        </section>

        <section className="space-y-6">
          <div className="border-l-4 border-amber-500 pl-4">
            <h2 className="text-xl sm:text-2xl font-black text-white">🏛️ 六大共同發起機構</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SIX_FOUNDING_ORGS.map((org, i) => (
              <div key={i} className="rounded-3xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 p-6 space-y-2 shadow-xl transition">
                <span className="text-xs font-bold text-amber-400">{org.role}</span>
                <h3 className="text-base sm:text-lg font-black text-white">{org.name}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{org.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="border-l-4 border-amber-500 pl-4">
            <h2 className="text-xl sm:text-2xl font-black text-white">👑 百位創始倡議人名人堂</h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">凝聚產官學界、演藝名人與百鐵傳奇選手共同倡議（點擊卡片下方按鈕可編輯照片、姓名與頭銜）。</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {initiators.map((person, idx) => (
              <div key={person.id} className="rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 p-4 flex flex-col items-center text-center justify-between gap-3 transition">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-500/60 overflow-hidden mb-3 bg-amber-950/30 flex items-center justify-center relative">
                    <span className="text-amber-300 font-black text-base">{person.name.slice(0, 2)}</span>
                    {person.avatarUrl && (
                      <img
                        src={person.avatarUrl}
                        alt={person.name}
                        className="w-full h-full object-cover absolute inset-0"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    )}
                  </div>
                  <h3 className="text-sm font-black text-white">{person.name}</h3>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{person.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingIdx(idx);
                    setEditName(person.name);
                    setEditTitle(person.title);
                    setEditAvatar(person.avatarUrl);
                  }}
                  className="w-full py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 font-bold cursor-pointer"
                >
                  📷 編輯照片/姓名
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {editingIdx !== null && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSave} className="bg-zinc-950 border border-amber-500 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-black text-amber-400">✏️ 編輯創始倡議人資訊</h3>
            <div>
              <label className="block text-zinc-400 font-bold mb-1">姓名</label>
              <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-2.5 text-white font-bold" />
            </div>
            <div>
              <label className="block text-zinc-400 font-bold mb-1">頭銜 / 單位</label>
              <input type="text" required value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-2.5 text-white" />
            </div>
            <div>
              <label className="block text-zinc-400 font-bold mb-1">上傳更換照片</label>
              <input type="file" accept="image/*" onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const r = new FileReader();
                r.onload = (ev) => setEditAvatar(String(ev.target?.result || ""));
                r.readAsDataURL(f);
              }} className="w-full text-zinc-300" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditingIdx(null)} className="px-4 py-2 rounded-xl bg-zinc-800 text-white font-bold">取消</button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 text-black font-black">💾 儲存</button>
            </div>
          </form>
        </div>
      )}
      <Footer />
    </div>
  );
}
