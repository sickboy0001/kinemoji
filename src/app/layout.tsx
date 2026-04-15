import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/layout/Navigations";
import Footer from "@/components/layout/Footer";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ToastContainer } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "kinemoji - ウゴクモジ",
  description: "文字を動かす Gif 作成サービスです。",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 認証機能は現在無効化されています
  const session = null;

  const handleSignIn = async () => {
    "use server";
    // Google ログインは現在無効化されています
    console.log("Sign in not implemented");
  };

  const handleSignOut = async () => {
    "use server";
    // ログアウトは現在無効化されています
    console.log("Sign out not implemented");
  };

  return (
    <html lang="ja">
      <body className="antialiased min-h-screen flex flex-col font-sans font-bold">
        <Navigation
          session={session}
          signInAction={handleSignIn}
          signOutAction={handleSignOut}
        >
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
