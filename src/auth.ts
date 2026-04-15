import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/turso/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";

// NextAuth の型拡張
declare module "next-auth" {
  interface User {
    id?: string;
    isAdmin?: boolean;
  }
  interface Session {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    image: string;
    isAdmin: boolean;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db) as any,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async signIn({ user, account }: any) {
      // Google OAuth コールバック後のユーザー処理
      if (account?.provider === "google" && user.email) {
        // 既存ユーザーの確認
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, user.email),
        });

        if (existingUser) {
          // 既存ユーザー：google_id を更新（まだ設定されていない場合）
          if (!existingUser.googleId && user.id) {
            await db
              .update(users)
              .set({
                googleId: user.id,
                displayName: user.name || existingUser.displayName,
              })
              .where(eq(users.id, existingUser.id));
          }
          return true;
        }

        // 新規ユーザー：自動登録
        if (user.id) {
          await db.insert(users).values({
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            googleId: user.id, // Google の sub クレーム
            displayName: user.name,
            emailVerified: user.email
              ? new Date() // Google 認証済みなので現在時刻
              : null,
            isAdmin: false,
          });
        }
      }
      return true;
    },
    async jwt({ token, user }: any) {
      // JWT にユーザー情報を追加
      if (user) {
        token.id = user.id ?? "";
        token.email = user.email ?? "";
        token.name = user.name ?? "";
        token.image = user.image ?? "";
        token.isAdmin = false; // 初期値は false
      }
      return token;
    },
    async session({ session, token }: any) {
      // セッションに JWT 情報を追加
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        session.user.isAdmin = (token.isAdmin as boolean) ?? false;
      }
      return session;
    },
  },
});
