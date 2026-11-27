"use client";

import { useEffect } from "react";
import { purgeStaleLocalCache } from "@/utils/cloudAssetSync";

/**
 * 全站零閃爍圖片骨架屏與本機快取優化控制器 (掛載於 app/layout.tsx，零破壞全站 40 頁)
 * ----------------------------------------------------------------------------
 * 1. 自動清理過期龐大的舊版 localStorage 垃圾快取，防止電腦版瀏覽器變慢與當機。
 * 2. 為全站所有 <img> 自動加上非同步解碼 (decoding="async") 與平滑淡入骨架過渡：
 *    圖片在下載完成前顯示消光深灰骨架底色，載入完成瞬間平滑顯示，消除破圖與閃爍跳動 (Zero CLS)。
 * 3. 預先預載關鍵靜態海報至瀏覽器快取，讓切換首頁／專欄／系列賽瞬間開啟。
 */
const PRELOAD_KEY_IMAGES = [
  "/images/col_med_default_clean.jpg",
  "/images/col_celeb_default_clean.jpg",
  "/images/col_celeb_song_clean.jpg",
];

export default function GlobalImageOptimizer() {
  useEffect(() => {
    // 1. 清理舊版肥大快取
    purgeStaleLocalCache();

    // 2. 注入全站輕量骨架與平滑淡入 CSS（僅一套 style，不影響既有版面尺寸）
    const styleId = "g100-global-img-skeleton-css";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        img[data-g100-img="loading"] {
          opacity: 0 !important;
          background: linear-gradient(90deg, #18181b 25%, #27272a 50%, #18181b 75%);
          background-size: 200% 100%;
          animation: g100Shimmer 1.4s infinite linear;
        }
        img[data-g100-img="loaded"] {
          opacity: 1;
          transition: opacity 220ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes g100Shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `;
      document.head.appendChild(style);
    }

    const enhanceImg = (img: HTMLImageElement) => {
      if (!img || img.dataset.g100Bound === "1") return;
      img.dataset.g100Bound = "1";
      try {
        img.decoding = "async";
      } catch (e) {}

      // 若瀏覽器已經從快取載入完成（0ms），直接標記 loaded 不閃爍
      if (img.complete && img.naturalWidth > 0) {
        img.dataset.g100Img = "loaded";
        return;
      }

      img.dataset.g100Img = "loading";
      const markLoaded = () => {
        img.dataset.g100Img = "loaded";
      };
      img.addEventListener("load", markLoaded, { once: true });
      img.addEventListener("error", markLoaded, { once: true });
      // 安全保底：最長 1.8 秒內強制顯示避免任何特殊圖片卡在透明狀態
      window.setTimeout(markLoaded, 1800);
    };

    const scanAllImages = () => {
      document.querySelectorAll("img").forEach((el) => enhanceImg(el as HTMLImageElement));
    };

    scanAllImages();

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.target instanceof HTMLImageElement && m.attributeName === "src") {
          const img = m.target;
          if (!img.complete || img.naturalWidth === 0) {
            img.dataset.g100Img = "loading";
            const done = () => { img.dataset.g100Img = "loaded"; };
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true });
            window.setTimeout(done, 1500);
          } else {
            img.dataset.g100Img = "loaded";
          }
        }
        m.addedNodes.forEach((node) => {
          if (node instanceof HTMLImageElement) {
            enhanceImg(node);
          } else if (node instanceof HTMLElement) {
            node.querySelectorAll("img").forEach((el) => enhanceImg(el as HTMLImageElement));
          }
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src"],
    });

    // 3. 瀏覽器閒置時背景預載關鍵海報至本機快取
    const idleTimer = window.setTimeout(() => {
      PRELOAD_KEY_IMAGES.forEach((url) => {
        const pre = new Image();
        pre.decoding = "async";
        pre.src = url;
      });
    }, 800);

    return () => {
      observer.disconnect();
      window.clearTimeout(idleTimer);
    };
  }, []);

  return null;
}
