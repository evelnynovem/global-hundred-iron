"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/client";

export interface Initiator {
  id: string;
  category: string;
  name: string;
  title: string;
  avatarUrl: string;
}

const CATEGORIES = ["全部", "運營團隊", "品牌代表", "媒體代表", "賽事主辦", "社團團長", "演藝影視", "KOL"];

const SIX_FOUNDING_ORGS = [
  { name: "醫護鐵人 (IronMedic)", role: "主辦發起機構", desc: "全球百鐵認證創立統籌機構，推動賽道移動式安全守護與零收費百鐵認證榮耀體系。" },
  { name: "臺東縣城鄉生活運動協會", role: "共同發起機構", desc: "臺東普悠瑪國際鐵人三項賽主辦單位，串聯歷年完賽成績資料庫。" },
  { name: "活動咖 (EventPal)", role: "共同發起機構", desc: "指標性運動賽事報名與成績數據平台，協力推動百鐵實名認證。" },
  { name: "臺東縣超級鐵人三項協會", role: "共同發起機構", desc: "東海岸巴歌浪超級鐵人三項賽主辦單位，共同倡議百鐵完賽榮耀。" },
  { name: "輪動台灣運動協會", role: "共同發起機構", desc: "推廣全台經典百K與長距離自行車挑戰賽，建構公路單車百鐵馬認證。" },
  { name: "昇陽自行車 (SYB)", role: "共同發起機構", desc: "國際頂級自行車與三鐵運動品牌代理，全力支持百鐵英雄榮耀裝備。" }
];

const DEFAULT_INITIATORS: Initiator[] = [
  {
    "id": "init-1",
    "category": "社團團長",
    "name": "曾國誌",
    "title": "全球百鐵認證創始倡議人暨NEWHOPE鐵人團團長",
    "avatarUrl": "/initiators/曾國誌.jpg"
  },
  {
    "id": "init-2",
    "category": "社團團長",
    "name": "李日益",
    "title": "全球百鐵認證創始倡議人暨台北市內湖鐵人三項運動協會理事長",
    "avatarUrl": "/initiators/李日益.jpg"
  },
  {
    "id": "init-3",
    "category": "社團團長",
    "name": "陳瑞傳",
    "title": "全球百鐵認證創始倡議人暨伊果鐵人創辦人",
    "avatarUrl": "/initiators/陳瑞傳.jpg"
  },
  {
    "id": "init-4",
    "category": "社團團長",
    "name": "黃柏青",
    "title": "全球百鐵認證創始倡議人暨DWD 臺灣追不到鐵人三項休閒運動協會理事長",
    "avatarUrl": "/images/initiators/12.jpg"
  },
  {
    "id": "init-5",
    "category": "社團團長",
    "name": "郭修森",
    "title": "全球百鐵認證創始倡議人暨丸鐵創辦人",
    "avatarUrl": "/initiators/郭修森.jpg"
  },
  {
    "id": "init-6",
    "category": "社團團長",
    "name": "魏睿呈",
    "title": "全球百鐵認證創始倡議人暨南投鐵人總教練",
    "avatarUrl": "/initiators/魏睿呈.jpg"
  },
  {
    "id": "init-7",
    "category": "社團團長",
    "name": "辛雷達",
    "title": "全球百鐵認證創始倡議人暨金門體育會秘書長",
    "avatarUrl": "/initiators/辛雷達.jpg"
  },
  {
    "id": "init-8",
    "category": "社團團長",
    "name": "陳智文",
    "title": "全球百鐵認證創始倡議人暨愛戀鐵團長",
    "avatarUrl": "/initiators/陳智文.jpg"
  },
  {
    "id": "init-9",
    "category": "社團團長",
    "name": "謝文甲",
    "title": "全球百鐵認證創始倡議人暨金門鐵人團隊長",
    "avatarUrl": "/initiators/謝文甲.jpg"
  },
  {
    "id": "init-10",
    "category": "社團團長",
    "name": "嚴浩銘",
    "title": "全球百鐵認證創始倡議人暨步輪不累鐵人團創辦人",
    "avatarUrl": "/initiators/嚴浩銘.jpg"
  },
  {
    "id": "init-11",
    "category": "社團團長",
    "name": "洪志青",
    "title": "全球百鐵認證創始倡議人暨高雄市自行車運動推廣協會理事長",
    "avatarUrl": "/initiators/洪志青.jpg"
  },
  {
    "id": "init-12",
    "category": "社團團長",
    "name": "陳信仲",
    "title": "全球百鐵認證創始倡議人暨二鹿慢跑協會理事長",
    "avatarUrl": "/initiators/陳信仲.jpg"
  },
  {
    "id": "init-13",
    "category": "社團團長",
    "name": "孟亞輝",
    "title": "全球百鐵認證創始倡議人暨高雄鐵人",
    "avatarUrl": "/initiators/孟亞輝.jpg"
  },
  {
    "id": "init-14",
    "category": "社團團長",
    "name": "蔡淙緯",
    "title": "全球百鐵認證創始倡議人暨台南山山來馳代表人",
    "avatarUrl": "/initiators/蔡淙緯.jpg"
  },
  {
    "id": "init-15",
    "category": "社團團長",
    "name": "蔡玉婷",
    "title": "全球百鐵認證創始倡議人暨群創鐵人社社長",
    "avatarUrl": "/initiators/蔡玉婷.jpg"
  },
  {
    "id": "init-16",
    "category": "社團團長",
    "name": "陳仁和",
    "title": "全球百鐵認證創始倡議人暨愛跑者協會理事長",
    "avatarUrl": "/initiators/陳仁和.jpg"
  },
  {
    "id": "init-17",
    "category": "社團團長",
    "name": "劉光武",
    "title": "全球百鐵認證創始倡議人暨光聿工作室負責人",
    "avatarUrl": "/initiators/劉光武.jpg"
  },
  {
    "id": "init-18",
    "category": "社團團長",
    "name": "簡佳齊",
    "title": "全球百鐵認證創始倡議人暨高雄鐵人扶輪社23-24社長",
    "avatarUrl": "/initiators/簡佳齊.jpg"
  },
  {
    "id": "init-19",
    "category": "社團團長",
    "name": "李國威",
    "title": "全球百鐵認證創始倡議人暨高雄鐵人扶輪社25-26社長",
    "avatarUrl": "/initiators/李國威.jpg"
  },
  {
    "id": "init-20",
    "category": "社團團長",
    "name": "趙傳亨",
    "title": "全球百鐵認證創始倡議人暨高雄鐵人扶輪社創社社長",
    "avatarUrl": "/initiators/趙傳亨.jpg"
  },
  {
    "id": "init-21",
    "category": "社團團長",
    "name": "李宇山",
    "title": "全球百鐵認證創始倡議人暨高雄鐵人扶輪社24-25社長",
    "avatarUrl": "/initiators/李宇山.jpg"
  },
  {
    "id": "init-22",
    "category": "社團團長",
    "name": "許瑞弘",
    "title": "全球百鐵認證創始倡議人暨台北鐵人扶輪社卸任社長",
    "avatarUrl": "/initiators/許瑞弘.jpg"
  },
  {
    "id": "init-23",
    "category": "社團團長",
    "name": "裴家榆",
    "title": "全球百鐵認證創始倡議人暨台北鐵人扶輪社 24-25社長",
    "avatarUrl": "/initiators/裴家榆.jpg"
  },
  {
    "id": "init-24",
    "category": "社團團長",
    "name": "徐慕雯",
    "title": "全球百鐵認證創始倡議人暨亂跑團團長",
    "avatarUrl": "/initiators/徐慕雯.jpg"
  },
  {
    "id": "init-25",
    "category": "社團團長",
    "name": "邱仲簾",
    "title": "全球百鐵認證創始倡議人暨台南鐵人隊教練",
    "avatarUrl": "/initiators/邱仲簾.jpg"
  },
  {
    "id": "init-26",
    "category": "社團團長",
    "name": "陳建昇",
    "title": "全球百鐵認證創始倡議人暨新莊慢跑協會三鐵組組長",
    "avatarUrl": "/images/initiators/26.jpg"
  },
  {
    "id": "init-27",
    "category": "社團團長",
    "name": "林士文",
    "title": "全球百鐵認證創始倡議人暨台北鐵人扶輪社 社長",
    "avatarUrl": "/images/initiators/27.jpg"
  },
  {
    "id": "init-28",
    "category": "演藝影視",
    "name": "陳雅琳",
    "title": "全球百鐵認證創始倡議人暨知名新聞主持人",
    "avatarUrl": "/initiators/陳雅琳.jpg"
  },
  {
    "id": "init-29",
    "category": "演藝影視",
    "name": "楊守義",
    "title": "全球百鐵認證創始倡議人暨紀錄片導演",
    "avatarUrl": "/initiators/楊守義.jpg"
  },
  {
    "id": "init-30",
    "category": "演藝影視",
    "name": "姚黛瑋",
    "title": "全球百鐵認證創始倡議人暨知名藝人",
    "avatarUrl": "/images/initiators/18.jpg"
  },
  {
    "id": "init-31",
    "category": "演藝影視",
    "name": "王心恬",
    "title": "全球百鐵認證創始倡議人暨鐵人名模",
    "avatarUrl": "/initiators/王心恬.jpg"
  },
  {
    "id": "init-32",
    "category": "演藝影視",
    "name": "段慧琳",
    "title": "全球百鐵認證創始倡議人暨民視主持人",
    "avatarUrl": "/initiators/段慧琳.jpg"
  },
  {
    "id": "init-33",
    "category": "演藝影視",
    "name": "吳永吉（阿吉）",
    "title": "全球百鐵認證創始倡議人暨董事長樂團主唱",
    "avatarUrl": "/images/initiators/33.jpg"
  },
  {
    "id": "init-34",
    "category": "演藝影視",
    "name": "杜文祥（小白）",
    "title": "全球百鐵認證創始倡議人暨董事長樂團吉他手・金鐘導播",
    "avatarUrl": "/images/initiators/34.jpg"
  },
  {
    "id": "init-35",
    "category": "演藝影視",
    "name": "馮勝賢",
    "title": "全球百鐵認證創始倡議人暨前中職秘書長「老邦」",
    "avatarUrl": "/images/initiators/35.jpg"
  },
  {
    "id": "init-36",
    "category": "KOL",
    "name": "陳彥良",
    "title": "全球百鐵認證創辦人暨醫護鐵人創辦人",
    "avatarUrl": "/images/initiators/1.jpg"
  },
  {
    "id": "init-37",
    "category": "KOL",
    "name": "簡翊倫",
    "title": "全球百鐵認證創始倡議人暨知名YouTuber「一輪」",
    "avatarUrl": "/images/initiators/37.jpg"
  },
  {
    "id": "init-38",
    "category": "KOL",
    "name": "黃柏青",
    "title": "全球百鐵認證創始倡議人暨鐵人運動專欄作家「柏青哥」",
    "avatarUrl": "/images/initiators/12.jpg"
  },
  {
    "id": "init-39",
    "category": "KOL",
    "name": "劉祖寧",
    "title": "全球百鐵認證創始倡議人暨老爺鐵人-知本老爺酒店總經理",
    "avatarUrl": "/images/initiators/11.jpg"
  },
  {
    "id": "init-40",
    "category": "KOL",
    "name": "詹益榮",
    "title": "全球百鐵認證創始倡議人暨舒跑哥",
    "avatarUrl": "/initiators/詹益榮.jpg"
  },
  {
    "id": "init-41",
    "category": "KOL",
    "name": "郭修森",
    "title": "全球百鐵認證創始倡議人暨Vertex 丸鐵運動創辦人",
    "avatarUrl": "/initiators/郭修森.jpg"
  },
  {
    "id": "init-42",
    "category": "KOL",
    "name": "姚焱堯",
    "title": "全球百鐵認證創始倡議人暨運動筆記創辦人",
    "avatarUrl": "/initiators/姚焱堯.jpg"
  },
  {
    "id": "init-43",
    "category": "KOL",
    "name": "李翰暄",
    "title": "全球百鐵認證創始倡議人暨光頭神童",
    "avatarUrl": "/initiators/李翰暄.jpg"
  },
  {
    "id": "init-44",
    "category": "KOL",
    "name": "姜義村",
    "title": "全球百鐵認證創始倡議人暨身障運動推手",
    "avatarUrl": "/initiators/姜義村.jpg"
  },
  {
    "id": "init-45",
    "category": "KOL",
    "name": "許仁茂",
    "title": "全球百鐵認證創始倡議人暨地表最強的鐵人老爸、FXT 第一屆冠軍",
    "avatarUrl": "/initiators/許仁茂.jpg"
  },
  {
    "id": "init-46",
    "category": "KOL",
    "name": "何航順",
    "title": "全球百鐵認證創始倡議人暨公路車小馬暨醫護鐵人",
    "avatarUrl": "/images/initiators/6.jpg"
  },
  {
    "id": "init-47",
    "category": "KOL",
    "name": "林美佐",
    "title": "全球百鐵認證創始倡議人暨最速空姐",
    "avatarUrl": "/initiators/林美佐.jpg"
  },
  {
    "id": "init-48",
    "category": "KOL",
    "name": "李詹瑩",
    "title": "全球百鐵認證創始倡議人暨蛙式泳后",
    "avatarUrl": "/initiators/李詹瑩.jpg"
  },
  {
    "id": "init-49",
    "category": "KOL",
    "name": "江昇峰",
    "title": "全球百鐵認證創始倡議人暨樂高鐵人",
    "avatarUrl": "/initiators/江昇峰.jpg"
  },
  {
    "id": "init-50",
    "category": "KOL",
    "name": "江晏慶",
    "title": "全球百鐵認證創始倡議人暨XTERRA 專業教練",
    "avatarUrl": "/initiators/江晏慶.jpg"
  },
  {
    "id": "init-51",
    "category": "KOL",
    "name": "王千由",
    "title": "全球百鐵認證創始倡議人暨雙棲女王、277 自轉車競佐訓教練",
    "avatarUrl": "/initiators/王千由.jpg"
  },
  {
    "id": "init-52",
    "category": "KOL",
    "name": "周青",
    "title": "全球百鐵認證創始倡議人暨中華民國越野跑協會理事長",
    "avatarUrl": "/initiators/周青.jpg"
  },
  {
    "id": "init-53",
    "category": "KOL",
    "name": "陳家平",
    "title": "全球百鐵認證創始倡議人暨嘉義市縣議員",
    "avatarUrl": "/initiators/陳家平.jpg"
  },
  {
    "id": "init-54",
    "category": "KOL",
    "name": "Hi Cindy",
    "title": "全球百鐵認證創始倡議人暨知名運動 KOL",
    "avatarUrl": "/initiators/Hi Cindy.jpg"
  },
  {
    "id": "init-55",
    "category": "KOL",
    "name": "連俊宏",
    "title": "全球百鐵認證創始倡議人暨工研院資通所技術副組長",
    "avatarUrl": "/initiators/連俊宏.jpg"
  },
  {
    "id": "init-56",
    "category": "KOL",
    "name": "吳聰義",
    "title": "全球百鐵認證創始倡議人暨台體大教授",
    "avatarUrl": "/initiators/吳聰義.jpg"
  },
  {
    "id": "init-57",
    "category": "KOL",
    "name": "張怡潔",
    "title": "全球百鐵認證創始倡議人暨中山醫學大學助理教授＆亞運女排國手",
    "avatarUrl": "/initiators/張怡潔.jpg"
  },
  {
    "id": "init-58",
    "category": "KOL",
    "name": "方信淵",
    "title": "全球百鐵認證創始倡議人暨實踐大學副教授",
    "avatarUrl": "/initiators/方信淵.jpg"
  },
  {
    "id": "init-59",
    "category": "運營團隊",
    "name": "陳彥良",
    "title": "全球百鐵認證總召集人暨醫護鐵人創辦人",
    "avatarUrl": "/images/initiators/1.jpg"
  },
  {
    "id": "init-60",
    "category": "運營團隊",
    "name": "洪緯欣",
    "title": "醫護鐵人共同創辦人暨胸腔內科醫師",
    "avatarUrl": "/images/initiators/2.jpg"
  },
  {
    "id": "init-61",
    "category": "運營團隊",
    "name": "施和鋐與陳素梅",
    "title": "全球百鐵認證總召集人暨昇陽自行車創辦人",
    "avatarUrl": "/images/initiators/61.jpg"
  },
  {
    "id": "init-62",
    "category": "運營團隊",
    "name": "劉榮昌",
    "title": "全球百鐵認證知識長暨活動咖總經理",
    "avatarUrl": "/initiators/劉榮昌.jpg"
  },
  {
    "id": "init-63",
    "category": "運營團隊",
    "name": "林健鴻",
    "title": "全球百鐵認證法務長",
    "avatarUrl": "/initiators/林健鴻.jpg"
  },
  {
    "id": "init-64",
    "category": "運營團隊",
    "name": "袁宜如",
    "title": "全球百鐵認證藝術總監",
    "avatarUrl": "/initiators/袁宜如.jpg"
  },
  {
    "id": "init-65",
    "category": "運營團隊",
    "name": "陳霖毅",
    "title": "全球百鐵認證資訊長",
    "avatarUrl": "/initiators/陳霖毅.jpg"
  },
  {
    "id": "init-66",
    "category": "運營團隊",
    "name": "黃興隆",
    "title": "全球百鐵認證顧問暨普悠瑪及台東超鐵鐵人三項裁判長",
    "avatarUrl": "/initiators/黃興隆.jpg"
  },
  {
    "id": "init-67",
    "category": "運營團隊",
    "name": "施宜孝",
    "title": "全球百鐵認證公關長",
    "avatarUrl": "/initiators/施宜孝.jpg"
  },
  {
    "id": "init-68",
    "category": "賽事主辦",
    "name": "羅威士 Jovi",
    "title": "全球百鐵認證創始倡議人暨WayPoint 鐵人工廠創辦人暨Challenge Taiwan 鐵人三項賽主辦人",
    "avatarUrl": "/images/initiators/68.jpg"
  },
  {
    "id": "init-69",
    "category": "賽事主辦",
    "name": "王臨哲",
    "title": "全球百鐵認證創始倡議人暨台東超級鐵人三項及普悠瑪鐵人三項統籌",
    "avatarUrl": "/images/initiators/13.jpg"
  },
  {
    "id": "init-70",
    "category": "賽事主辦",
    "name": "鄭世奇",
    "title": "全球百鐵認證創始倡議人暨台灣鐵人三項公司總經理",
    "avatarUrl": "/initiators/鄭世奇.jpg"
  },
  {
    "id": "init-71",
    "category": "賽事主辦",
    "name": "劉玉峯",
    "title": "全球百鐵認證創始倡議人暨中華民國鐵人三項協會 理事長",
    "avatarUrl": "/initiators/劉玉峯.jpg"
  },
  {
    "id": "init-72",
    "category": "賽事主辦",
    "name": "賴曉春",
    "title": "全球百鐵認證創始倡議人暨瘋三鐵百鐵教父",
    "avatarUrl": "/initiators/賴曉春.jpg"
  },
  {
    "id": "init-73",
    "category": "賽事主辦",
    "name": "孟亞輝",
    "title": "全球百鐵認證創始倡議人暨高雄愛河鐵人三項",
    "avatarUrl": "/initiators/孟亞輝.jpg"
  },
  {
    "id": "init-74",
    "category": "賽事主辦",
    "name": "劉榮昌",
    "title": "全球百鐵認證創始倡議人暨活動咖總經理",
    "avatarUrl": "/initiators/劉榮昌.jpg"
  },
  {
    "id": "init-75",
    "category": "賽事主辦",
    "name": "盧瑞忠",
    "title": "全球百鐵認證創始倡議人暨亞洲馬拉松大聯盟主席",
    "avatarUrl": "/initiators/盧瑞忠.jpg"
  },
  {
    "id": "init-76",
    "category": "賽事主辦",
    "name": "陳信仲",
    "title": "全球百鐵認證創始倡議人暨鹿港馬拉松統籌",
    "avatarUrl": "/initiators/陳信仲.jpg"
  },
  {
    "id": "init-77",
    "category": "賽事主辦",
    "name": "辛雷達",
    "title": "全球百鐵認證創始倡議人暨金門鐵人三項統籌",
    "avatarUrl": "/initiators/辛雷達.jpg"
  },
  {
    "id": "init-78",
    "category": "賽事主辦",
    "name": "李思璇",
    "title": "全球百鐵認證創始倡議人暨司格特國際運動行銷有限公司 執行長",
    "avatarUrl": "/initiators/李思璇.jpg"
  },
  {
    "id": "init-79",
    "category": "賽事主辦",
    "name": "莊憲紘",
    "title": "全球百鐵認證創始倡議人暨有藝思國際娛樂執行長",
    "avatarUrl": "/initiators/莊憲紘.jpg"
  },
  {
    "id": "init-80",
    "category": "賽事主辦",
    "name": "光圈整合行銷有限公司",
    "title": "全球百鐵認證創始倡議人暨賽事行銷夥伴",
    "avatarUrl": "/images/initiators/80.jpg"
  },
  {
    "id": "init-81",
    "category": "賽事主辦",
    "name": "林毅展",
    "title": "全球百鐵認證創始倡議人暨時代騎輪節總經理",
    "avatarUrl": "/initiators/林毅展.jpg"
  },
  {
    "id": "init-82",
    "category": "媒體代表",
    "name": "林宜慧",
    "title": "全球百鐵認證創始倡議人暨城邦媒體集團墨刻出版社編輯",
    "avatarUrl": "/initiators/林宜慧.jpg"
  },
  {
    "id": "init-83",
    "category": "媒體代表",
    "name": "段慧琳",
    "title": "全球百鐵認證創始倡議人暨民視主持人",
    "avatarUrl": "/initiators/段慧琳.jpg"
  },
  {
    "id": "init-84",
    "category": "媒體代表",
    "name": "姚焱堯",
    "title": "全球百鐵認證創始倡議人暨運動筆記創辦人",
    "avatarUrl": "/initiators/姚焱堯.jpg"
  },
  {
    "id": "init-85",
    "category": "媒體代表",
    "name": "Dan",
    "title": "全球百鐵認證創始倡議人暨Podcast「走鐘運動日記」共同主持人&國立金門大學兼任助理教授",
    "avatarUrl": "/initiators/Dan.jpg"
  },
  {
    "id": "init-86",
    "category": "媒體代表",
    "name": "Light",
    "title": "全球百鐵認證創始倡議人暨Podcast「走鐘運動日記」製作人暨主持人&自由教練",
    "avatarUrl": "/initiators/Light.jpg"
  },
  {
    "id": "init-87",
    "category": "媒體代表",
    "name": "洛克",
    "title": "全球百鐵認證創始倡議人暨Youtuber",
    "avatarUrl": "/initiators/洛克.jpg"
  },
  {
    "id": "init-88",
    "category": "媒體代表",
    "name": "吳奕德",
    "title": "全球百鐵認證創始倡議人暨運動人的pain cave主持人",
    "avatarUrl": "/initiators/吳奕德.jpg"
  },
  {
    "id": "init-89",
    "category": "媒體代表",
    "name": "林毅展",
    "title": "全球百鐵認證創始倡議人暨時代社群行銷有限公司 執行長",
    "avatarUrl": "/initiators/林毅展.jpg"
  },
  {
    "id": "init-90",
    "category": "媒體代表",
    "name": "陳柏如",
    "title": "全球百鐵認證創始倡議人暨單車誌&戶外探索總編輯",
    "avatarUrl": "/initiators/陳柏如.jpg"
  },
  {
    "id": "init-91",
    "category": "品牌代表",
    "name": "曾上原",
    "title": "全球百鐵認證創始倡議人暨美利達自行車總經理",
    "avatarUrl": "/initiators/曾上原.jpg"
  },
  {
    "id": "init-92",
    "category": "品牌代表",
    "name": "張仕賢",
    "title": "全球百鐵認證創始倡議人暨易飛網營運長",
    "avatarUrl": "/initiators/張仕賢.jpg"
  },
  {
    "id": "init-93",
    "category": "品牌代表",
    "name": "施和鋐與陳素梅",
    "title": "全球百鐵認證創始倡議人暨昇陽自行車創辦人",
    "avatarUrl": "/images/initiators/93.jpg"
  },
  {
    "id": "init-94",
    "category": "品牌代表",
    "name": "黃成翰",
    "title": "全球百鐵認證創始倡議人暨名衍行銷總經理",
    "avatarUrl": "/initiators/黃成翰.jpg"
  },
  {
    "id": "init-95",
    "category": "品牌代表",
    "name": "陳衍豪",
    "title": "全球百鐵認證創始倡議人暨SAEKO總經理",
    "avatarUrl": "/initiators/陳衍豪.jpg"
  },
  {
    "id": "init-96",
    "category": "品牌代表",
    "name": "黃潔儀",
    "title": "全球百鐵認證創始倡議人暨展盟展覽有限公司董事長",
    "avatarUrl": "/initiators/黃潔儀.jpg"
  },
  {
    "id": "init-97",
    "category": "品牌代表",
    "name": "王凌卿",
    "title": "全球百鐵認證創始倡議人暨王大夫一條根股份有限公司營運長",
    "avatarUrl": "/initiators/王凌卿.jpg"
  },
  {
    "id": "init-98",
    "category": "品牌代表",
    "name": "陳信仲",
    "title": "全球百鐵認證創始倡議人暨277自転車創辦人",
    "avatarUrl": "/initiators/陳信仲.jpg"
  },
  {
    "id": "init-99",
    "category": "品牌代表",
    "name": "黃上慧",
    "title": "全球百鐵認證創始倡議人暨LP台灣通路行銷經理",
    "avatarUrl": "/initiators/黃上慧.jpg"
  },
  {
    "id": "init-100",
    "category": "品牌代表",
    "name": "許榮裕",
    "title": "全球百鐵認證創始倡議人暨KS凱薩克總經理",
    "avatarUrl": "/images/initiators/5.jpg"
  },
  {
    "id": "init-101",
    "category": "品牌代表",
    "name": "楊世賓",
    "title": "全球百鐵認證創始倡議人暨登薾國際貿易股份有限公司經理",
    "avatarUrl": "/initiators/楊世賓.jpg"
  },
  {
    "id": "init-102",
    "category": "品牌代表",
    "name": "林宗緯",
    "title": "全球百鐵認證創始倡議人暨Akiwei總經理",
    "avatarUrl": "/initiators/林宗緯.jpg"
  },
  {
    "id": "init-103",
    "category": "品牌代表",
    "name": "賴奕銘",
    "title": "全球百鐵認證創始倡議人暨Footland總經理",
    "avatarUrl": "/initiators/賴奕銘.jpg"
  },
  {
    "id": "init-104",
    "category": "品牌代表",
    "name": "傅漢武",
    "title": "全球百鐵認證創始倡議人暨Compressport品牌經理",
    "avatarUrl": "/initiators/傅漢武.jpg"
  },
  {
    "id": "init-105",
    "category": "品牌代表",
    "name": "陳宣佑",
    "title": "全球百鐵認證創始倡議人暨諾壯BCAA創辦人",
    "avatarUrl": "/initiators/陳宣佑.jpg"
  },
  {
    "id": "init-106",
    "category": "品牌代表",
    "name": "林明謙",
    "title": "全球百鐵認證創始倡議人暨 Zoot Taiwan營運長",
    "avatarUrl": "/initiators/林明謙.jpg"
  },
  {
    "id": "init-107",
    "category": "品牌代表",
    "name": "陳金隆",
    "title": "全球百鐵認證創始倡議人暨Protecman波特超人",
    "avatarUrl": "/images/initiators/107.jpg"
  },
  {
    "id": "init-108",
    "category": "品牌代表",
    "name": "劉宜承",
    "title": "全球百鐵認證創始倡議人暨亞科太克品牌行銷部主任",
    "avatarUrl": "/initiators/劉宜承.jpg"
  },
  {
    "id": "init-109",
    "category": "品牌代表",
    "name": "張立群",
    "title": "全球百鐵認證創始倡議人暨淨極勁官方代表",
    "avatarUrl": "/initiators/張立群.jpg"
  },
  {
    "id": "init-110",
    "category": "品牌代表",
    "name": "陳本偉",
    "title": "全球百鐵認證創始倡議人暨ZIV運動眼鏡董事長",
    "avatarUrl": "/initiators/陳本偉.jpg"
  },
  {
    "id": "init-111",
    "category": "品牌代表",
    "name": "朱一帆",
    "title": "全球百鐵認證創始倡議人暨台灣賓士客戶關係管理經理",
    "avatarUrl": "/initiators/朱一帆.jpg"
  },
  {
    "id": "init-112",
    "category": "品牌代表",
    "name": "陳谷銘",
    "title": "全球百鐵認證創始倡議人暨Feebees赤足襪鞋創辦人",
    "avatarUrl": "/initiators/陳谷銘.jpg"
  },
  {
    "id": "init-113",
    "category": "品牌代表",
    "name": "古昌齡",
    "title": "全球百鐵認證創始倡議人暨FLIPPOS襪創辦人",
    "avatarUrl": "/initiators/古昌齡.jpg"
  },
  {
    "id": "init-114",
    "category": "品牌代表",
    "name": "陳松君",
    "title": "全球百鐵認證創始倡議人暨NOVATEC總經理",
    "avatarUrl": "/initiators/陳松君.jpg"
  }
];

export default function AboutPage() {
  const supabase = createClient();
  const [initiators, setInitiators] = useState<Initiator[]>(DEFAULT_INITIATORS);
  const [activeCategory, setActiveCategory] = useState<string>("全部");
  const [editingPerson, setEditingPerson] = useState<Initiator | null>(null);

  const loadCustomInitiators = useCallback(async () => {
    try {
      const saved = localStorage.getItem("g100_initiators_v19");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 100) setInitiators(parsed);
      }
      const { data: rows } = await supabase
        .from("race_details_full")
        .select("team")
        .eq("athlete_name", "__SYS_INITIATORS_V19__")
        .order("id", { ascending: false });
      if (rows && rows.length > 0 && rows[0].team) {
        const cloudList = JSON.parse(rows[0].team);
        if (Array.isArray(cloudList) && cloudList.length >= 100) {
          setInitiators(cloudList);
          localStorage.setItem("g100_initiators_v19", rows[0].team);
        }
      }
    } catch (e) {}
  }, [supabase]);

  useEffect(() => {
    loadCustomInitiators();
  }, [loadCustomInitiators]);

  const handleSavePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPerson) return;
    const nextList = initiators.map(p => {
      if (p.id === editingPerson.id) return editingPerson;
      if (p.name === editingPerson.name && editingPerson.avatarUrl) {
        return { ...p, avatarUrl: editingPerson.avatarUrl };
      }
      return p;
    });
    setInitiators(nextList);
    const str = JSON.stringify(nextList);
    localStorage.setItem("g100_initiators_v19", str);
    try {
      await supabase.from("race_details_full").delete().eq("athlete_name", "__SYS_INITIATORS_V19__");
      await supabase.from("race_details_full").insert([{
        athlete_name: "__SYS_INITIATORS_V19__",
        race_name: "INITIATORS_CONFIG",
        race_date: "2026-01-01",
        category: "SYS",
        finish_time: "SYS",
        team: str
      }]);
    } catch (err) {}
    setEditingPerson(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingPerson) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxW = 320;
        let w = img.width;
        let h = img.height;
        if (w > maxW) { h = Math.round((h * maxW) / w); w = maxW; }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          setEditingPerson({ ...editingPerson, avatarUrl: canvas.toDataURL("image/jpeg", 0.86) });
        }
      };
      if (typeof ev.target?.result === "string") img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const displayedList = activeCategory === "全部"
    ? initiators.filter((item, index, self) => self.findIndex(t => t.name === item.name) === index)
    : initiators.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between overflow-x-hidden">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
        <section className="rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-amber-500/40 p-6 sm:p-10 shadow-2xl space-y-4">
          <span className="px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-extrabold uppercase">
            ABOUT GLOBAL 100 TRIATHLON CERTIFICATION (G100TC)
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            關於「全球百鐵認證 Global 100 Triathlon Certification」
          </h1>
          <p className="text-xs sm:text-base text-zinc-300 leading-relaxed max-w-4xl">
            鐵人三項源自於夏威夷，而全球百鐵認證則創始自台灣。全球百鐵認證 Global 100 Triathlon Certification (G100TC) 為全球首創鐵人三項賽事及鐵馬賽事完賽紀錄認證平台，為醫護鐵人主導統籌、國際知名美利達自行車及眾多品牌支持的認證單位。採線上零收費認證，結合實體賽事現場讓更多愛好者共同參與。
          </p>
        </section>

        <section className="space-y-6">
          <div className="border-l-4 border-amber-500 pl-4">
            <h2 className="text-xl sm:text-2xl font-black text-white">🏛️ 六大共同發起機構</h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">凝聚運動醫學、賽道安全守護與指標性賽事主辦單位力量</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SIX_FOUNDING_ORGS.map((org, i) => (
              <div key={i} className="rounded-3xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 p-6 space-y-3 shadow-xl transition">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-black">{org.role}</span>
                <h3 className="text-lg font-black text-white">{org.name}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{org.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-l-4 border-amber-500 pl-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">👑 全球百鐵認證 百位創始倡議人</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">匯聚品牌代表、媒體代表、賽事主辦、運營團隊、社團團長、演藝影視與運動 KOL 共同倡議</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={"px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer " + (activeCategory === cat ? "bg-amber-500 text-black shadow-lg" : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800")}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayedList.map((person, idx) => (
              <div key={person.id || idx} className="rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 p-4 flex flex-col items-center justify-between text-center gap-3 shadow-lg transition">
                <div className="flex flex-col items-center gap-2.5 w-full">
                  <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-amber-400 text-[10px] font-bold">
                    {person.category}
                  </span>
                  <div className="w-20 h-20 rounded-full border-2 border-amber-500/60 bg-amber-950/30 flex items-center justify-center overflow-hidden relative shrink-0">
                    <span className="text-base font-black text-amber-300 select-none">
                      {String(person.name || "").slice(0, 3)}
                    </span>
                    {person.avatarUrl && (
                      <img
                        src={person.avatarUrl}
                        alt={person.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src.endsWith(".jpg")) {
                            target.src = target.src.replace(/\.jpg$/, ".jpeg");
                          } else if (target.src.endsWith(".jpeg")) {
                            target.src = target.src.replace(/\.jpeg$/, ".png");
                          } else {
                            target.style.display = "none";
                          }
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white">{person.name}</h3>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{person.title}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPerson({ ...person })}
                  className="w-full py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-amber-400 text-[11px] font-bold transition cursor-pointer"
                >
                  📷 編輯照片/姓名
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {editingPerson && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center px-4 z-50">
          <form onSubmit={handleSavePerson} className="bg-zinc-950 border-2 border-amber-500 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-black text-amber-400">✏️ 編輯創始倡議人：{editingPerson.name}</h3>
            <div>
              <label className="font-bold text-zinc-300 block mb-1">分類</label>
              <select value={editingPerson.category} onChange={e => setEditingPerson({ ...editingPerson, category: e.target.value })} className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-2.5 text-white font-bold">
                {CATEGORIES.filter(c => c !== "全部").map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="font-bold text-zinc-300 block mb-1">姓名</label>
              <input type="text" required value={editingPerson.name} onChange={e => setEditingPerson({ ...editingPerson, name: e.target.value })} className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-2.5 text-white font-bold" />
            </div>
            <div>
              <label className="font-bold text-zinc-300 block mb-1">頭銜 / 代表單位</label>
              <input type="text" required value={editingPerson.title} onChange={e => setEditingPerson({ ...editingPerson, title: e.target.value })} className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-2.5 text-white" />
            </div>
            <div>
              <label className="font-bold text-amber-400 block mb-1">📷 上傳個人照片</label>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full text-zinc-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-amber-500 file:text-black file:font-black cursor-pointer" />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button type="button" onClick={() => setEditingPerson(null)} className="px-4 py-2 rounded-xl bg-zinc-800 text-white font-bold">取消</button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 text-black font-black cursor-pointer">💾 儲存同步</button>
            </div>
          </form>
        </div>
      )}

      <Footer />
    </div>
  );
}
