"use client";

import { usePathname } from "next/navigation";

type Props = {
  className?: string;
  style?: React.CSSProperties;
};

/**
 * pathname の末尾セグメントから現在のシーン名を導出する。
 * 例: "/v0.2.0" -> "top" / "/v0.2.0/history" -> "history"
 */
function sceneName(pathname: string): string {
  const segs = pathname.split("/").filter(Boolean); // [version, scene?]
  return segs[1] ?? "top";
}

/**
 * ContextBand
 * -----------
 * 現在のシーン名を表示する帯。本文より少し強めの文字色で `> top` のように出す。
 */
export function ContextBand({ className, style }: Props) {
  const pathname = usePathname();

  return (
    <div
      className={`border-b border-zinc-300 px-6 py-4 font-mono text-base font-medium text-zinc-900 ${className ?? ""}`}
      style={style}
    >
      &gt; {sceneName(pathname)}
    </div>
  );
}
