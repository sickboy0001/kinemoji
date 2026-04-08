import { KinemojiDisplay } from "@/components/organisms/kinemoji-display";
import { kinemojiService } from "@/service/kinemoji-service";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const kinemoji = await kinemojiService.getByShortId(id);

  if (!kinemoji) return {};

  const title = `${kinemoji.text} | キネ文字`;
  const description = "動くキネ文字を作成しました。";
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <KinemojiDisplay
        text={kinemoji.text}
        parameters={kinemoji.parameters || undefined}
      />
    </div>
  );
}
