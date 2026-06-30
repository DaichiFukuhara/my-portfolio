"use client";

import { useEffect } from "react";
import { useBandScene } from "@/lib/band-scene-context";
import { scenes } from "@/data/scenes";
import { IdentityBand } from "./IdentityBand";
import { ContextBand } from "./ContextBand";
import { StatusBand } from "./StatusBand";

/**
 * BandSceneLayout
 * ---------------
 * v0.2.0 "bands" 用レイアウト。画面を縦4帯で構成し、Content 帯の中身を
 * Context の currentSceneId から決める（URL は変えない SPA 型）。
 *
 *   IdentityBand … プロンプト風（固定・非アニメ）
 *   ContextBand  … シーン名（シーン切替で再マウント → スタガー）
 *   Content      … 現在シーンのコンポーネント（同上）
 *   StatusBand   … バージョン情報 + 操作ヒント（固定・非アニメ）
 *
 * children は受け取らない（page.tsx の返り値は無視され、シーンは state から決まる）。
 */
export function BandSceneLayout() {
  const ctx = useBandScene();

  // v0.2.0 に入った瞬間は必ず top から始める。
  // Provider は版を跨いで生存するため、前回のシーン state を引きずらないようリセットする。
  // （リロード時もマウントされるので top に戻る）
  useEffect(() => {
    ctx?.setCurrentSceneId("top");
    // マウント時に一度だけ実行する。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ctx) return null; // Provider 外では描画しない（念のため）

  const { currentSceneId } = ctx;
  const scene = scenes.find((s) => s.id === currentSceneId) ?? scenes[0];
  const SceneComponent = scene.component;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 text-zinc-900">
      <IdentityBand />
      <ContextBand key={`ctx-${currentSceneId}`} sceneLabel={scene.label} />
      <main
        key={`content-${currentSceneId}`}
        className="band-animate min-h-0 flex-1 px-6 py-12"
        style={{ animationDelay: "160ms" }}
      >
        <div className="mx-auto max-w-3xl">
          <SceneComponent />
        </div>
      </main>
      <StatusBand />
    </div>
  );
}
