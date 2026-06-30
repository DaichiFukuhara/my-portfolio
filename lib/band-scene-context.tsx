"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { type SceneId, defaultSceneId } from "@/data/scenes";

/**
 * BandSceneContext
 * ----------------
 * v0.2.0 "bands" の「現在表示中シーン」を共有するための React Context。
 *
 * v0.2.0 では URL を変えずにシーンを差し替える SPA 型のため、
 * 現在シーンを state として持ち、CommandLauncher（シーン変更の起点）と
 * BandSceneLayout（シーン描画側）の両方から参照できるようにする。
 *
 * Provider は app/layout.tsx の最上位に置く。v0.1.0 にいる間も Provider 自体は
 * 存在するが、誰も state を読まないため無害。
 */
type BandSceneContextValue = {
  currentSceneId: SceneId;
  setCurrentSceneId: (id: SceneId) => void;
};

const BandSceneContext = createContext<BandSceneContextValue | null>(null);

export function BandSceneProvider({ children }: { children: ReactNode }) {
  const [currentSceneId, setCurrentSceneId] = useState<SceneId>(defaultSceneId);
  return (
    <BandSceneContext.Provider value={{ currentSceneId, setCurrentSceneId }}>
      {children}
    </BandSceneContext.Provider>
  );
}

/** Provider 外（v0.1.0 等）では null を返す */
export function useBandScene(): BandSceneContextValue | null {
  return useContext(BandSceneContext);
}
