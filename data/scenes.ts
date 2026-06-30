import type { ComponentType } from "react";
import { TopScene } from "@/components/scenes/TopScene";
import { HistoryScene } from "@/components/scenes/HistoryScene";

export type SceneId = "top" | "history";

export type Scene = {
  id: SceneId;
  label: string; // Context帯表示用、例: "top", "history"
  component: ComponentType;
};

export const scenes: Scene[] = [
  { id: "top", label: "top", component: TopScene },
  { id: "history", label: "history", component: HistoryScene },
];

export const defaultSceneId: SceneId = "top";
