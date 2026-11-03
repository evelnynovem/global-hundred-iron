import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import StorageOverflowGuard from "@/components/StorageOverflowGuard";

export const metadata: Metadata = {
  title: "全球百鐵認證 Global 100 Triathlon Certification",
  description: "每一場挑戰，都值得被記錄。全球百鐵認證服務平台。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="bg-[#070709] text-white antialiased selection:bg-amber-500 selection:text-black">
        <StorageOverflowGuard />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
