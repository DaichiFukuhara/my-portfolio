"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { commands } from "@/data/commands";
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

export function CommandLauncher() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(commands[0].name);

  function handleRun() {
    const found = commands.find((c) => c.name === selected);
    if (found) {
      if (found.action === "push") {
        router.push(found.path);
      } else if (found.action === "back") {
        router.back();
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
