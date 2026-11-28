import GlobalImageOptimizer from "@/components/GlobalImageOptimizer";
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import StorageOverflowGuard from "@/components/StorageOverflowGuard";

export const metadata: Metadata = {
  icons: { icon: "/images/g100-favicon.jpg?v=20261128", apple: "/images/g100-favicon.jpg?v=20261128" },
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
        <GlobalImageOptimizer />
        <StorageOverflowGuard />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
