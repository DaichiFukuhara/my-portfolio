"use client";

import { useParams } from "next/navigation";
import { versions, defaultVersion } from "@/data/versions";

/**
 * StatusBand
 * ----------
 * 画面下部のステータス帯。左に現在のバージョン情報、右に操作ヒント。
 * シーン切替時の情報は変化しないためアニメーションは入れない。
 * バージョン切替時はバージョン全体が再マウントされるので別途意識不要。
 */
export function StatusBand() {
  const params = useParams();
  const versionId =
    typeof params.version === "string" ? params.version : defaultVersion.id;
  const version = versions.find((v) => v.id === versionId) ?? defaultVersion;

  return (
    <footer className="flex items-center justify-between border-t border-zinc-300 px-6 py-2 font-mono text-xs text-zinc-500">
      <span>
        {version.id} &quot;{version.codename}&quot;
      </span>
      <span>&gt;_ open command launcher</span>
    </footer>
  );
}
