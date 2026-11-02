import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import StorageOverflowGuard from "@/components/StorageOverflowGuard";

export const metadata: Metadata = {
  title: "官方賽事與百鐵認證數位平台",
  description: "每一場挑戰，都值得被記錄。",
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
        <StorageOverflowGuard />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
