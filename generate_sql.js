const fs = require('fs');
const crypto = require('crypto');

// 讀取 CSV 檔案
const csvData = fs.readFileSync('歷史鐵人三項賽事選手完賽成績查詢 - raw data.csv', 'utf-8');
const lines = csvData.split('\n').filter(line => line.trim() !== '');

// 解析標題列以取得索引
const headers = lines[0].split(',');
const nameIdx = headers.indexOf('姓名');
const dateIdx = headers.indexOf('賽事日期');
const eventIdx = headers.indexOf('賽事名稱');
const timeIdx = headers.indexOf('完賽成績');
const catIdx = headers.indexOf('組別');

const records = [];
const nameCounts = {};

// 第一次掃描：計算完賽次數
for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length <= nameIdx) continue;
    const name = cols[nameIdx] ? cols[nameIdx].trim() : '';
    if (name) {
        nameCounts[name] = (nameCounts[name] || 0) + 1;
        records.push(cols);
    }
}

// 建立虛擬 Email 生成器
function getEmail(name) {
    if (name === '陳彥良') return 'pianopub1130@gmail.com';
    const hash = crypto.createHash('md5').update(name).digest('hex').substring(0, 6);
    return `legacy_${hash}@global100.org`;
}

// 建立組別轉換器
function cleanCategory(c) {
    let cat = (c || '').trim().replace(' 男', '').replace(' 女', '');
    const mapping = {
        'M18': 'M18-24', 'M20': 'M25-29', 'M25': 'M25-29', 'M30': 'M30-34',
        'M35': 'M35-39', 'M40': 'M40-44', 'M45': 'M45-49', 'M50': 'M50-54',
        'M55': 'M55-59', 'M60': 'M60-64', 'F15': 'F18-24', 'F18': 'F18-24',
        'F20': 'F18-24', 'F25': 'F25-29', 'F30': 'F30-34', 'F35': 'F35-39',
        'F40': 'F40-44', 'F45': 'F45-49', 'F50': 'F50-54'
    };
    if (mapping[cat]) return mapping[cat];
    if (['不分組', 'F00', '同意'].includes(cat)) return 'OPEN';
    return 'OTHER';
}

const sqlValues = [];
const uniqueCheck = new Set();
const userEmails = new Set(); // 🔥 新增：專門用來收集要先建檔的會員清單

// 第二次掃描：篩選並格式化資料
records.forEach(cols => {
    const name = cols[nameIdx].trim();
    // 條件：陳彥良本人 或 完賽 >= 5 次
    if (name === '陳彥良' || nameCounts[name] >= 5) {
        const email = getEmail(name);
        const eventName = cols[eventIdx].trim();
        const dateRaw = cols[dateIdx].trim();
        const timeRaw = cols[timeIdx] ? cols[timeIdx].trim() : '';
        const cat = cleanCategory(cols[catIdx]);

        // 確保時間格式完整 hh:mm:ss
        const timeParts = timeRaw.split(':');
        if (timeParts.length === 3 && eventName) {
            const timeFormatted = `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}:${timeParts[2].padStart(2, '0')}`;
            
            // 剔除 00:00:00 的未完賽紀錄
            if (timeFormatted !== '00:00:00') {
                const dateFormatted = dateRaw.replace(/\//g, '-');
                
                userEmails.add(email); // 把這個信箱加入會員建檔清單

                // 防重複寫入
                const uniqueKey = `${email}-${eventName}-${dateFormatted}`;
                if (!uniqueCheck.has(uniqueKey)) {
                    uniqueCheck.add(uniqueKey);
                    sqlValues.push(`  ('${email}', '${timeFormatted}', '${cat}', '${eventName}', '${dateFormatted}')`);
                }
            }
        }
    }
});

// 🔥 新增：第一段 SQL - 先幫這些老戰友在 users 資料表中建檔
const usersValues = Array.from(userEmails).map(email => `  ('${email}')`);
const usersSql = `INSERT INTO public.users (email)
VALUES 
${usersValues.join(',\n')}
ON CONFLICT (email) DO NOTHING;

`;

// 第二段 SQL - 再寫入成績
const certsSql = `INSERT INTO public.certifications (user_email, event_id, finish_time, category)
SELECT t.u_e, e.event_id, t.f_t::time, t.c
FROM (
  VALUES 
${sqlValues.join(',\n')}
) AS t(u_e, f_t, c, e_name, e_date)
JOIN public.events e ON e.event_name = t.e_name AND e.event_date = t.e_date::date
ON CONFLICT (user_email, event_id) DO NOTHING;
`;

fs.writeFileSync('final_import.sql', usersSql + certsSql, 'utf-8');
console.log(`處理完成！成功建立 ${usersValues.length} 筆會員帳號，並排隊寫入 ${sqlValues.length} 筆成績。`);