"use client";

import { usePathname } from "next/navigation";
import { IdentityBand } from "./IdentityBand";
import { ContextBand } from "./ContextBand";
import { StatusBand } from "./StatusBand";

type Props = { children: React.ReactNode };

/**
 * BandSceneLayout
 * ---------------
 * v0.2.0 "bands" 用のレイアウト。画面を縦に 4 帯で構成する:
 *
 *   IdentityBand (auto)  … プロンプト風
 *   ContextBand  (auto)  … シーン名
 *   Content      (flex-1)… {children}（Scene）
 *   StatusBand   (auto)  … バージョン情報 + 操作ヒント
 *
 * Scene 切替（同一バージョン内のページ遷移）時、各帯に key={pathname} を与えて
 * 再マウントさせ、CSS の animation-delay で上から順にスタガー表示する。
 * key は兄弟間で一意である必要があるためプレフィックスを付ける。
 */
export function BandSceneLayout({ children }: Props) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 text-zinc-900">
      <IdentityBand
        key={`identity-${pathname}`}
        className="band-animate"
        style={{ animationDelay: "0ms" }}
      />
      <ContextBand
        key={`context-${pathname}`}
        className="band-animate"
        style={{ animationDelay: "80ms" }}
      />
      <main
        key={`content-${pathname}`}
        className="band-animate min-h-0 flex-1 border-b border-zinc-300"
        style={{ animationDelay: "160ms" }}
      >
        <div className="mx-auto max-w-3xl px-8 py-12">{children}</div>
      </main>
      <StatusBand
        key={`status-${pathname}`}
        className="band-animate"
        style={{ animationDelay: "240ms" }}
      />
    </div>
  );
}
