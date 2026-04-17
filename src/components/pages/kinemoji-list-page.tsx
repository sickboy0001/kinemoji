"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { KinemojiDisplay } from "@/components/organisms/kinemoji-display";
import { KinemojiCopyButtons } from "@/components/organisms/kinemoji-copy-buttons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HOME_KINEMOJI_TYPES } from "@/constants/kinemoji-types";
import { ensureMillisecondTimestamp } from "@/lib/utils";

async function fetchKinemojiById(id: string) {
  try {
    const response = await fetch(`/api/kinemoji/${id}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return {
      ...data,
      status: data.status || data.gif_status || null,
      progress: data.progress ?? data.gif_progress ?? null,
      error: data.error || data.gif_error || null,
      createdAt: data.createdAt
        ? new Date(ensureMillisecondTimestamp(data.createdAt)).toISOString()
        : new Date().toISOString(),
      updatedAt: data.updatedAt
        ? new Date(ensureMillisecondTimestamp(data.updatedAt)).toISOString()
        : null,
    };
  } catch (error) {
    console.error("Error fetching kinemoji:", error);
    return null;
  }
}

interface Kinemoji {
  id: string;
  shortId: string;
  text: string;
  parameters: string | null;
  imageUrl: string | null;
  status: "pending" | "processing" | "completed" | "failed" | null;
  progress: number | null;
  error: string | null;
  createdAt: string;
  updatedAt: string | null;
}

function KinemojiListContent() {
  const [list, setList] = useState<Kinemoji[]>([]);
  const [selected, setSelected] = useState<Kinemoji | null>(null);
  const [scale, setScale] = useState(1);
  const [baseWidth, setBaseWidth] = useState(800);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetId = searchParams.get("id");
  const filterType = searchParams.get("type"); // type パラメータを取得
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // リストの取得
  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // updatedAt を含むようにマッピング
          const mappedData = data.map((item) => ({
            ...item,
            createdAt: item.createdAt
              ? new Date(
                  ensureMillisecondTimestamp(item.createdAt),
                ).toISOString()
              : new Date().toISOString(),
            updatedAt: item.updatedAt
              ? new Date(
                  ensureMillisecondTimestamp(item.updatedAt),
                ).toISOString()
              : null,
          }));

          // type パラメータがある場合はフィルタリング
          const filteredData = filterType
            ? mappedData.filter((item) => {
                if (!item.parameters) return false;
                try {
                  const params = JSON.parse(item.parameters);
                  return params.type === filterType;
                } catch {
                  return false;
                }
              })
            : mappedData;

          setList(filteredData);

          if (targetId) {
            const found = filteredData.find((item) => item.id === targetId);
            if (found) {
              setSelected(found);
              return;
            }
          }

          if (filteredData.length > 0 && !selected) {
            setSelected(filteredData[0]);
          }
        }
      });
  }, [targetId, filterType]);

  // 選択されたアイテムのポーリング（GIF 生成状況の更新）
  useEffect(() => {
    if (
      !selected ||
      selected.status === "completed" ||
      selected.status === "failed"
    ) {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    const poll = async () => {
      const updated = await fetchKinemojiById(selected.shortId);
      if (updated) {
        setSelected(updated);
        // リストも更新
        setList((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );
      }

      if (updated?.status !== "completed" && updated?.status !== "failed") {
        pollingRef.current = setTimeout(poll, 2000);
      }
    };

    poll();

    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [selected?.id]);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current && selected) {
        let width = 800; // default
        if (selected.parameters) {
          try {
            const params = JSON.parse(selected.parameters);
            width = params.width || 800;
          } catch (e) {}
        }
        setBaseWidth(width);

        const isMobile = window.innerWidth < 768;
        const padding = isMobile ? 0 : 80; // モバイル時はカードのパディングを0にするので計算からも除く
        const containerWidth = containerRef.current.offsetWidth - padding;
        const s = Math.min(1, containerWidth / width);
        setScale(s);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [selected]);

  return (
    <div className="container mx-auto py-6 md:py-12 flex flex-col md:flex-row gap-6 md:gap-12 px-4 md:px-6">
      <div className="w-full md:w-80 space-y-6 md:space-y-8">
        <div className="flex items-center justify-between md:justify-start gap-4">
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">
            Gallery
          </h2>
          <Button
            variant="default"
            onClick={() => {
              const type = filterType || "typewriter";
              router.push(`/kinemoji/new?type=${type}`);
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-full font-bold text-sm md:text-base shadow-lg shadow-orange-100 h-9 md:h-10 px-4 md:px-6"
          >
            新規作成
          </Button>
        </div>
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:inline-flex md:rounded-full md:border md:border-neutral-200 md:overflow-hidden no-scrollbar">
          <div className="flex md:inline-flex rounded-full border border-neutral-200 overflow-hidden shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("type");
                router.push(
                  `/kinemoji/list${params.toString() ? `?${params.toString()}` : ""}`,
                );
              }}
              className={`rounded-none h-8 md:h-9 px-3 md:px-4 border-r border-neutral-200 font-bold text-xs md:text-sm ${
                !filterType
                  ? "bg-neutral-100 text-neutral-900"
                  : "bg-white text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              All
            </Button>
            {HOME_KINEMOJI_TYPES.map((kinemojiType, index) => (
              <Link
                key={kinemojiType.type}
                href={`/kinemoji/list?type=${kinemojiType.type}`}
                className="shrink-0"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-none h-8 md:h-9 px-3 md:px-4 font-bold text-xs md:text-sm ${
                    index < HOME_KINEMOJI_TYPES.length - 1
                      ? "border-r border-neutral-200"
                      : ""
                  } ${
                    filterType === kinemojiType.type
                      ? "bg-neutral-100 text-neutral-900"
                      : "bg-white text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {kinemojiType.type}
                </Button>
              </Link>
            ))}
          </div>
        </div>
        <div className="space-y-3 max-h-[30vh] md:max-h-[60vh] overflow-y-auto pr-2 md:pr-3 custom-scrollbar">
          {list.map((item) => (
            <div
              key={item.id}
              className={`p-4 md:p-5 rounded-xl md:rounded-2xl border transition-all duration-300 group cursor-pointer ${
                selected?.id === item.id
                  ? "bg-neutral-900 text-white border-neutral-900 shadow-xl -translate-y-1"
                  : "bg-white hover:bg-neutral-50 border-neutral-100 hover:border-neutral-300"
              }`}
              onClick={() => setSelected(item)}
            >
              <p className="font-bold truncate text-base md:text-lg tracking-tight">
                {item.text}
              </p>
              <div className="flex items-center justify-between mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                <p className="text-[9px] md:text-[10px] font-medium uppercase tracking-widest">
                  {(() => {
                    const date = new Date(item.createdAt);
                    return `${date.toLocaleDateString()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
                  })()}
                </p>
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              </div>
            </div>
          ))}
          {list.length === 0 && (
            <div className="text-center py-12 md:py-16 border-2 border-dashed border-neutral-100 rounded-2xl md:rounded-3xl bg-neutral-50/50">
              <p className="text-neutral-400 text-xs md:text-sm font-medium">
                まだ作品がありません
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0" ref={containerRef}>
        {selected ? (
          <div className="h-full flex flex-col gap-4 md:gap-6">
            <Card className="flex-1 aspect-video md:aspect-auto md:min-h-[500px] flex flex-col items-center justify-center p-0 md:p-12 bg-neutral-100 border-none rounded-xl md:rounded-[2rem] relative overflow-hidden shadow-inner">
              <div className="absolute top-3 left-3 md:top-8 md:left-8 flex items-center gap-2 z-20 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-neutral-500">
                  Preview
                </span>
              </div>
              <div className="absolute top-3 right-3 md:top-8 md:right-8 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-full shadow-sm z-20">
                <span className="text-[8px] md:text-[10px] font-bold text-neutral-500">
                  #{selected.shortId}
                </span>
              </div>

              <div
                key={`${selected.id}-${selected.parameters}-${selected.imageUrl}`}
                className="flex justify-center origin-center cursor-pointer hover:scale-[1.02] active:scale-[0.98] shrink-0 z-10"
                style={{
                  transform: `scale(${scale})`,
                  width: `${baseWidth}px`,
                }}
                onClick={() => {
                  window.open(`/kinemoji/${selected.shortId}`, "_blank");
                }}
                title="別タブで詳細を開く"
              >
                <div className="shadow-2xl rounded-sm overflow-hidden ring-0 md:ring-12 ring-white/30 transition-shadow hover:ring-white/50 bg-white">
                  {selected.imageUrl &&
                  (selected.status === "completed" ||
                    selected.status === null) ? (
                    <img
                      src={selected.imageUrl}
                      alt={selected.text}
                      className="w-full h-auto"
                    />
                  ) : selected.status === "processing" ? (
                    <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex flex-col items-center justify-center bg-neutral-100">
                      <p className="text-base md:text-lg font-medium mb-3 md:mb-4">
                        GIF 生成中...
                      </p>
                      <div className="w-48 md:w-64 bg-neutral-200 rounded-full h-3 md:h-4 mb-3 md:mb-4">
                        <div
                          className="bg-orange-500 h-3 md:h-4 rounded-full transition-all"
                          style={{ width: `${selected.progress || 0}%` }}
                        />
                      </div>
                      <p className="text-xs md:text-sm text-neutral-500">
                        {selected.progress || 0}%
                      </p>
                    </div>
                  ) : selected.status === "pending" ? (
                    <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex flex-col items-center justify-center bg-neutral-100 p-4">
                      <p className="text-base md:text-lg font-medium mb-3 md:mb-4">
                        GIF 生成待ち...
                      </p>
                      <Button
                        size="sm"
                        onClick={() => window.location.reload()}
                      >
                        再試行
                      </Button>
                    </div>
                  ) : selected.status === "failed" ? (
                    <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex flex-col items-center justify-center bg-neutral-100 p-4 text-center">
                      <p className="text-base md:text-lg font-medium mb-3 md:mb-4 text-red-500">
                        GIF 生成に失敗しました
                      </p>
                      {selected.error && (
                        <p className="text-xs md:text-sm text-neutral-500 mb-3 md:mb-4 line-clamp-2">
                          {selected.error}
                        </p>
                      )}
                      <Button
                        size="sm"
                        onClick={() => window.location.reload()}
                      >
                        再試行
                      </Button>
                    </div>
                  ) : (
                    <KinemojiDisplay
                      text={selected.text}
                      parameters={selected.parameters || undefined}
                    />
                  )}
                </div>
              </div>
            </Card>

            <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-neutral-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
              <div className="space-y-1 text-center md:text-left">
                <h3 className="text-lg md:text-xl font-black tracking-tight">
                  {selected.text}
                </h3>
                <div className="space-y-0.5 md:space-y-1">
                  <p className="text-[10px] md:text-xs text-neutral-400 font-medium uppercase tracking-tighter">
                    Created on {new Date(selected.createdAt).toLocaleString()}
                  </p>
                  {selected.updatedAt &&
                    selected.updatedAt !== selected.createdAt && (
                      <p className="text-[10px] md:text-xs text-neutral-400 font-medium uppercase tracking-tighter">
                        Updated on{" "}
                        {new Date(selected.updatedAt).toLocaleString()}
                      </p>
                    )}
                </div>
              </div>
              <KinemojiCopyButtons
                shortId={selected.shortId}
                text={selected.text}
                imageUrl={selected.imageUrl}
              />
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[300px] md:min-h-[500px] flex flex-col items-center justify-center text-neutral-300 bg-neutral-50 rounded-[1.5rem] md:rounded-[2rem] border-2 border-dashed border-neutral-200 gap-4 p-8">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-neutral-100 flex items-center justify-center">
              <ExternalLink className="w-6 h-6 md:w-8 md:h-8 opacity-20" />
            </div>
            <p className="font-bold uppercase tracking-widest text-[10px] md:text-xs text-center">
              作品を選択してください
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function KinemojiListPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">読み込み中...</div>}>
      <KinemojiListContent />
    </Suspense>
  );
}
