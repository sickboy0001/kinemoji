import { NextRequest, NextResponse } from "next/server";
import { auth, signIn, signOut } from "@/auth";

// GET: セッション取得
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (session) {
      return NextResponse.json(session);
    }
    return NextResponse.json({ user: null }, { status: 401 });
  } catch (error) {
    console.error("GET /api/auth/[...nextauth] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST: サインイン/サインアウト処理
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, provider = "google", callbackUrl = "/" } = body;

    if (action === "signIn") {
      // NextAuth v4 では signIn がサーバーアクションとして直接使用できないため、リダイレクトを使用
      return NextResponse.json(
        { error: "Use GET for sign in" },
        { status: 400 },
      );
    } else if (action === "signOut") {
      await signOut({ redirectTo: callbackUrl });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/auth/[...nextauth] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
