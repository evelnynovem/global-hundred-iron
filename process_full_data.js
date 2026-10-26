const fs = require("fs");

// 讀取最新下載的原始 CSV 檔案
const csvFilename = "百鐵英雄榜 - raw data (3).csv";
if (!fs.existsSync(csvFilename)) {
  console.error(`❌ 找不到檔案: ${csvFilename}，請確認檔案已放置於專案根目錄。`);
  process.exit(1);
}

const raw = fs.readFileSync(csvFilename, "utf8");
const lines = raw.split(/\r?\n/).filter(l => l.trim());

// 嚴謹的 CSV 解析器（處理欄位內含逗號與引號的情況）
const parseLine = (line) => {
  const res = []; let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === "\"") inQ = !inQ;
    else if (c === "," && !inQ) { res.push(cur.trim()); cur = ""; }
    else cur += c;
  }
  res.push(cur.trim());
  return res;
};

// 提取 17 個原始欄位表頭
const headers = parseLine(lines[0]);
console.log("📌 偵測到的 17 個原始欄位：", headers);

const rows = lines.slice(1).map(parseLine);
const detailedRecords = [];
const rankingsMap = new Map();
const seenKeys = new Set();

rows.forEach((r) => {
  // 完整對應 17 個欄位
  const record = {
    submission_time: r[0] || "",
    login_email: r[1] || "",
    name: (r[2] || "").trim(),
    race_date: r[3] || "",
    race_name: r[4] || "",
    race_country: r[5] || "",
    race_city: r[6] || "",
    category: r[7] || "",
    ranking: r[8] || "",
    finish_time: r[9] || "",
    sport_team: (r[10] || "").trim(),
    bib: r[11] || "",
    gender: r[12] || "",
    terms_accepted: r[13] || "",
    finish_count: Number(r[14]) || 1,
    ranking_level: r[15] || "",
    member_status: r[16] || ""
  };

  if (!record.name) return;

  // 透過 姓名 + 賽事日期 + 賽事名稱 過濾重複提交
  const uniqueKey = `${record.name}|||${record.race_date}|||${record.race_name}`;
  if (seenKeys.has(uniqueKey)) return;
  seenKeys.add(uniqueKey);

  detailedRecords.push(record);

  // 同步計算以 (姓名 + 團隊) 為單位的百鐵英雄榜累計次數
  const rankKey = `${record.name}|||${record.sport_team}`;
  rankingsMap.set(rankKey, (rankingsMap.get(rankKey) || 0) + 1);
});

// 產出百鐵英雄榜排名資料
const rankings = Array.from(rankingsMap.entries()).map(([k, count]) => {
  const [name, team] = k.split("|||");
  return { name, team, count };
}).sort((a, b) => b.count - a.count);

// 建立前端快取目錄
if (!fs.existsSync("public/data")) {
  fs.mkdirSync("public/data", { recursive: true });
}

// 寫入完整 17 欄位的詳細 JSON 供前端查詢頁面使用
fs.writeFileSync("public/data/full_race_records.json", JSON.stringify(detailedRecords, null, 2));
fs.writeFileSync("public/data/hero_rankings.json", JSON.stringify(rankings, null, 2));

// 產出完整 17 欄位的 Supabase 匯入 CSV
const csvHeaders = "submission_time,login_email,athlete_name,race_date,race_name,race_country,race_city,category,ranking,finish_time,sport_team,bib,gender,terms_accepted,finish_count,ranking_level,member_status";
const csvRows = detailedRecords.map(item => {
  return [
    `"${item.submission_time}"`,
    `"${item.login_email}"`,
    `"${item.name.replace(/"/g, '""')}"`,
    `"${item.race_date}"`,
    `"${item.race_name.replace(/"/g, '""')}"`,
    `"${item.race_country}"`,
    `"${item.race_city}"`,
    `"${item.category}"`,
    `"${item.ranking}"`,
    `"${item.finish_time}"`,
    `"${item.sport_team.replace(/"/g, '""')}"`,
    `"${item.bib}"`,
    `"${item.gender}"`,
    `"${item.terms_accepted}"`,
    item.finish_count,
    `"${item.ranking_level}"`,
    `"${item.member_status}"`
  ].join(",");
});

fs.writeFileSync("supabase_full_17_import.csv", [csvHeaders, ...csvRows].join("\n"));

console.log(`\n🎉 17欄位資料處理完畢！`);
console.log(`- 有效不重複賽事明細：${detailedRecords.length} 筆`);
console.log(`- 百鐵英雄榜總人數：${rankings.length} 位`);
console.log(`- 已輸出前端 JSON 至: public/data/full_race_records.json`);
console.log(`- 已輸出完整欄位匯入檔至: supabase_full_17_import.csv\n`);