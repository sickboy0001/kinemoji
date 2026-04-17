"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  HOME_KINEMOJI_TYPES,
  KINEMOJI_NEW_PATH,
} from "@/constants/kinemoji-types";
import { LupinDisplay } from "@/components/organisms/kinemoji/lupin-display";
import { TypewriterDisplay } from "@/components/organisms/kinemoji/typewriter-display";
import { StandardDisplay } from "@/components/organisms/kinemoji/standard-display";

const CATCHPHRASES = [
  { text: "あなたの言葉を、", type: "typewriter" },
  { text: "アニメーションに。", type: "standard" },
  { text: "GIFとして書き出し。", type: "lupin" },
];

export default function StartPage() {
  const [heroText, setHeroText] = useState("Kinemoji");
  const [catchphraseIndex, setCatchphraseIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCatchphraseIndex((prev) => (prev + 1) % CATCHPHRASES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateScale = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth - 32;
        const baseWidth = mobile ? 320 : 600;
        const s = Math.min(1, containerWidth / baseWidth);
        setScale(s);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans overflow-x-hidden">
      {/* ヒーローエリア */}
      <section className="relative pt-12 md:pt-20 pb-20 md:pb-32 px-4 overflow-hidden bg-slate-50">
        <div
          className="max-w-7xl mx-auto flex flex-col items-center text-center"
          ref={containerRef}
        >
          {/* 動くロゴ演出 */}
          <div
            className="mb-8 md:mb-12 shadow-2xl rounded-xl overflow-hidden bg-white origin-center transition-transform"
            style={{ transform: `scale(${scale})` }}
          >
            <LupinDisplay
              text={heroText}
              lines={[heroText]}
              canvasWidth={isMobile ? 320 : 600}
              canvasHeight={isMobile ? 120 : 200}
              fontSize={
                heroText.length > 10 ? (isMobile ? 24 : 40) : isMobile ? 48 : 80
              }
              foreColor="#000000"
              backColor="#ffffff"
            />
          </div>

          {/* 動くキャッチコピー */}
          <div className="h-16 mb-8 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={catchphraseIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="text-2xl md:text-3xl font-bold text-slate-800"
              >
                {CATCHPHRASES[catchphraseIndex].text}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* サンドボックス入力 */}
          <div className="w-full max-w-md mb-12">
            <div className="relative group">
              <Input
                value={heroText === "Kinemoji" ? "" : heroText}
                onChange={(e) => setHeroText(e.target.value || "Kinemoji")}
                placeholder="ここに文字を入力してみて..."
                className="h-14 text-lg px-6 rounded-full border-2 border-slate-200 focus:border-black transition-all bg-white shadow-lg group-hover:shadow-xl pr-24"
                maxLength={20}
              />
              <button
                onClick={() => {
                  const samples = [
                    "Hello!",
                    "Wow!",
                    "Amazing",
                    "Awesome",
                    "Kinemoji",
                    "Love it",
                    "Congrats",
                  ];
                  const random =
                    samples[Math.floor(Math.random() * samples.length)];
                  setHeroText(random);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-100 hover:bg-black hover:text-white px-4 py-2 rounded-full text-xs font-bold transition-all text-slate-600"
              >
                Try it!
              </button>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {["重大発表", "お疲れ様", "最高！", "Coming Soon"].map(
                (sample) => (
                  <button
                    key={sample}
                    onClick={() => setHeroText(sample)}
                    className="text-xs text-slate-400 hover:text-black hover:underline transition-all"
                  >
                    #{sample}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={`${KINEMOJI_NEW_PATH}?type=lupin`}>
              <Button
                size="lg"
                className="px-10 h-14 rounded-full text-lg font-bold bg-black hover:bg-slate-800 text-white shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto"
              >
                今すぐ作る
              </Button>
            </Link>
            <Link href="/kinemoji/list">
              <Button
                size="lg"
                variant="outline"
                className="px-10 h-14 rounded-full text-lg font-bold border-2 border-slate-200 hover:border-black transition-all w-full sm:w-auto"
              >
                ギャラリーを見る
              </Button>
            </Link>
          </div>
        </div>

        {/* 背景のタイポグラフィ・パーティクル */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none overflow-hidden -z-10">
          {[..."KinemojiウゴクモジGIFANIMATION"].map((char, i) => (
            <div
              key={i}
              className="absolute animate-float text-8xl font-black"
              style={{
                left: `${(i * 137.5) % 100}%`,
                top: `${(i * 123.4) % 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${15 + (i % 5)}s`,
              }}
            >
              {char}
            </div>
          ))}
        </div>
      </section>

      {/* スタイルカタログ */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Styles</h2>
            <p className="text-slate-500 text-lg">
              マウスホバーで演出をプレビュー
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOME_KINEMOJI_TYPES.map((type) => (
              <StyleCard key={type.type} type={type} heroText={heroText} />
            ))}
          </div>
        </div>
      </section>

      {/* 利用シーン */}
      <section className="py-24 px-4 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">
              Use Cases
            </h2>
            <p className="text-slate-500 text-lg">
              SNSやプレゼンを、もっと印象的に。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Twttier風 */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold">X風</div>
                  <div className="text-xs text-slate-400">Timeline Feed</div>
                </div>
              </div>
              <div className="aspect-[16/9] bg-white border border-slate-100 rounded-2xl overflow-hidden flex flex-col p-4 gap-4 max-w-[500px] mx-auto">
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
                  <div className="space-y-1 w-full">
                    <div className="h-3 bg-slate-200 rounded w-1/4" />
                    <div className="h-2 bg-slate-100 rounded w-full" />
                  </div>
                </div>
                <div className="flex-1 bg-black rounded-xl overflow-hidden flex items-center justify-center">
                  <LupinDisplay
                    text="重大発表"
                    lines={["重大発表"]}
                    canvasWidth={400}
                    canvasHeight={180}
                    fontSize={60}
                    foreColor="#ffffff"
                    backColor="#000000"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-1000px) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}

function StyleCard({ type, heroText }: { type: any; heroText: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={`${KINEMOJI_NEW_PATH}?type=${type.type}`}>
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -10 }}
        className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-slate-100 group cursor-pointer"
      >
        <div className="aspect-video bg-slate-100 overflow-hidden relative flex items-center justify-center">
          <AnimatePresence>
            {isHovered ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex items-center justify-center"
              >
                {type.type === "lupin" && (
                  <LupinDisplay
                    text={heroText}
                    lines={[heroText]}
                    canvasWidth={400}
                    canvasHeight={225}
                    fontSize={40}
                    foreColor="#000000"
                    backColor="#f8fafc"
                  />
                )}
                {type.type === "typewriter" && (
                  <TypewriterDisplay
                    text={heroText}
                    lines={[heroText]}
                    canvasWidth={400}
                    canvasHeight={225}
                    fontSize={40}
                    foreColor="#000000"
                    backColor="#f8fafc"
                  />
                )}
                {type.type === "standard" && (
                  <StandardDisplay
                    type="direction"
                    action="up"
                    lines={[heroText]}
                    canvasWidth={400}
                    canvasHeight={225}
                    fontSize={40}
                    foreColor="#000000"
                    backColor="#f8fafc"
                  />
                )}
              </motion.div>
            ) : (
              <div className="text-slate-300 font-black text-4xl opacity-20 rotate-[-5deg] select-none">
                {heroText}
              </div>
            )}
          </AnimatePresence>
          {!isHovered && (
            <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
              <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold text-slate-600 shadow-sm border border-white/50">
                Hover to Preview
              </div>
            </div>
          )}
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-1">{type.label}</h3>
          <p className="text-slate-400 text-sm">クリックして編集</p>
        </div>
      </motion.div>
    </Link>
  );
}
