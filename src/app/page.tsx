import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  HOME_KINEMOJI_TYPES,
  KINEMOJI_NEW_PATH,
} from "@/constants/kinemoji-types";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center px-4">
      <h1 className="text-6xl font-bold mb-6">Kinemoji</h1>
      <p className="text-xl text-slate-600 mb-10 max-w-md">
        あなたの言葉を、アニメーションする「キネ文字」に。
        リアルタイムな演出として、あるいは GIF として。
      </p>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {HOME_KINEMOJI_TYPES.map((kinemojiType) => (
          <Link
            key={kinemojiType.type}
            href={`${KINEMOJI_NEW_PATH}?type=${kinemojiType.type}`}
          >
            <Button size="lg" className="w-full px-8 cursor-pointer">
              {kinemojiType.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
