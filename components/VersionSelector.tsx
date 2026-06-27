"use client";

import { useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { GearIcon } from "@phosphor-icons/react";
import { versions } from "@/data/versions";
import {
  resolveVersion,
  stripVersion,
  buildVersionPath,
} from "@/lib/version-routing";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * VersionSelector
 * ---------------
 * 画面左下に常駐するバージョン切替 UI。
 *
 * 役割:
 *   - 歯車アイコン + 現在のバージョン ID（例: ⚙ [v0.1.0]）を常時表示する。
 *   - クリックで Dialog を開き、Select で切替先バージョンを選ばせる。
 *   - 「Run」で、現在のサブパスを保持したまま バージョン部分だけ差し替えて遷移する。
 *     例: /v0.1.0/history で v0.2.0 を選択 -> /v0.2.0/history へ遷移。
 *
 * 配置:
 *   ルートレイアウト（app/layout.tsx）に常駐。右下の CommandLauncher と左右で対になる。
 */
export function VersionSelector() {
  const router = useRouter();

  // 現在の URL からバージョンとサブパスを得るためのフック。
  // params.version は app/[version] の動的セグメント名に対応する。
  const params = useParams();
  const pathname = usePathname();

  // version が undefined（/ から遷移する一瞬や、/projects 等のバージョン外パス）の
  // 場合に備え、resolveVersion で defaultVersion にフォールバックさせる。
  const currentVersion = resolveVersion(params.version as string | undefined);

  // Dialog の開閉状態。
  const [open, setOpen] = useState(false);
  // Select で選択中のバージョン ID。初期値は現在のバージョン。
  const [selected, setSelected] = useState(currentVersion);

  /**
   * 「Run」押下時の処理。
   * 選択が現在と異なる場合のみ、サブパスを保持して新バージョンへ遷移する。
   * 同じバージョンを選んだ場合は遷移しない（無駄な再描画と切替演出を避ける）。
   */
  function handleRun() {
    if (selected !== currentVersion) {
      const subPath = stripVersion(pathname, currentVersion);
      router.push(buildVersionPath(selected, subPath));
    }
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Dialog を開くたびに、選択状態を「現在のバージョン」に戻す。
        // 前回キャンセルした選択が残らないようにするための初期化。
        if (next) setSelected(currentVersion);
        setOpen(next);
      }}
    >
      {/* 画面左下に固定表示される切替ボタン。
          歯車アイコンとバージョン ID をまとめて 1 つのクリック領域にし、押せる範囲を広く取る。 */}
      <DialogTrigger asChild>
        <button
          aria-label="Switch version"
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-zinc-900 px-4 py-2.5 font-mono text-zinc-50 transition-colors hover:bg-zinc-700"
        >
          <GearIcon size={18} weight="bold" />
          <span>[{currentVersion}]</span>
        </button>
      </DialogTrigger>

      {/* 切替先を選ぶモーダル */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-mono">Switch Version</DialogTitle>
        </DialogHeader>

        <p className="font-mono text-xs text-zinc-500">
          Select a version and press Run.
        </p>

        {/* versions 配列を選択肢として表示。`id — codename` 形式（例: v0.1.0 — default）。
            versions.ts に 1 行追加すれば、ここに自動で新バージョンが現れる。 */}
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {versions.map((version) => (
              <SelectItem key={version.id} value={version.id}>
                {version.id} — {version.codename}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleRun}>
            Run
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
