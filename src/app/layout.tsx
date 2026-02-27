import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Make Words Cute 🎀 | 让你的话变得又凶又可爱",
  description:
    "用 AI 把攻击性的话变成可爱又不失锋芒的表达，让你的暴躁变得萌萌哒~",
  keywords: ["可爱", "文字转换", "AI", "萌化", "表情包文学"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
