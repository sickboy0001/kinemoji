import { kinemojiService } from "@/service/kinemoji-service";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { KinemojiDetailContent } from "./kinemoji-detail-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const kinemoji = await kinemojiService.getByShortId(id);

  if (!kinemoji) return {};

  const displayText =
    kinemoji.text.length > 15
      ? kinemoji.text.substring(0, 15) + "..."
      : kinemoji.text;
  const title = `kinemoji | ${displayText} (${kinemoji.type})`;
  const ogTitle = "kinemoji";
  const description = `${kinemoji.text} `;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://kinemoji.netlify.app";
  const ogpImageUrl = `${baseUrl}/api/og?id=${id}`;

  return {
    title,
    description,
    openGraph: {
      title: ogTitle,
      description,
      images: [ogpImageUrl],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [ogpImageUrl],
    },
  };
}

export default async function KinemojiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kinemoji = await kinemojiService.getByShortId(id);

  if (!kinemoji) {
    notFound();
  }

  return <KinemojiDetailContent id={id} />;
}
