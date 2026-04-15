"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface HelpTopic {
  slug: string;
  title: string;
}

/**
 * ヘルプフッター（ナビゲーションボタン）のプロパティ
 */
export interface HelpFooterProps {
  /**
   * 現在表示中の記事のスラッグ
   */
  currentSlug: string;
}

/**
 * ヘルプフッターコンポーネント
 * 「一覧に戻る」または「前のページへ」ボタンを提供
 */
export function HelpFooter({ currentSlug }: HelpFooterProps) {
  const [topics, setTopics] = useState<HelpTopic[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    async function fetchTopics() {
      try {
        const res = await fetch("/api/help");
        if (res.ok) {
          const data = await res.json();
          setTopics(data);
          const index = data.findIndex(
            (t: HelpTopic) => t.slug === currentSlug,
          );
          setCurrentIndex(index);
        }
      } catch (error) {
        console.error("Failed to fetch help topics:", error);
      }
    }
    fetchTopics();
  }, [currentSlug]);

  const prevTopic = currentIndex > 0 ? topics[currentIndex - 1] : null;
  const nextTopic =
    currentIndex >= 0 && currentIndex < topics.length - 1
      ? topics[currentIndex + 1]
      : null;

  return (
    <footer className="w-full bg-white border-t border-slate-200 mt-8">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* ヘルプ画面へボタン */}
          <Link
            href="/help"
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium
              bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            ヘルプ画面へ
          </Link>

          {/* ナビゲーションボタン */}
          <div className="flex flex-wrap gap-2">
            {prevTopic && (
              <Link
                href={`/help/${prevTopic.slug}`}
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium
                  bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                前の記事：{prevTopic.title}
              </Link>
            )}

            {nextTopic && (
              <Link
                href={`/help/${nextTopic.slug}`}
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium
                  bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                次の記事：{nextTopic.title}
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
