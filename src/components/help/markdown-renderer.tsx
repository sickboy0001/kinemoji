"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { visit } from "unist-util-visit";

/**
 * Markdown レンダリングコンポーネントのプロパティ
 */
export interface MarkdownRendererProps {
  /**
   * 描画する Markdown コンテンツ
   */
  content: string;
  /**
   * コンテナの最大幅クラス（デフォルト：max-w-5xl）
   */
  containerClass?: string;
}

/**
 * コードブロックに言語クラスを正しく設定するためのユーティリティ
 */
function codeBlockFixer() {
  return (tree: any) => {
    visit(tree, "element", (node: any) => {
      if (node.tagName === "pre") {
        const codeChild = node.children[0];
        if (codeChild && codeChild.tagName === "code") {
          // 言語クラスが設定されていない場合は「text」を設定
          const className = codeChild.properties?.className;
          if (!className || className.length === 0) {
            codeChild.properties.className = ["language-text"];
          }
        }
      }
    });
  };
}

/**
 * Markdown コンテンツをレンダリングするコンポーネント
 * - react-markdown を使用
 * - remarkGfm で GFM 拡張（テーブル、タスクリスト、打ち消し線）に対応
 * - rehypeHighlight でコードブロックのシンタックスハイライトを実装
 */
export function MarkdownRenderer({
  content,
  containerClass = "max-w-5xl",
}: MarkdownRendererProps) {
  return (
    <div className={`${containerClass} mx-auto`}>
      <div
        className="prose prose-lg dark:prose-invert max-w-none
        prose-headings:font-bold prose-headings:text-slate-900
        prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
        prose-p:text-slate-700 prose-p:my-4
        prose-strong:text-slate-900
        prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
        prose-pre:bg-slate-900 prose-pre:text-slate-100
        prose-table:border prose-table:border-slate-200
        prose-th:bg-slate-50 prose-th:font-bold
        prose-td:border prose-td:border-slate-200
        prose-ul:list-disc prose-ul:ml-4
        prose-ol:list-decimal prose-ol:ml-4
        prose-blockquote:border-l-4 prose-blockquote:border-slate-300 prose-blockquote:pl-4 prose-blockquote:italic
        prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
        prose-img:rounded prose-img:shadow"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            [
              rehypeHighlight,
              {
                ignoreMissing: true,
                detect: true,
              },
            ],
            codeBlockFixer,
          ]}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
