"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function StorageOverflowGuard() {
  useEffect(() => {
    async function sanitizeAuthAndCookies() {
      try {
        // 1. 清除任何非必要或過大的 Cookie，防止 494 REQUEST_HEADER_TOO_LARGE
        if (typeof document !== "undefined" && document.cookie.length > 3500) {
          const cookies = document.cookie.split(";");
          cookies.forEach((c) => {
            const name = c.split("=")[0].trim();
            if (!name.includes("sb-")) {
              document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
            }
          });
        }

        // 2. 檢查當前登入者的 user_metadata 是否誤存了巨大的 Base64 大頭照字串，若有則自動移至 localStorage 並將 Cookie 瘦身！
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.user_metadata?.avatar_data_url) {
          const bigAvatar = session.user.user_metadata.avatar_data_url;
          if (typeof window !== "undefined" && bigAvatar.length > 500) {
            localStorage.setItem("g100_avatar_" + session.user.id, bigAvatar);
            await supabase.auth.updateUser({
              data: { avatar_data_url: null }
            });
            console.log("✅ 已自動將超大頭像移出 Cookie Metadata，徹底根絕 494 錯誤！");
          }
        }
      } catch (e) {
        console.warn("Sanitize check:", e);
      }
    }
    sanitizeAuthAndCookies();
  }, []);

  return null;
}
