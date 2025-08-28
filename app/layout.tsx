import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./contexts/ThemeContext";

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
    <html lang="ja">
      <body className="font-mono antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
