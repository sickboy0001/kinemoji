export type AnimationType = "direction" | "zoom" | "opacity" | "lupin";

export type AnimationAction =
  | "down"
  | "up"
  | "left"
  | "right"
  | "in"
  | "out"
  | "fade"
  | "blur"
  | "typewriter"
  | "random";

export interface KinemojiDisplayProps {
  text: string;
  parameters?:
    | {
        type?: AnimationType;
        action?: AnimationAction;
        width?: number;
        height?: number;
        foreColor?: string;
        backColor?: string;
      }
    | string;
}

export const DIRECTION_ACTIONS: AnimationAction[] = [
  "down",
  "up",
  "left",
  "right",
];
export const ZOOM_ACTIONS: AnimationAction[] = ["in", "out"];
export const OPACITY_ACTIONS: AnimationAction[] = ["fade", "blur"];
