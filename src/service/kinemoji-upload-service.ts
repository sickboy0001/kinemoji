"use server";

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

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

export async function deleteKinemojiImage(imageUrl: string) {
  try {
    // URL からファイル名を抽出
    const publicUrl = process.env.R2_PUBLIC_URL!;
    const fileName = imageUrl.replace(`${publicUrl}/`, "");

    if (fileName === imageUrl) {
      console.warn("Could not extract file name from URL:", imageUrl);
      return { success: false, error: "Invalid URL" };
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileName,
    });

    await s3Client.send(command);
    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Delete R2 error:", errorMessage);
    return { success: false, error: "Failed to delete image from R2" };
  }
}

export async function uploadKinemojiImage(formData: FormData) {
  try {
    // Blob または File オブジェクトを取得（"file" キーを使用）
    const fileData = formData.get("file") as Blob | File;
    if (!fileData) {
      return { success: false, error: "No image data provided" };
    }

    // Blob を Buffer に変換
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ファイル名生成：日時 (YYYYMMDD-HHmmss) + UUID7 桁
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-T:]/g, "").split(".")[0];

    // MIME タイプの判定
    const contentType = fileData.type || "image/gif";
    const isGif = contentType.includes("gif");
    const extension = isGif ? "gif" : "png";

    // ファイル名の決定
    const fileNameFromFormData =
      fileData instanceof File ? fileData.name : undefined;
    const fileName =
      fileNameFromFormData ||
      `${timestamp}-${generateRandomId(7)}.${extension}`;

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
