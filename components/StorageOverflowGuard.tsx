"use client";

import { useEffect } from "react";

export default function StorageOverflowGuard() {
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        let totalSize = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const val = localStorage.getItem(key) || "";
            totalSize += key.length + val.length;
            if (val.length > 2000000) {
              localStorage.removeItem(key);
            }
          }
        }
        if (totalSize > 4000000) {
          localStorage.clear();
        }
      }
    } catch (e) {
      console.error("Storage Guard Error:", e);
    }
  }, []);

  return null;
}
