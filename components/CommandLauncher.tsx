"use client";

import { useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { commands } from "@/data/commands";
import { type SceneId, scenes } from "@/data/scenes";
import { useBandScene } from "@/lib/band-scene-context";
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
 * CommandLauncher
 * ---------------
 * 画面右下に常駐するコマンドランチャー（`>_` ボタン）。
 *
 * 役割:
 *   - data/commands.ts のコマンド一覧を Select で提示し、「Run」で実行する。
 *   - コマンドの action は 3 種類:
 *       push    … ページ遷移（versioned フラグがあれば現在のバージョンを前置）
 *       back    … 直前のページへ戻る
 *       version … 現在のサブパスを保ったままバージョンだけ切り替える
 *
 * 配置:
 *   ルートレイアウト（app/layout.tsx）に常駐。左下の VersionSelector と左右で対になる。
 *   バージョン切替ロジックは VersionSelector と共通で lib/version-routing.ts を利用する。
 *
 *   v0.2.0 "bands" にいる場合のみ、push コマンドは URL 遷移ではなく
 *   BandScene の state 変更（シーン差し替え）として扱う。
 */

/**
 * コマンド名を v0.2.0 のシーン ID に対応付ける。
 * "home" は top シーンへ、それ以外は同名のシーンを探す（"history" → "history"）。
 * 対応するシーンが無い場合（"projects" 等）は null を返し、何もしない。
 */
function commandNameToSceneId(name: string): SceneId | null {
  if (name === "home") return "top";
  return scenes.find((s) => s.id === name)?.id ?? null;
}

export function CommandLauncher() {
  const router = useRouter();

  // 現在の URL からバージョンとサブパスを取得する（version 切替・versioned push で使用）。
  const params = useParams();
  const pathname = usePathname();
  // version が undefined（/projects 等のバージョン外パスや遷移直後）の場合は
  // defaultVersion にフォールバックする。
  const currentVersion = resolveVersion(params.version as string | undefined);

  // v0.2.0 にいるかどうか。push コマンドの扱い（URL 遷移 / シーン state 変更）を分岐する。
  const isOnBands = params.version === "v0.2.0";
  // シーン state の変更口。Provider は常に張られているので基本 non-null。
  const bandScene = useBandScene();

  // Dialog の開閉状態。
  const [open, setOpen] = useState(false);
  // Select で選択中のコマンド名。初期値は先頭コマンド。
  const [selected, setSelected] = useState(commands[0].name);

  /**
   * 「Run」押下時の処理。選択中コマンドの action に応じて遷移方法を分岐する。
   */
  function handleRun() {
    const found = commands.find((c) => c.name === selected);
    if (!found) {
      setOpen(false);
      return;
    }

    if (found.action === "version") {
      // 現在のサブパスを保持したままバージョンだけ切り替える
      // （VersionSelector の Run と同じロジック）。
      const subPath = stripVersion(pathname, currentVersion);
      router.push(buildVersionPath(found.versionId, subPath));
      setOpen(false);
      return;
    }

    if (found.action === "back") {
      router.back();
      setOpen(false);
      return;
    }

    // ここからは action === "push"。
    if (isOnBands) {
      // v0.2.0 では URL 遷移せず、対応するシーンへ state を差し替える。
      // 対応シーンが無いコマンド（projects 等）は何もしない。
      const sceneId = commandNameToSceneId(found.name);
      if (sceneId) bandScene?.setCurrentSceneId(sceneId);
      setOpen(false);
      return;
    }

    // v0.1.0 等は従来通り URL 遷移。
    // versioned な push（home / history 等）は現在のバージョンを前置して
    // /{version}{path} へ。versioned でない push はそのまま遷移。
    router.push(
      found.versioned
        ? buildVersionPath(currentVersion, found.path)
        : found.path
    );
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* 画面右下に固定表示される開閉ボタン */}
      <DialogTrigger asChild>
        <button
          aria-label="Open command launcher"
          className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-zinc-50 font-mono px-4 py-2.5 transition-colors hover:bg-zinc-700"
        >
          {">_"}
        </button>
      </DialogTrigger>

      {/* モーダル */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-mono">Command Launcher</DialogTitle>
        </DialogHeader>

        <p className="font-mono text-xs text-zinc-500">
          Select a command and press Run.
        </p>

        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {commands.map((command) => (
              <SelectItem key={command.name} value={command.name}>
                {command.name}
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
