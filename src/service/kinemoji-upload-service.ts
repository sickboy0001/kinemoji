"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// nanoid の代わりに標準的なランダム文字列生成を使用（ES Module 問題の回避）
function generateRandomId(length: number): string {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function uploadKinemojiImage(formData: FormData) {
  try {
    const base64Data = formData.get("image") as string;
    if (!base64Data) {
      return { success: false, error: "No image data provided" };
    }
    // base64のヘッダーを削除
    const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Content, "base64");

    // ファイル名生成: 日時(YYYYMMDD-HHmmss) + UUID7桁
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-T:]/g, "").split(".")[0];
    const isGif = base64Data.startsWith("data:image/gif");
    const extension = isGif ? "gif" : "png";
    const contentType = isGif ? "image/gif" : "image/png";
    const fileName = `${timestamp}-${generateRandomId(7)}.gif`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
    return { success: true, url: publicUrl, fileName };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Upload error:", errorMessage);
    return { success: false, error: "Failed to upload image" };
  }
}
