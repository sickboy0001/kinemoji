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
      // 1. レコードを作成（status: "processing"）
      const createResponse = await fetch("/api/kinemoji/create", {
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
        }),
      });

      if (!createResponse.ok) {
        throw new Error("レコード作成に失敗しました");
      }

      const { id, shortId } = await createResponse.json();
      console.log("Kinemoji created:", { id, shortId });

      // 2. GIF の生成とアップロード（サーバーサイド API を呼び出す）
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

      // 3. ステータスを更新（status: "completed" または "failed"）
      const updateStatus = imageUrl ? "completed" : "failed";
      const updateProgress = imageUrl ? 100 : 0;

      const updateResponse = await fetch("/api/kinemoji/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: updateStatus,
          progress: updateProgress,
          imageUrl: imageUrl || undefined,
          error: imageUrl ? undefined : "GIF 生成に失敗しました",
        }),
      });

      if (!updateResponse.ok) {
        console.error("Status update failed:", await updateResponse.text());
      }

      toast.success("作成しました！");
      router.push(`/kinemoji/list?id=${shortId}`);
    } catch (error) {
      toast.error("エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-6">
      <Card className="max-w-6xl mx-auto border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0 pb-8">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Kinemoji を新しく作る
          </CardTitle>
          <p className="text-neutral-500 mt-2">
            アニメーションを選んで、あなただけのキネ文字を作成しましょう。
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-12 px-0">
          <div className="space-y-8">
            <div className="space-y-3">
              <Label
                htmlFor="text"
                className="text-sm font-semibold uppercase tracking-wider text-neutral-500"
              >
                表示する文字列
              </Label>
              <Textarea
                id="text"
                placeholder="一行目&#10;二行目"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={100}
                className="min-h-[120px] resize-y rounded-xl border-neutral-200 focus:ring-orange-500 focus:border-orange-500 text-lg"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                アニメーション・タイプ
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TYPE_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={type === opt.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTypeChange(opt.value)}
                    className={`w-full rounded-lg h-10 transition-all ${type === opt.value ? "bg-neutral-900 text-white shadow-md" : "border-neutral-200 hover:border-orange-500 hover:text-orange-600"}`}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                アクション
              </Label>
              <div className="grid grid-cols-2 gap-3">
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
                    className={`w-full rounded-lg h-10 transition-all ${action === opt.value ? "bg-neutral-900 text-white shadow-md" : "border-neutral-200 hover:border-orange-500 hover:text-orange-600"}`}
                  >
                    {opt.label}
                  </Button>
                ))}
                <Button
                  variant={action === "random" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAction("random")}
                  className={`w-full rounded-lg h-10 transition-all ${action === "random" ? "bg-neutral-900 text-white shadow-md" : "border-neutral-200 hover:border-orange-500 hover:text-orange-600"}`}
                >
                  ランダム
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                カラーセット
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {COLOR_SETS.map((set) => (
                  <Button
                    key={set.label}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setForeColor(set.foreColor);
                      setBackColor(set.backColor);
                    }}
                    className={`w-full flex items-center gap-2 rounded-lg h-10 transition-all ${
                      foreColor === set.foreColor && backColor === set.backColor
                        ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900"
                        : "border-neutral-200 hover:border-orange-500"
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-neutral-200"
                      style={{ backgroundColor: set.backColor }}
                    />
                    {set.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-neutral-100">
              <div className="space-y-3">
                <Label className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                  キャンバスの幅 (Width)
                </Label>
                <div className="grid grid-cols-4 gap-3">
                  {WIDTHS.map((w) => (
                    <Button
                      key={w.value}
                      variant={width === w.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setWidth(w.value)}
                      className={`w-full rounded-lg h-10 transition-all ${width === w.value ? "bg-neutral-900 text-white shadow-md" : "border-neutral-200 hover:border-orange-500 hover:text-orange-600"}`}
                    >
                      {w.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                  高さの比率
                </Label>
                <div className="grid grid-cols-5 gap-3">
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
                      className={`w-full px-0 rounded-lg h-10 transition-all ${Math.abs(height / width - r.ratio) < 0.01 ? "bg-neutral-900 text-white shadow-md" : "border-neutral-200 hover:border-orange-500 hover:text-orange-600"}`}
                    >
                      {r.label}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-6 mt-4 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                  <div className="flex-1 space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-neutral-400">
                      高さ直接指定 (px)
                    </Label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full h-10 rounded-lg border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm transition-all focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                  <div className="pt-6 font-mono text-xl font-bold text-neutral-900">
                    {width} <span className="text-neutral-300">×</span> {height}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={handlePreview}
                className="rounded-lg h-12 px-8 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold"
              >
                プレビュー更新
              </Button>
            </div>

            <Button
              className="w-full py-8 text-xl font-black uppercase tracking-tighter rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-200 transition-all hover:-translate-y-1 active:translate-y-0"
              onClick={handleRegister}
              disabled={isLoading || !text.trim()}
            >
              {isLoading ? "処理中..." : "Kinemoji を保存する"}
            </Button>
          </div>

          <div className="space-y-6" ref={containerRef}>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                リアルタイムプレビュー
              </Label>
              <span className="text-[10px] font-bold bg-neutral-100 px-2 py-1 rounded-full text-neutral-500 uppercase">
                Zoom: {Math.round(scale * 100)}%
              </span>
            </div>
            <div className="bg-neutral-100 rounded-3xl flex items-start justify-center min-h-[500px] border-2 border-dashed border-neutral-200 overflow-hidden p-8 shadow-inner">
              {previewText ? (
                <div
                  className="flex items-center justify-center origin-top transition-transform duration-500 ease-out"
                  style={{
                    transform: `scale(${scale})`,
                    width: `${width}px`,
                    height: `${height}px`,
                  }}
                >
                  <div
                    key={`${previewText}-${type}-${action}-${width}-${height}-${foreColor}-${backColor}`}
                    ref={displayRef}
                    className="shadow-2xl rounded-sm overflow-hidden ring-8 ring-white/50"
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
                <div className="h-[400px] flex flex-col items-center justify-center gap-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-neutral-300" />
                  </div>
                  <p className="text-neutral-400 text-sm font-medium">
                    テキストを入力して
                    <br />
                    プレビューを表示してください
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100">
              <h4 className="text-orange-900 font-bold text-sm mb-2 italic">
                Pro Tip:
              </h4>
              <p className="text-orange-800 text-xs leading-relaxed">
                GIF
                生成には少し時間がかかる場合があります。生成中はページを閉じないでお待ちください。
                背景色と文字色のコントラストを高くすると、より印象的な仕上がりになります。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
