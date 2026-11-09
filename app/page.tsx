"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import Footer from "@/components/Footer";

const DEFAULT_SLIDES = [
  {
    id: "slide-love197",
    badge: "單車百鐵認證",
    badgeColor: "bg-red-600 text-white",
    title: "戀戀197自行車挑戰賽",
    desc: "2026/12/06 & 2027/12/05｜臺東縣城鄉生活運動協會主辦，挑戰東海岸與197縣道最美縱谷。",
    link: "/taitung-assoc",
    poster: "/images/love197.jpg",
    fallbackPoster: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1200&q=85",
    isTuraa: true,
  },
  {
    id: "slide-puyuma",
    badge: "鐵人三項認證",
    badgeColor: "bg-amber-500 text-black",
    title: "台東普悠瑪鐵人三項",
    desc: "2026/03/28 & 2027/03/27｜臺東縣城鄉生活運動協會主辦，活水湖經典賽道年度盛事。",
    link: "/taitung-assoc",
    poster: "/images/puyuma.jpg",
    fallbackPoster: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=85",
    isTuraa: true,
  },
  {
    id: "slide-pakelang",
    badge: "鐵人三項認證",
    badgeColor: "bg-amber-500 text-black",
    title: "台東巴歌浪鐵人三項",
    desc: "2026/10/17-18 & 2027/10/16-17｜馳騁東海岸壯闊山海，體驗純粹而熱血的鐵人意志。",
    link: "/series",
    poster: "/images/pakelangTSTA.jpeg",
    fallbackPoster: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=85",
    isTuraa: false,
  },
  {
    id: "slide-tainan",
    badge: "單車百鐵認證",
    badgeColor: "bg-red-600 text-white",
    title: "輪躍台南單車嘉年華",
    desc: "2026/12/06 & 2027/12/12｜穿梭古都山海美景，年度最熱鬧的單車盛會。",
    link: "/series",
    poster: "/images/tainan.png",
    fallbackPoster: "https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?auto=format&fit=crop&w=1200&q=85",
    isTuraa: false,
  },
];

const DEFAULT_SPONSORS = [
  {
    id: "sp-ironmedic",
    name: "醫護鐵人 IRONMEDIC",
    shortText: "IRONMEDIC",
    logoUrl: "/images/sponsors/ironmedic.png",
    role: "創立統籌單位",
    desc: "全球首創運動安全暨百鐵認證創立統籌機構",
    url: "https://www.ironmedic.biz/",
  },
  {
    id: "sp-merida",
    name: "美利達自行車 MERIDA",
    shortText: "MERIDA",
    logoUrl: "/images/sponsors/merida.png",
    role: "國際領導單車品牌",
    desc: "全力支持台灣鐵人與百鐵馬耐力運動發展",
    url: "https://www.merida-bikes.com/zh-tw",
  },
  {
    id: "sp-syb",
    name: "SYB 昇陽自行車",
    shortText: "SYB 昇陽",
    logoUrl: "/images/sponsors/syb.png",
    role: "頂級單車與三鐵戰袍夥伴",
    desc: "專業三鐵車、競速裝備與客製化百鐵戰袍",
    url: "https://www.sycycles.com/",
  },
  {
    id: "sp-aminomax",
    name: "邁克仕 AminoMax",
    shortText: "aminoMax",
    logoUrl: "/images/sponsors/aminomax.png",
    role: "官方指定運動補給",
    desc: "專業胺基酸、BCAA 與長距離耐力能量補給",
    url: "https://aminomax.com.tw/zh/",
  },
  {
    id: "sp-mentholatum",
    name: "肌樂 Mentholatum",
    shortText: "Mentholatum",
    logoUrl: "/images/sponsors/mentholatum.png",
    role: "官方運動防護夥伴",
    desc: "賽前熱身與賽後舒緩之運動噴劑領導品牌",
    url: "https://www.zeropain.com.tw/",
  },
  {
    id: "sp-ziv",
    name: "ZIV 專業運動眼鏡",
    shortText: "ZIV",
    logoUrl: "/images/sponsors/ziv.png",
    role: "官方指定運動眼鏡",
    desc: "專為亞洲臉型設計之防風抗 UV 頂級光學鏡片",
    url: "https://www.ziv.com.tw/",
  },
  {
    id: "sp-saeko",
    name: "SAEKO 專業泳鏡",
    shortText: "SAEKO",
    logoUrl: "/images/sponsors/saeko.png",
    role: "官方指定開放水域泳鏡",
    desc: "台灣外銷全球之三鐵開放水域廣角防霧泳鏡",
    url: "https://www.saeko.com.tw/",
  },
  {
    id: "sp-novatec",
    name: "NOVATEC 久裕興業",
    shortText: "NOVATEC",
    logoUrl: "/images/sponsors/novatec.png",
    role: "官方指定高階輪組",
    desc: "國際頂尖碳纖維輪組與高順暢度花鼓技術",
    url: "https://www.novatecusa.net/",
  },
];

export default function HomePage() {
  const [siteMode, setSiteMode] = useState<"g100" | "turaa">("g100");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  // 動態管理的海報、邁克仕圖片與贊助商 Logo（支援管理員直接在網頁上傳更換，完全免跑終端機！）
  const [customImages, setCustomImages] = useState<Record<string, string>>({});
  const [brokenLogos, setBrokenLogos] = useState<Record<string, boolean>>({});

  // 自動抓取兩個專欄頁面的最新文章摘要
  const [latestMedCol, setLatestMedCol] = useState({
    title: "賽前感冒喉嚨痛，到底能不能上場",
    author: "洪緯欣 醫師（屏東榮總胸腔內科）× 陳彥良（醫護鐵人創辦人）",
    date: "2026-11-01",
    coverUrl: (typeof window !== "undefined" && localStorage.getItem("g100_fast_col_cover")) || "",
    summary: "賽前感冒喉嚨痛能否上場，取決於你的症狀符合「脖子法則 (Neck Rule)」的哪一部分。真正的運動咖必須學會傾聽身體的聲音，以下為判斷是否退賽或調整策略的核心指標...",
  });

  const [latestCelebCol, setLatestCelebCol] = useState({
    title: "向前一步，就是解方：跨界藝人與搖滾鐵人破風經驗分享",
    author: "陳彥良、洪緯欣 × 跨界藝人與搖滾鐵人聯合專訪",
    date: "2026-11-02",
    coverUrl: (typeof window !== "undefined" && localStorage.getItem("g100_fast_col_cover")) || "",
    summary: "在《單車誌》專題〈從運動科學解析宋城希的 226K 超鐵修羅場〉深入探討了藝人宋城希如何透過科學化的訓練與身體管理，在被稱為終極魔王的 226 公里超級鐵人三項賽事中完賽...",
  });

  const supabase = createClient();

  const loadDynamicAssetsAndColumns = useCallback(async () => {
    // 1. 載入管理員在網頁上傳的圖片覆蓋設定
        try {
      const { data: sysSyncRows } = await supabase.from("race_details_full").select("*").in("athlete_name", ["__SYS_COLUMN_SYNC__", "__SYS_IMAGE_SYNC__"]).order("id", { ascending: false });
      if (sysSyncRows && sysSyncRows.length > 0) {
        const medRow = sysSyncRows.find((r: any) => r.athlete_name === "__SYS_COLUMN_SYNC__" && r.race_name === "COL_MED_JSON");
        if (medRow?.team) { try { const arr = JSON.parse(medRow.team); if (arr.length > 0) setLatestMedCol(arr[0]); } catch (e) {} }
        const celebRow = sysSyncRows.find((r: any) => r.athlete_name === "__SYS_COLUMN_SYNC__" && r.race_name === "COL_CELEB_JSON");
        if (celebRow?.team) { try { const arr = JSON.parse(celebRow.team); if (arr.length > 0) setLatestCelebCol(arr[0]); } catch (e) {} }
        const imgMap: Record<string, string> = {};
        sysSyncRows.filter((r: any) => r.athlete_name === "__SYS_IMAGE_SYNC__").forEach((r: any) => { if (r.race_name && r.team) imgMap[r.race_name] = r.team; });
        if (Object.keys(imgMap).length > 0) setCustomImages((prev) => ({ ...prev, ...imgMap }));
      }
    } catch (e) {}
    
    // 自動將 vercel.app 本地已編輯之專欄與圖片同步推上 Supabase 雲端，讓 www.global100triathlon.com 100% 顯示相同最新圖文！
    try {
      const localMedRaw = localStorage.getItem("g100_unified_col_MED") || localStorage.getItem("g100_col_v3_MED");
      const localCelebRaw = localStorage.getItem("g100_unified_col_CELEB") || localStorage.getItem("g100_col_v3_CELEB");
      if (localMedRaw) {
        await supabase.from("race_details_full").delete().eq("athlete_name", "__SYS_COLUMN_SYNC__").eq("race_name", "COL_MED_JSON");
        await supabase.from("race_details_full").insert([{ athlete_name: "__SYS_COLUMN_SYNC__", race_name: "COL_MED_JSON", race_date: "2026-11-05", category: "SYS", finish_time: "SYS", team: localMedRaw }]);
      }
      if (localCelebRaw) {
        await supabase.from("race_details_full").delete().eq("athlete_name", "__SYS_COLUMN_SYNC__").eq("race_name", "COL_CELEB_JSON");
        await supabase.from("race_details_full").insert([{ athlete_name: "__SYS_COLUMN_SYNC__", race_name: "COL_CELEB_JSON", race_date: "2026-11-05", category: "SYS", finish_time: "SYS", team: localCelebRaw }]);
      }
    } catch (e) {}

    
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const oauthCode = urlParams.get("code");
      if (oauthCode) {
        window.location.replace("/auth/callback?code=" + encodeURIComponent(oauthCode) + "&next=/profile");
        return;
      }
      if (window.location.hostname.includes("vercel.app")) {
        // 先把 vercel.app 瀏覽器內的專欄與海報同步上 Supabase，再自動跳轉至唯一正式官網 www.global100triathlon.com
        setTimeout(() => {
          window.location.replace("https://www.global100triathlon.com" + window.location.pathname + window.location.search);
        }, 1200);
      }
    }

    const localImgs = localStorage.getItem("g100_custom_site_images_v3");
    if (localImgs) {
      try {
        setCustomImages(JSON.parse(localImgs));
      } catch (e) {}
    }

    // 2. 自動從兩個專欄資料池抓取最新一篇圖文摘要
    const localMed = localStorage.getItem("g100_unified_col_MED") || localStorage.getItem("g100_col_v3_MED");
    if (localMed) {
      try {
        const arr = JSON.parse(localMed);
        if (arr.length > 0) setLatestMedCol(arr[0]);
      } catch (e) {}
    }
    const localCeleb = localStorage.getItem("g100_unified_col_CELEB") || localStorage.getItem("g100_col_v3_CELEB");
    if (localCeleb) {
      try {
        const arr = JSON.parse(localCeleb);
        if (arr.length > 0) setLatestCelebCol(arr[0]);
      } catch (e) {}
    }

    // 3. 從雲端 Supabase 同步管理員上傳的圖片與最新專欄文章
    try {
      const { data: rows } = await supabase
        .from("association_announcements")
        .select("*")
        .in("tag", ["SITE_CUSTOM_IMAGES", "COL_SPORTS_MED", "COL_CELEBRITY"])
        .order("id", { ascending: false });

      if (rows && rows.length > 0) {
        const mergedImgs: Record<string, string> = {};
        rows.filter((r: any) => r.tag === "SITE_CUSTOM_IMAGES").forEach((r: any) => {
          if (!r.pdf_url) return;
          if (r.pdf_url.startsWith("data:image") && r.title) {
            mergedImgs[r.title] = r.pdf_url;
          } else {
            try {
              Object.assign(mergedImgs, JSON.parse(r.pdf_url));
            } catch (e) {}
          }
        });
        if (Object.keys(mergedImgs).length > 0) {
          setCustomImages((prev) => ({ ...prev, ...mergedImgs }));
          localStorage.setItem("g100_custom_site_images_v3", JSON.stringify(mergedImgs));
        }

        rows.forEach((r: any) => {
          try {
            if (r.tag !== "COL_SPORTS_MED" && r.tag !== "COL_CELEBRITY") return;
            const parsed = JSON.parse(r.pdf_url || "{}");
            if (!parsed.title) return;
            const txt = (parsed.title + " " + (parsed.summary || "")).toLowerCase();
            const isCelebTopic = txt.includes("求婚") || txt.includes("單車婚禮") || txt.includes("藝人") || txt.includes("搖滾") || txt.includes("破風故事");
            if (isCelebTopic) {
              if (!localStorage.getItem("g100_col_v3_CELEB")) setLatestCelebCol(parsed);
            } else if (r.tag === "COL_SPORTS_MED") {
              if (!localStorage.getItem("g100_col_v3_MED")) setLatestMedCol(parsed);
            } else {
              if (!localStorage.getItem("g100_col_v3_CELEB")) setLatestCelebCol(parsed);
            }
          } catch (e) {}
        });
      }
    } catch (err) {
      console.warn(err);
    }
  }, [supabase]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (host.includes("turaa") || params.get("site") === "turaa" || sessionStorage.getItem("force_turaa_site") === "1") {
        setSiteMode("turaa");
      }
    }

    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const em = session.user.email.toLowerCase();
        const meta = session.user.user_metadata?.full_name || "";
        if (em.includes("evelny") || em.includes("pianopub") || em.includes("novem") || meta.includes("洪緯欣") || meta.includes("陳彥良")) {
          setIsAdmin(true);
        }
      }
    }
    checkAdmin();
    loadDynamicAssetsAndColumns();
  }, [supabase, loadDynamicAssetsAndColumns]);

  // 📷 管理員直接在網頁上點選上傳更換任何海報或贊助商 Logo（自動壓縮並同步雲端，免開終端機！）
  const handleDirectImageUpload = (slotKey: string, labelName: string, maxWidth = 700) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          let w = img.width;
          let h = img.height;
          if (w > maxWidth) {
            h = Math.round((h * maxWidth) / w);
            w = maxWidth;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const isPng = file.type === "image/png";
            const dataUrl = canvas.toDataURL(isPng ? "image/png" : "image/jpeg", 0.82);
            const nextMap = { ...customImages, [slotKey]: dataUrl };
            setCustomImages(nextMap);
            setBrokenLogos((prev) => ({ ...prev, [slotKey]: false }));
            localStorage.setItem("g100_custom_site_images_v3", JSON.stringify(nextMap));

            try {
              await supabase.from("association_announcements").delete().eq("tag", "SITE_CUSTOM_IMAGES").eq("title", slotKey);
              await supabase.from("association_announcements").insert([
                {
                  title: slotKey,
                  tag: "SITE_CUSTOM_IMAGES",
                  date: new Date().toISOString().slice(0, 10),
                  is_pinned: false,
                  pdf_url: dataUrl,
                },
              ]);
            } catch (err) {}
            alert(`✅「${labelName}」圖檔已直接更新上線！完全不需再執行終端機！`);
          }
        };
        if (typeof ev.target?.result === "string") img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const activeSlides = siteMode === "turaa" ? DEFAULT_SLIDES.filter((s) => s.isTuraa) : DEFAULT_SLIDES;

  useEffect(() => {
    setCurrentSlide(0);
  }, [siteMode]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const announcements = [
    {
      id: 1,
      isPinned: true,
      org: "城會公告",
      category: "秩序冊與簡章",
      title: "【重要置頂】臺東普悠瑪鐵人三項 ＆ 戀戀197自行車公路賽 選手秩序冊與歷年成績認領開放！",
      date: "2026-10-28",
      href: "/taitung-assoc",
    },
    {
      id: 2,
      isPinned: true,
      org: "百鐵總站",
      category: "專屬福利",
      title: "【邁克仕補給兌換】登入會員預先勾選未來參賽場次，開賽當天憑號碼布或安全帽號碼貼免費領取邁克仕產品！",
      date: "2026-11-02",
      href: "/profile#aminomax-preorder",
    },
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between overflow-x-hidden">
      <main className="max-w-6xl mx-auto w-full px-3.5 sm:px-6 pt-2 pb-10 space-y-3 sm:space-y-3.5">
        
        {/* 🎯 第一頁第一屏上半部：主視覺＋四顆等高等寬按鈕＋右上角賽事海報輪播（已移除重複的邁克仕第一張輪播，並緊湊化高度讓下方邁克仕完整進入第一屏！） */}
        <section className="relative rounded-3xl bg-gradient-to-br from-zinc-950 via-[#0d090a] to-[#1a0a0d] border border-zinc-800/80 p-4 sm:p-5 shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center">
            
            <div className="lg:col-span-7 space-y-2.5 sm:space-y-3">
              {siteMode === "turaa" ? (
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  <span className="text-white">臺東縣城鄉生活運動協會</span>
                  <br />
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent text-xl sm:text-2xl">
                    普悠瑪鐵人 ＆ 戀戀197官方總站
                  </span>
                </h1>
              ) : (
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  <span className="text-white">每一場挑戰，</span>
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
                    都值得被記錄。
                  </span>
                </h1>
              )}
              
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
                {siteMode === "turaa"
                  ? "深耕東台灣耐力運動，主辦臺東普悠瑪鐵人三項、臺東超級鐵人及戀戀197自行車公路賽。本會所有完賽紀錄皆與「全球百鐵認證」中央資料庫即時互通連動。"
                  : "全球百鐵認證，為鐵人三項與單車選手保存每一次出發、完賽與突破。串聯全台指標結盟賽事，從初鐵到百鐵，累積屬於你的榮耀里程碑。"}
              </p>

              {/* 四顆主行動按鈕：手機 2x2、電腦 1x4，全部固定 h-11 w-full 等高等寬 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                <Link
                  href="/rankings"
                  className="h-11 w-full px-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs sm:text-[13px] transition shadow-lg shadow-red-600/20 flex items-center justify-center gap-1 whitespace-nowrap"
                >
                  <span>🏆</span>
                  <span>百鐵英雄榜查詢</span>
                </Link>
                <Link
                  href="/certifications/query"
                  className="h-11 w-full px-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 font-extrabold text-xs sm:text-[13px] transition flex items-center justify-center gap-1 whitespace-nowrap"
                >
                  <span>🔍</span>
                  <span>歷年完賽成績查詢</span>
                </Link>
                <Link
                  href="/profile/new-record"
                  className="h-11 w-full px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs sm:text-[13px] transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1 whitespace-nowrap"
                >
                  <span>✍️</span>
                  <span>完賽榮譽登錄</span>
                </Link>
                <Link
                  href="/profile/claim"
                  className="h-11 w-full px-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/50 text-amber-400 font-extrabold text-xs sm:text-[13px] transition flex items-center justify-center gap-1 whitespace-nowrap"
                >
                  <span>📥</span>
                  <span>認領歷史紀錄</span>
                </Link>
              </div>
            </div>

            {/* 右側：賽事海報輪播（已移除重複的邁克仕海報，且支援管理員直接在網頁上點按鈕換海報圖檔！） */}
            <div className="lg:col-span-5">
              <div className="relative h-44 sm:h-48 w-full rounded-2xl overflow-hidden border border-zinc-700/80 shadow-2xl group bg-zinc-900">
                {activeSlides.map((slide, index) => {
                  const displaySrc = customImages[slide.id] || slide.poster;
                  return (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                      }`}
                    >
                      <img
                        src={displaySrc}
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src !== slide.fallbackPoster) {
                            target.src = slide.fallbackPoster;
                          }
                        }}
                        alt={slide.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDirectImageUpload(slide.id, slide.title + " 海報", 1000)}
                          className="absolute top-2.5 right-2.5 z-20 px-2.5 py-1 rounded-lg bg-black/80 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/50 text-[11px] font-black transition cursor-pointer"
                        >
                          📷 更換此海報圖檔
                        </button>
                      )}

                      <div className="absolute inset-0 p-3.5 sm:p-4 flex flex-col justify-end">
                        <div className="space-y-1">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${slide.badgeColor}`}>
                            {slide.badge}
                          </span>
                          <h3 className="text-base sm:text-lg font-black text-white drop-shadow-md leading-tight">
                            {slide.title}
                          </h3>
                          <p className="text-[11px] text-zinc-200 line-clamp-1 drop-shadow">
                            {slide.desc}
                          </p>
                          <div className="pt-1 flex items-center justify-between">
                            <Link
                              href={slide.link}
                              className="text-xs font-extrabold text-amber-400 hover:text-amber-300 transition flex items-center gap-1"
                            >
                              進入專區查看詳情 →
                            </Link>

                            <div className="flex items-center gap-1.5">
                              {activeSlides.map((_, dotIdx) => (
                                <button
                                  key={dotIdx}
                                  type="button"
                                  onClick={() => setCurrentSlide(dotIdx)}
                                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                    dotIdx === currentSlide ? "w-5 bg-amber-400" : "w-1.5 bg-zinc-500 hover:bg-zinc-400"
                                  }`}
                                  aria-label={`切換至第 ${dotIdx + 1} 張海報`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </section>

        {/* 🎯 第一頁第一屏下半部：邁克仕活動完整欄位（緊湊精巧設計，100% 畫面無須滾動即可完整映入眼簾，且支援管理員網頁直接上傳更換海報！） */}
        {siteMode !== "turaa" && (
          <section className="rounded-3xl bg-gradient-to-r from-amber-950/60 via-zinc-900 to-red-950/50 border-2 border-amber-500/50 p-3.5 sm:p-5 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-center">
              
              {/* 左側：邁克仕商品海報與管理員直接換圖按鈕 */}
              <div className="lg:col-span-4">
                <div className="relative rounded-2xl overflow-hidden border border-amber-400/50 bg-zinc-950 p-3 text-center space-y-1.5 shadow-lg">
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDirectImageUpload("aminomax-hero-poster", "邁克仕活動海報", 900)}
                      className="absolute top-2 right-2 z-20 px-2.5 py-1 rounded-lg bg-black/85 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/50 text-[11px] font-black transition cursor-pointer"
                    >
                      📷 上傳更換邁克仕海報
                    </button>
                  )}
                  <img
                    src={customImages["aminomax-hero-poster"] || "/images/aminomax-poster.png"}
                    onError={(e) => {
                      const t = e.currentTarget;
                      if (!t.src.includes("data:image") && !t.src.endsWith("puyuma.jpg")) {
                        t.style.display = "none";
                      }
                    }}
                    alt="邁克仕兌換活動海報"
                    className="w-full h-auto object-contain rounded-xl bg-black/40 mx-auto mb-1.5"
                  />
                  <div className="flex items-center justify-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-black text-[10px] font-black">
                      官方指定補給海報
                    </span>
                    <span className="text-xs font-extrabold text-amber-400">aminoMax 邁克仕</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-white">
                    ⚡ 能量膠・BCAA・電解質補給組
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-700 text-[10px] font-bold text-amber-300">
                      📦 能量膠包
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-700 text-[10px] font-bold text-emerald-300">
                      💊 BCAA / 電解質
                    </span>
                  </div>
                </div>
              </div>

              {/* 右側：活動規則說明與立即勾選導流按鈕 */}
              <div className="lg:col-span-8 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-black animate-pulse">
                    🔥 年度系列賽事專屬福利
                  </span>
                  <span className="text-xs font-bold text-amber-400">
                    全球百鐵認證 × 邁克仕 AminoMax 參賽補給免費領取活動
                  </span>
                </div>
                <h2 className="text-base sm:text-xl font-black text-white leading-snug">
                  登入會員預先勾選參賽場次，比賽當天憑「號碼布」或「安全帽號碼貼」免費領取邁克仕補給！
                </h2>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  只要於<strong>各場系列賽事開賽前 1 個月（30天前）</strong>登入「全球百鐵認證會員中心」勾選您預計參加的未來賽事，我們將預先為您把邁克仕產品配發至該場次主辦單位。比賽當天現場出示<strong>號碼布（若該單車賽事無號碼布則憑「安全帽上的號碼貼」）</strong>，由工作人員在上面做記號後即可直接領取！
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-2.5">
                  <Link
                    href="/profile#aminomax-preorder"
                    className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm transition shadow-lg shadow-amber-500/20"
                  >
                    👉 立即進入會員中心預先勾選未來參賽場次 →
                  </Link>
                  <Link
                    href="/series"
                    className="flex-1 sm:flex-initial text-center px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs sm:text-sm transition"
                  >
                    查看年度系列賽事清單
                  </Link>
                  <Link
                    href="/legal/privacy"
                    className="text-xs text-zinc-400 hover:text-amber-400 underline px-2 py-1"
                  >
                    活動個資與共同行銷說明
                  </Link>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* 最新加盟協會與賽事聯合公告 */}
        <section className="rounded-2xl bg-zinc-900/70 border border-zinc-800/90 p-4 sm:p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-2.5 mb-2 gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                {siteMode === "turaa" ? "臺東縣城鄉生活運動協會 最新官方公告" : "最新加盟協會與賽事聯合公告"}
              </h2>
            </div>
            <Link
              href="/taitung-assoc"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 transition"
            >
              前往協會公告與秩序冊下載區 →
            </Link>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {announcements.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 hover:bg-zinc-800/40 px-2 rounded-lg transition group"
              >
                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.isPinned && (
                    <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-800/60 text-red-400 text-[10px] font-bold">
                      置頂
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                    {item.org}
                  </span>
                  <span className="text-xs sm:text-sm text-zinc-200 group-hover:text-amber-400 transition font-medium">
                    {item.title}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500 shrink-0">
                  {item.date}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 🤝 官方統籌與榮耀贊助夥伴（支援管理員直接在網頁上點選上傳各品牌 Logo，若尚未上傳亦自動顯示高質感品牌字標，絕不出現破圖！） */}
        <section className="rounded-3xl bg-zinc-950 border border-zinc-800/90 p-5 sm:p-7 space-y-4 shadow-xl">
          <div className="text-center space-y-1">
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
              OFFICIAL SPONSORS & STRATEGIC PARTNERS
            </span>
            <h2 className="text-lg sm:text-2xl font-black text-white">
              🤝 全球百鐵認證 官方統籌與榮耀贊助夥伴（點擊前往品牌官網）
            </h2>
            <p className="text-xs text-zinc-400">
              {isAdmin
                ? "👑 管理員模式已開啟：直接點擊任一贊助商卡片右上角的「📷 換Logo」即可從電腦選擇圖片立即更新！"
                : "感謝各大國際運動領導品牌與醫護鐵人共同守護賽道安全、支持台灣耐力運動發展"}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-1">
            {DEFAULT_SPONSORS.map((sp) => {
              const currentLogoSrc = customImages[sp.id] || sp.logoUrl;
              const isBroken = brokenLogos[sp.id] && !customImages[sp.id];

              return (
                <div
                  key={sp.id}
                  className="relative rounded-2xl bg-zinc-900/70 border border-zinc-800/90 hover:border-amber-500 hover:bg-zinc-900 p-3.5 sm:p-4 text-center space-y-1.5 transition group"
                >
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDirectImageUpload(sp.id, sp.name + " Logo", 400);
                      }}
                      className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded bg-amber-500 text-black text-[10px] font-black hover:bg-amber-400 cursor-pointer shadow"
                    >
                      📷 換Logo
                    </button>
                  )}

                  <a
                    href={sp.url}
                    target={sp.url.startsWith("http") ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="block space-y-1.5"
                  >
                    <div className="h-14 sm:h-16 w-full flex items-center justify-center px-2 py-1.5 rounded-xl bg-gradient-to-b from-zinc-800/50 to-transparent">
                      {!isBroken ? (
                        <img
                          src={currentLogoSrc}
                          alt={sp.name}
                          onError={(e) => {
                            const t = e.currentTarget;
                            const svgFallback = sp.logoUrl.replace(".png", ".svg");
                            if (!t.src.endsWith(".svg")) {
                              t.src = svgFallback;
                            } else {
                              setBrokenLogos((prev) => ({ ...prev, [sp.id]: true }));
                            }
                          }}
                          className="max-h-11 sm:max-h-12 max-w-[130px] sm:max-w-[150px] object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)] group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="text-lg sm:text-xl font-black tracking-wider bg-gradient-to-r from-white via-amber-200 to-amber-400 bg-clip-text text-transparent">
                          {sp.shortText}
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-bold text-amber-400">{sp.role}</div>
                    <div className="text-xs sm:text-sm font-black text-white group-hover:text-amber-300 transition flex items-center justify-center gap-1">
                      <span className="truncate">{sp.name}</span>
                      <span className="text-xs text-zinc-500 group-hover:text-amber-400 shrink-0">↗</span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-zinc-400 leading-snug line-clamp-2">{sp.desc}</p>
                  </a>
                </div>
              );
            })}
          </div>
        </section>

        {/* 📚 單車誌專欄：單車誌醫護鐵人運動醫學專欄＆全球百鐵認證藝人騎乘經驗分享專欄（自動抓取兩個專欄頁面的最新圖文摘要！） */}
        <section className="rounded-3xl bg-zinc-950 border border-zinc-800/90 p-5 sm:p-7 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-4">
            <div>
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
                CYCLINGTIME MEDIA × IRONMEDIC & GLOBAL 100 COLUMNS
              </span>
              <h2 className="text-base sm:text-2xl font-black text-white mt-1">
                📚 單車誌專欄：單車誌醫護鐵人運動醫學專欄＆全球百鐵認證藝人騎乘經驗分享專欄
              </h2>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/columns#med-section" className="text-xs font-bold text-emerald-400 hover:underline">
                運動醫學專欄 →
              </Link>
              <Link href="/columns#celeb-section" className="text-xs font-bold text-amber-400 hover:underline">
                藝人騎乘專欄 →
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            
            {/* 專欄卡片 1：自動抓取「單車誌醫護鐵人運動醫學專欄」最新一篇文章與配圖 */}
            <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/50 overflow-hidden flex flex-col justify-between transition group">
              <div>
                <div className="relative h-64 sm:h-72 w-full bg-gradient-to-b from-zinc-900 to-black flex items-center justify-center p-2.5 overflow-hidden border-b border-zinc-800/80">
                  <img
                    src={latestMedCol.coverUrl}
                    alt={latestMedCol.title}
                    className="max-h-full max-w-full object-contain rounded-lg shadow-xl group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500 text-black shadow">
                    單車誌醫護鐵人運動醫學專欄
                  </span>
                </div>
                <div className="p-5 space-y-2.5">
                  <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                    {latestMedCol.title}
                  </h3>
                  <div className="text-xs font-bold text-emerald-400">
                    撰文 / 專訪：{latestMedCol.author}
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-3">
                    {latestMedCol.summary}
                  </p>
                </div>
              </div>
              <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-zinc-800/70">
                <Link
                  href="/columns#med-section"
                  className="text-xs font-extrabold text-white hover:text-emerald-400 transition inline-flex items-center gap-1"
                >
                  前往閱讀完整專欄 →
                </Link>
                {isAdmin && (
                  <Link
                    href="/columns#med-section"
                    className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-bold hover:bg-emerald-500 hover:text-black transition"
                  >
                    ✍️ 進入專欄頁面編輯圖文
                  </Link>
                )}
              </div>
            </div>

            {/* 專欄卡片 2：自動抓取「全球百鐵認證藝人騎乘經驗分享專欄」最新一篇文章與配圖 */}
            <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/50 overflow-hidden flex flex-col justify-between transition group">
              <div>
                <div className="relative h-64 sm:h-72 w-full bg-gradient-to-b from-zinc-900 to-black flex items-center justify-center p-2.5 overflow-hidden border-b border-zinc-800/80">
                  <img
                    src={latestCelebCol.coverUrl}
                    alt={latestCelebCol.title}
                    className="max-h-full max-w-full object-contain rounded-lg shadow-xl group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-black shadow">
                    全球百鐵認證藝人騎乘經驗分享專欄
                  </span>
                </div>
                <div className="p-5 space-y-2.5">
                  <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                    {latestCelebCol.title}
                  </h3>
                  <div className="text-xs font-bold text-amber-400">
                    撰文 / 專訪：{latestCelebCol.author}
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-3">
                    {latestCelebCol.summary}
                  </p>
                </div>
              </div>
              <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-zinc-800/70">
                <Link
                  href="/columns#celeb-section"
                  className="text-xs font-extrabold text-white hover:text-amber-400 transition inline-flex items-center gap-1"
                >
                  前往閱讀完整專欄 →
                </Link>
                {isAdmin && (
                  <Link
                    href="/columns#celeb-section"
                    className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 text-[11px] font-bold hover:bg-amber-500 hover:text-black transition"
                  >
                    ✍️ 進入專欄頁面編輯圖文
                  </Link>
                )}
              </div>
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
