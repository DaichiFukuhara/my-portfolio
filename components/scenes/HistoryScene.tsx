type TimelineItem = {
  year: string;
  description: string;
};

const timelineItems: TimelineItem[] = [
  { year: "2005", description: "千葉県柏市に生まれる" },
  { year: "2021", description: "麗澤高校 入学" },
  { year: "2024", description: "電気通信大学 情報理工学域 I類 入学" },
];

/**
 * HistoryScene
 * ------------
 * 経歴シーンのコンテンツのみを持つ。
 * レイアウト指定は持たず、外側の Layout が配置を担う。
 */
export function HistoryScene() {
  return (
    <>
      {/* ラベル */}
      <p className="mb-4 font-mono text-xs uppercase tracking-widest text-zinc-500">
        Career
      </p>

      {/* ページ見出し */}
      <h1 className="text-7xl font-black tracking-tight sm:text-8xl">History</h1>

      {/* タイムライン */}
      <ol className="relative mt-12 border-l border-zinc-400">
        {timelineItems.map((item) => (
          <li key={item.year} className="relative mb-10 pl-8 last:mb-0">
            {/* 四角ドット(縦線上に重ねる) */}
            <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 bg-zinc-900" />

            <div className="flex gap-8">
              {/* 年 */}
              <span className="w-14 shrink-0 font-mono text-sm text-zinc-500">
                {item.year}
              </span>
              {/* 内容 */}
              <p className="text-base text-zinc-900">{item.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
