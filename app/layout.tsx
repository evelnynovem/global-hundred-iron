import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import { CookieBanner } from "@/components/CookieBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "全球百鐵認證 Global 100 Triathlon Certification",
    template: "%s｜全球百鐵認證",
  },
  description:
    "一組帳號通用於全球百鐵認證、普悠瑪鐵人三項與聯合賽事服務。",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 取得目前 Supabase 登入會員狀態
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="zh-Hant">
      <head><meta name="google" content="notranslate" /></head><body className="min-h-screen bg-gray-50 text-zinc-950 antialiased flex flex-col justify-between">
        <div>
          {/* 頂部導覽列（支援百鐵與普悠瑪切換） */}
          <Navbar />

          {/* 頁面主要內容 */}
          <main>{children}</main>
        </div>

        {/* 頁尾 Footer */}
        <footer className="border-t border-zinc-200 bg-zinc-950 text-white mt-12">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em]">
                Global 100 Triathlon Certification & TRUAA
              </p>
              <p className="mt-2 text-xs text-zinc-400">
                全球百鐵認證暨台東城鄉生活運動協會聯合服務平台
              </p>
            </div>
            <p className="text-xs text-zinc-500">
              © {new Date().getFullYear()} GLOBAL 100 TRIATHLON CERTIFICATION. All rights reserved.
            </p>
          </div>
        </footer>

        {/* 全站生效的 Cookie 隱私權同意橫幅 */}
        <CookieBanner />
      </body>
    </html>
  );
}