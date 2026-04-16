import { Session } from "next-auth";
import { db } from "@/lib/turso/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * 管理者かどうかを判定する
 * セッションオブジェクトまたはメールアドレスを直接受け取ることができる
 * データベースの is_admin フラグを確認する
 */
export async function isAdministrator(
  input: Session | string | null | undefined,
): Promise<boolean> {
  if (!input) return false;

  let email: string | null | undefined;

  if (typeof input === "string") {
    email = input;
  } else {
    // セッションオブジェクトの場合、既に isAdmin フラグが立っていれば即判定
    if (input.user && (input.user as any).isAdmin === true) {
      return true;
    }
    email = input.user?.email;
  }

  if (!email) return false;

  // ハードコードされた管理者メールアドレスのチェック
  if (
    process.env.ADMINISTRATOR_MAIL &&
    email === process.env.ADMINISTRATOR_MAIL
  ) {
    return true;
  }

  // データベースから権限を取得
  try {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return !!dbUser?.isAdmin;
  } catch (error) {
    console.error("Error checking administrator status:", error);
    return false;
  }
}
