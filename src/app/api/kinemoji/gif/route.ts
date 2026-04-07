import { NextResponse } from "next/server";
import { generateAndUploadGif } from "@/service/kinemoji-gif-service";

export async function POST(req: Request) {
  try {
    const params = await req.json();
    const result = await generateAndUploadGif(params);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("GIF generation API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
