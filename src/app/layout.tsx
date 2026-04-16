import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/layout/Navigations";
import Footer from "@/components/layout/Footer";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ToastContainer } from "@/components/ui/toast";
import { auth, signIn, signOut } from "@/auth";

export const metadata: Metadata = {
  title: "kinemoji - ウゴクモジ",
  description: "文字を動かす Gif 作成サービスです。",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  const handleSignIn = async () => {
    "use server";
    await signIn("google", { redirectTo: "/" });
  };

  const handleSignOut = async () => {
    "use server";
    await signOut({ redirectTo: "/" });
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
