"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

const DEFAULT_SIX = [
  { id: "o1", name: "醫護鐵人", role: "共同發起機構", desc: "賽道移動式安全守護與全球百鐵認證創立統籌機構。", img: "/images/sponsors/ironmedic.png" },
  { id: "o2", name: "台東城鄉運動生活協會", role: "共同發起機構", desc: "主辦臺東普悠瑪國際鐵人三項賽，深耕鐵人三項運動推廣。", img: "/images/sponsors/turaa-logo.png" },
  { id: "o3", name: "活動咖", role: "共同發起機構", desc: "指標性運動賽事報名與成績查核數位平台。", img: "/images/turaa-logo.png" },
  { id: "o4", name: "臺東縣超級鐵人三項協會", role: "共同發起機構", desc: "推廣東海岸長距離超級鐵人三項賽事與在地運動文化。", img: "/images/pakelangTSTA.jpeg" },
  { id: "o5", name: "輪動台灣運動協會", role: "共同發起機構", desc: "推動台灣長距離自行車挑戰與輪動運動發展。", img: "/images/tainan.png" },
  { id: "o6", name: "昇陽自行車", role: "共同發起機構", desc: "頂級自行車與客製化三鐵戰袍專業品牌。", img: "/images/sponsors/syb.png" }
];

export default function SixFoundingOrgsSection() {
  const supabase = createClient();
  const [orgs, setOrgs] = useState(DEFAULT_SIX);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("g100_six_orgs_real");
    if (saved) { try { setOrgs(JSON.parse(saved)); } catch (e) {} }
    supabase.from("race_details_full").select("*").eq("athlete_name", "__SYS_SIX_ORGS__").order("id", { ascending: false }).then(({ data }) => {
      if (data && data[0]?.team) {
        try { setOrgs(JSON.parse(data[0].team)); localStorage.setItem("g100_six_orgs_real", data[0].team); } catch (e) {}
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      const em = session?.user?.email?.toLowerCase() || "";
      if (em.includes("evelny") || em.includes("pianopub") || em.includes("novem")) setIsAdmin(true);
    });
  }, []);

  const saveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = orgs.map((o) => (o.id === editing.id ? editing : o));
    setOrgs(next);
    const str = JSON.stringify(next);
    localStorage.setItem("g100_six_orgs_real", str);
    await supabase.from("race_details_full").delete().eq("athlete_name", "__SYS_SIX_ORGS__");
    await supabase.from("race_details_full").insert([{ athlete_name: "__SYS_SIX_ORGS__", race_name: "SIX_ORGS", race_date: "2026-11-07", category: "SYS", finish_time: "SYS", team: str }]);
    setEditing(null);
    alert("✅ 六大共同發起機構圖文已更新！");
  };

  return (
    <section className="my-10 space-y-5">
      <div className="border-l-4 border-amber-500 pl-4">
        <h2 className="text-xl sm:text-2xl font-black text-white">🏛️ 六大共同發起機構（可點擊編輯上傳圖文）</h2>
        <p className="text-xs text-zinc-400 mt-1">醫護鐵人・台東城鄉運動生活協會・活動咖・臺東縣超級鐵人三項協會・輪動台灣運動協會・昇陽自行車</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {orgs.map((o) => (
          <div key={o.id} className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5 flex flex-col justify-between gap-3 shadow-xl">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[11px] font-bold">{o.role}</span>
                {isAdmin && <button onClick={() => setEditing({ ...o })} className="px-2.5 py-1 rounded-lg bg-amber-500 text-black text-xs font-black cursor-pointer">✏️ 編輯圖文</button>}
              </div>
              <div className="h-32 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-3 overflow-hidden">
                {o.img ? <img src={o.img} alt={o.name} className="max-h-full max-w-full object-contain" /> : <span className="font-black text-amber-400">{o.name}</span>}
              </div>
              <h3 className="text-base font-black text-white">{o.name}</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">{o.desc}</p>
            </div>
          </div>
        ))}
      </div>
      {editing && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50">
          <form onSubmit={saveOrg} className="bg-zinc-950 border-2 border-amber-500 rounded-3xl max-w-md w-full p-6 space-y-3 text-xs">
            <h3 className="text-base font-black text-amber-400">✏️ 編輯發起機構：{editing.name}</h3>
            <input type="text" required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="機構名稱" className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-2.5 text-white font-bold" />
            <input type="text" value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} placeholder="副標題" className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-2.5 text-amber-400" />
            <textarea rows={3} value={editing.desc} onChange={(e) => setEditing({ ...editing, desc: e.target.value })} placeholder="機構簡介" className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-2.5 text-white" />
            <div>
              <label className="block font-bold text-amber-300 mb-1">📷 上傳機構圖片 / Logo</label>
              <input type="file" accept="image/*" onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const r = new FileReader();
                r.onload = (ev) => setEditing({ ...editing, img: String(ev.target?.result || "") });
                r.readAsDataURL(f);
              }} className="w-full text-zinc-300" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl bg-zinc-800 text-white">取消</button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 text-black font-black">💾 儲存同步</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
