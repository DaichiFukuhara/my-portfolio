import { Button } from "@/components/ui/button";

/**
 * TopScene
 * --------
 * トップシーンのコンテンツのみを持つ。
 * レイアウト指定（min-h-screen, max-w-3xl, 中央寄せ等）は持たず、
 * DefaultLayout / BandSceneLayout 側で配置される。
 */
export function TopScene() {
  return (
    <>
      {/* ラベル */}
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
        Power Engineer
      </p>

      {/* 名前 */}
      <h1 className="text-7xl font-black tracking-tight sm:text-8xl">D.</h1>

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
    </>
  );
}
