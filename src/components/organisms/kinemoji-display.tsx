"use client";

import { useMemo, useRef } from "react";
import {
  KinemojiDisplayProps,
  AnimationType,
  AnimationAction,
} from "./kinemoji/types";
import { LupinDisplay } from "./kinemoji/lupin-display";
import { StandardDisplay } from "./kinemoji/standard-display";

export type { AnimationType, AnimationAction };

export const KinemojiDisplay = ({
  text,
  parameters,
  isRendering = false,
}: KinemojiDisplayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lines = text.split(/\r?\n/);

  let params: any = {};
  if (typeof parameters === "string") {
    try {
      params = JSON.parse(parameters);
    } catch (e) {
      params = {};
    }
  } else if (parameters) {
    params = parameters;
  }

  const type: AnimationType = params.type || "direction";
  const action: AnimationAction =
    params.action ||
    (type === "direction"
      ? "down"
      : type === "zoom"
        ? "in"
        : type === "opacity"
          ? "fade"
          : "typewriter");
  const canvasWidth = params.width || 800;
  const canvasHeight = params.height || 600;
  const foreColor = params.foreColor || "#ffffff";
  const backColor = params.backColor || "#000000";

  const fontSize = useMemo(() => {
    if (!text.trim()) return 64;
    const maxCharsInLine = Math.max(...lines.map((l) => l.length), 1);
    const lineCount = Math.max(lines.length, 1);
    const sizeByWidth = (canvasWidth / maxCharsInLine) * 0.8;
    const sizeByHeight = (canvasHeight / lineCount) * 0.7;
    return Math.min(sizeByWidth, sizeByHeight, 200);
  }, [text, canvasWidth, canvasHeight, lines]);

  return (
    <div className="relative group">
      <div ref={containerRef}>
        {type === "lupin" ? (
          <LupinDisplay
            text={text}
            lines={lines}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            fontSize={fontSize}
            foreColor={foreColor}
            backColor={backColor}
            isRendering={isRendering}
          />
        ) : (
          <StandardDisplay
            type={type}
            action={action}
            lines={lines}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            fontSize={fontSize}
            foreColor={foreColor}
            backColor={backColor}
            isRendering={isRendering}
          />
        )}
      </div>
    </div>
  );
};
