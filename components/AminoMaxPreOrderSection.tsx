"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export interface UpcomingSeriesRace {
  id: string;
  name: string;
  date: string;
  organizer: string;
  sportType: "triathlon" | "cycling";
  verificationTool: "號碼布 (Bib)" | "安全帽號碼貼 或 號碼布";
  giftItem: string;
}

// 全球百鐵認證未來系列賽事清單（系統會自動用今日日期過濾，只顯示今天以後的未來賽事！）
export const UPCOMING_SERIES_RACES: UpcomingSeriesRace[] = [
  {
    id: "2026-kh-100k",
    name: "2026 高雄百K自行車挑戰",
    date: "2026-11-29",
    organizer: "中華民國體適能健身運動發展協會",
    sportType: "cycling",
    verificationTool: "安全帽號碼貼 或 號碼布",
    giftItem: "邁克仕 AminoMax 能量補給組",
  },
  {
    id: "2026-love197",
    name: "2026 戀戀197東海岸自行車公路賽",
    date: "2026-12-06",
    organizer: "臺東縣城鄉生活運動協會",
    sportType: "cycling",
    verificationTool: "安全帽號碼貼 或 號碼布",
    giftItem: "邁克仕 AminoMax 能量膠＋BCAA補給包",
  },
  {
    id: "2026-tainan-bike",
    name: "2026 輪躍台南單車嘉年華",
    date: "2026-12-06",
    organizer: "輪躍台南籌備委員會",
    sportType: "cycling",
    verificationTool: "安全帽號碼貼 或 號碼布",
    giftItem: "邁克仕 AminoMax 長距離耐力補給包",
  },
  {
    id: "2027-meishan-36",
    name: "2027 梅山36彎自行車挑戰賽",
    date: "2027-02-21",
    organizer: "中華民國體適能健身運動發展協會",
    sportType: "cycling",
    verificationTool: "安全帽號碼貼 或 號碼布",
    giftItem: "邁克仕 AminoMax 登山王能量補給組",
  },
  {
    id: "2027-puyuma-tri",
    name: "2027 臺東普悠瑪鐵人三項賽 (226K/113K/51.5K)",
    date: "2027-03-27",
    organizer: "臺東縣城鄉生活運動協會",
    sportType: "triathlon",
    verificationTool: "號碼布 (Bib)",
    giftItem: "邁克仕 AminoMax 鐵人三項全效能量組",
  },
  {
    id: "2027-lanyang-100k",
    name: "2027 蘭陽百K單車挑戰",
    date: "2027-09-20",
    organizer: "中華民國體適能健身運動發展協會",
    sportType: "cycling",
    verificationTool: "安全帽號碼貼 或 號碼布",
    giftItem: "邁克仕 AminoMax 能量補給組",
  },
  {
    id: "2027-pakelang-tri",
    name: "2027 台東巴歌浪鐵人三項",
    date: "2027-10-16",
    organizer: "臺東縣城鄉生活運動協會 / 巴歌浪",
    sportType: "triathlon",
    verificationTool: "號碼布 (Bib)",
    giftItem: "邁克仕 AminoMax 鐵人完賽補給組",
  },
  {
    id: "2027-love197",
    name: "2027 戀戀197東海岸自行車挑戰賽",
    date: "2027-12-05",
    organizer: "臺東縣城鄉生活運動協會",
    sportType: "cycling",
    verificationTool: "安全帽號碼貼 或 號碼布",
    giftItem: "邁克仕 AminoMax 能量膠＋BCAA補給包",
  },
  {
    id: "2027-tainan-bike",
    name: "2027 輪躍台南單車嘉年華",
    date: "2027-12-12",
    organizer: "輪躍台南籌備委員會",
    sportType: "cycling",
    verificationTool: "安全帽號碼貼 或 號碼布",
    giftItem: "邁克仕 AminoMax 長距離耐力補給包",
  },
  {
    id: "2027-shimen-roma",
    name: "2027 石門羅馬公路自行車挑戰",
    date: "2027-12-19",
    organizer: "中華民國體適能健身運動發展協會",
    sportType: "cycling",
    verificationTool: "安全帽號碼貼 或 號碼布",
    giftItem: "邁克仕 AminoMax 能量補給組",
  },
];

export default function AminoMaxPreOrderSection({
  userEmail,
  athleteName,
  sportTeam,
}: {
  userEmail: string;
  athleteName: string;
  sportTeam: string;
}) {
  const [selectedRaceIds, setSelectedRaceIds] = useState<string[]>([]);
  const [bibNotes, setBibNotes] = useState<Record<string, string>>({});
  const [agreedMarketing, setAgreedMarketing] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [allGlobalBookings, setAllGlobalBookings] = useState<any[]>([]);

  const isAdmin =
    (userEmail || "").toLowerCase().includes("evelny") ||
    (userEmail || "").toLowerCase().includes("pianopub") ||
    (userEmail || "").toLowerCase().includes("novem");

  // 計算距離開賽天數（厳格執行：歷史賽事不顯示、開賽前 30 天自動鎖定統計！）
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureRaces = UPCOMING_SERIES_RACES.map((r) => {
    const rDate = new Date(r.date + "T00:00:00");
    const diffTime = rDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // 開放勾選條件：開賽前 30 天以上 (daysLeft > 30)
    const isCutoffLocked = daysLeft <= 30;
    return {
      ...r,
      daysLeft,
      isCutoffLocked,
    };
  }).filter((r) => r.daysLeft >= 0); // 嚴格過濾：歷史已結束的賽事 (daysLeft < 0) 絕對不顯示！

  useEffect(() => {
    if (typeof window === "undefined") return;
    const rawUser = localStorage.getItem(`g100_aminomax_user_${userEmail || "guest"}`);
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        setSelectedRaceIds(parsed.raceIds || []);
        setBibNotes(parsed.bibNotes || {});
      } catch (e) {
        console.error(e);
      }
    }

    const rawGlobal = localStorage.getItem("g100_aminomax_all_bookings");
    if (rawGlobal) {
      try {
        setAllGlobalBookings(JSON.parse(rawGlobal));
      } catch (e) {
        console.error(e);
      }
    }
  }, [userEmail]);

  const toggleRaceSelection = (raceId: string, isCutoffLocked: boolean) => {
    if (isCutoffLocked) {
      alert("⚠️ 此賽事已進入「開賽前 1 個月（30天內）物資配發統計期」，已截止線上新增勾選，以確保正確數量的邁克仕產品送達主辦單位！");
      return;
    }
    setSelectedRaceIds((prev) =>
      prev.includes(raceId) ? prev.filter((id) => id !== raceId) : [...prev, raceId]
    );
    setSavedSuccess(false);
  };

  const handleSavePreOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedMarketing) {
      alert("⚠️ 請先勾選同意個人資料提供予賽事主辦單位與全球百鐵認證同步統計與行銷使用。");
      return;
    }

    const userBookingData = {
      email: userEmail,
      athleteName: athleteName || "認證選手",
      sportTeam: sportTeam || "個人",
      raceIds: selectedRaceIds,
      bibNotes,
      updatedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
    };

    localStorage.setItem(`g100_aminomax_user_${userEmail || "guest"}`, JSON.stringify(userBookingData));

    // 同步寫入全站統計池（供管理員統計發貨數量給各主辦單位）
    const rawGlobal = localStorage.getItem("g100_aminomax_all_bookings");
    let globalList: any[] = rawGlobal ? JSON.parse(rawGlobal) : [];
    globalList = globalList.filter((b) => b.email !== userEmail);
    globalList.push(userBookingData);
    localStorage.setItem("g100_aminomax_all_bookings", JSON.stringify(globalList));
    setAllGlobalBookings(globalList);

    setSavedSuccess(true);
    alert(`🎉 邁克仕（AminoMax）參賽補給預約成功！\n您已預先勾選 ${selectedRaceIds.length} 場未來系列賽事。\n\n📌 領取提醒：賽事當天請憑「號碼布」或「安全帽號碼貼（若該賽事無號碼布）」，由現場工作人員於號碼布/貼紙上做記號後即可免費領取邁克仕產品！`);
  };

  // 管理員匯出各場次邁克仕配發數量統計 CSV
  const handleExportAminoCsv = () => {
    const rows = [
      ["賽事名稱", "賽事日期", "主辦單位", "距離開賽天數", "統計狀態", "預先勾選總人數", "預約選手名單"],
    ];
    futureRaces.forEach((r) => {
      const matchedUsers = allGlobalBookings.filter((b) => (b.raceIds || []).includes(r.id));
      // 加上基本示範基數讓管理員預覽效果
      const count = matchedUsers.length;
      const names = matchedUsers.map((u) => `${u.athleteName}(${u.sportTeam})`).join("、") || "尚無名單";
      rows.push([
        r.name,
        r.date,
        r.organizer,
        `${r.daysLeft}天`,
        r.isCutoffLocked ? "已截止(準備發貨給主辦方)" : "開放會員勾選中",
        String(count),
        names,
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `邁克仕_全球百鐵系列賽事配發數量統計表_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section
      id="aminomax-preorder"
      className="rounded-3xl bg-gradient-to-br from-zinc-950 via-[#120d05] to-zinc-950 border-2 border-amber-500/50 p-6 sm:p-8 shadow-2xl space-y-6"
    >
      {/* 標題與商品視覺海報卡 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center border-b border-zinc-800 pb-6">
        <div className="lg:col-span-4">
          <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 bg-gradient-to-br from-amber-500/20 via-red-950/40 to-zinc-950 p-5 text-center space-y-3 shadow-xl">
            <img
              src="/images/aminomax-poster.jpg"
              alt="邁克仕 AminoMax 參賽補給兌換海報"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
              className="w-full h-44 object-cover rounded-xl mb-2"
            />
            <div className="inline-block px-3 py-0.5 rounded-full bg-amber-500 text-black text-[11px] font-black uppercase">
              OFFICIAL NUTRITION PARTNER
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              邁克仕 AminoMax
            </div>
            <div className="text-xs font-extrabold text-amber-300">
              ⚡ 能量膠 ／ BCAA 晶沛 ／ 電解質膠囊
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              全球百鐵認證會員專屬福利：賽前 1 個月預先勾選參賽場次，賽事現場憑號碼布或安全帽號碼貼做記號免費領取！
            </p>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black">
              🎁 會員專屬參賽福利
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-bold">
              開賽前 30 天截止統計・精準配發至各主辦單位
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            邁克仕 AminoMax × 全球百鐵認證 未來參賽場次預先勾選系統
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            請於下方勾選您<strong>從今日起預計報名參加之全球百鐵認證系列賽事</strong>（已結束之歷史賽事自動隱藏）。系統將於<strong>各場賽事開賽前 1 個月（30天）截止統計數量</strong>，並將邁克仕產品精準配發至該場次主辦單位手上。
          </p>
          <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs text-amber-300 space-y-1">
            <div className="font-extrabold text-white">📌 賽事當天現場兌換與核銷規則（防重複領取機制）：</div>
            <div>1. <strong>有號碼布之賽事</strong>：請出示本頁預約憑證與「選手號碼布」，由工作人員於<strong>號碼布上做記號</strong>後領取邁克仕產品。</div>
            <div>2. <strong>無號碼布（僅有單車安全帽號碼貼）之賽事</strong>：請出示<strong>「安全帽上的號碼貼」</strong>，由工作人員於<strong>號碼貼上做記號</strong>後即可領取！</div>
          </div>
        </div>
      </div>

      {/* 未來系列賽事勾選清單 */}
      <form onSubmit={handleSavePreOrder} className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-white">
            🗓️ 請勾選您預計參加的未來系列賽事（僅顯示今日以後之場次，已勾選 <span className="text-amber-400">{selectedRaceIds.length}</span> 場）
          </h3>
          <Link href="/series" className="text-xs font-bold text-amber-400 hover:underline">
            查看系列賽事詳情 →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {futureRaces.map((race) => {
            const isChecked = selectedRaceIds.includes(race.id);
            return (
              <div
                key={race.id}
                onClick={() => toggleRaceSelection(race.id, race.isCutoffLocked)}
                className={`rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between gap-3 ${
                  race.isCutoffLocked
                    ? "bg-zinc-900/30 border-zinc-800/60 opacity-75"
                    : isChecked
                    ? "bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-500/10"
                    : "bg-zinc-900/70 border-zinc-800 hover:border-zinc-600"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-extrabold ${
                      race.sportType === "triathlon" ? "bg-amber-500 text-black" : "bg-red-600 text-white"
                    }`}>
                      {race.sportType === "triathlon" ? "🏊‍♂️ 鐵人三項" : "🚴‍♂️ 百鐵馬單車"}
                    </span>
                    {race.isCutoffLocked ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[11px] font-bold">
                        🔒 開賽前30天內（已截止統計配發）
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                        ✅ 開放預約（距離開賽 {race.daysLeft} 天）
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-3 pt-1">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={race.isCutoffLocked}
                      onChange={() => {}}
                      className="mt-1 h-5 w-5 rounded border-amber-500 text-amber-500 focus:ring-amber-500 cursor-pointer"
                    />
                    <div>
                      <div className="text-sm sm:text-base font-black text-white">{race.name}</div>
                      <div className="text-xs text-zinc-400 font-mono mt-0.5">
                        賽事日期：{race.date} ｜ 主辦：{race.organizer}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-amber-300 font-bold">🎁 {race.giftItem}</span>
                  <span className="text-zinc-400">憑【{race.verificationTool}】做記號領取</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 個資與共同行銷同意勾選 */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
          <input
            type="checkbox"
            id="agree_amino_privacy"
            checked={agreedMarketing}
            onChange={(e) => setAgreedMarketing(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-amber-500"
          />
          <label htmlFor="agree_amino_privacy" className="text-xs text-zinc-300 leading-relaxed cursor-pointer">
            我已閱讀並同意
            <Link href="/legal/privacy" className="text-amber-400 underline font-bold mx-1">
              《個人資料保護暨跨賽事共同行銷授權聲明》
            </Link>
            ，同意將本人預約參賽之場次與基本識別資料提供予該賽事主辦單位（協會/公司）、全球百鐵認證及邁克仕（AminoMax）作為賽前物資配發統計、現場號碼布/安全帽號碼貼核銷與同步行銷使用。
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {savedSuccess ? (
            <span className="text-xs font-extrabold text-emerald-400">
              ✅ 已成功儲存您的未來參賽場次預約！賽事當天請出示下方核銷憑證與號碼布／安全帽號碼貼領取。
            </span>
          ) : (
            <span className="text-xs text-zinc-400">
              提示：請務必於各場賽事開賽前 1 個月完成勾選並點擊右側按鈕儲存。
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm transition shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            💾 確認儲存未來參賽場次 ＆ 產生邁克仕領取憑證
          </button>
        </div>
      </form>

      {/* 選手現場出示之「數位核銷卡」 */}
      {selectedRaceIds.length > 0 && (
        <div className="rounded-2xl bg-emerald-950/20 border border-emerald-500/40 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-emerald-400">
              🎫 我的邁克仕（AminoMax）賽事現場兌換核銷憑證（請於賽事現場出示此畫面＋號碼布/安全帽號碼貼）
            </h4>
            <span className="text-xs font-mono text-zinc-300">選手：{athleteName}（{sportTeam}）</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {futureRaces
              .filter((r) => selectedRaceIds.includes(r.id))
              .map((r) => (
                <div key={r.id} className="p-3 rounded-xl bg-zinc-950 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-extrabold text-white">{r.name}</div>
                    <div className="text-[11px] text-amber-400 mt-0.5">
                      核銷方式：工作人員於【{r.verificationTool}】做記號
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-500 text-black text-[11px] font-black shrink-0">
                    已預約登記
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 👑 管理員專屬：各場次邁克仕產品配發數量統計表（方便提早 1 個月發貨給各主辦單位！） */}
      {isAdmin && (
        <div className="rounded-2xl bg-zinc-900 border border-amber-500/50 p-5 space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <div>
              <span className="text-[11px] font-black text-amber-400 uppercase">
                ADMIN LOGISTICS & SPONSOR REPORT
              </span>
              <h4 className="text-base font-black text-white">
                👑 管理員專用：各場次「邁克仕產品配發數量」即時統計表（開賽前1個月發放至各主辦單位）
              </h4>
            </div>
            <button
              type="button"
              onClick={handleExportAminoCsv}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition cursor-pointer shrink-0"
            >
              📥 匯出各場次邁克仕配發數量統計 (.csv)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 text-zinc-400">
                <tr>
                  <th className="py-2 px-3">未來系列賽事名稱</th>
                  <th className="py-2 px-3">賽事日期</th>
                  <th className="py-2 px-3">接收物資之主辦單位</th>
                  <th className="py-2 px-3">現場核銷工具</th>
                  <th className="py-2 px-3">統計狀態 (前30天截止)</th>
                  <th className="py-2 px-3 text-right">已預約領取數量</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {futureRaces.map((r) => {
                  const count = allGlobalBookings.filter((b) => (b.raceIds || []).includes(r.id)).length;
                  return (
                    <tr key={r.id}>
                      <td className="py-2.5 px-3 font-bold text-white">{r.name}</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-300">{r.date}</td>
                      <td className="py-2.5 px-3 text-amber-400">{r.organizer}</td>
                      <td className="py-2.5 px-3 text-zinc-300">{r.verificationTool}</td>
                      <td className="py-2.5 px-3">
                        {r.isCutoffLocked ? (
                          <span className="text-red-400 font-bold">🔒 已截止（可發貨予主辦方）</span>
                        ) : (
                          <span className="text-emerald-400 font-bold">開放中（剩 {r.daysLeft} 天截止）</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-sm text-amber-400">
                        {count} 份
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
