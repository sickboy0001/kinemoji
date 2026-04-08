import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/layout/Navigations";
import Footer from "@/components/layout/Footer";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ToastContainer } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "kinemoji - ウゴクモジ",
  description: "文字を動かすGif作成サービスです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 認証周りは将来的に使用するため、現在はダミー値を渡す
  const session = null;

  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navigation session={session}>
          {/* Main Content */}
          <main className="flex-1 bg-white">{children}</main>
        </Navigation>

        <ToastContainer />
        <Footer />
        <GoogleAnalytics gaId="G-J2G39C7PZZ" />
      </body>
    </html>
  );
}
