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
}

const DEFAULT_ARTICLES: ColumnArticle[] = [
  {
    "id": "celeb-1",
    "title": "向前一步，就是解方：狂飆的鐵人與跨界藝人破風故事",
    "author": "陳彥良、洪緯欣 × 跨界藝人與搖滾鐵人聯合專訪",
    "date": "2026-11-02",
    "coverUrl": "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=900&q=80",
    "summary": "從舞台聚光燈走向東海岸活水湖與 197 縣道，看跨界藝人與百鐵推手們如何透過游泳、單車與跑步療癒焦慮、突破中年危機！",
    "content": "在《向前一步，就是解方：狂飆的18鐵人人生處方箋》與單車誌系列專訪中，我們記錄了來自演藝圈、搖滾樂團、企業領袖與醫療前線的鐵人們，如何用一場又一場的耐力挑戰改寫人生。\n\n無論是面對工作高壓、人生低谷還是自我懷疑，當你跨上公路車、踩上卡踏迎向逆風的那一刻，所有的焦慮都會化為規律的踏頻與呼吸。全球百鐵認證不僅記錄完賽數字，更為每一位勇敢出發的靈魂見證榮耀！"
  },
  {
    "id": "celeb-2",
    "title": "挑戰東海岸最美縱谷：戀戀197與百鐵馬完賽配速心法",
    "author": "全球百鐵認證名人堂騎士團",
    "date": "2026-10-22",
    "coverUrl": "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80",
    "summary": "首次挑戰百K公路賽與197縣道連續丘陵該如何分配體力？名人堂騎士公開私房齒比選擇與補給時間表。",
    "content": "許多車友第一次參加百K挑戰賽最常犯的錯誤，就是開賽前 30 公里跟著領先集團過度衝刺，導致後半段進入爬坡段時雙腿抽筋。\n\n透過全球百鐵認證的歷年完賽數據分析，穩定維持個人 FTP 75%~80% 的輸出，並在每 45 分鐘定時補充能量膠與電解質，是微笑通過終點線的不二法門。"
  }
];

export default function ColumnPage() {
  const [articles, setArticles] = useState<ColumnArticle[]>(DEFAULT_ARTICLES);
  const [selectedArticle, setSelectedArticle] = useState<ColumnArticle | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // 管理員網頁直接新增/編輯圖文 Modal
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formAuthor, setFormAuthor] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formCover, setFormCover] = useState("");
  const [formSummary, setFormSummary] = useState("");
  const [formContent, setFormContent] = useState("");
  const [saving, setSaving] = useState(false);

  const supabase = createClient();
  const storageTag = "COL_CELEBRITY";

  const loadArticles = useCallback(async () => {
    const localRaw = localStorage.getItem("g100_col_" + storageTag);
    let merged = DEFAULT_ARTICLES;
    if (localRaw) {
      try {
        merged = JSON.parse(localRaw);
        setArticles(merged);
      } catch (e) {}
    }

    try {
      const { data: cloudRows } = await supabase
        .from("association_announcements")
        .select("*")
        .eq("tag", storageTag)
        .order("date", { ascending: false });

      if (cloudRows && cloudRows.length > 0) {
        const parsedList: ColumnArticle[] = [];
        cloudRows.forEach((r: any) => {
          try {
            const item = JSON.parse(r.pdf_url || "{}");
            if (item.title) parsedList.push(item);
          } catch (e) {}
        });
        if (parsedList.length > 0) {
          setArticles(parsedList);
          localStorage.setItem("g100_col_" + storageTag, JSON.stringify(parsedList));
        }
      }
    } catch (err) {
      console.warn(err);
    }
  }, [supabase, storageTag]);

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

  // 網頁直接上傳專欄配圖並自動 Canvas 壓縮（完全免跑終端機！）
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_W = 800;
        let w = img.width;
        let h = img.height;
        if (w > MAX_W) {
          h = Math.round((h * MAX_W) / w);
          w = MAX_W;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          setFormCover(canvas.toDataURL("image/jpeg", 0.8));
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
    setShowEditor(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const newArt: ColumnArticle = {
      id: editingId || "art-" + Date.now(),
      title: formTitle.trim(),
      author: formAuthor.trim(),
      date: formDate,
      coverUrl: formCover || DEFAULT_ARTICLES[0].coverUrl,
      summary: formSummary.trim() || formContent.trim().slice(0, 95) + "...",
      content: formContent.trim(),
    };

    const updated = editingId
      ? articles.map((a) => (a.id === editingId ? newArt : a))
      : [newArt, ...articles];

    setArticles(updated);
    localStorage.setItem("g100_col_" + storageTag, JSON.stringify(updated));

    try {
      await supabase.from("association_announcements").delete().eq("tag", storageTag);
      const payload = updated.map((item) => ({
        title: item.title,
        tag: storageTag,
        date: item.date,
        is_pinned: false,
        pdf_url: JSON.stringify(item),
      }));
      await supabase.from("association_announcements").insert(payload);
    } catch (err) {
      console.warn(err);
    }

    setSaving(false);
    setShowEditor(false);
    alert("✅ 專欄文章與配圖已發布！首頁下方的專欄區塊已自動同步抓取最新圖文摘要！");
  };

  const handleDeleteArticle = async (id: string, title: string) => {
    if (!confirm("確定要刪除「" + title + "」這篇專欄文章嗎？")) return;
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
              匯聚跨界藝人、搖滾樂手與百鐵傳奇推手，分享從初鐵到百鐵、從舞台聚光燈走向東海岸賽道的真實破風故事。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isAdmin && (
              <button
                type="button"
                onClick={openNewModal}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs sm:text-sm transition cursor-pointer shadow-lg"
              >
                ✍️ 新增專欄圖文（首頁自動同步抓取最新一篇）
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

        {/* 專欄文章列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((art, index) => (
            <article
              key={art.id}
              className="rounded-3xl bg-zinc-950 border border-zinc-800/90 hover:border-amber-500/50 overflow-hidden flex flex-col justify-between shadow-2xl transition group"
            >
              <div>
                <div className="relative h-56 w-full bg-zinc-900 overflow-hidden">
                  <img
                    src={art.coverUrl}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {index === 0 && (
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-black shadow">
                      🔥 最新發布（首頁同步展示中）
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-black/80 text-zinc-300 font-mono text-xs">
                    {art.date}
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <div className="text-xs font-bold text-amber-400">撰文 / 專訪：{art.author}</div>
                  <h2 className="text-lg sm:text-xl font-black text-white leading-snug">{art.title}</h2>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                    {selectedArticle?.id === art.id ? art.content : art.summary}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setSelectedArticle(selectedArticle?.id === art.id ? null : art)}
                  className="text-xs font-extrabold text-amber-400 hover:text-amber-300 cursor-pointer"
                >
                  {selectedArticle?.id === art.id ? "🔼 收合完整文章" : "📖 展開閱讀完整全文 →"}
                </button>

                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(art)}
                      className="px-3 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-black text-xs font-extrabold transition cursor-pointer"
                    >
                      ✏️ 編輯圖文
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
          ))}
        </div>

      </div>

      {/* 管理員網頁端直接上傳圖片與編輯文章 Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center px-4 z-50">
          <div className="bg-zinc-950 border border-amber-500/50 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-black text-white">
                {editingId ? "✏️ 編輯專欄圖文" : "✍️ 新增專欄圖文（發布後自動同步至首頁）"}
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
                  📷 直接從電腦/手機選擇專欄配圖上傳（自動壓縮免跑終端機，或貼上圖片網址）
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-xs text-zinc-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-extrabold file:bg-amber-500 file:text-black cursor-pointer"
                />
                <input
                  type="text"
                  value={formCover}
                  onChange={(e) => setFormCover(e.target.value)}
                  placeholder="或直接貼上圖片網址 /images/..."
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 mt-2"
                />
                {formCover && (
                  <img src={formCover} alt="Preview" className="h-36 w-full object-cover rounded-xl border border-zinc-700 mt-2" />
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">首頁圖文摘要（顯示於首頁專欄卡片，約 50~100 字）*</label>
                <textarea
                  rows={2}
                  required
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-3 text-xs sm:text-sm text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">專欄完整內文 *</label>
                <textarea
                  rows={6}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-3 text-xs sm:text-sm text-white leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowEditor(false)} className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-bold">取消</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-amber-500 text-black text-xs sm:text-sm font-black cursor-pointer">
                  {saving ? "儲存發布中..." : "💾 確認發布並同步更新至首頁"}
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
