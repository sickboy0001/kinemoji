import Link from "next/link";

interface HelpTopic {
  slug: string;
  title: string;
}

/**
 * ヘルプヘッダー（Quick Links チップ一覧）のプロパティ
 */
export interface HelpHeaderProps {
  /**
   * 現在表示中の記事のスラッグ
   */
  currentSlug: string;
  /**
   * ヘルプ記事一覧
   */
  topics: HelpTopic[];
}

/**
 * ヘルプヘッダーコンポーネント
 * 利用可能な全記事へのリンクを「チップ（ボタン）」形式で横並び表示
 * 現在表示中の記事はアクティブ状態で強調
 */
export async function HelpHeader({ currentSlug, topics }: HelpHeaderProps) {
  return (
    <header className="w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <h1 className="text-xl font-bold text-slate-900 mb-3">
          ヘルプドキュメント
        </h1>
        <nav
          className="flex flex-wrap gap-2"
          aria-label="ヘルプ記事ナビゲーション"
        >
          {topics.map((topic) => (
            <HelpTopicChip
              key={topic.slug}
              topic={topic}
              isActive={topic.slug === currentSlug}
            />
          ))}
        </nav>
      </div>
    </header>
  );
}

/**
 * ヘルプ記事チップコンポーネント
 */
function HelpTopicChip({
  topic,
  isActive,
}: {
  topic: HelpTopic;
  isActive: boolean;
}) {
  return (
    <Link
      href={`/help/${topic.slug}`}
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors
        ${
          isActive
            ? "bg-blue-600 text-white"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        }`}
      aria-current={isActive ? "page" : undefined}
    >
      {topic.title}
    </Link>
  );
}
