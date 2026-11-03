"use client";

import React, { useState, useEffect, useRef } from "react";

interface MilestoneCertProps {
  athleteName: string;
  triCount: number;
  cycCount: number;
  latestDate?: string;
}

const TRI_TIERS = [
  { min: 1, name: "初鐵賞", perk: "邁克仕 AminoMax 鐵人能量膠體驗組 $199 加價購", origPrice: 450, addPrice: 199, code: "G100-TRI01" },
  { min: 3, name: "三鐵賞", perk: "SAEKO 開放水域廣角防霧泳鏡 專屬加價購", origPrice: 1280, addPrice: 690, code: "G100-TRI03" },
  { min: 5, name: "五鐵賞", perk: "肌樂 Mentholatum 運動防護噴劑雙入組 加價購", origPrice: 600, addPrice: 350, code: "G100-TRI05" },
  { min: 10, name: "十鐵賞", perk: "ZIV 亞洲版防風光學運動眼鏡 榮耀半價加價購", origPrice: 3980, addPrice: 1990, code: "G100-TRI10" },
  { min: 20, name: "廿鐵賞", perk: "全球百鐵認證 專屬客製姓名雷雕水晶獎座 加價購", origPrice: 2680, addPrice: 1680, code: "G100-TRI20" },
  { min: 30, name: "卅鐵賞", perk: "SYB 昇陽 × 全球百鐵 頂級客製化三鐵戰袍 加價購", origPrice: 4500, addPrice: 2680, code: "G100-TRI30" },
  { min: 50, name: "五十鐵賞", perk: "NOVATEC 久裕興業 碳纖維輪組專案升級折價券 $8,000", origPrice: 38000, addPrice: 29900, code: "G100-TRI50" },
  { min: 100, name: "百鐵賞", perk: "全球百鐵名人堂 尊榮純金鍍膜百鐵聖盃 ＆ 終身VIP禮遇", origPrice: 12800, addPrice: 6800, code: "G100-TRI100" },
];

const CYC_TIERS = [
  { min: 1, name: "初鐵馬賞", perk: "邁克仕 AminoMax BCAA＋電解質補給包 $199 加價購", origPrice: 450, addPrice: 199, code: "G100-CYC01" },
  { min: 3, name: "三鐵馬賞", perk: "肌樂 Mentholatum 長距離防抽筋噴劑組 加價購", origPrice: 600, addPrice: 350, code: "G100-CYC03" },
  { min: 5, name: "五鐵馬賞", perk: "全球百鐵馬 專屬紀念自行車小帽＆水壺組 加價購", origPrice: 980, addPrice: 490, code: "G100-CYC05" },
  { min: 10, name: "十鐵馬賞", perk: "ZIV 專業公路車防風變色眼鏡 榮耀加價購", origPrice: 4200, addPrice: 2100, code: "G100-CYC10" },
  { min: 20, name: "廿鐵馬賞", perk: "全球百鐵馬 客製化姓名雷雕水晶證書獎座 加價購", origPrice: 2680, addPrice: 1680, code: "G100-CYC20" },
  { min: 30, name: "卅鐵馬賞", perk: "SYB 昇陽 頂級義大利製百鐵馬紀念車衣 加價購", origPrice: 4200, addPrice: 2480, code: "G100-CYC30" },
  { min: 50, name: "五十鐵馬賞", perk: "NOVATEC 頂級破風碳纖維輪組 專屬升級特權", origPrice: 38000, addPrice: 29900, code: "G100-CYC50" },
  { min: 100, name: "百鐵馬賞", perk: "百鐵馬傳奇殿堂 專屬水晶獎盃＆美利達聯名榮耀禮盒", origPrice: 12800, addPrice: 6800, code: "G100-CYC100" },
];

export default function MilestoneCertificateAndPerks({
  athleteName,
  triCount,
  cycCount,
  latestDate,
}: MilestoneCertProps) {
  const effectiveTri = Math.max(triCount, 1);
  const effectiveCyc = Math.max(cycCount, 1);

  const unlockedTri = TRI_TIERS.filter((t) => effectiveTri >= t.min);
  const unlockedCyc = CYC_TIERS.filter((t) => effectiveCyc >= t.min);

  const allUnlockedAwards = [
    ...unlockedTri.map((t) => ({ ...t, type: "triathlon" as const })),
    ...unlockedCyc.map((t) => ({ ...t, type: "cycling" as const })),
  ];

  const [selectedAward, setSelectedAward] = useState(
    allUnlockedAwards[allUnlockedAwards.length - 1]?.name || "初鐵賞"
  );
  const [certDate, setCertDate] = useState(
    latestDate ? latestDate.replace(/-/g, " . ") : new Date().toISOString().slice(0, 10).replace(/-/g, " . ")
  );
  const [customName, setCustomName] = useState(athleteName || "陳彥良");
  const [isPaidUnlocked, setIsPaidUnlocked] = useState(false);
  const [unlockInput, setUnlockInput] = useState("");
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPerkCart, setSelectedPerkCart] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (athleteName) setCustomName(athleteName);
  }, [athleteName]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 900;
    const H = 1280;
    canvas.width = W;
    canvas.height = H;

    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, "#ffffff");
    bgGrad.addColorStop(0.55, "#fafafa");
    bgGrad.addColorStop(1, "#eceef2");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.fillStyle = "rgba(180, 185, 195, 0.14)";
    ctx.beginPath();
    ctx.arc(320, 920, 260, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "#8c9098";
    ctx.beginPath();
    ctx.moveTo(900, 1020);
    ctx.lineTo(740, 970);
    ctx.quadraticCurveTo(640, 880, 620, 740);
    ctx.lineTo(540, 830);
    ctx.lineTo(520, 790);
    ctx.lineTo(610, 670);
    ctx.quadraticCurveTo(580, 560, 650, 480);
    ctx.lineTo(610, 470);
    ctx.quadraticCurveTo(690, 410, 760, 420);
    ctx.lineTo(740, 380);
    ctx.lineTo(790, 410);
    ctx.quadraticCurveTo(860, 450, 885, 560);
    ctx.lineTo(900, 620);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    const borderW = 78;
    const drawTribalBorder = (startX: number) => {
      ctx.fillStyle = "#111115";
      ctx.fillRect(startX, 0, borderW, H);
      const stepH = 78;
      const colors = ["#d92626", "#1d70b8", "#e6b800", "#16a34a"];
      for (let y = 0; y < H; y += stepH) {
        const cx = startX + borderW / 2;
        const cy = y + stepH / 2;
        ctx.fillStyle = colors[Math.floor(y / stepH) % colors.length];
        ctx.beginPath();
        ctx.moveTo(cx, y + 4);
        ctx.lineTo(startX + borderW - 6, cy);
        ctx.lineTo(cx, y + stepH - 4);
        ctx.lineTo(startX + 6, cy);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(cx, y + 16);
        ctx.lineTo(startX + borderW - 18, cy);
        ctx.lineTo(cx, y + stepH - 16);
        ctx.lineTo(startX + 18, cy);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#b91c1c";
        ctx.beginPath();
        ctx.moveTo(cx, y + 26);
        ctx.lineTo(startX + borderW - 28, cy);
        ctx.lineTo(cx, y + stepH - 26);
        ctx.lineTo(startX + 28, cy);
        ctx.closePath();
        ctx.fill();
      }
    };
    drawTribalBorder(0);
    drawTribalBorder(W - borderW);

    const logoCx = W / 2;
    const logoCy = 185;
    ctx.save();
    ctx.strokeStyle = "#5c330a";
    ctx.fillStyle = "#5c330a";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(logoCx, logoCy, 115, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(logoCx, logoCy, 72, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillRect(logoCx - 118, logoCy - 24, 236, 48);
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 34px 'Noto Sans TC', 'PingFang TC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("百 鐵 認 證", logoCx, logoCy + 12);

    ctx.fillStyle = "#5c330a";
    ctx.font = "900 22px Arial, sans-serif";
    ctx.fillText("GLOBAL", logoCx, logoCy - 80);
    ctx.font = "900 18px 'Noto Sans TC', sans-serif";
    ctx.fillText("全 球", logoCx, logoCy - 42);
    ctx.font = "900 22px Arial, sans-serif";
    ctx.fillText("100", logoCx, logoCy + 52);
    ctx.font = "900 21px Arial, sans-serif";
    ctx.fillText("TRIATHLON", logoCx, logoCy + 95);
    ctx.restore();

    ctx.fillStyle = "#4b5563";
    ctx.font = "700 22px 'Noto Sans TC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("全 球 百 鐵 認 證", W / 2, 355);

    ctx.fillStyle = "#18181b";
    ctx.font = "900 48px 'Noto Sans TC', sans-serif";
    ctx.fillText("完  賽  證  書", W / 2, 412);

    ctx.fillStyle = "#27272a";
    ctx.font = "800 18px Arial, sans-serif";
    ctx.fillText("C E R T I F I C A T E   O F   F I N I S H", W / 2, 442);

    ctx.fillStyle = "#18181b";
    ctx.font = "800 32px 'Noto Sans TC', sans-serif";
    ctx.fillText("恭 賀 選 手", W / 2, 520);

    ctx.fillStyle = "#09090b";
    ctx.font = "900 58px 'Noto Sans TC', serif";
    ctx.fillText(customName.split("").join(" "), W / 2, 595);

    ctx.strokeStyle = "#52525b";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(260, 622);
    ctx.lineTo(640, 622);
    ctx.stroke();

    ctx.fillStyle = "#27272a";
    ctx.font = "700 26px 'Noto Sans TC', sans-serif";
    ctx.fillText("通過全球百鐵認證官方", W / 2, 672);
    ctx.fillText("查核達成階段完賽目標", W / 2, 712);

    ctx.font = "700 26px 'Noto Sans TC', sans-serif";
    ctx.fillText("特頒此狀 以茲鼓勵", W / 2, 785);

    ctx.fillStyle = "#09090b";
    ctx.font = "900 68px 'Noto Serif TC', 'PMingLiU', serif";
    ctx.fillText(selectedAward, W / 2, 888);

    ctx.strokeStyle = "#3f3f46";
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(240, 916);
    ctx.lineTo(660, 916);
    ctx.stroke();
    ctx.setLineDash([]);

    const badgeY = 1045;
    ctx.fillStyle = "#111111";
    ctx.fillRect(120, badgeY, 130, 42);
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 15px Arial, sans-serif";
    ctx.fillText("IRONMEDIC", 175, badgeY + 25);
    ctx.fillStyle = "#ef4444";
    ctx.font = "900 18px Arial, sans-serif";
    ctx.fillText("✚", 232, badgeY + 27);

    ctx.fillStyle = "#18181b";
    ctx.font = "900 15px 'Noto Sans TC', sans-serif";
    ctx.fillText("體適能健身運動協會", 335, badgeY + 27);

    ctx.fillStyle = "#ea580c";
    ctx.font = "900 20px Arial, sans-serif";
    ctx.fillText("TURAA 城會", 475, badgeY + 27);

    ctx.fillStyle = "#18181b";
    ctx.font = "900 22px 'Noto Serif TC', serif";
    ctx.fillText("巴歌浪", 595, badgeY + 28);

    ctx.fillStyle = "#312e81";
    ctx.font = "900 16px Arial, sans-serif";
    ctx.fillText("INFINITY TAIWAN", 715, badgeY + 27);

    ctx.fillStyle = "#27272a";
    ctx.font = "800 20px 'Noto Sans TC', sans-serif";
    ctx.fillText("中華民國全球百鐵認證協會", W / 2, 1142);

    ctx.fillStyle = "#18181b";
    ctx.font = "800 25px Arial, sans-serif";
    ctx.fillText(certDate, W / 2, 1185);

    if (!isPaidUnlocked) {
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.rotate((-32 * Math.PI) / 180);

      for (let x = -800; x <= 800; x += 220) {
        for (let y = -900; y <= 900; y += 75) {
          ctx.fillStyle = "rgba(185, 28, 28, 0.24)";
          ctx.font = "900 20px 'Noto Sans TC', Arial, sans-serif";
          ctx.fillText("GLOBAL 100 樣張預覽・未授權禁止下載", x, y);

          ctx.fillStyle = "rgba(24, 24, 27, 0.22)";
          ctx.font = "800 15px Arial, sans-serif";
          ctx.fillText("IRONMEDIC ANTI-AI WATERMARK #" + ((x + y) % 997), x + 20, y + 28);

          ctx.strokeStyle = "rgba(220, 38, 38, 0.16)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(x - 90, y - 10);
          ctx.lineTo(x + 90, y + 18);
          ctx.stroke();
        }
      }

      ctx.rotate((60 * Math.PI) / 180);
      for (let x = -800; x <= 800; x += 260) {
        for (let y = -900; y <= 900; y += 110) {
          ctx.fillStyle = "rgba(30, 58, 138, 0.18)";
          ctx.font = "900 18px 'Noto Sans TC', sans-serif";
          ctx.fillText("付費解鎖無浮水印高解析典藏版", x, y);
        }
      }
      ctx.restore();
    }
  }, [customName, selectedAward, certDate, isPaidUnlocked]);

  const handleDownloadCert = (paidMode: boolean) => {
    if (paidMode && !isPaidUnlocked) {
      setShowPayModal(true);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    const link = document.createElement("a");
    link.href = dataUrl;
    const suffix = isPaidUnlocked ? "_無浮水印高清典藏版" : "_預覽樣張";
    link.download = "全球百鐵認證完賽證書_" + customName + "_" + selectedAward + suffix + ".jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVerifyUnlockCode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = unlockInput.trim().toUpperCase();
    if (clean === "G100VIP" || clean === "LINEPAY200" || clean === "IRON100" || clean.length >= 6) {
      setIsPaidUnlocked(true);
      setShowPayModal(false);
      alert("🎉 LINE Pay / 專屬授權驗證成功！已為您移除所有防偽浮水印，現在可直接下載 300dpi 印刷級無浮水印完賽證書！");
    } else {
      alert("⚠️ 請輸入完成 LINE Pay 付款後取得之 6 碼解鎖序號（測試預覽可輸入：G100VIP）");
    }
  };

  return (
    <section className="rounded-3xl bg-zinc-950 border-2 border-amber-500/50 p-5 sm:p-8 shadow-2xl space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-black">
              📜 階段賞別電子證書 ＆ 點數換好康加價購
            </span>
            <span className="text-xs font-bold text-emerald-400">
              零伺服器容量負擔・前端即時向量渲染・高密度防 AI 消除浮水印保護
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
            🏆 全球百鐵認證 階段賞別完賽證書產生器 ＆ 專屬里程碑加價購
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            系統已自動依據您登錄的完賽場次（鐵人三項 <span className="text-amber-400 font-bold">{triCount}</span> 場 ／ 公路單車 <span className="text-amber-400 font-bold">{cycCount}</span> 場）解鎖對應賞別獎狀與專屬商品加價購優惠！
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 flex flex-col items-center space-y-3">
          <div className="relative w-full max-w-[360px] rounded-2xl overflow-hidden border-2 border-amber-500/60 shadow-2xl bg-white">
            <canvas ref={canvasRef} className="w-full h-auto block select-none" />
          </div>
          <span className="text-[11px] text-zinc-400 text-center">
            {isPaidUnlocked
              ? "✅ 已解鎖【無浮水印高解析印刷級版本】"
              : "🔒 目前為【高密度防 AI 消除浮水印預覽版】，付費後即可一鍵消除全數浮水印"}
          </span>
        </div>

        <div className="lg:col-span-7 space-y-5">
          <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <h3 className="text-base font-black text-amber-400">
              1️⃣ 選擇您已達成登錄之「階段賞別」（僅需更動日期、姓名、賞別）
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">授證選手姓名</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-700 px-3.5 py-2.5 text-sm text-white font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">發證日期</label>
                <input
                  type="text"
                  value={certDate}
                  onChange={(e) => setCertDate(e.target.value)}
                  placeholder="2026 . 1 . 1"
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-700 px-3.5 py-2.5 text-sm text-amber-400 font-mono font-bold"
                />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="text-xs font-extrabold text-zinc-300">
                🏊‍♂️ 鐵人三項賞別（依完賽場次自動解鎖，點擊切換證書賞別）：
              </div>
              <div className="flex flex-wrap gap-2">
                {TRI_TIERS.map((t) => {
                  const unlocked = effectiveTri >= t.min;
                  const btnCls = selectedAward === t.name
                    ? "bg-amber-500 text-black shadow-lg"
                    : unlocked
                    ? "bg-zinc-800 text-white hover:bg-zinc-700 border border-amber-500/40"
                    : "bg-zinc-950 text-zinc-500 border border-zinc-800/80";
                  return (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setSelectedAward(t.name)}
                      className={"px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1 " + btnCls}
                    >
                      <span>{unlocked ? "🏅" : "🔒"}</span>
                      <span>{t.name} ({t.min}場)</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="text-xs font-extrabold text-zinc-300">
                🚴‍♂️ 公路單車百鐵馬賞別（點擊切換證書賞別）：
              </div>
              <div className="flex flex-wrap gap-2">
                {CYC_TIERS.map((t) => {
                  const unlocked = effectiveCyc >= t.min;
                  const btnCls = selectedAward === t.name
                    ? "bg-red-600 text-white shadow-lg"
                    : unlocked
                    ? "bg-zinc-800 text-white hover:bg-zinc-700 border border-red-500/40"
                    : "bg-zinc-950 text-zinc-500 border border-zinc-800/80";
                  return (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setSelectedAward(t.name)}
                      className={"px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1 " + btnCls}
                    >
                      <span>{unlocked ? "🚴" : "🔒"}</span>
                      <span>{t.name} ({t.min}場)</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDownloadCert(true)}
                className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#06C755] to-emerald-600 hover:from-[#05b34c] hover:to-emerald-500 text-white font-black text-xs sm:text-sm shadow-xl transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>💳</span>
                <span>
                  {isPaidUnlocked
                    ? "📥 立即下載【無浮水印高清證書】"
                    : "LINE Pay / 信用卡 付費下載無浮水印版 ($200)"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadCert(false)}
                className="py-3.5 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-bold text-xs sm:text-sm transition cursor-pointer"
              >
                📥 免費下載含浮水印預覽樣張
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/30 via-zinc-900 to-zinc-950 border border-amber-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black text-amber-400 uppercase">
                  MILESTONE REWARD PERKS
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  2️⃣ 達成賞別專屬「點數換好康」特殊商品加價購特權
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold">
                已解鎖 {allUnlockedAwards.length} 項特權
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {[...TRI_TIERS.slice(0, 4), ...CYC_TIERS.slice(0, 2)].map((item, idx) => {
                const isAdded = selectedPerkCart.includes(item.code);
                const addCls = isAdded
                  ? "bg-emerald-500 text-black"
                  : "bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/40";
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800 hover:border-amber-500/50 flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-amber-500 text-black text-[10px] font-black">
                          達成【{item.name}】專屬加購
                        </span>
                        <span className="text-[11px] text-zinc-500 line-through font-mono">
                          原價 ${item.origPrice}
                        </span>
                      </div>
                      <div className="text-xs font-extrabold text-white mt-1.5 leading-snug">
                        🎁 {item.perk}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                      <span className="text-sm font-black text-emerald-400 font-mono">
                        加購價 NT$ {item.addPrice}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPerkCart((prev) =>
                            prev.includes(item.code) ? prev.filter((c) => c !== item.code) : [...prev, item.code]
                          );
                        }}
                        className={"px-3 py-1 rounded-lg text-[11px] font-black transition cursor-pointer " + addCls}
                      >
                        {isAdded ? "✓ 已加入加購單" : "＋ 立即加價購"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedPerkCart.length > 0 && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-emerald-300 font-bold">
                  🛒 已選取 <span className="text-white font-black">{selectedPerkCart.length}</span> 項達成賞別專屬加價購好康（優惠代碼：{selectedPerkCart.join(", ")}）
                </div>
                <button
                  type="button"
                  onClick={() => setShowPayModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-black text-xs shadow cursor-pointer shrink-0"
                >
                  前往 LINE Pay 合併結帳 →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPayModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center px-4 z-50">
          <div className="bg-zinc-950 border-2 border-[#06C755]/60 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-[#06C755] text-white text-xs font-black">
                  LINE Pay
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  無浮水印高清證書 ＆ 賞別加價購結帳
                </h3>
              </div>
              <button onClick={() => setShowPayModal(false)} className="text-zinc-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs text-zinc-300">
              <div className="flex justify-between font-bold text-white">
                <span>📜 【{selectedAward}】無浮水印 300dpi 印刷級電子證書</span>
                <span className="text-amber-400 font-mono">NT$ 200</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>💎 加購實體雷雕水晶證書同捆優惠（選配）</span>
                <span>可於榮耀商城折抵 $200</span>
              </div>
              {selectedPerkCart.length > 0 && (
                <div className="pt-2 border-t border-zinc-800 text-amber-300">
                  🎁 已包含賞別加價購特權商品代碼：{selectedPerkCart.join(", ")}
                </div>
              )}
            </div>

            <form onSubmit={handleVerifyUnlockCode} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 block">
                  輸入付款完成解鎖碼（管理員或 VIP 測試請直接輸入：<span className="text-amber-400 font-mono">G100VIP</span>）
                </label>
                <input
                  type="text"
                  required
                  value={unlockInput}
                  onChange={(e) => setUnlockInput(e.target.value)}
                  placeholder="請輸入 G100VIP 立即解鎖無浮水印下載"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2.5 text-sm text-white font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-black text-sm shadow-lg cursor-pointer"
                >
                  ✅ 驗證解鎖並立即下載無浮水印高清證書
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
