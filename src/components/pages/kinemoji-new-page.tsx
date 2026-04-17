"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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

// URL パラメータで受け付ける type の型（lupin, typewriter, zoom）
type UrlAnimationType = "lupin" | "typewriter" | "zoom";

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

// typewriter は lupin と同じアニメーション（lupin-display を使用）
const TYPEWRITER_ACTIONS: { value: AnimationAction; label: string }[] = [
  { value: "typewriter", label: "タイピング" },
];

const COLOR_SETS = [
  { label: "黒地に白", foreColor: "#ffffff", backColor: "#000000" },
  { label: "白地に黒", foreColor: "#000000", backColor: "#ffffff" },
];

export function KinemojiNewPage() {
  const searchParams = useSearchParams();
  const urlType = searchParams.get("type");

  // URL パラメータから初期値を設定
  let initialType: AnimationType = "direction";
  let initialAction: AnimationAction | undefined = undefined;

  if (urlType === "lupin") {
    initialType = "lupin";
    initialAction = "typewriter";
  } else if (urlType === "typewriter") {
    // typewriter は独立した型として扱う（lupin-display を使用）
    initialType = "typewriter";
    initialAction = "fade";
  } else if (urlType === "zoom") {
    initialType = "zoom";
    initialAction = "in";
  } else if (urlType === "direction") {
    initialType = "direction";
    initialAction = "down";
  }

  const [text, setText] = useState("");
  const [type, setType] = useState<AnimationType>(initialType);
  const [action, setAction] = useState<AnimationAction>(
    initialAction ??
      (initialType === "direction"
        ? "down"
        : initialType === "zoom"
          ? "in"
          : "typewriter") /* lupin */,
  );
  const [foreColor, setForeColor] = useState("#ffffff");
  const [backColor, setBackColor] = useState("#000000");
  const [previewText, setPreviewText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scale, setScale] = useState(1);
  const displayRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // デフォルトサイズ
  const width = 400;
  const height = 300;

  useEffect(() => {
    const updateScale = () => {
      if (previewContainerRef.current) {
        const isMobile = window.innerWidth < 768;
        const padding = isMobile ? 0 : 64; // モバイル時はカードのパディングを0にする
        const containerWidth =
          previewContainerRef.current.offsetWidth - padding;
        const s = Math.min(1, containerWidth / width);
        setScale(s);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const handleTypeChange = (newType: AnimationType) => {
    setType(newType);
    if (newType === "direction") {
      setAction("down");
    } else if (newType === "zoom") {
      setAction("in");
    } else if (newType === "opacity") {
      setAction("fade");
    } else if (newType === "lupin") {
      setAction("typewriter");
    } else if (newType === "typewriter") {
      setAction("fade");
    }
  };

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
    console.log("Registering new Kinemoji with parameters:", {
      text,
      type,
      action,
      foreColor,
      backColor,
    });
    setIsLoading(true);
    try {
      // 直接 GIF 生成 API を叩く（データの登録も外部 API 側で行われる）
      const gifResponse = await fetch("/kinemoji/gif", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          parameters: {
            type,
            action,
            foreColor,
            backColor,
          },
        }),
      });

      if (!gifResponse.ok) {
        throw new Error("GIF 生成リクエストに失敗しました");
      }

      const { id } = await gifResponse.json();
      console.log("GIF generation started:", { id });

      // ポーリングで完了を待つ（最大 120 秒）
      // 一覧側の画面で待つこととするの以下の処理は不要

      // let status = "pending";
      // let shortId = "";
      // let attempts = 0;
      // const maxAttempts = 60; // 2 秒間隔で 120 秒

      // while (
      //   (status === "pending" || status === "processing") &&
      //   attempts < maxAttempts
      // ) {
      //   await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 秒待機

      //   const statusResponse = await fetch(`/kinemoji/status/${id}`);
      //   if (statusResponse.ok) {
      //     const data = await statusResponse.json();
      //     status = data.status;
      //     // shortId が取得できれば保存（完了後の遷移に使用）
      //     // API のレスポンスに shortId が含まれていない場合は id をそのまま使う
      //     shortId = data.shortId || data.id;

      //     if (status === "completed") {
      //       break;
      //     }
      //     if (status === "failed") {
      //       throw new Error(data.error || "GIF 生成に失敗しました");
      //     }
      //   }
      //   attempts++;
      // }

      // if (status !== "completed") {
      //   throw new Error("GIF 生成がタイムアウトしました");
      // }

      toast.success("作成開始！");
      router.push(`/kinemoji/list?id=${id}`);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        error instanceof Error ? error.message : "エラーが発生しました",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <CardHeader className="px-0 pt-0 pb-8">
          <div className="flex items-center gap-4">
            <CardTitle className="text-3xl font-bold tracking-tight">
              Kinemoji を新しく作る
            </CardTitle>
            <span className="text-sm font-semibold bg-neutral-100 px-3 py-1 rounded-full text-neutral-700 uppercase tracking-wider">
              Type:{" "}
              {urlType === "lupin"
                ? "LUPIN"
                : urlType === "typewriter"
                  ? "TYPEWRITER"
                  : urlType === "zoom"
                    ? "ZOOM"
                    : urlType === "direction"
                      ? "DIRECTION"
                      : type.toUpperCase()}
            </span>
            <Link href={`/kinemoji/list${urlType ? `?type=${urlType}` : ""}`}>
              <Button
                size="sm"
                className="rounded-full bg-orange-600 hover:bg-orange-700 font-bold text-base"
              >
                Gallery
              </Button>
            </Link>
          </div>
          <p className="text-neutral-500 mt-2">
            {urlType === "lupin"
              ? "ルパンアニメーションでキネ文字を作成しましょう。"
              : urlType === "typewriter"
                ? "タイピングアニメーションでキネ文字を作成しましょう。"
                : urlType === "zoom"
                  ? "ズームアニメーションでキネ文字を作成しましょう。"
                  : urlType === "direction"
                    ? "移動アニメーションでキネ文字を作成しましょう。"
                    : "あなただけのキネ文字を作成しましょう。"}
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-12 px-0">
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <Label
                  htmlFor="text"
                  className="text-sm font-semibold uppercase tracking-wider text-neutral-500"
                >
                  表示する文字列
                </Label>
                <span
                  className={`text-xs font-medium ${text.length >= 100 ? "text-red-500" : "text-neutral-400"}`}
                >
                  {text.length} / 100
                </span>
              </div>
              <Textarea
                id="text"
                placeholder="一行目&#10;二行目"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={100}
                className="min-h-[120px] resize-y rounded-xl border-neutral-200 focus:ring-orange-500 focus:border-orange-500 text-lg"
              />
            </div>

            {/* lupin/typewriter の場合はアクション選択を表示しない */}
            {type !== "lupin" && type !== "typewriter" && (
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
                        : []
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
            )}

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

            <div className="flex justify-end gap-3 pt-6 border-t border-neutral-100">
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
              {isLoading ? "処理中..." : "Kinemoji を作成開始する"}
            </Button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                プレビュー
              </Label>
            </div>
            <div
              ref={previewContainerRef}
              className="bg-neutral-100 rounded-3xl flex items-center justify-center min-h-[300px] md:min-h-[500px] border-2 border-dashed border-neutral-200 overflow-hidden p-0 md:p-8 shadow-inner"
            >
              {previewText ? (
                <div
                  ref={displayRef}
                  className="shadow-2xl rounded-sm overflow-hidden ring-4 md:ring-8 ring-white/50 origin-center transition-transform shrink-0"
                  style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    transform: `scale(${scale})`,
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
                GIF生成開始には少し時間がかかる場合があります。開始中はページを閉じないでお待ちください。
              </p>
            </div>
          </div>
        </CardContent>
      </div>
    </div>
  );
}
