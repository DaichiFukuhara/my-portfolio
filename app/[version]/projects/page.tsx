import Link from "next/link";
import { Button } from "@/components/ui/button";
import { projects } from "@/data/projects";
import { buildVersionPath } from "@/lib/version-routing";

/**
 * ProjectsPage（/{version}/projects）
 * ----------------------------------
 * プロジェクト一覧ページ。バージョン配下に置かれるため、
 * 内部リンクはすべて現在のバージョンを前置して組み立てる。
 *
 * params はバージョン検証済みの [version] レイアウト配下で渡される
 * （Next.js 16 では params は Promise なので await して取り出す）。
 */
export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ version: string }>;
}) {
  const { version } = await params;

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
            // 内部リンク（/ 始まり）はバージョンを前置、外部 URL（https 等）はそのまま使う。
            const isInternal = project.href.startsWith("/");
            const href = isInternal
              ? buildVersionPath(version, project.href)
              : project.href;
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
                      <Link href={href}>開く</Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline">
                      <a href={href} target="_blank" rel="noopener noreferrer">
                        開く
                      </a>
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {/* 戻るボタン（現在バージョンのトップへ） */}
        <div className="mt-12">
          <Button asChild variant="outline">
            <Link href={buildVersionPath(version, "")}>← Home</Link>
          </Button>
        </div>

      </section>
    </main>
  );
}
