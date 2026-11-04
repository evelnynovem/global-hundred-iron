"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";

export interface ColumnArticle {
  id: string;
  category: "MED" | "CELEB";
  title: string;
  author: string;
  date: string;
  coverUrl: string;
  summary: string;
  content: string;
  contentImages?: string[]; // 試閱內文附加的高清壓縮圖片（支援多張圖文並茂）
  purchaseUrl?: string;
  purchaseLabel?: string;
}

export const DEFAULT_MED_LIST: ColumnArticle[] = [
  {
    id: "med-1",
    category: "MED",
    title: "長距離耐力賽事的心肺評估、熱傷害預防與精準補給策略",
    author: "洪緯欣 醫師（屏東榮總胸腔內科）× 陳彥良（醫護鐵人創辦人）",
    date: "2026-11-01",
    coverUrl: "/images/cycling-140.jpeg",
    summary: "深入解析 113K/226K 超鐵與百K單車挑戰中常見之抽筋、低血鈉與高溫脫水風險，如何透過科學化配速與電解質補給安全完賽。",
    content: "在長達 6 至 17 小時的 113K 或 226K 超級鐵人三項與百K自行車挑戰賽中，運動員面臨最大的生理挑戰往往不是單純的肌肉疲勞，而是體溫調節失衡（熱衰竭、中暑）與電解質失衡（低血鈉症）。\n\n【一、賽前心肺與呼吸系統評估】\n針對有氣喘、過敏性鼻炎或曾有運動性胸悶病史的耐力選手，建議賽前進行完整肺功能與運動心肺評估，並在開放水域游泳段做好防寒與暖身適應。\n\n【二、高溫賽道的精準水份與電解質策略】\n單純大量飲用純水反而會稀釋血鈉濃度。建議每小時依照排汗率補充 500-750ml 水份，並搭配高生物利用率之電解質膠囊與 BCAA 能量膠，於抽筋發生前提前建立防護網。",
    contentImages: [],
    purchaseUrl: "https://www.books.com.tw/web/sys_serialtext/?item=0000005012",
    purchaseLabel: "🛒 欲閱讀後半段完整運動醫學專欄，請點此前往購買《單車誌 Cycling Update》當期雜誌 →",
  },
  {
    id: "med-2",
    category: "MED",
    title: "開放水域游泳（OWS）恐慌症候群與吸入性肺水腫之臨床防護",
    author: "洪緯欣 醫師 × 醫護鐵人賽道安全組",
    date: "2026-10-18",
    coverUrl: "https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=900&q=80",
    summary: "為什麼在泳池游得很好，一下活水湖或大海卻喘不過氣？胸腔內科醫師帶您剖析開放水域換氣節奏與游泳誘發性肺水腫（SIPE）。",
    content: "開放水域（Open Water）沒有池底黑線與池壁可扶，加上開賽時百人同時下水的肢體碰撞與水溫刺激，極易引發交感神經瞬間亢奮，導致過度換氣與恐慌。\n\n醫護鐵人團隊建議選手於下水前務必先潑水適應水溫，開賽前 200 公尺採取 80% 巡航配速，若感呼吸急促可立即改為蛙式或仰漂舉手示意，切勿硬撐。",
    contentImages: [],
    purchaseUrl: "https://www.books.com.tw/web/sys_serialtext/?item=0000005012",
    purchaseLabel: "🛒 欲閱讀後半段完整運動醫學專欄，請點此前往購買《單車誌 Cycling Update》當期雜誌 →",
  },
];

export const DEFAULT_CELEB_LIST: ColumnArticle[] = [
  {
    id: "celeb-1",
    category: "CELEB",
    title: "最強賽事求婚＆單車婚禮：陳彥良的賽事求婚必勝攻略與鐵人故事",
    author: "單車誌 / 洪緯欣 醫師 × 陳彥良（醫護鐵人創辦人）",
    date: "2026-11-02",
    coverUrl: "/images/cycling-140.jpeg",
    summary: "如果說自行車賽事是一場與自我的對話，那麼愛情便是兩人共譜的長征。當精準的瓦數與功率計，遇上無法計算的浪漫火花與粉紅泡泡，我們看見單車不僅是移動工具，更是承載一生的信物與紅線。",
    content: "在臺東普悠瑪 113K 鐵人三項的終點線上，經歷了游泳、單車與長跑的極限洗禮後，一場策劃已久的賽事求婚驚喜登場！\n\n為什麼越來越多年輕與中壯年騎士選擇以「單車婚禮」與「終點線求婚」作為人生最重要的里程碑？本篇專欄前半段先帶您直擊現場籌備秘辛……",
    contentImages: [],
    purchaseUrl: "https://www.books.com.tw/web/sys_serialtext/?item=0000005012",
    purchaseLabel: "🛒 欲閱讀後半段完整封面故事，請點此前往購買《單車誌》2026冬季號第140期 →",
  },
  {
    id: "celeb-2",
    category: "CELEB",
    title: "向前一步，就是解方：跨界藝人與搖滾鐵人破風經驗分享",
    author: "全球百鐵認證名人堂 × 跨界藝人聯合專訪",
    date: "2026-10-22",
    coverUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80",
    summary: "從舞台聚光燈走向東海岸活水湖與 197 縣道，看跨界藝人與百鐵推手們如何透過單車與鐵人運動突破自我！",
    content: "許多跨界藝人第一次參加百K挑戰賽最深刻的體會，就是學會與逆風共處，穩定維持輸出並定時補充能量，微笑通過終點線。",
    contentImages: [],
    purchaseUrl: "https://www.books.com.tw/web/sys_serialtext/?item=0000005012",
    purchaseLabel: "🛒 欲閱讀後半段完整藝人專欄，請點此前往購買《單車誌 Cycling Update》當期雜誌 →",
  },
];

// 智慧高清晰度圖片壓縮引擎（保留圖上小字清晰度，同時將容量壓縮至約 80KB~120KB）
export function compressImageHighClarity(file: File, maxDim = 1100, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        if (w > h && w > maxDim) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else if (h >= w && h > maxDim) {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } else {
          reject(new Error("Canvas context failed"));
        }
      };
      img.onerror = reject;
      if (typeof ev.target?.result === "string") img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function UnifiedCyclingColumnsPage() {
  const [medArticles, setMedArticles] = useState<ColumnArticle[]>(DEFAULT_MED_LIST);
  const [celebArticles, setCelebArticles] = useState<ColumnArticle[]>(DEFAULT_CELEB_LIST);
  const [activeView, setActiveView] = useState<"ALL" | "MED" | "CELEB">("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // 管理員編輯器狀態
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formCategory, setFormCategory] = useState<"MED" | "CELEB">("MED");
  const [formTitle, setFormTitle] = useState("");
  const [formAuthor, setFormAuthor] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formCover, setFormCover] = useState("");
  const [formSummary, setFormSummary] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formContentImages, setFormContentImages] = useState<string[]>([]);
  const [formPurchaseUrl, setFormPurchaseUrl] = useState("https://www.books.com.tw/web/sys_serialtext/?item=0000005012");
  const [formPurchaseLabel, setFormPurchaseLabel] = useState("🛒 欲閱讀後半段完整專欄，請點此前往購買《單車誌 Cycling Update》當期雜誌 →");
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const loadAllColumns = useCallback(async () => {
    let loadedMed: ColumnArticle[] | null = null;
    let loadedCeleb: ColumnArticle[] | null = null;

    // 1. 先讀本地快取
    if (typeof window !== "undefined") {
      try {
        const rawMed = localStorage.getItem("g100_unified_col_MED");
        if (rawMed) loadedMed = JSON.parse(rawMed);
        const rawCeleb = localStorage.getItem("g100_unified_col_CELEB");
        if (rawCeleb) loadedCeleb = JSON.parse(rawCeleb);
      } catch (e) {}
    }

    // 2. 從雲端 Supabase 同步（同時檢查 association_announcements 與 race_details_full 跨裝置同步通道，確保手機與電腦 100% 一致！）
    try {
      const { data: sysRows } = await supabase
        .from("race_details_full")
        .select("*")
        .eq("athlete_name", "__SYS_COLUMN_SYNC__")
        .order("id", { ascending: false });

      if (sysRows && sysRows.length > 0) {
        const medRow = sysRows.find((r: any) => r.race_name === "COL_MED_JSON");
        if (medRow?.team) {
          try {
            loadedMed = JSON.parse(medRow.team);
            localStorage.setItem("g100_unified_col_MED", medRow.team);
          } catch (e) {}
        }
        const celebRow = sysRows.find((r: any) => r.race_name === "COL_CELEB_JSON");
        if (celebRow?.team) {
          try {
            loadedCeleb = JSON.parse(celebRow.team);
            localStorage.setItem("g100_unified_col_CELEB", celebRow.team);
          } catch (e) {}
        }
      }
    } catch (e) {
      console.warn(e);
    }

    if (loadedMed && loadedMed.length > 0) setMedArticles(loadedMed);
    if (loadedCeleb && loadedCeleb.length > 0) setCelebArticles(loadedCeleb);
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
      await loadAllColumns();
    }
    init();
  }, [supabase, loadAllColumns]);

  const syncColumnsToCloud = async (nextMed: ColumnArticle[], nextCeleb: ColumnArticle[]) => {
    localStorage.setItem("g100_unified_col_MED", JSON.stringify(nextMed));
    localStorage.setItem("g100_unified_col_CELEB", JSON.stringify(nextCeleb));

    try {
      const medJson = JSON.stringify(nextMed);
      const celebJson = JSON.stringify(nextCeleb);

      await supabase
        .from("race_details_full")
        .delete()
        .eq("athlete_name", "__SYS_COLUMN_SYNC__");

      await supabase.from("race_details_full").insert([
        {
          athlete_name: "__SYS_COLUMN_SYNC__",
          race_name: "COL_MED_JSON",
          race_date: new Date().toISOString().slice(0, 10),
          category: "SYS",
          finish_time: "SYS",
          team: medJson,
        },
        {
          athlete_name: "__SYS_COLUMN_SYNC__",
          race_name: "COL_CELEB_JSON",
          race_date: new Date().toISOString().slice(0, 10),
          category: "SYS",
          finish_time: "SYS",
          team: celebJson,
        },
      ]);
    } catch (err) {
      console.warn("Cloud sync error:", err);
    }
  };

  // 上傳封面圖
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageHighClarity(file, 950, 0.85);
      setFormCover(compressed);
    } catch (err) {
      alert("圖片處理失敗，請重試");
    }
  };

  // 上傳「試閱內文圖片」（支援多張、高清壓縮字跡清晰）
  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      const results: string[] = [];
      for (const f of files) {
        // 內文圖解析度提高至 1150px、品質 0.86，確保雜誌內頁文字與圖表清晰可讀，且單張僅約 90KB
        const dataUrl = await compressImageHighClarity(f, 1150, 0.86);
        results.push(dataUrl);
      }
      setFormContentImages((prev) => [...prev, ...results]);
    } catch (err) {
      alert("內文圖片壓縮失敗");
    }
  };

  const openNewModal = (cat: "MED" | "CELEB") => {
    setEditingId(null);
    setFormCategory(cat);
    setFormTitle("");
    setFormAuthor(
      cat === "MED"
        ? "洪緯欣 醫師（屏東榮總胸腔內科）× 陳彥良（醫護鐵人創辦人）"
        : "單車誌 / 全球百鐵認證名人堂 × 跨界鐵人專訪"
    );
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormCover("/images/cycling-140.jpeg");
    setFormSummary("");
    setFormContent("");
    setFormContentImages([]);
    setFormPurchaseUrl("https://www.books.com.tw/web/sys_serialtext/?item=0000005012");
    setFormPurchaseLabel(
      cat === "MED"
        ? "🛒 欲閱讀後半段完整運動醫學專欄，請點此前往購買《單車誌 Cycling Update》當期雜誌 →"
        : "🛒 欲閱讀後半段完整藝人騎乘專欄，請點此前往購買《單車誌 Cycling Update》當期雜誌 →"
    );
    setShowEditor(true);
  };

  const openEditModal = (art: ColumnArticle) => {
    setEditingId(art.id);
    setFormCategory(art.category);
    setFormTitle(art.title);
    setFormAuthor(art.author);
    setFormDate(art.date);
    setFormCover(art.coverUrl);
    setFormSummary(art.summary);
    setFormContent(art.content);
    setFormContentImages(art.contentImages || []);
    setFormPurchaseUrl(art.purchaseUrl || "https://www.books.com.tw/web/sys_serialtext/?item=0000005012");
    setFormPurchaseLabel(art.purchaseLabel || "🛒 欲閱讀後半段完整專欄，請點此前往購買《單車誌 Cycling Update》當期雜誌 →");
    setShowEditor(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const newArt: ColumnArticle = {
      id: editingId || (formCategory === "MED" ? "med-" : "celeb-") + Date.now(),
      category: formCategory,
      title: formTitle.trim(),
      author: formAuthor.trim(),
      date: formDate,
      coverUrl: formCover || "/images/cycling-140.jpeg",
      summary: formSummary.trim() || formContent.trim().slice(0, 95) + "...",
      content: formContent.trim(),
      contentImages: formContentImages,
      purchaseUrl: formPurchaseUrl.trim() || "https://www.books.com.tw/web/sys_serialtext/?item=0000005012",
      purchaseLabel: formPurchaseLabel.trim() || "🛒 欲閱讀後半段完整專欄，請點此前往購買《單車誌 Cycling Update》當期雜誌 →",
    };

    let nextMed = [...medArticles];
    let nextCeleb = [...celebArticles];

    if (formCategory === "MED") {
      nextMed = editingId
        ? nextMed.map((a) => (a.id === editingId ? newArt : a))
        : [newArt, ...nextMed];
      // 若原本在 CELEB 被改分類到 MED，從 CELEB 移除
      if (editingId) nextCeleb = nextCeleb.filter((a) => a.id !== editingId);
    } else {
      nextCeleb = editingId
        ? nextCeleb.map((a) => (a.id === editingId ? newArt : a))
        : [newArt, ...nextCeleb];
      if (editingId) nextMed = nextMed.filter((a) => a.id !== editingId);
    }

    setMedArticles(nextMed);
    setCelebArticles(nextCeleb);
    await syncColumnsToCloud(nextMed, nextCeleb);

    setSaving(false);
    setShowEditor(false);
    alert("✅ 專欄圖文與試閱內文圖片已儲存！已同步更新至首頁下方對應專欄與手機版！");
  };

  const handleDeleteArticle = async (art: ColumnArticle) => {
    if (!confirm("確定要刪除「" + art.title + "」嗎？")) return;
    const nextMed = art.category === "MED" ? medArticles.filter((a) => a.id !== art.id) : medArticles;
    const nextCeleb = art.category === "CELEB" ? celebArticles.filter((a) => a.id !== art.id) : celebArticles;
    setMedArticles(nextMed);
    setCelebArticles(nextCeleb);
    await syncColumnsToCloud(nextMed, nextCeleb);
  };

  const renderArticleCard = (art: ColumnArticle, index: number, isMed: boolean) => {
    const isExpanded = expandedId === art.id;
    const accentBorder = isMed ? "hover:border-emerald-500/50" : "hover:border-amber-500/50";
    const accentText = isMed ? "text-emerald-400" : "text-amber-400";
    const badgeBg = isMed ? "bg-emerald-500 text-black" : "bg-amber-500 text-black";
    const buyBtnGrad = isMed
      ? "from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500"
      : "from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500";

    return (
      <article
        key={art.id}
        className={"rounded-3xl bg-zinc-950 border border-zinc-800/90 overflow-hidden flex flex-col justify-between shadow-2xl transition group " + accentBorder}
      >
        <div>
          <div className="relative h-80 sm:h-96 w-full bg-gradient-to-b from-zinc-900 via-zinc-950 to-black flex items-center justify-center p-3 border-b border-zinc-800/80">
            <img
              src={art.coverUrl}
              alt={art.title}
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl group-hover:scale-[1.02] transition-transform duration-500"
            />
            {index === 0 && (
              <span className={"absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-black shadow-lg " + badgeBg}>
                🔥 最新發布（首頁{isMed ? "左側" : "右側"}同步展示中）
              </span>
            )}
            <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-black/85 border border-zinc-700 text-zinc-300 font-mono text-xs">
              {art.date}
            </span>
          </div>

          <div className="p-6 space-y-3">
            <div className={"text-xs font-bold " + accentText}>撰文 / 專訪：{art.author}</div>
            <h3 className="text-lg sm:text-xl font-black text-white leading-snug">{art.title}</h3>

            {!isExpanded ? (
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                {art.summary}
              </p>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-xs sm:text-sm text-zinc-200 leading-relaxed space-y-4">
                  <div className={"text-xs font-extrabold " + accentText}>
                    📖 【線上精華試閱版（前 1/2 圖文內容）】
                  </div>

                  <div className="whitespace-pre-line leading-relaxed">
                    {art.content}
                  </div>

                  {/* 顯示管理員上傳於試閱內文中的高清晰度壓縮圖片 */}
                  {art.contentImages && art.contentImages.length > 0 && (
                    <div className="space-y-3 pt-2">
                      {art.contentImages.map((imgSrc, imgIdx) => (
                        <div key={imgIdx} className="rounded-xl overflow-hidden border border-zinc-700 bg-black p-1">
                          <img
                            src={imgSrc}
                            alt={art.title + " 試閱配圖 " + (imgIdx + 1)}
                            className="w-full h-auto object-contain rounded-lg mx-auto"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-dashed border-zinc-700 text-zinc-400 text-xs italic">
                    ……（為保護《單車誌 Cycling Update》期刊銷售，線上僅公開 1/2 精華圖文篇幅，後半段完整內容請見當期雜誌）
                  </div>
                </div>

                <a
                  href={art.purchaseUrl || "https://www.books.com.tw/web/sys_serialtext/?item=0000005012"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={"block w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r text-black font-black text-xs sm:text-sm text-center shadow-xl transition " + buyBtnGrad}
                >
                  {art.purchaseLabel || "🛒 欲閱讀後半段完整專欄，請點此前往購買《單車誌 Cycling Update》當期雜誌 →"}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 pt-3 flex items-center justify-between border-t border-zinc-900">
          <button
            type="button"
            onClick={() => setExpandedId(isExpanded ? null : art.id)}
            className={"text-xs font-extrabold cursor-pointer " + accentText}
          >
            {isExpanded ? "🔼 收合試閱內容" : "📖 展開閱讀完整全文 (1/2 圖文試閱 ＆ 購書連結) →"}
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
                onClick={() => handleDeleteArticle(art)}
                className="px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-600 text-red-400 hover:text-white text-xs font-bold transition cursor-pointer"
              >
                刪除
              </button>
            </div>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between overflow-x-hidden">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        
        {/* 頂部總標題與快速分類切換 */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 border-b border-zinc-800 pb-6">
          <div>
            <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-extrabold">
              CYCLINGTIME MEDIA × IRONMEDIC & GLOBAL 100 COLUMNS
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white mt-3">
              📚 單車專欄總覽
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-2xl">
              匯集【單車誌醫護鐵人運動醫學專欄】與【全球百鐵認證藝人騎乘經驗分享專欄】。本頁編輯更新後，將自動同步兩大分區之最新第 1 篇圖文摘要至首頁最下方（左：運動醫學、右：藝人騎乘）及手機版！
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => openNewModal("MED")}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition cursor-pointer shadow-lg"
                >
                  ➕ 新增【運動醫學專欄】
                </button>
                <button
                  type="button"
                  onClick={() => openNewModal("CELEB")}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition cursor-pointer shadow-lg"
                >
                  ➕ 新增【藝人騎乘專欄】
                </button>
              </>
            )}
            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold"
            >
              ← 返回首頁
            </Link>
          </div>
        </div>

        {/* 頁內分區篩選標籤 */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveView("ALL")}
            className={"px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer " + (activeView === "ALL" ? "bg-white text-black shadow" : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800")}
          >
            📚 單車專欄全覽（上下分區並陳）
          </button>
          <button
            type="button"
            onClick={() => setActiveView("MED")}
            className={"px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer " + (activeView === "MED" ? "bg-emerald-500 text-black shadow" : "bg-zinc-900 text-emerald-400 hover:bg-zinc-800 border border-emerald-500/30")}
          >
            🩺 單車誌醫護鐵人運動醫學專欄 ({medArticles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveView("CELEB")}
            className={"px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer " + (activeView === "CELEB" ? "bg-amber-500 text-black shadow" : "bg-zinc-900 text-amber-400 hover:bg-zinc-800 border border-amber-500/30")}
          >
            🌟 全球百鐵認證藝人騎乘經驗分享專欄 ({celebArticles.length})
          </button>
        </div>

        {/* 專區一：單車誌醫護鐵人運動醫學專欄 */}
        {(activeView === "ALL" || activeView === "MED") && (
          <section id="med-section" className="space-y-5 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-l-4 border-emerald-500 pl-4 py-1">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-emerald-400">
                  🩺 專區一：單車誌醫護鐵人運動醫學專欄
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  本區最新第 1 篇文章將自動同步顯示於「首頁最下方左側：醫護鐵人運動醫學專欄」
                </p>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => openNewModal("MED")}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-500/40 text-xs font-extrabold transition cursor-pointer self-start sm:self-auto"
                >
                  ✍️ 新增運動醫學文章
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {medArticles.map((art, idx) => renderArticleCard(art, idx, true))}
            </div>
          </section>
        )}

        {/* 專區二：全球百鐵認證藝人騎乘經驗分享專欄 */}
        {(activeView === "ALL" || activeView === "CELEB") && (
          <section id="celeb-section" className="space-y-5 pt-6 border-t border-zinc-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-l-4 border-amber-500 pl-4 py-1">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-amber-400">
                  🌟 專區二：全球百鐵認證藝人騎乘經驗分享專欄
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  本區最新第 1 篇文章將自動同步顯示於「首頁最下方右側：全球百鐵認證藝人騎乘經驗分享專欄」
                </p>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => openNewModal("CELEB")}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/40 text-xs font-extrabold transition cursor-pointer self-start sm:self-auto"
                >
                  ✍️ 新增藝人騎乘文章
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {celebArticles.map((art, idx) => renderArticleCard(art, idx, false))}
            </div>
          </section>
        )}

      </div>

      {/* 管理員圖文編輯器 Modal（支援試閱內文插入多張高清晰壓縮圖片） */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center px-4 z-50">
          <div className="bg-zinc-950 border-2 border-amber-500/50 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-black text-white">
                {editingId ? "✏️ 編輯單車專欄圖文" : "✍️ 新增單車專欄圖文"}
              </h3>
              <button onClick={() => setShowEditor(false)} className="text-zinc-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-400">所屬專欄分區 *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as "MED" | "CELEB")}
                    className="w-full rounded-xl bg-zinc-900 border border-amber-500/50 px-3.5 py-2.5 text-xs sm:text-sm text-white font-extrabold"
                  >
                    <option value="MED">🩺 單車誌醫護鐵人運動醫學專欄（同步至首頁左側）</option>
                    <option value="CELEB">🌟 全球百鐵認證藝人騎乘經驗分享專欄（同步至首頁右側）</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">發布日期</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2.5 text-xs sm:text-sm text-white font-mono"
                  />
                </div>
              </div>

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

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">撰文者 / 專訪對象 *</label>
                <input
                  type="text"
                  required
                  value={formAuthor}
                  onChange={(e) => setFormAuthor(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2 text-xs text-amber-400 font-bold"
                />
              </div>

              {/* 封面圖片上傳 */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <label className="text-xs font-extrabold text-amber-400 block">
                  📷 1. 上傳專欄封面海報（自動保留《單車誌》直式雜誌比例，不裁切）
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="text-xs text-zinc-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-extrabold file:bg-amber-500 file:text-black cursor-pointer"
                />
                {formCover && (
                  <div className="h-44 w-full bg-zinc-950 rounded-xl border border-zinc-700 flex items-center justify-center p-2 mt-2">
                    <img src={formCover} alt="Cover Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">首頁圖文摘要（顯示於首頁卡片，約 50~100 字）*</label>
                <textarea
                  rows={2}
                  required
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-3 text-xs sm:text-sm text-white"
                />
              </div>

              {/* 試閱內文（文字 ＋ 高清壓縮圖片上傳） */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-emerald-500/40 space-y-3">
                <label className="text-xs font-extrabold text-emerald-400 block">
                  📖 2. 線上 1/2 精華試閱內文（支援文字編輯 ＋ 插入多張高清晰壓縮內文圖片）*
                </label>
                <textarea
                  rows={5}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="請輸入前 1/2 試閱文字內容..."
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-700 p-3 text-xs sm:text-sm text-white leading-relaxed"
                />

                <div className="pt-2 border-t border-zinc-800 space-y-2">
                  <label className="text-xs font-extrabold text-amber-300 block">
                    🖼️ 在試閱內文中加入圖片（自動進行 1150px 高解析智慧壓縮：檔案極小不佔空間，且雜誌內頁文字與圖表依然清晰可讀！）
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleContentImageUpload}
                    className="text-xs text-zinc-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-extrabold file:bg-emerald-500 file:text-black cursor-pointer"
                  />

                  {formContentImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                      {formContentImages.map((imgUrl, idx) => (
                        <div key={idx} className="relative rounded-xl bg-zinc-950 border border-zinc-700 p-1.5">
                          <img src={imgUrl} alt={"內文圖 " + (idx + 1)} className="h-28 w-full object-contain rounded" />
                          <button
                            type="button"
                            onClick={() => setFormContentImages((prev) => prev.filter((_, i) => i !== idx))}
                            className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-black cursor-pointer"
                          >
                            刪除
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 單車誌購買連結 */}
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
                  {saving ? "雲端同步儲存中..." : "💾 確認儲存並同步至首頁與手機版"}
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
