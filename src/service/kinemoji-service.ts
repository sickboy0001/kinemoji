import { db } from "@/lib/turso/db";
import { kinemojis } from "@/db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { ensureMillisecondTimestamp } from "@/lib/utils";
import { deleteKinemojiImage } from "./kinemoji-upload-service";

type KinemojiWithDate = Omit<
  Awaited<ReturnType<typeof db.query.kinemojis.findMany>>[number],
  "createdAt" | "updatedAt"
> & {
  createdAt: number;
  updatedAt: number | null;
};

function mapKinemojiWithDates(item: any): KinemojiWithDate {
  return {
    ...item,
    createdAt: ensureMillisecondTimestamp(item.createdAt),
    updatedAt: item.updatedAt
      ? ensureMillisecondTimestamp(item.updatedAt)
      : null,
  };
}

export const kinemojiService = {
  async getAll() {
    const results = await db.query.kinemojis.findMany({
      orderBy: [desc(kinemojis.createdAt)],
      limit: 50,
    });
    return results.map(mapKinemojiWithDates);
  },

  async getAllByCreator(creatorId: string) {
    const results = await db.query.kinemojis.findMany({
      where: eq(kinemojis.creatorId, creatorId),
      orderBy: [desc(kinemojis.createdAt)],
    });
    return results.map(mapKinemojiWithDates);
  },

  async getByShortId(shortId: string) {
    const result = await db.query.kinemojis.findFirst({
      where: eq(kinemojis.shortId, shortId),
    });
    return result ? mapKinemojiWithDates(result) : null;
  },

  async getById(id: string) {
    const result = await db.query.kinemojis.findFirst({
      where: eq(kinemojis.id, id),
    });
    return result ? mapKinemojiWithDates(result) : null;
  },

  async create(
    creatorId: string | null,
    text: string,
    parameters?: any,
    imageUrl?: string,
    id?: string,
  ) {
    const targetId = id || crypto.randomUUID();
    const shortId = nanoid(10);
    const now = Date.now();
    // imageUrl があれば completed、なければ pending
    const status = imageUrl ? "completed" : "pending";
    const progress = imageUrl ? 100 : 0;
    const result = await db
      .insert(kinemojis)
      .values({
        id: targetId,
        shortId,
        text,
        parameters: JSON.stringify(parameters || {}),
        imageUrl,
        creatorId,
        createdAt: now,
        updatedAt: now,
        status,
        progress,
        type: parameters?.type,
        action: parameters?.action,
      })
      .returning();
    return result[0];
  },

  async delete(id: string, creatorId?: string) {
    // 削除前に画像URLを取得
    const kinemoji = await this.getById(id);
    if (kinemoji?.imageUrl) {
      await deleteKinemojiImage(kinemoji.imageUrl);
    }

    if (creatorId) {
      return await db
        .delete(kinemojis)
        .where(and(eq(kinemojis.id, id), eq(kinemojis.creatorId, creatorId)));
    }
    return await db.delete(kinemojis).where(eq(kinemojis.id, id));
  },

  async deleteMany(ids: string[]) {
    // 削除前に全ての画像URLを取得して削除
    const items = await db.query.kinemojis.findMany({
      where: inArray(kinemojis.id, ids),
    });

    for (const item of items) {
      if (item.imageUrl) {
        await deleteKinemojiImage(item.imageUrl);
      }
    }

    return await db.delete(kinemojis).where(inArray(kinemojis.id, ids));
  },

  async updateStatus(
    id: string,
    status: string,
    progress?: number,
    imageUrl?: string,
    error?: string,
    type?: string,
    action?: string,
  ) {
    const updates: any = { status, updatedAt: Date.now() };
    if (progress !== undefined) updates.progress = progress;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (error !== undefined) updates.error = error;
    if (type !== undefined) updates.type = type;
    if (action !== undefined) updates.action = action;

    const result = await db
      .update(kinemojis)
      .set(updates)
      .where(eq(kinemojis.id, id))
      .returning();
    return result[0] ? mapKinemojiWithDates(result[0]) : undefined;
  },
};
