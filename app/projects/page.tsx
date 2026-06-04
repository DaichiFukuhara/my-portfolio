import Link from "next/link";
import { Button } from "@/components/ui/button";
import { projects } from "@/data/projects";

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900">
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-8 py-24">

        {/* ラベル */}
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-zinc-500">
          Works
        </p>

        {/* ページ見出し */}
        <h1 className="text-7xl font-black tracking-tight sm:text-8xl">
          Projects
        </h1>

        {/* カード一覧 */}
        <ul className="mt-12 flex flex-col gap-6">
          {projects.map((project) => {
            const isInternal = project.href.startsWith("/");
            return (
              <li
                key={project.slug}
                className="border border-zinc-400 bg-zinc-50 p-6"
              >
                <h2 className="font-mono text-xl font-bold">{project.title}</h2>
                <p className="mt-2 text-sm text-zinc-600">{project.description}</p>

                {/* タグ */}
                <ul className="mt-3 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <li
                      key={tag}
                      className="border border-zinc-400 px-2 py-0.5 font-mono text-xs text-zinc-500"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>

                {/* 開くボタン */}
                <div className="mt-4">
                  {isInternal ? (
                    <Button asChild variant="default">
                      <Link href={project.href}>開く</Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline">
                      <a href={project.href} target="_blank" rel="noopener noreferrer">
                        開く
                      </a>
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {/* 戻るボタン */}
        <div className="mt-12">
          <Button asChild variant="outline">
            <Link href="/">← Home</Link>
          </Button>
        </div>

      </section>
    </main>
  );
}
