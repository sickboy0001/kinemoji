"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState, useEffect } from "react";

interface LupinDisplayProps {
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
 * ルパン三世風アニメーション表示コンポーネント
 */
export const LupinDisplay = ({
  text,
  lines,
  canvasWidth,
  canvasHeight,
  fontSize,
  foreColor,
  backColor,
  isRendering = false,
}: LupinDisplayProps) => {
  const allChars = useMemo(
    () => text.split("").filter((c) => c !== "\n" && c !== "\r"),
    [text],
  );

  const [highlightIndex, setHighlightIndex] = useState(
    allChars.length > 0 ? 0 : -1,
  );
  const [showFull, setShowFull] = useState(false);

  const STAGGER_MS = 300;
  const lupinFontSize = useMemo(() => {
    return Math.min(canvasWidth, canvasHeight) * 0.85;
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    setShowFull(false);
    setHighlightIndex(allChars.length > 0 ? 0 : -1);

    let timer: NodeJS.Timeout;

    const startAnimation = () => {
      let charIdx = 0;
      timer = setInterval(() => {
        charIdx++;
        if (charIdx < allChars.length) {
          setHighlightIndex(charIdx);
        } else {
          clearInterval(timer);
          // 最後の文字を表示したままにするため、ここでは -1 にしない
          setTimeout(() => {
            setShowFull(true);
          }, 200);
        }
      }, STAGGER_MS);
    };

    if (isRendering) {
      // GIF 生成時は、即座にアニメーションを開始し、ループさせる
      let charIdx = 0;
      timer = setInterval(() => {
        charIdx++;
        if (charIdx < allChars.length) {
          setHighlightIndex(charIdx);
        } else {
          // ループさせるために、最後から再度開始
          charIdx = 0;
          setHighlightIndex(charIdx);
        }
      }, STAGGER_MS);

      return () => {
        if (timer) clearInterval(timer);
      };
    } else {
      startAnimation();
      return () => {
        if (timer) clearInterval(timer);
      };
    }
  }, [allChars, isRendering, STAGGER_MS]);

  return (
    <div
      className="flex flex-col items-center justify-center overflow-hidden relative"
      style={{
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        backgroundColor: backColor,
      }}
    >
      <AnimatePresence mode={isRendering ? undefined : "sync"} initial={false}>
        {!showFull && highlightIndex >= 0 && (
          <motion.div
            key={`highlight-${highlightIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: isRendering ? 1 : 0 }}
            transition={{ duration: isRendering ? 0.01 : 0.05, ease: "linear" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              fontSize: `${lupinFontSize}px`,
              color: foreColor,
              lineHeight: 1,
              fontFamily: "var(--font-zen-old-mincho)",
              fontWeight: 300,
            }}
          >
            {allChars[highlightIndex]}
          </motion.div>
        )}

        {showFull && (
          <motion.div
            key="full-text"
            initial={{ opacity: isRendering ? 1 : 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: isRendering ? 0.1 : 0.4 }}
            className="flex flex-col items-center justify-center w-full h-full"
            style={{ gap: `${fontSize * 0.2}px` }}
          >
            {lines.map((line, i) => (
              <div
                key={i}
                className="whitespace-nowrap"
                style={{
                  fontSize: `${fontSize}px`,
                  color: foreColor,
                  fontFamily: "var(--font-zen-old-mincho)",
                  fontWeight: 300,
                }}
              >
                {line}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
