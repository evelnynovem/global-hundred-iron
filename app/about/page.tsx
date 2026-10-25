"use client";

import React from "react";
import Link from "next/link";

// 完美對應您以中文姓名命名的圖片檔案、原始自訂頭銜與分類
const founderGroups = [
  {
    category: "核心領導與管理團隊",
    members: [
      { name: "陳彥良", title: "全球百鐵認證總召集人暨創辦人", note: "（當時成立時倡議人自己提出）", img: "/initiators/陳彥良.jpg" },
      { name: "施和鋐 & 陳素梅", title: "全球百鐵認證總召集人暨昇陽自行車創辦人", note: "（當時成立時倡議人自己提出）", img: "/initiators/施和鋐與陳素梅.jpg" },
      { name: "劉榮昌", title: "全球百鐵認證知識長暨活動咖總經理", note: "（當時成立時倡議人自己提出）", img: "/initiators/劉榮昌.jpg" },
      { name: "林健鴻", title: "全球百鐵認證法務長", note: "（當時成立時倡議人自己提出）", img: "/initiators/林健鴻.jpg" },
      { name: "袁宜如", title: "全球百鐵認證藝術總監", note: "（當時成立時倡議人自己提出）", img: "/initiators/袁宜如.jpg" },
      { name: "陳霖毅", title: "全球百鐵認證資訊長", note: "（當時成立時倡議人自己提出）", img: "/initiators/陳霖毅.jpg" },
      { name: "黃興隆", title: "全球百鐵認證顧問暨普悠瑪及台東超鐵人三項裁判長", note: "（當時成立時倡議人自己提出）", img: "/initiators/黃興隆.jpg" },
      { name: "施宜孝", title: "全球百鐵認證公關長", note: "（當時成立時倡議人自己提出）", img: "/initiators/施宜孝.jpg" },
    ],
  },
  {
    category: "KOL",
    members: [
      { name: "陳彥良", title: "全球百鐵認證創辦人暨醫護鐵人創辦人", note: "（當時成立時倡議人自己提出）", img: "/initiators/陳彥良.jpg" },
      { name: "簡翊倫 (一輪)", title: "全球百鐵認證創始倡議人暨知名YouTuber「一輪」", note: "（當時成立時倡議人自己提出）", img: "/initiators/簡翊倫.jpg" },
      { name: "黃柏青 (柏青哥)", title: "全球百鐵認證創始倡議人暨鐵人運動專欄作家「柏青哥」", note: "（當時成立時倡議人自己提出）", img: "/initiators/黃柏青.jpg" },
      { name: "劉祖寧", title: "全球百鐵認證創始倡議人暨老爺鐵人-知本老爺酒店總經理", note: "（當時成立時倡議人自己提出）", img: "/initiators/劉祖寧.jpg" },
      { name: "詹益榮", title: "全球百鐵認證創始倡議人暨舒跑哥", note: "（當時成立時倡議人自己提出）", img: "/initiators/詹益榮.jpg" },
      { name: "郭修森", title: "全球百鐵認證創始倡議人暨Vertex 丸鐵運動創辦人", note: "（當時成立時倡議人自己提出）", img: "/initiators/郭修森.jpg" },
      { name: "姚焱堯", title: "全球百鐵認證創始倡議人暨運動筆記創辦人", note: "（當時成立時倡議人自己提出）", img: "/initiators/姚焱堯.jpg" },
      { name: "李翰暄", title: "全球百鐵認證創始倡議人暨光頭神童", note: "（當時成立時倡議人自己提出）", img: "/initiators/李翰暄.jpg" },
      { name: "姜義村", title: "全球百鐵認證創始倡議人暨身障運動推手", note: "（當時成立時倡議人自己提出）", img: "/initiators/姜義村.jpg" },
      { name: "許仁茂", title: "全球百鐵認證創始倡議人暨地表最強的鐵人老爸、FXT 第一屆冠軍", note: "（當時成立時倡議人自己提出）", img: "/initiators/許仁茂.jpg" },
      { name: "何航順", title: "全球百鐵認證創始倡議人暨公路車小馬暨醫護鐵人", note: "（當時成立時倡議人自己提出）", img: "/initiators/何航順.jpg" },
      { name: "林美佐", title: "全球百鐵認證創始倡議人暨最速空姐", note: "（當時成立時倡議人自己提出）", img: "/initiators/林美佐.jpg" },
      { name: "李詹瑩", title: "全球百鐵認證創始倡議人暨蛙式泳后", note: "（當時成立時倡議人自己提出）", img: "/initiators/李詹瑩.jpg" },
      { name: "江昇峰", title: "全球百鐵認證創始倡議人暨樂高鐵人", note: "（當時成立時倡議人自己提出）", img: "/initiators/江昇峰.jpg" },
      { name: "江晏慶", title: "全球百鐵認證創始倡議人暨XTERRA 專業教練", note: "（當時成立時倡議人自己提出）", img: "/initiators/江晏慶.jpg" },
      { name: "王千由", title: "全球百鐵認證創始倡議人暨雙棲女王、277 自轉車競佐訓教練", note: "（當時成立時倡議人自己提出）", img: "/initiators/王千由.jpg" },
      { name: "周青", title: "全球百鐵認證創始倡議人暨中華民國越野跑協會理事長", note: "（當時成立時倡議人自己提出）", img: "/initiators/周青.jpg" },
      { name: "陳家平", title: "全球百鐵認證創始倡議人暨嘉義市縣議員", note: "（當時成立時倡議人自己提出）", img: "/initiators/陳家平.jpg" },
      { name: "Hi Cindy", title: "Hi Cindy", note: "（當時成立時倡議人自己提出）", img: "/initiators/Hi Cindy.jpg" },
      { name: "連俊宏", title: "全球百鐵認證創始倡議人暨工研院資通所技術副組長", note: "（當時成立時倡議人自己提出）", img: "/initiators/連俊宏.jpg" },
      { name: "吳聰義", title: "全球百鐵認證創始倡議人暨台體大教授", note: "（當時成立時倡議人自己提出）", img: "/initiators/吳聰義.jpg" },
      { name: "張怡潔", title: "全球百鐵認證創始倡議人暨中山醫學大學助理教授＆亞運女排國手", note: "（當時成立時倡議人自己提出）", img: "/initiators/張怡潔.jpg" },
      { name: "方信淵", title: "全球百鐵認證創始倡議人暨實踐大學副教授", note: "（當時成立時倡議人自己提出）", img: "/initiators/方信淵.jpg" },
    ],
  },
  {
    category: "品牌代表",
    members: [
      { name: "曾上原", title: "全球百鐵認證創始倡議人暨美利達自行車總經理", note: "（當時成立時倡議人自己提出）", img: "/initiators/曾上原.jpg" },
      { name: "張仕賢", title: "全球百鐵認證創始倡議人暨易飛網營運長", note: "（當時成立時倡議人自己提出）", img: "/initiators/張仕賢.jpg" },
      { name: "黃成翰", title: "全球百鐵認證創始倡議人暨名衍行銷總經理", note: "（當時成立時倡議人自己提出）", img: "/initiators/黃成翰.jpg" },
      { name: "陳衍豪", title: "全球百鐵認證創始倡議人暨SAEKO總經理", note: "（當時成立時倡議人自己提出）", img: "/initiators/陳衍豪.jpg" },
      { name: "黃潔儀", title: "全球百鐵認證創始倡議人暨展盟展覽有限公司董事長", note: "（當時成立時倡議人自己提出）", img: "/initiators/黃潔儀.jpg" },
      { name: "王凌卿", title: "全球百鐵認證創始倡議人暨王大夫一條根股份有限公司營運長", note: "（當時成立時倡議人自己提出）", img: "/initiators/王凌卿.jpg" },
      { name: "陳信仲", title: "全球百鐵認證創始倡議人暨277自転車創辦人", note: "（當時成立時倡議人自己提出）", img: "/initiators/陳信仲.jpg" },
      { name: "黃上慧", title: "全球百鐵認證創始倡議人暨LP台灣通路行銷經理", note: "（當時成立時倡議人自己提出）", img: "/initiators/黃上慧.jpg" },
      { name: "許榮裕", title: "全球百鐵認證創始倡議人暨KS凱薩克總經理", note: "（當時成立時倡議人自己提出）", img: "/initiators/許榮裕.jpg" },
      { name: "楊世賓", title: "全球百鐵認證創始倡議人暨登薾國際貿易股份有限公司經理", note: "（當時成立時倡議人自己提出）", img: "/initiators/楊世賓.jpg" },
      { name: "林宗緯", title: "全球百鐵認證創始倡議人暨Akiwei總經理", note: "（當時成立時倡議人自己提出）", img: "/initiators/林宗緯.jpg" },
      { name: "賴奕銘", title: "全球百鐵認證創始倡議人暨Footland總經理", note: "（當時成立時倡議人自己提出）", img: "/initiators/賴奕銘.jpg" },
      { name: "傅漢武", title: "全球百鐵認證創始倡議人暨Compressport品牌經理", note: "（當時成立時倡議人自己提出）", img: "/initiators/傅漢武.jpg" },
      { name: "陳宣佑", title: "全球百鐵認證創始倡議人暨諾壯BCAA創辦人", note: "（當時成立時倡議人自己提出）", img: "/initiators/陳宣佑.jpg" },
      { name: "林明謙", title: "全球百鐵認證創始倡議人暨Zoot Taiwan營運長", note: "（當時成立時倡議人自己提出）", img: "/initiators/林明謙.jpg" },
      { name: "劉宜承", title: "全球百鐵認證創始倡議人暨亞科太克品牌行銷部主任", note: "（當時成立時倡議人自己提出）", img: "/initiators/劉宜承.jpg" },
      { name: "張立群", title: "全球百鐵認證創始倡議人暨淨極勁官方代表", note: "（當時成立時倡議人自己提出）", img: "/initiators/張立群.jpg" },
      { name: "陳本偉", title: "全球百鐵認證創始倡議人暨ZIV運動眼鏡董事長", note: "（當時成立時倡議人自己提出）", img: "/initiators/陳本偉.jpg" },
      { name: "朱一帆", title: "全球百鐵認證創始倡議人暨台灣賓士客戶關係管理經理", note: "（當時成立時倡議人自己提出）", img: "/initiators/朱一帆.jpg" },
      { name: "陳谷銘", title: "全球百鐵認證創始倡議人暨Feebees赤足襪鞋創辦人", note: "（當時成立時倡議人自己提出）", img: "/initiators/陳谷銘.jpg" },
      { name: "古昌齡", title: "全球百鐵認證創始倡議人暨FLIPPOS襪創辦人", note: "（當時成立時倡議人自己提出）", img: "/initiators/古昌齡.jpg" },
      { name: "陳松君", title: "NOVATEC總經理", note: "（當時成立時倡議人自己提出）", img: "/initiators/陳松君.jpg" },
    ],
  },
  {
    category: "賽事主辦",
    members: [
      { name: "羅威士 (Jovi)", title: "全球百鐵認證創始倡議人暨WayPoint 鐵人工廠創辦人暨Challenge Taiwan 鐵人三項賽主辦人", note: "（當時成立時倡議人自己提出）", img: "/initiators/羅威士.jpg" },
      { name: "王臨哲", title: "全球百鐵認證創始倡議人暨台東超級鐵人三項及普悠瑪鐵人三項統籌", note: "（當時成立時倡議人自己提出）", img: "/initiators/王臨哲.jpg" },
      { name: "鄭世奇", title: "全球百鐵認證創始倡議人暨台灣鐵人三項公司總經理", note: "（當時成立時倡議人自己提出）", img: "/initiators/鄭世奇.jpg" },
      { name: "劉玉峯", title: "全球百鐵認證創始倡議人暨中華民國鐵人三項協會 理事長", note: "（當時成立時倡議人自己提出）", img: "/initiators/劉玉峯.jpg" },
      { name: "賴曉春", title: "全球百鐵認證創始倡議人暨瘋三鐵百鐵教父", note: "（當時成立時倡議人自己提出）", img: "/initiators/賴曉春.jpg" },
      { name: "孟亞輝", title: "全球百鐵認證創始倡議人暨高雄愛河鐵人三項", note: "（當時成立時倡議人自己提出）", img: "/initiators/孟亞輝.jpg" },
      { name: "劉榮昌", title: "全球百鐵認證創始倡議人暨活動咖總經理", note: "（當時成立時倡議人自己提出）", img: "/initiators/劉榮昌.jpg" },
      { name: "盧瑞忠", title: "全球百鐵認證創始倡議人暨亞洲馬拉松大聯盟主席", note: "（當時成立時倡議人自己提出）", img: "/initiators/盧瑞忠.jpg" },
      { name: "陳信仲", title: "全球百鐵認證創始倡議人暨鹿港馬拉松統籌", note: "（當時成立時倡議人自己提出）", img: "/initiators/陳信仲.jpg" },
      { name: "辛雷達", title: "全球百鐵認證創始倡議人暨金門鐵人三項統籌", note: "（當時成立時倡議人自己提出）", img: "/initiators/辛雷達.jpg" },
      { name: "李思璇", title: "全球百鐵認證創始倡議人暨司格特國際運動行銷有限公司執行長", note: "（當時成立時倡議人自己提出）", img: "/initiators/李思璇.jpg" },
      { name: "莊憲紘", title: "有藝思國際娛樂執行長", note: "（當時成立時倡議人自己提出）", img: "/initiators/莊憲紘.jpg" },
      { name: "光圈整合行銷", title: "全球百鐵認證創始倡議人暨光圈整合行銷有限公司", note: "（當時成立時倡議人自己提出）", img: "/initiators/光圈整合行銷.jpg" },
      { name: "林毅展", title: "全球百鐵認證創始倡議人暨時代騎輪節總經理", note: "（當時成立時倡議人自己提出）", img: "/initiators/林毅展.jpg" },
    ],
  },
  {
    category: "媒體代表",
    members: [
      { name: "林宜慧", title: "全球百鐵認證創始倡議人暨城邦媒體集團墨刻出版社 編輯", note: "（當時成立時倡議人自己提出）", img: "/initiators/林宜慧.jpg" },
      { name: "段慧琳", title: "全球百鐵認證創始倡議人暨民視主持人", note: "（當時成立時倡議人自己提出）", img: "/initiators/段慧琳.jpg" },
      { name: "姚焱堯", title: "全球百鐵認證創始倡議人暨運動筆記創辦人", note: "（當時成立時倡議人自己提出）", img: "/initiators/姚焱堯.jpg" },
      { name: "Dan", title: "全球百鐵認證創始倡議人暨Podcast「走鐘運動日記」共同主持人&國立金門大學兼任助理教授", note: "（當時成立時倡議人自己提出）", img: "/initiators/Dan.jpg" },
      { name: "Light", title: "全球百鐵認證創始倡議人暨Podcast「走鐘運動日記」製作人暨主持人&自由教練", note: "（當時成立時倡議人自己提出）", img: "/initiators/Light.jpg" },
      { name: "洛克", title: "全球百鐵認證創始倡議人暨Youtuber 洛克", note: "（當時成立時倡議人自己提出）", img: "/initiators/洛克.jpg" },
      { name: "吳奕德", title: "全球百鐵認證創始倡議人暨運動人的pain cave主持人", note: "（當時成立時倡議人自己提出）", img: "/initiators/吳奕德.jpg" },
      { name: "林毅展", title: "全球百鐵認證創始倡議人暨時代社群行銷有限公司執行長", note: "（當時成立時倡議人自己提出）", img: "/initiators/林毅展.jpg" },
      { name: "陳柏如", title: "全球百鐵認證創始倡議人暨單車誌&戶外探索總編輯", note: "（當時成立時倡議人自己提出）", img: "/initiators/陳柏如.jpg" },
    ],
  },
  {
    category: "演藝影視",
    members: [
      { name: "陳雅琳", title: "全球百鐵認證創始倡議人暨知名新聞主持人", note: "（當時成立時倡議人自己提出）", img: "/initiators/陳雅琳.jpg" },
      { name: "楊守義", title: "全球百鐵認證創始倡議人暨紀錄片導演", note: "（當時成立時倡議人自己提出）", img: "/initiators/楊守義.jpg" },
      { name: "姚黛瑋", title: "全球百鐵認證創始倡議人暨知名藝人", note: "（當時成立時倡議人自己提出）", img: "/initiators/姚黛瑋.jpg" },
      { name: "王心恬", title: "全球百鐵認證創始倡議人暨鐵人名模", note: "（當時成立時倡議人自己提出）", img: "/initiators/王心恬.jpg" },
      { name: "段慧琳", title: "全球百鐵認證創始倡議人暨民視主持人", note: "（當時成立時倡議人自己提出）", img: "/initiators/段慧琳.jpg" },
      { name: "吳永吉 (阿吉)", title: "全球百鐵認證創始倡議人暨董事長樂團 編號· 主唱 吳永吉（阿吉）", note: "（當時成立時倡議人自己提出）", img: "/initiators/吳永吉.jpg" },
      { name: "杜文祥 (小白)", title: "全球百鐵認證創始倡議人暨董事長樂團吉他手 / 金鐘導播 杜文祥（小白）", note: "（當時成立時倡議人自己提出）", img: "/initiators/杜文祥.jpg" },
    ],
  },
  {
    category: "社團團長",
    members: [
      { name: "曾國誌", title: "全球百鐵認證創始倡議人暨NEWHOPE鐵人團團長", note: "（當時成立時倡議人自己提出）", img: "/initiators/曾國誌.jpg" },
      { name: "李日益", title: "全球百鐵認證創始倡議人暨台北市內湖鐵人三項運動協會理事長", note: "（當時成立時倡議人自己提出）", img: "/initiators/李日益.jpg" },
      { name: "陳瑞傳", title: "全球百鐵認證創始倡議人暨伊果鐵人創辦人", note: "（當時成立時倡議人自己提出）", img: "/initiators/陳瑞傳.jpg" },
      { name: "黃柏青", title: "全球百鐵認證創始倡議人暨DWD 臺灣追不到鐵人三項休閒運動協會理事長", note: "（當時成立時倡議人自己提出）", img: "/initiators/黃柏青.jpg" },
      { name: "郭修森", title: "全球百鐵認證創始倡議人暨丸鐵創辦人", note: "（當時成立時倡議人自己提出）", img: "/initiators/郭修森.jpg" },
      { name: "魏睿呈", title: "全球百鐵認證創始倡議人暨南投鐵人總教練", note: "（當時成立時倡議人自己提出）", img: "/initiators/魏睿呈.jpg" },
      { name: "辛雷達", title: "全球百鐵認證創始倡議人暨金門體育會秘書長", note: "（當時成立時倡議人自己提出）", img: "/initiators/辛雷達.jpg" },
      { name: "陳智文", title: "全球百鐵認證創始倡議人暨愛戀鐵團長", note: "（當時成立時倡議人自己提出）", img: "/initiators/陳智文.jpg" },
      { name: "謝文甲", title: "全球百鐵認證創始倡議人暨金門鐵人團隊長", note: "（當時成立時倡議人自己提出）", img: "/initiators/謝文甲.jpg" },
      { name: "嚴浩銘", title: "全球百鐵認證創始倡議人暨步輪不累鐵人團創辦人", note: "（當時成立時倡議人自己提出）", img: "/initiators/嚴浩銘.jpg" },
      { name: "洪志青", title: "全球百鐵認證創始倡議人暨高雄市自行車運動推廣協會理事長", note: "（當時成立時倡議人自己提出）", img: "/initiators/洪志青.jpg" },
      { name: "陳信仲", title: "全球百鐵認證創始倡議人暨二鹿慢跑協會理事長", note: "（當時成立時倡議人自己提出）", img: "/initiators/陳信仲.jpg" },
      { name: "孟亞輝", title: "全球百鐵認證創始倡議人暨高雄鐵人", note: "（當時成立時倡議人自己提出）", img: "/initiators/孟亞輝.jpg" },
      { name: "蔡淙緯", title: "台南山山來馳代表人", note: "（當時成立時倡議人自己提出）", img: "/initiators/蔡淙緯.jpg" },
      { name: "蔡玉婷", title: "全球百鐵認證創始倡議人暨群創鐵人社社長", note: "（當時成立時倡議人自己提出）", img: "/initiators/蔡玉婷.jpg" },
      { name: "陳仁和", title: "全球百鐵認證創始倡議人暨愛跑者協會理事長", note: "（當時成立時倡議人自己提出）", img: "/initiators/陳仁和.jpg" },
      { name: "劉光武", title: "全球百鐵認證創始倡議人暨光聿工作室負責人", note: "（當時成立時倡議人自己提出）", img: "/initiators/劉光武.jpg" },
      { name: "簡佳齊", title: "全球百鐵認證創始倡議人暨高雄鐵人扶輪社23-24社長", note: "（當時成立時倡議人自己提出）", img: "/initiators/簡佳齊.jpg" },
      { name: "李國威", title: "全球百鐵認證創始倡議人暨高雄鐵人扶輪社25-26社長", note: "（當時成立時倡議人自己提出）", img: "/initiators/李國威.jpg" },
      { name: "趙傳亨", title: "全球百鐵認證創始倡議人暨高雄鐵人扶輪社創社社長", note: "（當時成立時倡議人自己提出）", img: "/initiators/趙傳亨.jpg" },
      { name: "李宇山", title: "全球百鐵認證創始倡議人暨高雄鐵人扶輪社24-25社長", note: "（當時成立時倡議人自己提出）", img: "/initiators/李宇山.jpg" },
      { name: "許瑞弘", title: "全球百鐵認證創始倡議人暨台北鐵人扶輪社卸任社長", note: "（當時成立時倡議人自己提出）", img: "/initiators/許瑞弘.jpg" },
      { name: "裴家榆", title: "全球百鐵認證創始倡議人暨台北鐵人扶輪社24-25社長", note: "（當時成立時倡議人自己提出）", img: "/initiators/裴家榆.jpg" },
      { name: "徐慕雯", title: "全球百鐵認證創始倡議人暨亂跑團團長", note: "（當時成立時倡議人自己提出）", img: "/initiators/徐慕雯.jpg" },
      { name: "邱仲簾", title: "全球百鐵認證創始倡議人暨台南鐵人隊教練", note: "（當時成立時倡議人自己提出）", img: "/initiators/邱仲簾.jpg" },
      { name: "詹益榮", title: "全球百鐵認證創始倡議人暨舒跑哥", note: "（當時成立時倡議人自己提出）", img: "/initiators/詹益榮.jpg" },
      { name: "李翰暄", title: "全球百鐵認證創始倡議人暨光頭神童", note: "（當時成立時倡議人自己提出）", img: "/initiators/李翰暄.jpg" },
      { name: "姜義村", title: "全球百鐵認證創始倡議人暨身障運動推手", note: "（當時成立時倡議人自己提出）", img: "/initiators/姜義村.jpg" },
      { name: "許仁茂", title: "全球百鐵認證創始倡議人暨地表最強的鐵人老爸、FXT 第一屆冠軍", note: "（當時成立時倡議人自己提出）", img: "/initiators/許仁茂.jpg" },
      { name: "何航順", title: "全球百鐵認證創始倡議人暨公路車小馬暨醫護鐵人", note: "（當時成立時倡議人自己提出）", img: "/initiators/何航順.jpg" },
      { name: "林美佐", title: "全球百鐵認證創始倡議人暨最速空姐", note: "（當時成立時倡議人自己提出）", img: "/initiators/林美佐.jpg" },
      { name: "李詹瑩", title: "全球百鐵認證創始倡議人暨蛙式泳后", note: "（當時成立時倡議人自己提出）", img: "/initiators/李詹瑩.jpg" },
      { name: "江昇峰", title: "全球百鐵認證創始倡議人暨樂高鐵人", note: "（當時成立時倡議人自己提出）", img: "/initiators/江昇峰.jpg" },
      { name: "江晏慶", title: "全球百鐵認證創始倡議人暨XTERRA 專業教練", note: "（當時成立時倡議人自己提出）", img: "/initiators/江晏慶.jpg" },
      { name: "王千由", title: "全球百鐵認證創始倡議人暨雙棲女王、277 自轉車競佐訓教練", note: "（當時成立時倡議人自己提出）", img: "/initiators/王千由.jpg" },
      { name: "周青", title: "全球百鐵認證創始倡議人暨中華民國越野跑協會理事長", note: "（當時成立時倡議人自己提出）", img: "/initiators/周青.jpg" },
      { name: "陳家平", title: "全球百鐵認證創始倡議人暨嘉義市縣議員", note: "（當時成立時倡議人自己提出）", img: "/initiators/陳家平.jpg" },
      { name: "Hi Cindy", title: "Hi Cindy", note: "（當時成立時倡議人自己提出）", img: "/initiators/Hi Cindy.jpg" },
      { name: "連俊宏", title: "全球百鐵認證創始倡議人暨工研院資通所技術副組長", note: "（當時成立時倡議人自己提出）", img: "/initiators/連俊宏.jpg" },
      { name: "吳聰義", title: "全球百鐵認證創始倡議人暨台體大教授", note: "（當時成立時倡議人自己提出）", img: "/initiators/吳聰義.jpg" },
      { name: "張怡潔", title: "全球百鐵認證創始倡議人暨中山醫學大學助理教授＆亞運女排國手", note: "（當時成立時倡議人自己提出）", img: "/initiators/張怡潔.jpg" },
      { name: "方信淵", title: "全球百鐵認證創始倡議人暨實踐大學副教授", note: "（當時成立時倡議人自己提出）", img: "/initiators/方信淵.jpg" },
    ],
  },
];

const awardTiers = [
  { tier: "初鐵賞", count: "1 場", desc: "完成人生第一場標準鐵人三項（51.5K以上）或百K單車挑戰" },
  { tier: "十鐵賞", count: "10 場", desc: "累積完成 10 場認證賽事，解鎖十鐵榮譽電子證書" },
  { tier: "三十鐵賞", count: "30 場", desc: "累積完成 30 場認證賽事，展現穩定不懈的耐力紀律" },
  { tier: "五十鐵賞", count: "50 場", desc: "邁入半百鐵人殿堂，可申請專屬五十鐵榮耀紀念物" },
  { tier: "百鐵賞", count: "100 場", desc: "最高殿堂！完成 100 場認證賽事，受邀年度百鐵英雄授證宴" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Hero Section */}
      <section className="relative border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 py-20 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <span className="inline-block rounded-full bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 text-xs font-semibold tracking-wider text-amber-400 uppercase mb-4">
            About Global 100 Triathlon
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
            每一場堅持，都值得被永恆記錄
          </h1>
          <p className="mx-auto max-w-3xl text-base md:text-lg text-slate-300 leading-relaxed">
            「全球百鐵認證」是一個完全免費、公益性質的耐力運動榮譽登錄平台。我們匯聚台灣各大鐵人三項與自行車賽事主辦方、運動社團與跨界推手，不區分賽事品牌，只為幫每一位在賽道上流汗堅持的選手，建立跨越一生的完賽履歷。
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 space-y-20 mt-16">
        {/* 認證辦法與合格標準 */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-7 w-1.5 bg-amber-500 rounded-full" />
            <h2 className="text-2xl font-bold text-white">認證辦法與合格賽事標準</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="text-amber-400 font-bold text-lg mb-2">🏊‍♂️ 鐵人三項與越野認證</div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                凡完成國內外具備合法路權與晶片計時之標準距離以上賽事皆可登錄：
              </p>
              <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
                <li>標準鐵人 51.5K（含以上距離）</li>
                <li>超級鐵人 113公里 / 70.3英里</li>
                <li>超級鐵人 226K / IRONMAN</li>
                <li>XTERRA 等越野鐵人三項正式賽事</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="text-amber-400 font-bold text-lg mb-2">🚴‍♂️ 公路車 / 長途單車認證</div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                鼓勵單車耐力挑戰，符合以下條件之正式活動即可納入百鐵累計：
              </p>
              <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
                <li>單日騎乘距離達 90 公里（含）以上</li>
                <li>具政府合法路權申請之正式賽事/活動</li>
                <li>具備大會官方晶片計時與完賽證書</li>
                <li>註：已具獨立認證之北高/雙塔不重複計入</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="text-amber-400 font-bold text-lg mb-2">🛡️ 榮譽自律與審核機制</div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                平台採「免費自主登錄」結合「系列賽自動勾稽」雙軌制：
              </p>
              <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
                <li>平時登錄採鐵人榮譽自律精神</li>
                <li>合作系列賽由大會賽後提供數據快速認領</li>
                <li>申請實體百鐵獎牌或授證時進行資格複核</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 給獎階梯 */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-7 w-1.5 bg-amber-500 rounded-full" />
            <h2 className="text-2xl font-bold text-white">榮譽階梯與給獎標準</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {awardTiers.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 flex flex-col justify-between hover:border-amber-500/40 transition"
              >
                <div>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded">
                    累計 {item.count}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-3 mb-2">{item.tier}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 完整名人照片牆 */}
        <section className="pt-6 border-t border-slate-800/80">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-7 w-1.5 bg-amber-500 rounded-full" />
              <h2 className="text-2xl font-bold text-white">共同倡議與創始榮譽推手</h2>
            </div>
            <p className="text-xs text-slate-400 ml-4">
              * 以下頭銜為當時成立時倡議人自己提出的原始說明。
            </p>
          </div>

          <div className="space-y-12">
            {founderGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-4">
                <h3 className="text-sm font-bold text-amber-400 tracking-wider uppercase border-b border-slate-800/60 pb-2">
                  {group.category}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {group.members.map((member, mIdx) => (
                    <div
                      key={mIdx}
                      className="flex items-center gap-4 rounded-xl border border-slate-800/90 bg-slate-900/50 p-4 hover:border-amber-500/40 transition"
                    >
                      {/* 頭像改為 h-20 w-20 (80px) 讓人物更清晰 */}
                      <div className="relative h-20 w-20 shrink-0 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                        <img
                          src={`/initiators/${member.name}.jpg`}
                          alt={member.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            // 若中文檔名圖片不存在時，嘗試回退讀取原始亂數圖片路徑
                            const target = e.currentTarget;
                            if (target.src.includes(".jpg") && !target.src.includes(member.img)) {
                              target.src = member.img;
                            } else {
                              target.style.display = "none";
                            }
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-white text-base truncate">{member.name}</div>
                        <div className="text-xs text-slate-300 mt-0.5 leading-snug">{member.title}</div>
                        <div className="text-[10px] text-amber-500/80 mt-1 italic">{member.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 底部行動呼籲 */}
        <section className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">準備好記錄您的下一場榮耀了嗎？</h3>
          <p className="text-sm text-slate-400 mb-6">零報名費、永久保存，立即加入全球百鐵認證行列。</p>
          <div className="flex justify-center gap-4">
            <Link
              href="/certifications"
              className="rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 transition"
            >
              前往完賽登錄
            </Link>
            <Link
              href="/shop"
              className="rounded-lg border border-slate-700 bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition"
            >
              瀏覽榮耀商城
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}