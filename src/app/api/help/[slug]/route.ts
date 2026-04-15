import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const filePath = path.join(
      process.cwd(),
      "src/contents/help",
      `${decodedSlug}.md`,
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Help article not found" },
        { status: 404 },
      );
    }

    const content = fs.readFileSync(filePath, "utf8");
    return NextResponse.json({
      slug: decodedSlug,
      content,
    });
  } catch (error) {
    console.error("Help API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
