import { KinemojiDisplay } from "@/components/organisms/kinemoji-display";
import { kinemojiService } from "@/service/kinemoji-service";
import { notFound } from "next/navigation";

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
