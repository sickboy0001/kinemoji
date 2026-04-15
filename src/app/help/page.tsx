import { redirect } from "next/navigation";

/**
 * /help ルートへのアクセスを /help/00_index にリダイレクト
 */
export default function HelpRootPage() {
  redirect("/help/00_index");
}
