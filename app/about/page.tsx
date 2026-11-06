"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";

interface OrgItem {
  id: string;
  name: string;
  subtitle: string;
  desc: string;
  logoUrl: string;
  linkUrl: string;
}

interface InitiatorPerson {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
}

const DEFAULT_SIX_ORGS: OrgItem[] = [
  {
    id: "org-1",
    name: "醫護鐵人 (IRONMEDIC)",
    subtitle: "全球百鐵認證創立統籌機構",
    desc: "由陳彥良與洪緯欣醫師共同創辦之社會企業，動員具合格醫護與 EMT 證照之耐力運動員，提供賽道移動式安全守護並統籌全球百鐵認證。",
    logoUrl: "/images/sponsors/ironmedic.png",
    linkUrl: "https://www.global100triathlon.com",
  },
  {
    id: "org-2",
    name: "台東城鄉運動生活協會",
    subtitle: "六大共同發起機構",
    desc: "深耕臺灣鐵人三項搖籃臺東，每年主辦指標性臺東普悠瑪國際鐵人三項賽，推動城鄉運動發展與歷年完賽數據串聯。",
    logoUrl: "/images/sponsors/turaa-logo.png",
    linkUrl: "https://www.global100triathlon.com/taitung-assoc",
  },
  {
    id: "org-3",
    name: "活動咖 (EventPal)",
    subtitle: "六大共同發起機構",
    desc: "臺灣指標性運動賽事報名與成績資訊平台，共同倡議耐力賽事數位化查核與百鐵完賽榮耀紀錄。",
    logoUrl: "/images/turaa-logo.png",
    linkUrl: "https://www.eventpal.com.tw/",
  },
  {
    id: "org-4",
    name: "臺東縣超級鐵人三項協會",
    subtitle: "六大共同發起機構",
    desc: "推廣東海岸 113K 與 226K 超級鐵人三項運動，串聯在地山海賽道資源與高規格賽事安全認證。",
    logoUrl: "/images/pakelangTSTA.jpeg",
    linkUrl: "https://www.global100triathlon.com/association",
  },
  {
    id: "org-5",
    name: "輪動台灣運動協會",
    subtitle: "六大共同發起機構",
    desc: "致力於推廣台灣長距離自行車挑戰與輪動運動文化，共同發起 90km+ 公路單車百鐵馬認證體系。",
    logoUrl: "/images/tainan.png",
    linkUrl: "https://www.global100triathlon.com",
  },
  {
    id: "org-6",
    name: "昇陽自行車 (SYB)",
    subtitle: "六大共同發起機構",
    desc: "深耕頂級自行車與鐵人三項裝備代理與客製化戰袍研發，全力支持台灣百鐵英雄挑戰極限。",
    logoUrl: "/images/sponsors/syb.png",
    linkUrl: "https://www.syb-cycling.com/",
  },
];

const CORE_INITIATORS: InitiatorPerson[] = [
  { id: "init-1", name: "陳彥良", title: "醫護鐵人＆全球百鐵認證創辦人", avatarUrl: "/images/initiators/1.jpg" },
  { id: "init-2", name: "洪緯欣", title: "共同創辦人・胸腔內科暨運動醫學醫師", avatarUrl: "/images/initiators/2.jpg" },
  { id: "init-3", name: "吳盈進", title: "KMC桂盟董事長・台灣自行車協會理事長", avatarUrl: "/images/initiators/3.jpg" },
  { id: "init-4", name: "陳素梅", title: "昇陽自行車創辦人", avatarUrl: "/images/initiators/4.jpg" },
  { id: "init-5", name: "許榮裕", title: "KS凱薩克董事長", avatarUrl: "/images/initiators/5.jpg" },
  { id: "init-6", name: "何航順", title: "中華民國體適能健身運動發展協會理事長", avatarUrl: "/images/initiators/6.jpg" },
  { id: "init-7", name: "蔡邦權", title: "正德海運董事長・ESG永續倡議人", avatarUrl: "/images/initiators/7.jpg" },
  { id: "init-8", name: "吳永盛 (吉董)", title: "董事長樂團主唱・百鐵跨界倡議人", avatarUrl: "/images/initiators/8.jpg" },
  { id: "init-9", name: "杜文祥 (白董)", title: "金鐘導演・董事長樂團・三鐵倡議人", avatarUrl: "/images/initiators/9.jpg" },
  { id: "init-10", name: "雅維·茉芮", title: "金曲獎歌手・鐵人運動倡議人", avatarUrl: "/images/initiators/10.jpg" },
  { id: "init-11", name: "劉祖寧", title: "知本老爺酒店總經理", avatarUrl: "/images/initiators/11.jpg" },
  { id: "init-12", name: "黃柏青", title: "焦耳極限訓練中心＆DWD創辦人", avatarUrl: "/images/initiators/12.jpg" },
  { id: "init-13", name: "王臨哲", title: "知名耐力賽事總監", avatarUrl: "/images/initiators/13.jpg" },
  { id: "init-14", name: "周淑芳", title: "台灣自行車協會秘書長", avatarUrl: "/images/initiators/14.jpg" },
  { id: "init-15", name: "宋城希", title: "226K超鐵跨界藝人倡議人", avatarUrl: "/images/initiators/15.jpg" },
  { id: "init-16", name: "丁寧", title: "金馬獎演員・鐵人運動倡議人", avatarUrl: "/images/initiators/16.jpg" },
  { id: "init-17", name: "馬國畢", title: "演藝界三鐵完賽倡議人", avatarUrl: "/images/initiators/17.jpg" },
  { id: "init-18", name: "姚黛瑋", title: "資深藝人・耐力運動倡議人", avatarUrl: "/images/initiators/18.jpg" },
  { id: "init-19", name: "劉至翰", title: "演藝界單車與三鐵倡議人", avatarUrl: "/images/initiators/19.jpg" },
  { id: "init-20", name: "安乙蕎", title: "演員・鐵人三項倡議人", avatarUrl: "/images/initiators/20.jpg" },
];

function compressAboutImg(file: File, maxW = 700, q = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        if (w > maxW) {
          h = Math.round((h * maxW) / w);
          w = maxW;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", q));
        } else reject(new Error("Canvas err"));
      };
      img.onerror = reject;
      if (typeof ev.target?.result === "string") img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AboutPage() {
  const supabase = createClient();
  const [orgs, setOrgs] = useState<OrgItem[]>(DEFAULT_SIX_ORGS);
  const [initiators, setInitiators] = useState<InitiatorPerson[]>(CORE_INITIATORS);
  const [isAdmin, setIsAdmin] = useState(false);

  const [editingOrg, setEditingOrg] = useState<OrgItem | null>(null);
  const [editingPerson, setEditingPerson] = useState<InitiatorPerson | null>(null);
  const [searchInit, setSearchInit] = useState("");

  const loadAboutData = useCallback(async () => {
    let basePeople = [...CORE_INITIATORS];
    try {
      // 自動從百鐵英雄榜載入前 100 位百鐵英雄共同組成「百大創始倡議人牆」
      const res = await fetch("/data/rankings-baseline.json");
      if (res.ok) {
        const data = await res.json();
        const existingNames = new Set(basePeople.map((p) => p.name));
        (data.triathlon || []).slice(0, 95).forEach((h: any, idx: number) => {
          if (!existingNames.has(h.name)) {
            existingNames.add(h.name);
            basePeople.push({
              id: "hero-" + idx,
              name: h.name,
              title: (h.team && h.team !== "個人" ? h.team + "・" : "") + "百鐵認證創始倡議人 (" + h.count + "場)",
              avatarUrl: "/images/initiators/" + (basePeople.length + 1) + ".jpg",
            });
          }
        });
      }
    } catch (e) {}

    try {
      const localOrgs = localStorage.getItem("g100_six_orgs_v12");
      if (localOrgs) setOrgs(JSON.parse(localOrgs));
      const localPeople = localStorage.getItem("g100_initiators_v12");
      if (localPeople) {
        basePeople = JSON.parse(localPeople);
      }

      const { data: rows } = await supabase
        .from("race_details_full")
        .select("*")
        .in("athlete_name", ["__SYS_SIX_ORGS__", "__SYS_INITIATORS__"])
        .order("id", { ascending: false });

      if (rows && rows.length > 0) {
        const orgRow = rows.find((r: any) => r.athlete_name === "__SYS_SIX_ORGS__");
        if (orgRow?.team) {
          setOrgs(JSON.parse(orgRow.team));
          localStorage.setItem("g100_six_orgs_v12", orgRow.team);
        }
        const pRow = rows.find((r: any) => r.athlete_name === "__SYS_INITIATORS__");
        if (pRow?.team) {
          basePeople = JSON.parse(pRow.team);
          localStorage.setItem("g100_initiators_v12", pRow.team);
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const em = session.user.email.toLowerCase();
        const meta = session.user.user_metadata?.full_name || "";
        if (em.includes("evelny") || em.includes("pianopub") || em.includes("novem") || meta.includes("陳彥良") || meta.includes("洪緯欣")) {
          setIsAdmin(true);
        }
      }
    } catch (e) {}

    setInitiators(basePeople);
  }, [supabase]);

  useEffect(() => {
    loadAboutData();
  }, [loadAboutData]);

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;
    const exists = orgs.some((o) => o.id === editingOrg.id);
    const nextList = exists
      ? orgs.map((o) => (o.id === editingOrg.id ? editingOrg : o))
      : [...orgs, editingOrg];
    setOrgs(nextList);
    const str = JSON.stringify(nextList);
    localStorage.setItem("g100_six_orgs_v12", str);
    try {
      await supabase.from("race_details_full").delete().eq("athlete_name", "__SYS_SIX_ORGS__");
      await supabase.from("race_details_full").insert([{
        athlete_name: "__SYS_SIX_ORGS__",
        race_name: "SIX_ORGS",
        race_date: "2026-11-05",
        category: "SYS",
        finish_time: "SYS",
        team: str,
      }]);
    } catch (err) {}
    setEditingOrg(null);
    alert("✅ 共同發起機構圖文已儲存並同步至全站！");
  };

  const handleSavePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPerson) return;
    const exists = initiators.some((p) => p.id === editingPerson.id);
    const nextList = exists
      ? initiators.map((p) => (p.id === editingPerson.id ? editingPerson : p))
      : [editingPerson, ...initiators];
    setInitiators(nextList);
    const str = JSON.stringify(nextList);
    localStorage.setItem("g100_initiators_v12", str);
    try {
      await supabase.from("race_details_full").delete().eq("athlete_name", "__SYS_INITIATORS__");
      await supabase.from("race_details_full").insert([{
        athlete_name: "__SYS_INITIATORS__",
        race_name: "INITIATORS",
        race_date: "2026-11-05",
        category: "SYS",
        finish_time: "SYS",
        team: str,
      }]);
    } catch (err) {}
    setEditingPerson(null);
    alert("✅ 創始倡議人照片與資料已儲存並同步！");
  };

  const filteredPeople = initiators.filter(
    (p) => !searchInit.trim() || p.name.includes(searchInit.trim()) || p.title.includes(searchInit.trim())
  );

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between overflow-x-hidden">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
        
        {/* 頂部介紹 */}
        <section className="rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-amber-500/40 p-6 sm:p-10 shadow-2xl space-y-4">
          <span className="px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-extrabold uppercase">
            FOUNDED BY IRONMEDIC・GLOBAL 100 TRIATHLON CERTIFICATION
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            關於全球百鐵認證 ＆ 六大共同發起機構・百位創始倡議人
          </h1>
          <p className="text-xs sm:text-base text-zinc-300 leading-relaxed max-w-4xl">
            「全球百鐵認證」由醫護鐵人、台東城鄉運動生活協會、活動咖、臺東縣超級鐵人三項協會、輪動台灣運動協會與昇陽自行車共同發起，並匯聚超過百位產業界、演藝界與百鐵傳奇選手擔任創始倡議人。
          </p>
        </section>

        {/* 🏛️ 六大共同發起機構（如同單車誌專欄，支援管理員直接在網頁上編輯圖文與上傳 Logo！） */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-l-4 border-amber-500 pl-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                🏛️ 六大共同發起機構（點擊可前往官方頁面）
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                醫護鐵人・台東城鄉運動生活協會・活動咖・臺東縣超級鐵人三項協會・輪動台灣運動協會・昇陽自行車
              </p>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() =>
                  setEditingOrg({
                    id: "org-" + Date.now(),
                    name: "",
                    subtitle: "六大共同發起機構",
                    desc: "",
                    logoUrl: "",
                    linkUrl: "https://",
                  })
                }
                className="px-4 py-2 rounded-xl bg-amber-500 text-black font-black text-xs cursor-pointer shadow-lg self-start"
              >
                ➕ 新增發起機構卡片
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orgs.map((org) => (
              <div
                key={org.id}
                className="rounded-3xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 p-6 flex flex-col justify-between gap-4 shadow-xl transition"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-[11px] font-extrabold">
                      {org.subtitle}
                    </span>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setEditingOrg({ ...org })}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 text-black text-xs font-black cursor-pointer"
                      >
                        ✏️ 編輯圖文
                      </button>
                    )}
                  </div>

                  <div className="h-36 w-full rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-center p-4 overflow-hidden">
                    {org.logoUrl ? (
                      <img
                        src={org.logoUrl}
                        alt={org.name}
                        className="max-h-full max-w-full object-contain rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-lg font-black text-amber-400">{org.name}</span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-white">{org.name}</h3>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{org.desc}</p>
                </div>

                {org.linkUrl && (
                  <a
                    href={org.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-400 font-bold text-xs text-center transition"
                  >
                    前往機構專頁 ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 🌟 百位創始倡議人榮耀牆（每個人對應名字與照片圖檔，支援管理員隨時上傳更換照片與頭銜） */}
        <section className="space-y-6 pt-6 border-t border-zinc-800">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-l-4 border-red-600 pl-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                🌟 全球百鐵認證 百位創始倡議人榮耀牆 ({initiators.length} 位)
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                感謝百位企業領袖、跨界藝人與百鐵先行者共同連署倡議（管理員點擊卡片即可上傳更換個人照片與頭銜）。
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <input
                type="text"
                value={searchInit}
                onChange={(e) => setSearchInit(e.target.value)}
                placeholder="搜尋倡議人姓名或頭銜..."
                className="rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2 text-xs text-white outline-none focus:border-amber-500"
              />
              {isAdmin && (
                <button
                  type="button"
                  onClick={() =>
                    setEditingPerson({
                      id: "init-" + Date.now(),
                      name: "",
                      title: "全球百鐵認證創始倡議人",
                      avatarUrl: "",
                    })
                  }
                  className="px-3.5 py-2 rounded-xl bg-[#b91c1c] hover:bg-[#dc2626] text-white font-black text-xs cursor-pointer shrink-0"
                >
                  ➕ 新增倡議人
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredPeople.map((person, idx) => (
              <div
                key={person.id}
                className="rounded-2xl bg-zinc-950 border border-zinc-800/90 hover:border-amber-500/50 p-4 flex flex-col items-center text-center justify-between gap-3 shadow-lg transition group"
              >
                <div className="w-full flex flex-col items-center space-y-2.5">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-amber-500/20 to-red-900/30 border-2 border-amber-500/50 flex items-center justify-center shadow-md">
                    {person.avatarUrl ? (
                      <img
                        src={person.avatarUrl}
                        alt={person.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : null}
                    <span className="text-lg font-black text-amber-300 select-none">
                      {person.name.slice(0, 2)}
                    </span>
                  </div>

                  <div>
                    <div className="text-sm font-black text-white">{person.name}</div>
                    <div className="text-[11px] text-zinc-400 leading-snug mt-1 line-clamp-2">
                      {person.title}
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setEditingPerson({ ...person })}
                    className="w-full py-1 rounded-lg bg-zinc-900 hover:bg-amber-500 text-amber-400 hover:text-black text-[10px] font-extrabold transition cursor-pointer"
                  >
                    📷 編輯照片/姓名
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* 管理員編輯六大共同發起機構 Modal */}
      {editingOrg && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center px-4 z-50">
          <div className="bg-zinc-950 border-2 border-amber-500/60 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-black text-amber-400">✏️ 編輯共同發起機構圖文</h3>
              <button onClick={() => setEditingOrg(null)} className="text-zinc-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveOrg} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-zinc-300">機構名稱</label>
                <input
                  type="text"
                  required
                  value={editingOrg.name}
                  onChange={(e) => setEditingOrg({ ...editingOrg, name: e.target.value })}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-white font-bold mt-1"
                />
              </div>
              <div>
                <label className="font-bold text-zinc-300">副標題標籤</label>
                <input
                  type="text"
                  value={editingOrg.subtitle}
                  onChange={(e) => setEditingOrg({ ...editingOrg, subtitle: e.target.value })}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-amber-400 font-bold mt-1"
                />
              </div>
              <div>
                <label className="font-bold text-zinc-300">機構簡介說明</label>
                <textarea
                  rows={3}
                  value={editingOrg.desc}
                  onChange={(e) => setEditingOrg({ ...editingOrg, desc: e.target.value })}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-3 text-white mt-1"
                />
              </div>
              <div>
                <label className="font-bold text-zinc-300">官方網站連結 (URL)</label>
                <input
                  type="text"
                  value={editingOrg.linkUrl}
                  onChange={(e) => setEditingOrg({ ...editingOrg, linkUrl: e.target.value })}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-white font-mono mt-1"
                />
              </div>
              <div>
                <label className="font-bold text-amber-400">📷 上傳機構 Logo 或代表圖片（自動壓縮雲端同步）</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const dUrl = await compressAboutImg(f, 700, 0.86);
                    setEditingOrg({ ...editingOrg, logoUrl: dUrl });
                  }}
                  className="w-full mt-1 text-zinc-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-amber-500 file:text-black file:font-black cursor-pointer"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button type="button" onClick={() => setEditingOrg(null)} className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold">取消</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 text-black font-black cursor-pointer">💾 儲存並同步全站</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 管理員編輯創始倡議人照片與姓名 Modal */}
      {editingPerson && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center px-4 z-50">
          <div className="bg-zinc-950 border-2 border-amber-500/60 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-black text-amber-400">📷 編輯創始倡議人照片與姓名</h3>
              <button onClick={() => setEditingPerson(null)} className="text-zinc-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSavePerson} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-zinc-300">倡議人姓名</label>
                <input
                  type="text"
                  required
                  value={editingPerson.name}
                  onChange={(e) => setEditingPerson({ ...editingPerson, name: e.target.value })}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-white font-bold mt-1"
                />
              </div>
              <div>
                <label className="font-bold text-zinc-300">代表頭銜 / 完賽場次</label>
                <input
                  type="text"
                  required
                  value={editingPerson.title}
                  onChange={(e) => setEditingPerson({ ...editingPerson, title: e.target.value })}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-amber-400 font-bold mt-1"
                />
              </div>
              <div>
                <label className="font-bold text-amber-400">📷 上傳個人照片</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const dUrl = await compressAboutImg(f, 400, 0.85);
                    setEditingPerson({ ...editingPerson, avatarUrl: dUrl });
                  }}
                  className="w-full mt-1 text-zinc-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-amber-500 file:text-black file:font-black cursor-pointer"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button type="button" onClick={() => setEditingPerson(null)} className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold">取消</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 text-black font-black cursor-pointer">💾 儲存並同步</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
