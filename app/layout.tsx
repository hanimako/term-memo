import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "専門用語メモ",
  description:
    "専門用語を登録・管理し、効率的に記憶に定着させるためのWebアプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <body className="bg-gray-900 text-cyan-400 font-mono antialiased">
        {children}
      </body>
    </html>
  );
}
