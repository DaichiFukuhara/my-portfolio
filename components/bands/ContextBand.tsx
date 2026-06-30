/**
 * ContextBand
 * -----------
 * 現在のシーン名を表示する帯。`> top` のように出す。
 * 再マウントは親（BandSceneLayout）が key で制御し、シーン切替時に
 * band-animate でスタガー発火する。
 */
export function ContextBand({ sceneLabel }: { sceneLabel: string }) {
  return (
    <div
      className="band-animate border-b border-zinc-300 px-6 py-4 font-mono text-base font-medium text-zinc-900"
      style={{ animationDelay: "80ms" }}
    >
      &gt; {sceneLabel}
    </div>
  );
}
