import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "官方賽事與認證數位服務平台",
  description: "提供歷年賽事成績查詢、線上榮譽登錄、秩序冊下載與會員中心服務。",
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" translate="no" className="notranslate">
      <body className="bg-[#070709] text-white antialiased selection:bg-amber-500 selection:text-black">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
