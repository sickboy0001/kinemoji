import { db } from "@/lib/turso/db";
import { kinemojis } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export const kinemojiService = {
  async getAll() {
    const results = await db.query.kinemojis.findMany({
      orderBy: [desc(kinemojis.createdAt)],
      limit: 50,
    });
    // console.log(
    //   "All kinemojis from DB:",
    //   results.map((k) => ({ id: k.id, hasUrl: !!k.imageUrl })),
    // ); // デバッグログ
    return results;
  },

  async getAllByCreator(creatorId: string) {
    return await db.query.kinemojis.findMany({
      where: eq(kinemojis.creatorId, creatorId),
      orderBy: [desc(kinemojis.createdAt)],
    });
  },

  async getByShortId(shortId: string) {
    return await db.query.kinemojis.findFirst({
      where: eq(kinemojis.shortId, shortId),
    });
  },

  async create(
    creatorId: string | null,
    text: string,
    parameters?: any,
    imageUrl?: string,
  ) {
    const id = crypto.randomUUID();
    const shortId = nanoid(10);
    const now = new Date();
    // imageUrl があれば completed、なければ pending
    const status = imageUrl ? ("completed" as const) : ("pending" as const);
    const progress = imageUrl ? 100 : 0;
    const result = await db
      .insert(kinemojis)
      .values({
        id,
        shortId,
        text,
        parameters: parameters ? JSON.stringify(parameters) : null,
        imageUrl,
        creatorId,
        createdAt: now,
        updatedAt: now,
        status,
        progress,
      })
      .returning();
    return result[0];
  },

  async delete(id: string, creatorId: string) {
    return await db
      .delete(kinemojis)
      .where(and(eq(kinemojis.id, id), eq(kinemojis.creatorId, creatorId)));
  },

  async updateStatus(
    id: string,
    status: "pending" | "processing" | "completed" | "failed",
    progress?: number,
    imageUrl?: string,
    error?: string,
  ) {
    const updates: any = { status, updatedAt: new Date() };
    if (progress !== undefined) updates.progress = progress;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (error !== undefined) updates.error = error;

    return await db
      .update(kinemojis)
      .set(updates)
      .where(eq(kinemojis.id, id))
      .returning();
  },
};
