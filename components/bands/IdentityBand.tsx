"use client";

import { usePathname } from "next/navigation";

type Props = {
  className?: string;
  style?: React.CSSProperties;
};

/**
 * IdentityBand
 * ------------
 * 最上部のターミナルプロンプト風帯。
 * 現在パス全体（バージョン部分を含む）を usePathname から取得して表示する。
 * 例: d@portfolio:/v0.2.0/history$
 */
export function IdentityBand({ className, style }: Props) {
  const pathname = usePathname();

  return (
    <header
      className={`border-b border-zinc-300 px-6 py-3 font-mono text-xs text-zinc-500 ${className ?? ""}`}
      style={style}
    >
      <span>d@portfolio:{pathname}$</span>
    </header>
  );
}
