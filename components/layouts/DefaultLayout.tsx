type Props = { children: React.ReactNode };

/**
 * DefaultLayout
 * -------------
 * v0.1.0 "default" 用のレイアウト。
 * 既存ページの外側（main + 中央寄せ section）をそのまま移植したもの。
 * Scene はレイアウト指定を持たないため、ここで配置・サイズを与える。
 */
export function DefaultLayout({ children }: Props) {
  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900">
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-8 py-24">
        {children}
      </section>
    </main>
  );
}
