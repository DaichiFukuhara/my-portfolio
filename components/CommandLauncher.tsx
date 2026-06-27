"use client";

import { useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { commands } from "@/data/commands";
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
 */
export function CommandLauncher() {
  const router = useRouter();

  // 現在の URL からバージョンとサブパスを取得する（version 切替・versioned push で使用）。
  const params = useParams();
  const pathname = usePathname();
  // version が undefined（/projects 等のバージョン外パスや遷移直後）の場合は
  // defaultVersion にフォールバックする。
  const currentVersion = resolveVersion(params.version as string | undefined);

  // Dialog の開閉状態。
  const [open, setOpen] = useState(false);
  // Select で選択中のコマンド名。初期値は先頭コマンド。
  const [selected, setSelected] = useState(commands[0].name);

  /**
   * 「Run」押下時の処理。選択中コマンドの action に応じて遷移方法を分岐する。
   */
  function handleRun() {
    const found = commands.find((c) => c.name === selected);
    if (found) {
      if (found.action === "push") {
        // versioned な push（home / history 等）は現在のバージョンを前置して
        // /{version}{path} へ。versioned でない push（/projects 等）はそのまま遷移。
        router.push(
          found.versioned
            ? buildVersionPath(currentVersion, found.path)
            : found.path
        );
      } else if (found.action === "back") {
        router.back();
      } else if (found.action === "version") {
        // 現在のサブパスを保持したままバージョンだけ切り替える
        // （VersionSelector の Run と同じロジック）。
        const subPath = stripVersion(pathname, currentVersion);
        router.push(buildVersionPath(found.versionId, subPath));
      }
    }
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
