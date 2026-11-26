import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 跨裝置雲端資源讀取（手機與電腦 100% 同步）：
 * 1. 優先讀取專屬雲端表 public.site_assets_sync（開放公開唯讀，無 RLS 寫入衝突）
 * 2. 若新表尚無資料，自動降級讀取舊版 race_details_full (__SYS_*) 保持向後相容
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
        return legacyRows[0].team;
      }
    } catch (e) {}
  }

  return null;
}

/**
 * 跨裝置雲端資源儲存（透過零信任 SECURITY DEFINER RPC 寫入 site_assets_sync）：
 * 徹底根除舊版寫入 race_details_full 被 RLS 靜默擋掉、導致「電腦看得到、手機看不到」的問題。
 */
export async function saveCloudAsset(
  supabase: SupabaseClient,
  assetKey: string,
  payload: string,
  legacySysAthleteName?: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error: rpcErr } = await supabase.rpc("upsert_site_asset", {
      p_key: assetKey,
      p_payload: payload,
    });
    if (!rpcErr) {
      return { ok: true };
    }

    // 降級容錯：若管理員尚未執行 v4 SQL，嘗試寫入舊表並真實檢查 error（絕不靜默吞錯）
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

/**
 * 判斷賽事名稱或組別是否屬於 113K / 226K / 70.3 / 140.6 超級鐵人三項（單車段達 90K+）
 */
export function isUltraTriathlon90K(raceName?: string, category?: string): boolean {
  const combined = `${raceName || ""} ${category || ""}`.toUpperCase();
  return (
    combined.includes("113") ||
    combined.includes("226") ||
    combined.includes("70.3") ||
    combined.includes("140.6")
  );
}
