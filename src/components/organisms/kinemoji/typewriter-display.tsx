"use client";

import { useMemo, useState, useEffect } from "react";

interface TypewriterDisplayProps {
  text: string;
  lines: string[];
  canvasWidth: number;
  canvasHeight: number;
  fontSize: number;
  foreColor: string;
  backColor: string;
  isRendering?: boolean;
}

/**
 * タイプライター風アニメーション表示コンポーネント
 * 最初から最終的な表示領域を確保し、1文字ずつ表示していくことで
 * 文字の移動を防ぎ、完璧な中央揃えを実現する。
 */
export const TypewriterDisplay = ({
  text,
  lines,
  canvasWidth,
  canvasHeight,
  fontSize,
  foreColor,
  backColor,
  isRendering = false,
}: TypewriterDisplayProps) => {
  // 改行を除外した全文字（アニメーションのカウント用）
  const allChars = useMemo(
    () => text.split("").filter((c) => c !== "\n" && c !== "\r"),
    [text],
  );

  const [displayedCount, setDisplayedCount] = useState(0);

  useEffect(() => {
    setDisplayedCount(0);

    let timer: NodeJS.Timeout;

    const startAnimation = () => {
      let charIdx = 0;
      // 1文字あたりの表示間隔
      const interval = 100;

      timer = setInterval(() => {
        charIdx++;
        if (charIdx <= allChars.length) {
          setDisplayedCount(charIdx);
        } else {
          clearInterval(timer);
        }
      }, interval);
    };

    startAnimation();
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [allChars.length, isRendering]);

  // グローバルな文字インデックスを追跡するための変数
  let currentCharIndex = 0;

  return (
    <div
      className="flex items-center justify-center overflow-hidden"
      style={{
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        backgroundColor: backColor,
      }}
    >
      <div
        className="flex flex-col items-start"
        style={{ gap: `${fontSize * 0.2}px` }}
      >
        {lines.map((line, lineIndex) => (
          <div
            key={lineIndex}
            className="whitespace-nowrap"
            style={{
              fontSize: `${fontSize}px`,
              color: foreColor,
              fontFamily: "var(--font-zen-old-mincho)",
              fontWeight: 300,
              lineHeight: 1.2,
            }}
          >
            {line.split("").map((char, charIndex) => {
              const isVisible = currentCharIndex < displayedCount;
              currentCharIndex++;
              return (
                <span
                  key={charIndex}
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transition: "opacity 0.1s ease-in-out",
                  }}
                >
                  {char}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
