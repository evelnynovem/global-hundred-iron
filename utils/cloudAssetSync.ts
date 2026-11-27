import type { SupabaseClient } from "@supabase/supabase-js";

const CACHE_PREFIX = "g100_v35_cache_";
const MAX_SINGLE_CACHE_CHARS = 1200000; // 單一快取上限 1.2MB，防止瀏覽器 localStorage 塞爆當機

/**
 * 清除早期版本遺留的龐大過期快取（解決電腦版比手機版慢、偶發記憶體不足當機的問題）
 */
export function purgeStaleLocalCache(): void {
  if (typeof window === "undefined") return;
  try {
    const legacyKeys = [
      "g100_fast_col_cover",
      "g100_celeb_col_cover",
      "g100_initiators_v17",
      "g100_initiators_v18",
      "g100_initiators_v19",
      "g100_col_v3_CELEB",
      "g100_col_v3_MED",
    ];
    legacyKeys.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch (e) {}
    });
  } catch (e) {}
}

/**
 * 毫秒級讀取安全本機快取（自動過濾無效或舊版污染圖檔連結）
 */
export function getCachedCloudAsset(assetKey: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + assetKey);
    if (!raw) return null;
    if (raw.includes("images.unsplash.com") || raw.includes("cycling-140.jpeg")) {
      localStorage.removeItem(CACHE_PREFIX + assetKey);
      return null;
    }
    return raw;
  } catch (e) {
    return null;
  }
}

/**
 * 寫入安全本機快取（遇到容量配額滿時自動淘汰最舊快取，絕不報錯或卡死瀏覽器）
 */
export function setCachedCloudAsset(assetKey: string, payload: string): void {
  if (typeof window === "undefined" || !payload) return;
  if (payload.length > MAX_SINGLE_CACHE_CHARS) return;
  try {
    localStorage.setItem(CACHE_PREFIX + assetKey, payload);
  } catch (e) {
    try {
      // 容量不足時清除舊版快取後重試一次
      purgeStaleLocalCache();
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith(CACHE_PREFIX) && k !== CACHE_PREFIX + assetKey) {
          localStorage.removeItem(k);
        }
      }
      localStorage.setItem(CACHE_PREFIX + assetKey, payload);
    } catch (e2) {}
  }
}

/**
 * 跨裝置雲端資源讀取（支援 Stale-While-Revalidate 本機快取同步更新）
 */
export async function loadCloudAsset(
  supabase: SupabaseClient,
  assetKey: string,
  legacySysAthleteName?: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("site_assets_sync")
      .select("payload")
      .eq("asset_key", assetKey)
      .maybeSingle();

    if (!error && data && typeof data.payload === "string" && data.payload.length > 0) {
      setCachedCloudAsset(assetKey, data.payload);
      return data.payload;
    }
  } catch (e) {}

  if (legacySysAthleteName) {
    try {
      const { data: legacyRows } = await supabase
        .from("race_details_full")
        .select("team")
        .eq("athlete_name", legacySysAthleteName)
        .order("id", { ascending: false })
        .limit(1);

      if (legacyRows && legacyRows.length > 0 && typeof legacyRows[0].team === "string" && legacyRows[0].team.length > 0) {
        setCachedCloudAsset(assetKey, legacyRows[0].team);
        return legacyRows[0].team;
      }
    } catch (e) {}
  }

  return getCachedCloudAsset(assetKey);
}

/**
 * 跨裝置雲端資源儲存（同步更新雲端與本機快取）
 */
export async function saveCloudAsset(
  supabase: SupabaseClient,
  assetKey: string,
  payload: string,
  legacySysAthleteName?: string
): Promise<{ ok: boolean; error?: string }> {
  setCachedCloudAsset(assetKey, payload);
  try {
    const { error: rpcErr } = await supabase.rpc("upsert_site_asset", {
      p_key: assetKey,
      p_payload: payload,
    });
    if (!rpcErr) {
      return { ok: true };
    }

    if (legacySysAthleteName) {
      await supabase.from("race_details_full").delete().eq("athlete_name", legacySysAthleteName);
      const { error: insErr } = await supabase.from("race_details_full").insert([
        {
          athlete_name: legacySysAthleteName,
          race_name: assetKey,
          race_date: "2026-01-01",
          category: "SYS",
          finish_time: "SYS",
          team: payload,
        },
      ]);
      if (!insErr) return { ok: true };
      return { ok: false, error: rpcErr.message || insErr.message };
    }

    return { ok: false, error: rpcErr.message };
  } catch (err: any) {
    return { ok: false, error: err?.message || "雲端同步失敗" };
  }
}

export function isUltraTriathlon90K(raceName?: string, category?: string): boolean {
  const combined = `${raceName || ""} ${category || ""}`.toUpperCase();
  return (
    combined.includes("113") ||
    combined.includes("226") ||
    combined.includes("70.3") ||
    combined.includes("140.6")
  );
}
