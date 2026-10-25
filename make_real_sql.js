const fs = require('fs');
const crypto = require('crypto');

// 讀取原始資料
const csvData = fs.readFileSync('百鐵英雄榜 - raw data.csv', 'utf-8');
const lines = csvData.split('\n').filter(line => line.trim() !== '');

const headers = lines[0].split(',');
const emailIdx = headers.indexOf('Login email');
const nameIdx = headers.indexOf('Name');
const dateIdx = headers.indexOf('Race date');
const eventIdx = headers.indexOf('Race name');
const timeIdx = headers.indexOf('Finish time');

const usersSet = new Set();
const certsSet = new Set();
const certsSql = [];

function getEmail(name, rawEmail) {
    if (name === '陳彥良') return 'pianopub1130@gmail.com';
    if (rawEmail && rawEmail.includes('@')) return rawEmail.toLowerCase().trim();
    const hash = crypto.createHash('md5').update(name).digest('hex').substring(0, 6);
    return `legacy_${hash}@global100.org`;
}

function cleanDate(d) {
    if (!d || d.includes('#')) return '2000-01-01'; 
    let dStr = d.replace(/\//g, '-').replace(/\./g, '-');
    let parts = dStr.split('-');
    if (parts.length === 3) {
        let y = parseInt(parts[0]) || 2000;
        let m = parseInt(parts[1]) || 1;
        let day = parseInt(parts[2]) || 1;
        return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    return '2000-01-01';
}

// 🔥 絕對防禦機制：確保產出的時間百分之百符合 HH:MM:SS
function cleanTime(t) {
    if (!t) return '00:00:01';
    let tStr = String(t).trim();
    
    // 只抓取字串裡面的「數字」區塊
    const nums = tStr.match(/\d+/g);
    if (!nums) return '00:00:01';

    // 如果是一長串沒分隔的數字（如 Excel 日期序號）
    if (nums.length === 1 && nums[0].length >= 5) return '23:59:59';

    let h = 0, m = 0, s = 0;

    if (nums.length >= 3) {
        h = parseInt(nums[0], 10) || 0;
        m = parseInt(nums[1], 10) || 0;
        s = parseInt(nums[2], 10) || 0;
    } else if (nums.length === 2) {
        h = parseInt(nums[0], 10) || 0;
        m = parseInt(nums[1], 10) || 0;
    } else if (nums.length === 1) {
        h = parseInt(nums[0], 10) || 0;
    }

    // 強制校正所有超出範圍的數值
    if (h >= 24) h = 23;
    if (m >= 60) m = 59;
    if (s >= 60) s = 59;

    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');

    return `${hh}:${mm}:${ss}`;
}

for (let i = 1; i < lines.length; i++) {
    let cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    if (cols.length <= eventIdx) continue;
    
    let name = cols[nameIdx] ? cols[nameIdx].replace(/"/g, '').trim() : '';
    let eventName = cols[eventIdx] ? cols[eventIdx].replace(/"/g, '').trim() : '';
    if (!name || !eventName) continue;
    
    let email = getEmail(name, cols[emailIdx] ? cols[emailIdx].replace(/"/g, '') : '');
    let dateFormatted = cleanDate(cols[dateIdx] ? cols[dateIdx].replace(/"/g, '') : '');
    let timeFormatted = cleanTime(cols[timeIdx] ? cols[timeIdx].replace(/"/g, '') : '');
    
    usersSet.add(email);
    
    const safeEventName = eventName.replace(/'/g, "''");
    const certKey = `${email}|${safeEventName}|${dateFormatted}`;
    if (!certsSet.has(certKey)) {
        certsSet.add(certKey);
        certsSql.push(`  ('${email}', '${timeFormatted}', 'OPEN', '${safeEventName}', '${dateFormatted}')`);
    }
}

const uniqueEvents = new Map();
for (let i = 1; i < lines.length; i++) {
    let cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    if (cols.length <= eventIdx) continue;
    let eventName = cols[eventIdx] ? cols[eventIdx].replace(/"/g, '').trim() : '';
    if (!eventName) continue;
    let dateFormatted = cleanDate(cols[dateIdx] ? cols[dateIdx].replace(/"/g, '') : '');
    const safeEventName = eventName.replace(/'/g, "''");
    uniqueEvents.set(`${safeEventName}|${dateFormatted}`, `  ('${safeEventName}', 'triathlon', 'Taiwan', 'Unknown', '${dateFormatted}', 'visible')`);
}

const outUsers = `INSERT INTO public.users (email) VALUES \n${Array.from(usersSet).map(e => `  ('${e}')`).join(',\n')} \nON CONFLICT DO NOTHING;\n\n`;
const outEvents = `INSERT INTO public.events (event_name, sport_type, country, city, event_date, visibility_status) VALUES \n${Array.from(uniqueEvents.values()).join(',\n')} \nON CONFLICT DO NOTHING;\n\n`;
const outCerts = `INSERT INTO public.certifications (user_email, event_id, finish_time, category)\nSELECT t.u_e, e.event_id, t.f_t::time, t.c\nFROM ( VALUES \n${certsSql.join(',\n')} \n) AS t(u_e, f_t, c, e_name, e_date)\nJOIN public.events e ON e.event_name = t.e_name AND e.event_date = t.e_date::date\nON CONFLICT DO NOTHING;\n`;

// 注意：這裡改用全新的檔名，避免跟舊檔案搞混
fs.writeFileSync('FINAL_HERO_IMPORT.sql', outUsers + outEvents + outCerts, 'utf-8');
console.log('【成功】全新無敵版的 SQL 檔案 FINAL_HERO_IMPORT.sql 已經在根目錄產生了！');