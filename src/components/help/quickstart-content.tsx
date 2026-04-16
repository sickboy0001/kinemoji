"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LupinDisplay } from "@/components/organisms/kinemoji/lupin-display";
import { TypewriterDisplay } from "@/components/organisms/kinemoji/typewriter-display";

export function QuickStartContent() {
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);

  return (
    <div className="bg-white min-h-screen font-sans pb-24">
      {/* 1. ヒーローセクション */}
      <section className="py-20 bg-black text-white overflow-hidden relative">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <LupinDisplay
            text="QUICK START"
            lines={["QUICK START"]}
            canvasWidth={800}
            canvasHeight={200}
            fontSize={80}
            foreColor="#ffffff"
            backColor="#000000"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="text-slate-400 mt-6 text-lg"
          >
            3ステップで、あなたの言葉に命を吹き込む
          </motion.p>
        </div>
        {/* 背景のノイズ演出 */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />
      </section>

      {/* 2. ステップ解説 */}
      <section className="max-w-5xl mx-auto px-4 py-24 space-y-32">
        {/* Step 01 */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-4">
            <div className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-black rounded tracking-widest">
              STEP 01
            </div>
            <h2 className="text-3xl font-bold">文字を打ち込む</h2>
            <p className="text-slate-600 leading-relaxed">
              まずは伝えたいメッセージを入力。日本語・英語どちらも対応。
              感情や状況に合わせた最適な一言を。
            </p>
          </div>
          <div className="flex-1 w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center border-4 border-slate-800">
            <TypewriterDisplay
              text="ルパンが来る！"
              lines={["ルパンが来る！"]}
              canvasWidth={400}
              canvasHeight={225}
              fontSize={40}
              foreColor="#ffffff"
              backColor="#0f172a"
            />
          </div>
        </div>

        {/* Step 02 */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-12">
          <div className="flex-1 space-y-4">
            <div className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-black rounded tracking-widest">
              STEP 02
            </div>
            <h2 className="text-3xl font-bold">演出を選ぶ</h2>
            <p className="text-slate-600 leading-relaxed">
              スタイルを選択。ルパン風なら、泥棒のようなスリルある演出に。
              タイプライターなら、一文字ずつ想いを込める演出に。
            </p>
          </div>
          <div className="flex-1 w-full grid grid-cols-2 gap-4">
            <motion.div
              onMouseEnter={() => setHoveredStyle("lupin")}
              onMouseLeave={() => setHoveredStyle(null)}
              whileHover={{ scale: 1.05 }}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center font-black transition-all cursor-default border-4 ${
                hoveredStyle === "lupin"
                  ? "bg-red-600 border-red-400 text-white"
                  : "bg-slate-100 border-transparent text-slate-300"
              }`}
            >
              <div className="text-2xl mb-2">LUPIN</div>
              {hoveredStyle === "lupin" && (
                <motion.div
                  layoutId="spark"
                  className="text-yellow-300 animate-pulse"
                >
                  ✨
                </motion.div>
              )}
            </motion.div>
            <motion.div
              onMouseEnter={() => setHoveredStyle("typewriter")}
              onMouseLeave={() => setHoveredStyle(null)}
              whileHover={{ scale: 1.05 }}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center font-black transition-all cursor-default border-4 ${
                hoveredStyle === "typewriter"
                  ? "bg-black border-slate-700 text-white"
                  : "bg-slate-100 border-transparent text-slate-300"
              }`}
            >
              <div className="text-2xl mb-2">TYPE</div>
              {hoveredStyle === "typewriter" && (
                <motion.div
                  layoutId="spark"
                  className="text-slate-400 animate-bounce"
                >
                  ⌨️
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Step 03 */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-4">
            <div className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-black rounded tracking-widest">
              STEP 03
            </div>
            <h2 className="text-3xl font-bold">書き出し・シェア</h2>
            <p className="text-slate-600 leading-relaxed">
              一瞬でGIFを生成。SNSや資料に貼り付けて、みんなを驚かせよう。
              透過GIFにも対応しており、どんな背景にも馴染みます。
            </p>
          </div>
          <div className="flex-1 w-full flex flex-col items-center gap-6">
            <div className="w-[200px] aspect-[9/16] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 bg-slate-800 rounded-b-2xl z-10" />
              <div className="w-full h-full flex items-center justify-center">
                <LupinDisplay
                  text="驚いた？"
                  lines={["驚いた？"]}
                  canvasWidth={184}
                  canvasHeight={320}
                  fontSize={30}
                  foreColor="#ffffff"
                  backColor="#000000"
                />
              </div>
            </div>
            <Button
              disabled
              className="bg-slate-100 text-slate-400 rounded-full px-8"
            >
              Download GIF
            </Button>
          </div>
        </div>
      </section>

      {/* 3. 実行への導線 */}
      <section className="max-w-5xl mx-auto px-4 pt-12">
        <Link href="/kinemoji/new?type=lupin">
          <div className="relative group overflow-hidden rounded-3xl bg-black py-16 px-8 text-center cursor-pointer shadow-2xl hover:shadow-red-600/20 transition-all">
            {/* 背景のカチャカチャ */}
            <div className="absolute inset-0 opacity-10 pointer-events-none select-none flex flex-wrap gap-4 p-4 overflow-hidden">
              {[..."LUPINJACKHIJACKKINEMOJI"].map((char, i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.1, 0.5, 0.1], x: [0, 5, 0] }}
                  transition={{
                    duration: 0.1,
                    repeat: Infinity,
                    delay: Math.random(),
                  }}
                  className="text-4xl text-white font-black"
                >
                  {char}
                </motion.span>
              ))}
            </div>

            <div className="relative z-10">
              <h3 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tighter group-hover:scale-105 transition-transform">
                今すぐ作る
              </h3>
              <p className="text-red-600 font-bold tracking-[0.2em] animate-pulse">
                CREATE NOW
              </p>
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
}
