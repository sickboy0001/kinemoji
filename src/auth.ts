import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/turso/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { isAdministrator } from "@/lib/user";

// NextAuth の型拡張
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    isAdmin?: boolean;
  }
}

// JWT の型拡張が必要な場合はここに追加しますが、ビルドエラー回避のため一旦コメントアウトするか、
// @auth/core など別のパスを試します。
// NextAuth v5 では JWT の型定義は Session の定義から推論されることも多いため、一旦外して確認します。

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db) as any,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === "google" && user.email) {
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, user.email),
        });

        if (existingUser) {
          await db
            .update(users)
            .set({
              googleId: existingUser.googleId || user.id,
              image: existingUser.image || user.image,
              displayName: existingUser.displayName || user.name,
            })
            .where(eq(users.id, existingUser.id));
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }: any) {
      // 初期ログイン時
      if (user) {
        token.id = user.id ?? "";
      }

      // 毎回DBおよび環境変数から管理者権限を確認
      if (token.email) {
        token.isAdmin = await isAdministrator(token.email as string);

        // デバッグログ
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[auth][jwt] user: ${token.email}, isAdmin: ${token.isAdmin}`,
          );
        }
      }

      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = (token.isAdmin as boolean) ?? false;
      }
      return session;
    },
  },
});
