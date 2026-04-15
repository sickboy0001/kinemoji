/**
 * Markdown ファイルの raw インポート用型宣言
 */
declare module "*.md?raw" {
  const content: string;
  export default content;
}
