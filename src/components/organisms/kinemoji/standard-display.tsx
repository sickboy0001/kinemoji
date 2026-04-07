"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  AnimationAction,
  AnimationType,
  DIRECTION_ACTIONS,
  OPACITY_ACTIONS,
  ZOOM_ACTIONS,
} from "./types";

interface StandardDisplayProps {
  type: AnimationType;
  action: AnimationAction;
  lines: string[];
  canvasWidth: number;
  canvasHeight: number;
  fontSize: number;
  foreColor: string;
  backColor: string;
}

/**
 * 標準的な Stagger アニメーション（Direction, Zoom, Opacity）用コンポーネント
 */
export const StandardDisplay = ({
  type,
  action,
  lines,
  canvasWidth,
  canvasHeight,
  fontSize,
  foreColor,
  backColor,
}: StandardDisplayProps) => {
  const charConfigs = useMemo(() => {
    let globalIndex = 0;
    return lines.map((line) =>
      line.split("").map(() => {
        let activeType = type;
        let activeAction = action;

        if (action === "random") {
          const types: AnimationType[] = ["direction", "zoom", "opacity"];
          activeType = types[Math.floor(Math.random() * types.length)];
          if (activeType === "direction") {
            activeAction =
              DIRECTION_ACTIONS[
                Math.floor(Math.random() * DIRECTION_ACTIONS.length)
              ];
          } else if (activeType === "zoom") {
            activeAction =
              ZOOM_ACTIONS[Math.floor(Math.random() * ZOOM_ACTIONS.length)];
          } else {
            activeAction =
              OPACITY_ACTIONS[
                Math.floor(Math.random() * OPACITY_ACTIONS.length)
              ];
          }
        }

        const config = {
          x: 0,
          y: 0,
          scale: 1,
          filter: "blur(20px)",
          globalIndex: globalIndex++,
        };

        if (activeType === "opacity") {
          return {
            ...config,
            filter: activeAction === "blur" ? "blur(40px)" : "blur(0px)",
          };
        } else if (activeType === "zoom") {
          return { ...config, scale: activeAction === "in" ? 0.1 : 5 };
        } else {
          switch (activeAction) {
            case "up":
              return { ...config, y: 100 };
            case "left":
              return { ...config, x: 100 };
            case "right":
              return { ...config, x: -100 };
            default:
              return { ...config, y: -100 };
          }
        }
      }),
    );
  }, [lines, type, action]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center overflow-hidden"
      style={{
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        gap: `${fontSize * 0.2}px`,
        backgroundColor: backColor,
      }}
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      {lines.map((line, lineIndex) => (
        <div
          key={lineIndex}
          className="flex justify-center"
          style={{
            gap: `${fontSize * 0.1}px`,
            minHeight: line.length === 0 ? `${fontSize}px` : "auto",
          }}
        >
          {line.split("").map((char, charIndex) => {
            const config = charConfigs[lineIndex][charIndex];
            return (
              <motion.span
                key={`${lineIndex}-${charIndex}`}
                variants={{
                  visible: {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    scale: 1,
                    filter: "blur(0px)",
                    transition: { type: "spring", damping: 15 },
                  },
                  hidden: {
                    opacity: 0,
                    x: config.x,
                    y: config.y,
                    scale: config.scale,
                    filter: config.filter,
                  },
                }}
                className="inline-block font-bold leading-none"
                style={{
                  fontSize: `${fontSize}px`,
                  color: foreColor,
                  textShadow: `${fontSize * 0.05}px ${fontSize * 0.05}px ${fontSize * 0.1}px rgba(0,0,0,0.2)`,
                  fontFamily: "var(--font-noto-serif-jp)",
                }}
              >
                {char}
              </motion.span>
            );
          })}
        </div>
      ))}
    </motion.div>
  );
};
