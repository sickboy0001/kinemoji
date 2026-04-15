import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/help/markdown-renderer";
import { HelpFooter } from "@/components/help/help-footer";
import { HELP_TOPICS } from "@/contents/help/help-topics";

interface HelpApiResponse {
  slug: string;
  content: string;
}

/**
 * ヘルプページの静的生成用パラメータ
 */
export async function generateStaticParams() {
  return HELP_TOPICS.map((topic) => ({
    slug: topic.slug,
  }));
}

/**
 * メタデータ生成
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/help/${slug}`,
  );

  if (!res.ok) {
    return {
      title: "ページが見つかりません | ヘルプ",
    };
  }

  const data: HelpApiResponse = await res.json();
  // Markdown から最初の見出しをタイトルとして抽出
  const titleMatch = data.content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : "ヘルプ";

  return {
    title: `${title} | ヘルプ`,
    description: `${title} - チョイタメラボのヘルプドキュメント`,
  };
}

/**
 * ヘルプ記事表示ページ
 * @param params URL パラメータ（slug）
 */
export default async function HelpPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/help/${slug}`,
    { cache: "no-store" },
  );

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            エラーが発生しました
          </h1>
          <p className="text-slate-600">ヘルプ記事の読み込みに失敗しました。</p>
        </div>
      </div>
    );
  }

  const data: HelpApiResponse = await res.json();

  return (
    <div className="max-w-5xl mx-auto px-4">
      <article>
        <MarkdownRenderer content={data.content} />
      </article>
      <HelpFooter currentSlug={data.slug} />
    </div>
  );
}
