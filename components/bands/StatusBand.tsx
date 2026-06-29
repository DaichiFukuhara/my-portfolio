"use client";

import { useParams } from "next/navigation";
import { versions, defaultVersion } from "@/data/versions";

type Props = {
  className?: string;
  style?: React.CSSProperties;
};

/**
 * StatusBand
 * ----------
 * 画面下部のステータス帯。
 * 左に現在のバージョン情報、右に操作ヒントを控えめなトーンで表示する。
 */
export function StatusBand({ className, style }: Props) {
  const params = useParams();
  const versionId =
    typeof params.version === "string" ? params.version : defaultVersion.id;
  const version = versions.find((v) => v.id === versionId) ?? defaultVersion;

  return (
    <footer
      className={`flex items-center justify-between px-6 py-2 font-mono text-xs text-zinc-500 ${className ?? ""}`}
      style={style}
    >
      <span>
        {version.id} &quot;{version.codename}&quot;
      </span>
      <span>&gt;_ open command launcher</span>
    </footer>
  );
}
