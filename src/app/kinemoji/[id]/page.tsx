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

  const title = `${kinemoji.text} `;
  const description = "kimemoji";
  const imageUrl = kinemoji.imageUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
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
