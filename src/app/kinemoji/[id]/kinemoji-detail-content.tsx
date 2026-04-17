"use client";

import { KinemojiDisplay } from "@/components/organisms/kinemoji-display";
import { KinemojiCopyButtons } from "@/components/organisms/kinemoji-copy-buttons";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Kinemoji {
  id: string;
  shortId: string;
  text: string;
  parameters: string | null;
  imageUrl: string | null;
  status: "pending" | "processing" | "completed" | "failed" | null;
  progress: number | null;
  error: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

async function fetchKinemoji(id: string): Promise<Kinemoji | null> {
  try {
    const response = await fetch(`/api/kinemoji/${id}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    console.log("Raw API response:", data);
    // createdAt と updatedAt を Date オブジェクトに変換
    // status が gif_status という名前で返される場合のマッピング
    return {
      ...data,
      status: data.status || data.gif_status || null,
      progress: data.progress ?? data.gif_progress ?? null,
      error: data.error || data.gif_error || null,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : null,
    };
  } catch (error) {
    console.error("Error fetching kinemoji:", error);
    return null;
  }
}

interface KinemojiDetailContentProps {
  id: string;
}

export function KinemojiDetailContent({ id }: KinemojiDetailContentProps) {
  const [kinemoji, setKinemoji] = useState<Kinemoji | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const loadKinemoji = async () => {
      const data = await fetchKinemoji(id);
      console.log("Fetched kinemoji data:", data);
      setKinemoji(data);
      setLoading(false);

      // GIF 生成完了するまでポーリング
      if (data && data.status !== "completed" && data.status !== "failed") {
        timer = setTimeout(loadKinemoji, 2000);
      }
    };

    loadKinemoji();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6 md:p-12">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  if (!kinemoji) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6 md:p-12">
        <div className="text-center">データが見つかりません</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4 md:p-12">
      <div className="bg-white p-4 md:p-8 rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden max-w-2xl w-full">
        {/* Title */}
        <h1 className="text-xl md:text-3xl font-bold text-center text-neutral-800 mb-1 md:mb-2">
          {kinemoji.text}
        </h1>
        {/* Description */}
        <p className="text-center text-xs md:text-sm text-neutral-500 mb-4 md:mb-6 uppercase tracking-widest font-bold">
          kinemoji
        </p>
        <div className="bg-white p-1 md:p-2 rounded-xl md:rounded-2xl shadow-inner border border-neutral-100 overflow-hidden">
          {kinemoji.imageUrl &&
          (kinemoji.status === "completed" || kinemoji.status === null) ? (
            <>
              <div className="flex justify-center">
                <img
                  src={kinemoji.imageUrl}
                  alt={kinemoji.text}
                  className="max-w-full h-auto shadow-sm"
                />
              </div>
              <div className="mt-4 md:mt-6">
                <KinemojiCopyButtons
                  shortId={kinemoji.shortId}
                  text={kinemoji.text}
                  imageUrl={kinemoji.imageUrl}
                />
              </div>
            </>
          ) : kinemoji.status === "processing" ? (
            <div className="text-center p-6 md:p-8">
              <p className="text-base md:text-lg font-medium mb-3 md:mb-4">
                GIF 生成中...
              </p>
              <div className="w-full bg-neutral-200 rounded-full h-3 md:h-4 mb-3 md:mb-4">
                <div
                  className="bg-orange-500 h-3 md:h-4 rounded-full transition-all"
                  style={{ width: `${kinemoji.progress || 0}%` }}
                />
              </div>
              <p className="text-xs md:text-sm text-neutral-500">
                {kinemoji.progress || 0}%
              </p>
            </div>
          ) : kinemoji.status === "pending" ? (
            <div className="text-center p-6 md:p-8">
              <p className="text-base md:text-lg font-medium mb-3 md:mb-4">
                GIF 生成待ち...
              </p>
              <Button size="sm" onClick={() => window.location.reload()}>
                再試行
              </Button>
            </div>
          ) : kinemoji.status === "failed" ? (
            <div className="text-center p-6 md:p-8">
              <p className="text-base md:text-lg font-medium mb-3 md:mb-4 text-red-500">
                GIF 生成に失敗しました
              </p>
              {kinemoji.error && (
                <p className="text-xs md:text-sm text-neutral-500 mb-3 md:mb-4">
                  {kinemoji.error}
                </p>
              )}
              <Button size="sm" onClick={() => window.location.reload()}>
                再試行
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <KinemojiDisplay
                text={kinemoji.text}
                parameters={kinemoji.parameters || undefined}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
