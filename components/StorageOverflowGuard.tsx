"use client";

import { useEffect } from "react";

export default function StorageOverflowGuard() {
  useEffect(() => {
    try {
      // 1. 檢查並清理過大或過期的 localStorage 項目
      if (typeof window !== "undefined" && window.localStorage) {
        let totalSize = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const val = localStorage.getItem(key) || "";
            totalSize += key.length + val.length;
            // 若發現單一暫存超過 2MB 或整體超過 4MB，自動清除舊快取
            if (val.length > 2000000) {
              localStorage.removeItem(key);
            }
          }
        }
        if (totalSize > 4000000) {
          console.warn("⚠️ 偵測到 LocalStorage 過大，自動進行安全清理...");
          localStorage.clear();
        }
      }

      // 2. 自動攔截並清理過長導致 494 Header 過大的冗餘 Cookie
      if (typeof document !== "undefined" && document.cookie) {
        const cookies = document.cookie.split(";");
        if (cookies.length > 30 || document.cookie.length > 4000) {
          console.warn("⚠️ 偵測到 Cookie 累積過多，正在自動精簡...");
          cookies.forEach((cookie) => {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            // 保留 Supabase 驗證與語言核心 Cookie，其餘非必要舊 Cookie 自動過期清除
            if (!name.includes("sb-") && !name.includes("supabase")) {
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
            }
          });
        }
      }
    } catch (e) {
      console.error("Storage Guard Error:", e);
    }
  }, []);

  return null;
}
