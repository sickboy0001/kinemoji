import { createClient } from "@libsql/client";
import fs from "fs";

const url = process.env.TURSO_DATABASE_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log("Connecting to database:", url);

const client = createClient({
  url,
  authToken,
});

async function migrate() {
  try {
    // カラムが存在するか確認
    const result = await client.execute(`
      SELECT name FROM pragma_table_info('kinemoji') WHERE name IN ('gif_status', 'gif_progress', 'gif_error', 'updated_at');
    `);

    const existingColumns = result.rows.map((row: any) => row.name);
    console.log("Existing columns:", existingColumns);

    const alterStatements = [];

    if (!existingColumns.includes("gif_status")) {
      alterStatements.push(
        `ALTER TABLE kinemoji ADD COLUMN gif_status TEXT DEFAULT 'pending';`,
      );
    }

    if (!existingColumns.includes("gif_progress")) {
      alterStatements.push(
        `ALTER TABLE kinemoji ADD COLUMN gif_progress INTEGER DEFAULT 0;`,
      );
    }

    if (!existingColumns.includes("gif_error")) {
      alterStatements.push(`ALTER TABLE kinemoji ADD COLUMN gif_error TEXT;`);
    }

    if (!existingColumns.includes("updated_at")) {
      alterStatements.push(
        `ALTER TABLE kinemoji ADD COLUMN updated_at INTEGER;`,
      );
    }

    if (alterStatements.length === 0) {
      console.log("All columns already exist. No migration needed.");
      return;
    }

    console.log("Running migrations:");
    for (const stmt of alterStatements) {
      console.log("  ", stmt);
      await client.execute(stmt);
    }

    console.log("Migration completed successfully!");

    // 既存のデータにデフォルト値を設定
    await client.execute(`
      UPDATE kinemoji SET gif_status = 'completed' WHERE gif_status IS NULL;
    `);

    console.log("Updated existing records.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.close();
  }
}

migrate();
