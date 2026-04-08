"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { KinemojiDisplay } from "@/components/organisms/kinemoji-display";
import { KinemojiCopyButtons } from "@/components/organisms/kinemoji-copy-buttons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Kinemoji {
  id: string;
  shortId: string;
  text: string;
  parameters: string | null;
  imageUrl: string | null;
  createdAt: string;
}

function KinemojiListContent() {
  const [list, setList] = useState<Kinemoji[]>([]);
  const [selected, setSelected] = useState<Kinemoji | null>(null);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetId = searchParams.get("id");

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setList(data);

          if (targetId) {
            const found = data.find((item) => item.id === targetId);
            if (found) {
              setSelected(found);
              return;
            }
          }

          if (data.length > 0 && !selected) {
            setSelected(data[0]);
          }
        }
      });
  }, [targetId]);

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

        const containerWidth = containerRef.current.offsetWidth - 80; // p-10 = 80px padding
        const s = Math.min(1, containerWidth / width);
        setScale(s);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [selected]);

  return (
    <div className="container mx-auto py-10 flex flex-col md:flex-row gap-6 px-4">
      <div className="w-full md:w-1/3 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">作成済み一覧</h2>
          <Button
            variant="outline"
            onClick={() => router.push("/kinemoji/new")}
          >
            新規作成
          </Button>
        </div>
        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
          {list.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selected?.id === item.id
                  ? "bg-black text-white border-black"
                  : "bg-card hover:bg-slate-50 border-slate-200"
              }`}
              onClick={() => setSelected(item)}
            >
              <p className="font-medium truncate">{item.text}</p>
              <p className="text-xs opacity-70">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
          {list.length === 0 && (
            <p className="text-center text-slate-500 py-10 border rounded-lg border-dashed">
              まだありません
            </p>
          )}
        </div>
      </div>

      <div className="flex-1" ref={containerRef}>
        {selected ? (
          <Card className="h-full min-h-[400px] flex flex-col items-center justify-center p-10 bg-slate-50 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-xs text-slate-400">
              ID: {selected.shortId}
            </div>
            <div
              key={`${selected.id}-${selected.parameters}`}
              className="flex justify-center transition-transform duration-300 origin-center cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                transform: `scale(${scale})`,
              }}
              onClick={() => {
                window.open(`/kinemoji/${selected.shortId}`, "_blank");
              }}
              title="別タブで詳細を開く"
            >
              <KinemojiDisplay
                text={selected.text}
                parameters={selected.parameters || undefined}
              />
            </div>
            <div className="mt-10">
              <KinemojiCopyButtons
                shortId={selected.shortId}
                text={selected.text}
                imageUrl={selected.imageUrl}
              />
            </div>
          </Card>
        ) : (
          <div className="h-full min-h-[400px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg">
            選択してください
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
