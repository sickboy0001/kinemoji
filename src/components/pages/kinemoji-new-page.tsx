"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  KinemojiDisplay,
  AnimationType,
  AnimationAction,
} from "@/components/organisms/kinemoji-display";

const TYPE_OPTIONS: { value: AnimationType; label: string }[] = [
  { value: "direction", label: "移動 (Direction)" },
  { value: "zoom", label: "ズーム (Zoom)" },
  { value: "opacity", label: "不透明度 (Opacity)" },
  { value: "lupin", label: "ルパン (Lupin)" },
];

const DIRECTION_ACTIONS: { value: AnimationAction; label: string }[] = [
  { value: "down", label: "上から下" },
  { value: "up", label: "下から上" },
  { value: "left", label: "右から左" },
  { value: "right", label: "左から右" },
];

const ZOOM_ACTIONS: { value: AnimationAction; label: string }[] = [
  { value: "in", label: "ズーム・イン (寄)" },
  { value: "out", label: "ズーム・アウト (引)" },
];

const OPACITY_ACTIONS: { value: AnimationAction; label: string }[] = [
  { value: "fade", label: "フェードのみ" },
  { value: "blur", label: "ぼかしからの出現" },
];

const LUPIN_ACTIONS: { value: AnimationAction; label: string }[] = [
  { value: "typewriter", label: "タイピング" },
];

const WIDTHS = [
  { value: 800, label: "800" },
  { value: 400, label: "400" },
  { value: 200, label: "200" },
];

const HEIGHT_RATIOS = [
  { label: "1/4", ratio: 0.25 },
  { label: "1/2", ratio: 0.5 },
  { label: "2/3", ratio: 0.666 },
  { label: "3/4", ratio: 0.75 },
  { label: "1/1", ratio: 1 },
];

const COLOR_SETS = [
  { label: "黒地に白", foreColor: "#ffffff", backColor: "#000000" },
  { label: "白地に黒", foreColor: "#000000", backColor: "#ffffff" },
  { label: "青地に白", foreColor: "#ffffff", backColor: "#1e40af" },
  { label: "赤地に白", foreColor: "#ffffff", backColor: "#991b1b" },
];

export function KinemojiNewPage() {
  const [text, setText] = useState("");
  const [type, setType] = useState<AnimationType>("direction");
  const [action, setAction] = useState<AnimationAction>("down");
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(300);
  const [foreColor, setForeColor] = useState("#ffffff");
  const [backColor, setBackColor] = useState("#000000");
  const [previewText, setPreviewText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleTypeChange = (newType: AnimationType) => {
    setType(newType);
    if (newType === "direction") {
      setAction("down");
    } else if (newType === "zoom") {
      setAction("in");
    } else if (newType === "opacity") {
      setAction("fade");
    } else {
      setAction("typewriter");
    }
  };

  const handleRatioClick = (ratio: number) => {
    setHeight(Math.round(width * ratio));
  };

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth - 32;
        const s = Math.min(1, containerWidth / width);
        setScale(s);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [width, previewText]);

  const handlePreview = () => {
    if (!text.trim()) {
      toast.error("文字列を入力してください");
      return;
    }
    setPreviewText("");
    setTimeout(() => setPreviewText(text), 50);
  };

  const handleRegister = async () => {
    if (!text.trim()) {
      toast.error("文字列を入力してください");
      return;
    }

    setIsLoading(true);
    try {
      // GIFの生成とアップロード（サーバーサイドAPIを呼び出す）
      let imageUrl = null;
      try {
        const gifResponse = await fetch("/api/kinemoji/gif", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            type,
            action,
            width,
            height,
            foreColor,
            backColor,
          }),
        });

        if (gifResponse.ok) {
          const uploadResult = await gifResponse.json();
          if (uploadResult.success) {
            imageUrl = uploadResult.url;
          }
        } else {
          console.error("GIF generation failed:", await gifResponse.text());
        }
      } catch (uploadError) {
        console.error("Image generation/upload error:", uploadError);
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          parameters: {
            type,
            action,
            width,
            height,
            foreColor,
            backColor,
          },
          imageUrl,
        }),
      });

      if (!response.ok) throw new Error("作成に失敗しました");

      const data = await response.json();
      toast.success("作成しました！");
      router.push(`/kinemoji/list?id=${data.id}`);
    } catch (error) {
      toast.error("エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>Kinemojiを新しく作る</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="text">表示する文字列</Label>
              <Textarea
                id="text"
                placeholder="一行目&#10;二行目"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={100}
                className="min-h-[100px] resize-y"
              />
            </div>

            <div className="space-y-2">
              <Label>アニメーション・タイプ</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TYPE_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={type === opt.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTypeChange(opt.value)}
                    className="w-full"
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>アクション</Label>
              <div className="grid grid-cols-2 gap-2">
                {(type === "direction"
                  ? DIRECTION_ACTIONS
                  : type === "zoom"
                    ? ZOOM_ACTIONS
                    : type === "opacity"
                      ? OPACITY_ACTIONS
                      : LUPIN_ACTIONS
                ).map((opt) => (
                  <Button
                    key={opt.value}
                    variant={action === opt.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAction(opt.value)}
                    className="w-full"
                  >
                    {opt.label}
                  </Button>
                ))}
                <Button
                  variant={action === "random" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAction("random")}
                  className="w-full"
                >
                  ランダム
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>カラーセット</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {COLOR_SETS.map((set) => (
                  <Button
                    key={set.label}
                    variant={
                      foreColor === set.foreColor && backColor === set.backColor
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => {
                      setForeColor(set.foreColor);
                      setBackColor(set.backColor);
                    }}
                    className="w-full flex items-center gap-2"
                  >
                    <div
                      className="w-4 h-4 rounded border border-slate-200"
                      style={{ backgroundColor: set.backColor }}
                    />
                    {set.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t">
              <div className="space-y-2">
                <Label>キャンバスの幅 (Width)</Label>
                <div className="grid grid-cols-4 gap-2">
                  {WIDTHS.map((w) => (
                    <Button
                      key={w.value}
                      variant={width === w.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setWidth(w.value)}
                      className="w-full"
                    >
                      {w.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>高さの比率 (Width × 比率 = Height)</Label>
                <div className="grid grid-cols-5 gap-2">
                  {HEIGHT_RATIOS.map((r) => (
                    <Button
                      key={r.label}
                      variant={
                        Math.abs(height / width - r.ratio) < 0.01
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handleRatioClick(r.ratio)}
                      className="w-full px-0"
                    >
                      {r.label}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      高さ直接指定 (px)
                    </Label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="pt-6 font-mono text-sm text-muted-foreground">
                    {width} × {height}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={handlePreview}>
                表示（プレビュー）
              </Button>
            </div>

            <Button
              className="w-full py-6 text-lg font-bold"
              onClick={handleRegister}
              disabled={isLoading || !text.trim()}
            >
              {isLoading ? "登録中..." : "この内容で登録する"}
            </Button>
          </div>

          <div className="space-y-4" ref={containerRef}>
            <div className="flex items-center justify-between">
              <Label>プレビュー</Label>
              <span className="text-xs text-muted-foreground">
                表示倍率: {Math.round(scale * 100)}%
              </span>
            </div>
            <div className="bg-slate-50 rounded-xl flex items-start justify-center min-h-[400px] border border-dashed border-slate-200 overflow-hidden p-4">
              {previewText ? (
                <div
                  className="flex items-center justify-center origin-top transition-transform duration-300"
                  style={{
                    transform: `scale(${scale})`,
                    width: `${width}px`,
                    height: `${height}px`,
                  }}
                >
                  <div
                    key={`${previewText}-${type}-${action}-${width}-${height}-${foreColor}-${backColor}`}
                    ref={displayRef}
                    className="shadow-lg border border-slate-100 overflow-hidden"
                    style={{
                      width: `${width}px`,
                      height: `${height}px`,
                    }}
                  >
                    <KinemojiDisplay
                      text={previewText}
                      parameters={{
                        type,
                        action,
                        width,
                        height,
                        foreColor,
                        backColor,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center">
                  <p className="text-slate-400 text-sm">プレビューエリア</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
