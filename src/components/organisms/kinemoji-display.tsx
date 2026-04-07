"use client";

import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { uploadKinemojiImage } from "@/service/kinemoji-upload-service";
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
  const [isSaving, setIsSaving] = useState(false);
  const lines = text.split(/\r?\n/);

  const handleSaveImage = async () => {
    if (!containerRef.current) return;

    try {
      setIsSaving(true);
      const dataUrl = await toPng(containerRef.current, {
        cacheBust: true,
        backgroundColor: params.backColor || "#000000",
      });

      const formData = new FormData();
      formData.append("image", dataUrl);
      const result = await uploadKinemojiImage(formData);

      if (result.success) {
        toast.success("画像を保存しました", {
          description: result.fileName,
        });
      } else {
        toast.error("保存に失敗しました", {
          description: result.error,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Save image error:", errorMessage);
      toast.error("保存中にエラーが発生しました");
    } finally {
      setIsSaving(false);
    }
  };

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
          />
        )}
      </div>
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="secondary"
          onClick={handleSaveImage}
          disabled={isSaving}
          title="画像として保存"
        >
          <Save className={`w-4 h-4 ${isSaving ? "animate-pulse" : ""}`} />
        </Button>
      </div>
    </div>
  );
};
