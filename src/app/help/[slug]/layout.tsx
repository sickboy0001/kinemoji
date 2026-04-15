import { HelpHeader } from "@/components/help/help-header";
import { HELP_TOPICS } from "@/contents/help/help-topics";

/**
 * ヘルプページのレイアウト
 * ヘッダー（Quick Links）を全ページで共有
 */
export default async function HelpLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-slate-50">
      <HelpHeader currentSlug={slug} topics={HELP_TOPICS} />
      <main className="py-8">{children}</main>
    </div>
  );
}
