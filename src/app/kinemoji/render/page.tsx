import { KinemojiDisplay } from "@/components/organisms/kinemoji-display";

export default async function RenderPage({
  searchParams,
}: {
  searchParams: Promise<any>;
}) {
  const params = await searchParams;
  const { text, type, action, width, height, foreColor, backColor, render } =
    params;
  const isRendering = render === "true";

  if (!text) return null;

  const parameters = {
    type,
    action,
    width: Number(width),
    height: Number(height),
    foreColor,
    backColor,
  };

  return (
    <div
      className="kinemoji-container overflow-hidden"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: backColor || "#FFFFFF",
      }}
    >
      <KinemojiDisplay
        text={text}
        parameters={parameters}
        isRendering={isRendering}
      />
    </div>
  );
}
