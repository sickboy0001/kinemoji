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
    const xText = encodeURIComponent(`${text}\n#キネ文字 #kinemoji`);
    const xUrl = encodeURIComponent(shareUrl);
    window.open(
      `https://x.com/intent/post?text=${xText}&url=${xUrl}`,
      "_blank",
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          onClick={() => copyToClipboard(shareUrl, "共有URL")}
        >
          共有URLをコピー
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={() => {
            window.open(shareUrl, "_blank");
          }}
          title="別タブで開く"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      <Button
        variant="default"
        className="bg-black hover:bg-slate-800 text-white flex items-center gap-2"
        onClick={handleXPost}
      >
        <Send className="h-4 w-4" />
        Xでポスト
      </Button>

      {imageUrl && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            onClick={() => copyToClipboard(imageUrl, "画像URL")}
          >
            画像URLをコピー
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => {
              window.open(imageUrl, "_blank");
            }}
            title="画像を別タブで開く"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
