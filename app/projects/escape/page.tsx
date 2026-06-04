import Link from "next/link";
import { Button } from "@/components/ui/button";
import { projects } from "@/data/projects";

export default function EscapePage() {
  const embed = projects.find((p) => p.slug === "escape")?.embed;

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900">
      <section className="mx-auto max-w-3xl px-8 py-24">

        {/* 戻るボタン */}
        <div className="mb-8">
          <Button asChild variant="outline">
            <Link href="/projects">← Projects</Link>
          </Button>
        </div>

        {/* ラベル */}
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-zinc-500">
          Game
        </p>

        {/* ページ見出し */}
        <h1 className="mb-8 text-7xl font-black tracking-tight sm:text-8xl">
          Escape
        </h1>

        {/* iframe またはフォールバック */}
        {embed ? (
          <div
            className="w-full border border-zinc-400"
            style={{
              aspectRatio: `${embed.width} / ${embed.height}`,
              maxWidth: embed.width,
              maxHeight: embed.height,
            }}
          >
            <iframe
              src={embed.url}
              title="Escape Game"
              loading="lazy"
              style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            />
          </div>
        ) : (
          <p className="font-mono text-sm text-zinc-500">準備中</p>
        )}

      </section>
    </main>
  );
}
