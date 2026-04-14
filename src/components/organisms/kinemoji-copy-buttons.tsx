"use client";

import { ExternalLink, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KinemojiCopyButtonsProps {
  shortId: string;
  text: string;
  imageUrl?: string | null;
}

export function KinemojiCopyButtons({
  shortId,
  text,
  imageUrl,
}: KinemojiCopyButtonsProps) {
  const copyToClipboard = async (content: string, label: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = content;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      alert(`${label}をコピーしました！`);
    } catch (err) {
      console.error("Copy failed:", err);
      alert("コピーに失敗しました");
    }
  };

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/kinemoji/${shortId}`;

  const handleXPost = () => {
    const xText = encodeURIComponent(`${text}\n#kinemoji`);
    const xUrl = encodeURIComponent(shareUrl);
    window.open(
      `https://x.com/intent/post?text=${xText}&url=${xUrl}`,
      "_blank",
    );
  };

  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex items-center gap-1 group">
        <Button
          variant="outline"
          onClick={() => copyToClipboard(shareUrl, "共有URL")}
          className="rounded-lg border-neutral-200 hover:border-neutral-900 transition-all font-medium text-xs h-9"
        >
          共有URL
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-all"
          onClick={() => {
            window.open(shareUrl, "_blank");
          }}
          title="別タブで開く"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      {imageUrl && (
        <div className="flex items-center gap-1 group">
          <Button
            variant="outline"
            onClick={() => copyToClipboard(imageUrl, "画像URL")}
            className="rounded-lg border-neutral-200 hover:border-neutral-900 transition-all font-medium text-xs h-9"
          >
            画像URL
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-all"
            onClick={() => {
              window.open(imageUrl, "_blank");
            }}
            title="画像を別タブで開く"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      )}
      <Button
        variant="default"
        className="bg-neutral-900 hover:bg-neutral-800 text-white flex items-center gap-2 rounded-lg px-4 font-bold text-xs h-9 shadow-md transition-transform active:scale-95"
        onClick={handleXPost}
      >
        <Send className="h-4 w-4" />
        Xにポスト
      </Button>
    </div>
  );
}
