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
    "id": "med-1",
    "title": "長距離耐力賽事的心肺評估、熱傷害預防與精準補給策略",
    "author": "洪緯欣 醫師（屏東榮總胸腔內科）× 陳彥良（醫護鐵人創辦人）",
    "date": "2026-11-01",
    "coverUrl": "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=900&q=80",
    "summary": "深入解析 113K/226K 超鐵與百K單車挑戰中常見之抽筋、低血鈉與高溫脫水風險，如何透過科學化配速與電解質補給安全完賽。",
    "content": "在長達 6 至 17 小時的 113K 或 226K 超級鐵人三項與百K自行車挑戰賽中，運動員面臨最大的生理挑戰往往不是單純的肌肉疲勞，而是體溫調節失衡（熱衰竭、中暑）與電解質失衡（低血鈉症）。\n\n【一、賽前心肺與呼吸系統評估】\n針對有氣喘、過敏性鼻炎或曾有運動性胸悶病史的耐力選手，建議賽前進行完整肺功能與運動心肺評估，並在開放水域游泳段做好防寒與暖身適應。\n\n【二、高溫賽道的精準水份與電解質策略】\n單純大量飲用純水反而會稀釋血鈉濃度。建議每小時依照排汗率補充 500-750ml 水份，並搭配高生物利用率之電解質膠囊與 BCAA 能量膠，於抽筋發生前提前建立防護網。"
  },
  {
    "id": "med-2",
    "title": "開放水域游泳（OWS）恐慌症候群與吸入性肺水腫之臨床防護",
    "author": "洪緯欣 醫師 × 醫護鐵人賽道安全組",
    "date": "2026-10-18",
    "coverUrl": "https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=900&q=80",
    "summary": "為什麼在泳池游得很好，一下活水湖或大海卻喘不過氣？胸腔內科醫師帶您剖析開放水域換氣節奏與游泳誘發性肺水腫（SIPE）。",
    "content": "開放水域（Open Water）沒有池底黑線與池壁可扶，加上開賽時百人同時下水的肢體碰撞與水溫刺激，極易引發交感神經瞬間亢奮，導致過度換氣與恐慌。\n\n醫護鐵人團隊建議選手於下水前務必先潑水適應水溫，開賽前 200 公尺採取 80% 巡航配速，若感呼吸急促可立即改為蛙式或仰漂舉手示意，切勿硬撐。"
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
  const storageTag = "COL_SPORTS_MED";

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
    setFormAuthor("洪緯欣 醫師 × 陳彥良 創辦人（醫護鐵人團隊）");
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
              CYCLINGTIME × IRONMEDIC SPORTS MEDICINE
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white mt-3">
              📚 單車誌醫護鐵人運動醫學專欄
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-2xl">
              由屏東榮總胸腔內科洪緯欣醫師、醫護鐵人創辦人陳彥良與專業醫療團隊共同執筆，提供耐力運動員最權威的運動醫學與安全補給指南。
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
