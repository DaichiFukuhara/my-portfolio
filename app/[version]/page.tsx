import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900">
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-8 py-24">

        {/* ラベル */}
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
          Power Engineer
        </p>

        {/* 名前 */}
        <h1 className="text-7xl font-black tracking-tight sm:text-8xl">
          D.
        </h1>

        {/* 自己紹介 */}
        <p className="mt-6 max-w-lg text-base leading-relaxed text-zinc-600 sm:text-lg">
          筋トレと音楽を愛するパワー系エンジニア。
          将来はボディビルダーを本職に、副業としてエンジニアを目指している。
        </p>

        {/* リンクボタン */}
        <div className="mt-10 flex flex-wrap gap-4">
          <Button asChild variant="outline">
            <a href="#">GitHub</a>
          </Button>
          <Button asChild variant="outline">
            <a href="#">AtCoder</a>
          </Button>
        </div>

      </section>
    </main>
  );
}
