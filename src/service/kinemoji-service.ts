import { db } from "@/lib/turso/db";
import { kinemojis } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export const kinemojiService = {
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

  async create(creatorId: string, text: string) {
    const id = crypto.randomUUID();
    const shortId = nanoid(10);
    const result = await db
      .insert(kinemojis)
      .values({
        id,
        shortId,
        text,
        creatorId,
        createdAt: new Date(),
      })
      .returning();
    return result[0];
  },

  async delete(id: string, creatorId: string) {
    return await db
      .delete(kinemojis)
      .where(eq(kinemojis.id, id))
      // 実際には管理者チェックも必要
      .where(eq(kinemojis.creatorId, creatorId));
  },
};
