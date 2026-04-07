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
    const result = await db
      .insert(kinemojis)
      .values({
        id,
        shortId,
        text,
        parameters: parameters ? JSON.stringify(parameters) : null,
        imageUrl,
        creatorId,
        createdAt: new Date(),
      })
      .returning();
    return result[0];
  },

  async delete(id: string, creatorId: string) {
    return await db
      .delete(kinemojis)
      .where(and(eq(kinemojis.id, id), eq(kinemojis.creatorId, creatorId)));
  },
};
