"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";

export interface ColumnArticle {
  id: string;
  title: string;
  author: string;
  date: string;
  coverUrl: string;
  summary: string;
  content: string;
  purchaseUrl?: string;
  purchaseLabel?: string;
}

const DEFAULT_CELEB_ARTICLES: ColumnArticle[] = [
  {
    id: "celeb-1",
    title: "最強賽事求婚＆單車婚禮：陳彥良的賽事求婚必勝攻略與鐵人故事",
    author: "單車誌 / 洪緯欣 醫師 × 陳彥良（醫護鐵人創辦人）",
    date: "2026-11-02",
    coverUrl: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=900&q=80",
    summary: "如果說自行車賽事是一場與自我的對話，那麼愛情便是兩人共譜的長征。當精準的瓦數與功率計，遇上無法計算的浪漫火花與粉紅泡泡，我們看見單車不僅是移動工具，更是承載一生的信物與紅線。",
    content: "在臺東普悠瑪 113K 鐵人三項的終點線上，經歷了游泳、單車與長跑的極限洗禮後，一場策劃已久的賽事求婚驚喜登場！\n\n為什麼越來越多年輕與中壯年騎士選擇以「單車婚禮」與「終點線求婚」作為人生最重要的里程碑？本篇專欄前半段先帶您直擊現場籌備秘辛……",
    purchaseUrl: "https://www.books.com.tw/web/sys_serialtext/?item=0000005012",
    purchaseLabel: "🛒 欲閱讀後半段完整封面故事，請點此前往購買《單車誌》2026冬季號第140期 →",
  },
  {
    id: "celeb-2",
    title: "向前一步，就是解方：跨界藝人與搖滾鐵人破風經驗分享",
    author: "全球百鐵認證名人堂 × 跨界藝人聯合專訪",
    date: "2026-10-22",
    coverUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80",
    summary: "從舞台聚光燈走向東海岸活水湖與 197 縣道，看跨界藝人與百鐵推手們如何透過單車與鐵人運動突破自我！",
    content: "許多跨界藝人第一次參加百K挑戰賽最深刻的體會，就是學會與逆風共處，穩定維持輸出並定時補充能量，微笑通過終點線。",
    purchaseUrl: "https://www.books.com.tw/web/sys_serialtext/?item=0000005012",
    purchaseLabel: "🛒 欲閱讀後半段完整藝人專欄，請點此前往購買《單車誌 Cycling Update》當期雜誌 →",
  },
];

export default function CelebrityColumnPage() {
  const [articles, setArticles] = useState<ColumnArticle[]>(DEFAULT_CELEB_ARTICLES);
  const [selectedArticle, setSelectedArticle] = useState<ColumnArticle | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formAuthor, setFormAuthor] = useState("全球百鐵認證名人堂 × 跨界鐵人專訪");
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formCover, setFormCover] = useState("");
  const [formSummary, setFormSummary] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formPurchaseUrl, setFormPurchaseUrl] = useState("https://www.books.com.tw/web/sys_serialtext/?item=0000005012");
  const [formPurchaseLabel, setFormPurchaseLabel] = useState("🛒 欲閱讀後半段完整藝人專欄，請點此前往購買《單車誌 Cycling Update》當期雜誌 →");
  const [saving, setSaving] = useState(false);

  const supabase = createClient();
  const storageTag = "COL_CELEBRITY";

  const loadArticles = useCallback(async () => {
    try {
      const { data: cloudRows } = await supabase
        .from("association_announcements")
        .select("*")
        .eq("tag", storageTag)
        .order("date", { ascending: false });

      if (cloudRows && cloudRows.length > 0) {
        const list: ColumnArticle[] = [];
        cloudRows.forEach((r: any) => {
          try {
            const item = JSON.parse(r.pdf_url || "{}");
            if (item.title && !list.some((x) => x.title === item.title)) {
              list.push(item);
            }
          } catch (e) {}
        });

        DEFAULT_CELEB_ARTICLES.forEach((def) => {
          if (!list.some((x) => x.title === def.title)) list.push(def);
        });

        if (list.length > 0) {
          setArticles(list);
          localStorage.setItem("g100_col_" + storageTag, JSON.stringify(list));
        }
      }
    } catch (err) {
      console.warn(err);
    }
  }, [supabase]);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const em = session.user.email.toLowerCase();
        const meta = session.user.user_metadata?.full_name || "";
        if (em.includes("evelny") || em.includes("pianopub") || em.includes("novem") || meta.includes("洪緯欣") || meta.includes("陳彥良")) {
          setIsAdmin(true);
        }
      }
      await loadArticles();
    }
    init();
  }, [supabase, loadArticles]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 950;
        let w = img.width;
        let h = img.height;
        if (w > h && w > MAX_DIM) {
          h = Math.round((h * MAX_DIM) / w);
          w = MAX_DIM;
        } else if (h >= w && h > MAX_DIM) {
          w = Math.round((w * MAX_DIM) / h);
          h = MAX_DIM;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          setFormCover(canvas.toDataURL("image/jpeg", 0.85));
        }
      };
      if (typeof ev.target?.result === "string") img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const openNewModal = () => {
    setEditingId(null);
    setFormTitle("");
    setFormAuthor("全球百鐵認證名人堂 × 跨界鐵人專訪");
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormCover("");
    setFormSummary("");
    setFormContent("");
    setFormPurchaseUrl("https://www.books.com.tw/web/sys_serialtext/?item=0000005012");
    setFormPurchaseLabel("🛒 欲閱讀後半段完整藝人專欄，請點此前往購買《單車誌 Cycling Update》當期雜誌 →");
    setShowEditor(true);
  };

  const openEditModal = (art: ColumnArticle) => {
    setEditingId(art.id);
    setFormTitle(art.title);
    setFormAuthor(art.author);
    setFormDate(art.date);
    setFormCover(art.coverUrl);
    setFormSummary(art.summary);
    setFormContent(art.content);
    setFormPurchaseUrl(art.purchaseUrl || "https://www.books.com.tw/web/sys_serialtext/?item=0000005012");
    setFormPurchaseLabel(art.purchaseLabel || "🛒 欲閱讀後半段完整藝人專欄，請點此前往購買《單車誌 Cycling Update》當期雜誌 →");
    setShowEditor(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const newArt: ColumnArticle = {
      id: editingId || "celeb-" + Date.now(),
      title: formTitle.trim(),
      author: formAuthor.trim(),
      date: formDate,
      coverUrl: formCover || DEFAULT_CELEB_ARTICLES[0].coverUrl,
      summary: formSummary.trim() || formContent.trim().slice(0, 95) + "...",
      content: formContent.trim(),
      purchaseUrl: formPurchaseUrl.trim() || "https://www.books.com.tw/web/sys_serialtext/?item=0000005012",
      purchaseLabel: formPurchaseLabel.trim() || "🛒 欲閱讀後半段完整藝人專欄，請點此前往購買《單車誌 Cycling Update》當期雜誌 →",
    };

    const updated = editingId
      ? articles.map((a) => (a.id === editingId ? newArt : a))
      : [newArt, ...articles];

    setArticles(updated);
    localStorage.setItem("g100_col_" + storageTag, JSON.stringify(updated));

    try {
      await supabase.from("association_announcements").delete().eq("tag", storageTag).eq("title", newArt.title);
      await supabase.from("association_announcements").insert([
        {
          title: newArt.title,
          tag: storageTag,
          date: newArt.date,
          is_pinned: false,
          pdf_url: JSON.stringify(newArt),
        },
      ]);
    } catch (err) {
      console.warn(err);
    }

    setSaving(false);
    setShowEditor(false);
    alert("✅ 藝人騎乘專欄文章已儲存發布！");
  };

  const handleDeleteArticle = async (id: string, title: string) => {
    if (!confirm("確定要刪除此篇藝人專欄文章嗎？")) return;
    const updated = articles.filter((a) => a.id !== id);
    setArticles(updated);
    localStorage.setItem("g100_col_" + storageTag, JSON.stringify(updated));
    try {
      await supabase.from("association_announcements").delete().eq("tag", storageTag).eq("title", title);
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between overflow-x-hidden">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-extrabold">
              GLOBAL 100 CELEBRITY & PRO RIDERS
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white mt-3">
              🌟 全球百鐵認證藝人騎乘經驗分享專欄
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-2xl">
              本頁專門刊登【全球百鐵認證藝人騎乘與鐵人故事專欄】（不含運動醫學文章）。線上提供 1/2 精華試閱，完整專訪歡迎點擊購買當期《單車誌》！
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isAdmin && (
              <button
                type="button"
                onClick={openNewModal}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs sm:text-sm transition cursor-pointer shadow-lg"
              >
                ✍️ 新增藝人騎乘專欄圖文 ＆ 設定購買連結
              </button>
            )}
            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold"
            >
              ← 返回首頁
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((art, index) => {
            const isExpanded = selectedArticle?.id === art.id;
            const buyUrl = art.purchaseUrl || "https://www.books.com.tw/web/sys_serialtext/?item=0000005012";
            const buyText = art.purchaseLabel || "🛒 欲閱讀後半段完整藝人專欄，請點此前往購買《單車誌 Cycling Update》當期雜誌 →";

            return (
              <article
                key={art.id}
                className="rounded-3xl bg-zinc-950 border border-zinc-800/90 hover:border-amber-500/50 overflow-hidden flex flex-col justify-between shadow-2xl transition group"
              >
                <div>
                  <div className="relative h-80 sm:h-96 w-full bg-gradient-to-b from-zinc-900 via-zinc-950 to-black flex items-center justify-center p-3 border-b border-zinc-800/80">
                    <img
                      src={art.coverUrl}
                      alt={art.title}
                      className="max-h-full max-w-full object-contain rounded-lg shadow-2xl group-hover:scale-[1.02] transition-transform duration-500"
                    />
                    {index === 0 && (
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-500 text-black text-[11px] font-black shadow-lg">
                        🔥 最新發布（首頁同步展示中）
                      </span>
                    )}
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-black/85 border border-zinc-700 text-zinc-300 font-mono text-xs">
                      {art.date}
                    </span>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="text-xs font-bold text-amber-400">撰文 / 專訪：{art.author}</div>
                    <h2 className="text-lg sm:text-xl font-black text-white leading-snug">{art.title}</h2>

                    {!isExpanded ? (
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                        {art.summary}
                      </p>
                    ) : (
                      <div className="space-y-4 pt-2">
                        <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
                          <div className="text-[11px] font-extrabold text-amber-400 mb-2">
                            📖 【線上精華試閱版（前 1/2 內容）】
                          </div>
                          {art.content}
                          <div className="mt-4 pt-3 border-t border-dashed border-zinc-700 text-zinc-400 text-xs italic">
                            ……（為保護《單車誌 Cycling Update》期刊銷售，線上僅公開 1/2 精華篇幅，完整專訪請見當期雜誌）
                          </div>
                        </div>

                        <a
                          href={buyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-black font-black text-xs sm:text-sm text-center shadow-xl transition"
                        >
                          {buyText}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-6 pt-3 flex items-center justify-between border-t border-zinc-900">
                  <button
                    type="button"
                    onClick={() => setSelectedArticle(isExpanded ? null : art)}
                    className="text-xs font-extrabold text-amber-400 hover:text-amber-300 cursor-pointer"
                  >
                    {isExpanded ? "🔼 收合試閱內容" : "📖 展開閱讀完整全文 (1/2 試閱 ＆ 購書連結) →"}
                  </button>

                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(art)}
                        className="px-3 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-black text-xs font-extrabold transition cursor-pointer"
                      >
                        ✏️ 編輯
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteArticle(art.id, art.title)}
                        className="px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-600 text-red-400 hover:text-white text-xs font-bold transition cursor-pointer"
                      >
                        刪除
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {showEditor && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center px-4 z-50">
          <div className="bg-zinc-950 border border-amber-500/50 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-black text-white">
                {editingId ? "✏️ 編輯藝人騎乘專欄" : "✍️ 新增藝人騎乘專欄"}
              </h3>
              <button onClick={() => setShowEditor(false)} className="text-zinc-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">文章標題 *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2.5 text-sm text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">作者 / 專訪對象 *</label>
                  <input
                    type="text"
                    required
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2 text-xs text-amber-400 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">發布日期</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <label className="text-xs font-extrabold text-amber-400 block">
                  📷 上傳封面或配圖（完整保留直式比例不裁切）
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-xs text-zinc-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-extrabold file:bg-amber-500 file:text-black cursor-pointer"
                />
                {formCover && (
                  <div className="h-48 w-full bg-zinc-950 rounded-xl border border-zinc-700 flex items-center justify-center p-2 mt-2">
                    <img src={formCover} alt="Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">首頁圖文摘要 *</label>
                <textarea
                  rows={2}
                  required
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-3 text-xs sm:text-sm text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-400">
                  📖 線上 1/2 精華試閱內文 *
                </label>
                <textarea
                  rows={5}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-3 text-xs sm:text-sm text-white leading-relaxed"
                />
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-amber-400 block">
                    🛒 《單車誌》指定購買連結網址 *
                  </label>
                  <input
                    type="url"
                    required
                    value={formPurchaseUrl}
                    onChange={(e) => setFormPurchaseUrl(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 block">
                    購買導流按鈕文字
                  </label>
                  <input
                    type="text"
                    value={formPurchaseLabel}
                    onChange={(e) => setFormPurchaseLabel(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2 text-xs text-amber-300 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowEditor(false)} className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-bold">取消</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-amber-500 text-black text-xs sm:text-sm font-black cursor-pointer">
                  {saving ? "儲存發布中..." : "💾 確認儲存並同步更新"}
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
