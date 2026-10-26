"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

interface Announcement {
  id: string;
  title: string;
  category: string;
  published_at: string;
  is_pinned?: boolean;
}

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "1",
    title: "【重要公告】全球百鐵認證官網全新改版上線，開放歷史完賽紀錄認領與查詢！",
    category: "系統公告",
    published_at: "2026-10-25",
    is_pinned: true,
  },
  {
    id: "2",
    title: "【賽事專區】台東普悠瑪鐵人三項＆巴歌浪鐵人三項完賽成績已同步匯入百鐵認證系統",
    category: "賽事快訊",
    published_at: "2026-10-20",
    is_pinned: true,
  },
  {
    id: "3",
    title: "【協會動態】台東城鄉生活運動協會年度賽事行事曆與志工召募資訊",
    category: "協會公告",
    published_at: "2026-10-15",
    is_pinned: false,
  },
];

export default function HomeAnnouncements() {
  const [news, setNews] = useState<Announcement[]>(DEFAULT_ANNOUNCEMENTS);
  const supabase = createClient();

  useEffect(() => {
    async function loadNews() {
      try {
        const { data, error } = await supabase
          .from("association_announcements")
          .select("id, title, category, created_at, is_pinned")
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(5);

        if (!error && data && data.length > 0) {
          setNews(
            data.map((item: any) => ({
              id: String(item.id),
              title: item.title,
              category: item.category || "最新公告",
              published_at: item.created_at
                ? new Date(item.created_at).toISOString().split("T")[0]
                : "近期發布",
              is_pinned: Boolean(item.is_pinned),
            }))
          );
        }
      } catch {
        // 自動維持預設展示公告，不影響首頁渲染
      }
    }
    loadNews();
  }, []);

  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
              最新協會與賽事公告
            </h2>
          </div>
          <Link
            href="/association"
            className="text-xs sm:text-sm text-yellow-400 hover:text-yellow-300 font-medium transition"
          >
            查看全部公告 →
          </Link>
        </div>

        <div className="divide-y divide-zinc-800/80">
          {news.map((item) => (
            <Link
              key={item.id}
              href="/association"
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-zinc-800/50 px-2 rounded-lg transition group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {item.is_pinned && (
                  <span className="shrink-0 px-2 py-0.5 text-[11px] font-bold bg-red-600/20 text-red-400 border border-red-500/30 rounded">
                    置頂
                  </span>
                )}
                <span className="shrink-0 px-2 py-0.5 text-[11px] font-medium bg-zinc-800 text-gray-300 rounded">
                  {item.category}
                </span>
                <p className="text-sm sm:text-base text-gray-200 group-hover:text-yellow-400 truncate transition">
                  {item.title}
                </p>
              </div>
              <span className="text-xs text-gray-500 shrink-0 font-mono">
                {item.published_at}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}