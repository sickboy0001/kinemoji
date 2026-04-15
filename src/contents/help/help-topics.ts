/**
 * ヘルプ記事のメタデータ定義
 */
export interface HelpTopic {
  slug: string;
  title: string;
  description: string;
}

/**
 * 利用可能なヘルプ記事の一覧
 */
export const HELP_TOPICS: HelpTopic[] = [
  {
    slug: "00_index",
    title: "目次",
    description: "ヘルプ記事の一覧",
  },
  {
    slug: "01_quickstart",
    title: "クイックスタート",
    description: "基本的な利用手順",
  },
  {
    slug: "02_terms",
    title: "利用規約",
    description: "利用条件と免責事項",
  },
  {
    slug: "03_privacy",
    title: "プライバシーポリシー",
    description: "個人情報の取り扱いについて",
  },
];

/**
 * スラッグからヘルプ記事のメタデータを取得
 * @param slug 記事のスラッグ
 * @returns メタデータ、見つからない場合は undefined
 */
export function getHelpTopicBySlug(slug: string): HelpTopic | undefined {
  return HELP_TOPICS.find((topic) => topic.slug === slug);
}

/**
 * 有効なスラッグのリストを取得
 * @returns スラッグの配列
 */
export function getHelpTopicSlugs(): string[] {
  return HELP_TOPICS.map((topic) => topic.slug);
}
