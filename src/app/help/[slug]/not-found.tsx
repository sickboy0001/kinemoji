import Link from "next/link";
import { HelpHeader } from "@/components/help/help-header";
import { HELP_TOPICS } from "@/contents/help/help-topics";

/**
 * ヘルプページの 404 エラーページ
 * 存在しないスラッグが表示された場合に表示
 */
export default function HelpNotFound() {
  return (
    <div className="min-h-screen bg-slate-50">
      <HelpHeader currentSlug="" topics={HELP_TOPICS} />
      <main className="py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-slate-700 mb-4">
              ページが見つかりません
            </h2>
            <p className="text-slate-600 mb-8">
              お探しのヘルプ記事は見つかりませんでした。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/help/00_index"
                className="inline-flex items-center px-6 py-3 rounded-lg text-base font-medium
                  bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                ヘルプ一覧に戻る
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
