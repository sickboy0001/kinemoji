import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center px-4">
      <h1 className="text-6xl font-bold mb-6">Kinemoji</h1>
      <p className="text-xl text-slate-600 mb-10 max-w-md">
        あなたの言葉を、アニメーションする「キネ文字」に。
        リアルタイムな演出として、あるいはGIFとして。
      </p>
      <div className="flex gap-4">
        <Link href="/kinemoji/new">
          <Button size="lg" className="px-8 cursor-pointer">
            使ってみる
          </Button>
        </Link>
        <Link href="/kinemoji/list">
          <Button variant="outline" size="lg" className="px-8 cursor-pointer">
            一覧を見る
          </Button>
        </Link>
      </div>
    </div>
  );
}
