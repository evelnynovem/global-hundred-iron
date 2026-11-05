"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";
import MilestoneCertificateAndPerks from "@/components/MilestoneCertificateAndPerks";

interface ShopProduct {
  id: string;
  categoryLabel: string;
  badgeText: string;
  title: string;
  priceText: string;
  description: string;
  bullets: string[];
  buttonLabel: string;
  buyUrl: string;
  imageUrl: string;
}

const DEFAULT_SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: "shop-1",
    categoryLabel: "官方授證紀念",
    badgeText: "達成階梯限定",
    title: "全球百鐵認證 專屬雷雕紀念獎牌",
    priceText: "NT$ 200",
    description: "採用台灣天然芳香樟木精緻雷雕，專屬刻印您的姓名、達成場次（初鐵/十鐵/五十鐵/百鐵）與完賽日期。",
    bullets: ["天然樟木立體雷雕", "客製化刻印姓名與達成賞別", "含專屬紀念保護包裝"],
    buttonLabel: "立即申購獎牌 (NT$ 200) ↗",
    buyUrl: "https://line.me/R/ti/p/@ironmedic",
    imageUrl: "",
  },
  {
    id: "shop-2",
    categoryLabel: "官方授證紀念",
    badgeText: "最受歡迎組合",
    title: "全球百鐵認證 獎牌 + 裱框水晶證書組",
    priceText: "NT$ 200",
    description: "包含專屬階段賞別證書與精緻外框，適合擺設於家中或辦公室榮耀展示牆，紀錄每一個突破自我的里程碑。",
    bullets: ["官方認證專屬賞別獎狀", "高質感精緻裱框與防偽印記", "可搭配下方線上預覽直接下單出貨"],
    buttonLabel: "立即申購獎牌 + 框 (NT$ 200) ↗",
    buyUrl: "https://line.me/R/ti/p/@ironmedic",
    imageUrl: "",
  },
  {
    id: "shop-3",
    categoryLabel: "個人榮耀旗幟",
    badgeText: "終點拱門焦點",
    title: "全球百鐵認證 客製化終點大刀旗幟",
    priceText: "專案客製報價",
    description: "1100mm × 3000mm / 4000mm 巨型抗風水滴大刀旗，印有全球百鐵認證金章、駿馬圖騰與選手專屬大名，賽事終點最霸氣的榮耀象徵！",
    bullets: ["尺寸規格：寬 1100mm × 高 3000mm (含旗桿 4000mm)", "專屬印製選手大名與百鐵榮耀駿馬圖騰", "適合百鐵達成、授證典禮與車隊主場佈置"],
    buttonLabel: "立即洽詢客製化大刀旗幟 ↗",
    buyUrl: "https://line.me/R/ti/p/@ironmedic",
    imageUrl: "",
  },
  {
    id: "shop-4",
    categoryLabel: "聯名戰袍",
    badgeText: "百鐵榮耀戰袍",
    title: "全球百鐵認證 × 昇陽 SYB 客製化頂級三鐵衣",
    priceText: "依款式報價",
    description: "由昇陽自行車專業團隊操刀，採用高透氣低風阻義大利進口布料，可印製個人專屬百鐵編號與姓名。",
    bullets: ["專業長距離三鐵競速剪裁", "可客製印製個人姓名/百鐵認證標章", "昇陽官方品質保固"],
    buttonLabel: "立即前往預訂百鐵聯名戰袍 ↗",
    buyUrl: "https://www.syb-cycling.com/",
    imageUrl: "",
  },
];

function compressShopImg(file: File, maxW = 900, q = 0.85): Promise<string> {
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

export default function ShopPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<ShopProduct[]>(DEFAULT_SHOP_PRODUCTS);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingProd, setEditingProd] = useState<ShopProduct | null>(null);

  // 同步讀取登入會員姓名與完賽場次，傳給下方水晶證書元件（與會員中心 100% 同步！）
  const [memberName, setMemberName] = useState("陳彥良");
  const [memberTriCount, setMemberTriCount] = useState(1);
  const [memberCycCount, setMemberCycCount] = useState(1);

  const loadShopAndMember = useCallback(async () => {
    try {
      const localProds = localStorage.getItem("g100_shop_products_v8");
      if (localProds) setProducts(JSON.parse(localProds));

      const { data: sysRows } = await supabase
        .from("race_details_full")
        .select("*")
        .eq("athlete_name", "__SYS_SHOP_JSON__")
        .order("id", { ascending: false });

      if (sysRows && sysRows.length > 0 && sysRows[0].team) {
        const parsed = JSON.parse(sysRows[0].team);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          localStorage.setItem("g100_shop_products_v8", sysRows[0].team);
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const em = session.user.email.toLowerCase();
        const meta = session.user.user_metadata?.full_name || "";
        if (em.includes("evelny") || em.includes("pianopub") || em.includes("novem") || meta.includes("陳彥良") || meta.includes("洪緯欣")) {
          setIsAdmin(true);
        }
        const targetName = meta || (em.includes("pianopub") ? "陳彥良" : em.includes("evelny") ? "洪緯欣" : "會員選手");
        setMemberName(targetName);

        const { data: triRows } = await supabase
          .from("race_details_full")
          .select("race_date")
          .eq("athlete_name", targetName);
        if (triRows && triRows.length > 0) {
          const uniqueDays = new Set(triRows.map((r: any) => String(r.race_date || "").trim().replace(/\\//g, "-")));
          setMemberTriCount(Math.max(1, uniqueDays.size));
        } else if (targetName === "陳彥良") {
          setMemberTriCount(105);
          setMemberCycCount(53);
        }
      }
    } catch (e) {}
  }, [supabase]);

  useEffect(() => {
    loadShopAndMember();
  }, [loadShopAndMember]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProd) return;
    const nextList = products.map((p) => (p.id === editingProd.id ? editingProd : p));
    setProducts(nextList);
    const jsonStr = JSON.stringify(nextList);
    localStorage.setItem("g100_shop_products_v8", jsonStr);
    try {
      await supabase.from("race_details_full").delete().eq("athlete_name", "__SYS_SHOP_JSON__");
      await supabase.from("race_details_full").insert([{
        athlete_name: "__SYS_SHOP_JSON__",
        race_name: "SHOP_CONFIG",
        race_date: new Date().toISOString().slice(0, 10),
        category: "SYS",
        finish_time: "SYS",
        team: jsonStr,
      }]);
    } catch (err) {}
    setEditingProd(null);
    alert("✅ 榮耀商城商品圖文與購買連結已儲存並跨裝置同步！");
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between overflow-x-hidden">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-12 space-y-10">
        
        {/* 頂部標題 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-extrabold uppercase">
              GLOBAL 100 HONOR SHOP & CERTIFICATE CENTER
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white mt-3">
              🏅 榮耀商城 ＆ 階段賞別水晶證書中心
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              專為全球百鐵認證英雄打造的階段賞別水晶證書、樟木雷雕獎牌、終點大刀旗幟與昇陽 SYB 聯名三鐵戰袍。
            </p>
          </div>
          <Link href="/profile" className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold shrink-0">
            👤 前往會員中心同步資料 →
          </Link>
        </div>

        {/* 4 大榮耀商城商品卡片（比照第9張截圖 image_f23b7b.png，支援管理員直接編輯圖文與購買連結） */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="rounded-3xl bg-zinc-950 border border-amber-500/30 hover:border-amber-500/60 p-6 flex flex-col justify-between gap-5 shadow-2xl transition"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400">{prod.categoryLabel}</span>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-[11px] font-extrabold">
                      {prod.badgeText}
                    </span>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setEditingProd({ ...prod })}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 text-black text-xs font-black cursor-pointer shadow"
                      >
                        ✏️ 編輯商品圖文/連結
                      </button>
                    )}
                  </div>
                </div>

                {/* 商品圖片展示框 */}
                <div className="h-52 w-full rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-center p-4 overflow-hidden">
                  {prod.imageUrl ? (
                    <img src={prod.imageUrl} alt={prod.title} className="max-h-full max-w-full object-contain rounded-lg" />
                  ) : (
                    <div className="w-36 h-36 rounded-full border-4 border-amber-400/80 bg-zinc-950 flex flex-col items-center justify-center text-center p-2 shadow-xl">
                      <span className="text-[10px] font-black text-amber-400">GLOBAL 全球</span>
                      <span className="text-sm font-black text-amber-300 border-y border-amber-400/50 py-0.5 my-0.5 px-2">百鐵認證</span>
                      <span className="text-[10px] font-black text-amber-400">100 TRIATHLON</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-lg sm:text-xl font-black text-white">{prod.title}</h2>
                  <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                    {prod.priceText}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {prod.description}
                </p>

                <ul className="space-y-1.5 pt-1">
                  {prod.bullets.map((b, i) => (
                    <li key={i} className="text-xs text-zinc-300 flex items-center gap-2">
                      <span className="text-amber-400 font-black">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={prod.buyUrl || "https://line.me/R/ti/p/@ironmedic"}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs sm:text-sm text-center shadow-lg transition cursor-pointer"
              >
                {prod.buttonLabel}
              </a>
            </div>
          ))}
        </section>

        {/* 與會員中心 100% 同步的「階段賞別水晶證書產生器 ＆ 點數換好康加價購」 */}
        <MilestoneCertificateAndPerks
          athleteName={memberName}
          triCount={memberTriCount}
          cycCount={memberCycCount}
          isAdmin={isAdmin}
        />

      </div>

      {/* 管理員編輯榮耀商城商品 Modal */}
      {editingProd && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center px-4 z-50">
          <div className="bg-zinc-950 border-2 border-amber-500/60 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-black text-amber-400">
                ✏️ 編輯榮耀商城商品：{editingProd.title}
              </h3>
              <button onClick={() => setEditingProd(null)} className="text-zinc-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-300">商品名稱</label>
                <input
                  type="text"
                  required
                  value={editingProd.title}
                  onChange={(e) => setEditingProd({ ...editingProd, title: e.target.value })}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-300">價格顯示文字（如 NT$ 200）</label>
                  <input
                    type="text"
                    required
                    value={editingProd.priceText}
                    onChange={(e) => setEditingProd({ ...editingProd, priceText: e.target.value })}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-amber-400 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-zinc-300">右上角標籤</label>
                  <input
                    type="text"
                    value={editingProd.badgeText}
                    onChange={(e) => setEditingProd({ ...editingProd, badgeText: e.target.value })}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300">商品介紹說明</label>
                <textarea
                  rows={3}
                  value={editingProd.description}
                  onChange={(e) => setEditingProd({ ...editingProd, description: e.target.value })}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-3 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300">特色條列（每行一項）</label>
                <textarea
                  rows={3}
                  value={editingProd.bullets.join("\n")}
                  onChange={(e) => setEditingProd({ ...editingProd, bullets: e.target.value.split("\n") })}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-3 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300">購買按鈕文字</label>
                <input
                  type="text"
                  required
                  value={editingProd.buttonLabel}
                  onChange={(e) => setEditingProd({ ...editingProd, buttonLabel: e.target.value })}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-amber-300 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-amber-400">🔗 點擊按鈕跳轉之購買網址 (URL)</label>
                <input
                  type="url"
                  required
                  value={editingProd.buyUrl}
                  onChange={(e) => setEditingProd({ ...editingProd, buyUrl: e.target.value })}
                  className="w-full rounded-xl bg-zinc-900 border border-amber-500/50 px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300">📷 上傳商品展示圖片（自動壓縮同步）</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const dUrl = await compressShopImg(f, 900, 0.85);
                    setEditingProd({ ...editingProd, imageUrl: dUrl });
                  }}
                  className="w-full text-zinc-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-amber-500 file:text-black file:font-black cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button type="button" onClick={() => setEditingProd(null)} className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold">取消</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 text-black font-black cursor-pointer">💾 儲存並同步全站</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
