/**
 * アニメーションタイプの定義
 */
export interface KinemojiType {
  type: string;
  label: string;
  description?: string;
  visible: boolean; // ホームページに表示するかどうか
}

/**
 * 全てのアニメーションタイプ一覧
 * visible: true のものがホームページに表示されます
 */
export const ALL_KINEMOJI_TYPES: KinemojiType[] = [
  {
    type: "lupin",
    label: "ルパン (Lupin)",
    description: "流れるようなアニメーション",
    visible: true,
  },
  {
    type: "typewriter",
    label: "タイピング (Typewriter)",
    description: "タイプライター風の演出",
    visible: true,
  },
  {
    type: "zoom",
    label: "ズーム (Zoom)",
    description: "ズームイン・アウトの演出",
    visible: false,
  },
  {
    type: "direction",
    label: "移動 (Direction)",
    description: "方向移動のアニメーション",
    visible: false,
  },
];

/**
 * ホームページに表示するアニメーションタイプ一覧
 * visible: true のもののみをフィルタリング
 */
export const HOME_KINEMOJI_TYPES = ALL_KINEMOJI_TYPES.filter(
  (type) => type.visible,
);

/**
 * アニメーションタイプの URL パス
 */
export const KINEMOJI_NEW_PATH = "/kinemoji/new";
