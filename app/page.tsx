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
          <a
            href="#"
            className="rounded border border-zinc-400 bg-white px-5 py-2.5 font-mono text-sm font-medium text-zinc-900 transition-colors duration-200 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
          >
            GitHub
          </a>
          <a
            href="#"
            className="rounded border border-zinc-400 bg-white px-5 py-2.5 font-mono text-sm font-medium text-zinc-900 transition-colors duration-200 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
          >
            AtCoder
          </a>
        </div>

      </section>
    </main>
  );
}
