import crypto from "crypto";

/**
 * サーバーと共有している FERNET_KEY を使用して X-Security-Token を生成する
 */
export function generateSecurityToken(): string {
  const fernetKey = process.env.FERNET_KEY;
  if (!fernetKey) throw new Error("FERNET_KEY is not defined");

  // 1. 鍵をデコード
  // Fernet 鍵は URL-safe Base64 (RFC 4648 Section 5)
  const key = Buffer.from(
    fernetKey.replace(/-/g, "+").replace(/_/g, "/"),
    "base64",
  );

  // 2. 現在のタイムスタンプ（秒）
  const timestamp = Math.floor(Date.now() / 1000).toString();

  // 3. IV (16バイト) 生成
  const iv = crypto.randomBytes(16);

  // 4. AES-256-CBC で暗号化
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let ciphertext = cipher.update(timestamp, "utf8");
  ciphertext = Buffer.concat([ciphertext, cipher.final()]);

  // 5. IV + Ciphertext を結合して Base64 エンコード
  return Buffer.concat([iv, ciphertext]).toString("base64");
}
