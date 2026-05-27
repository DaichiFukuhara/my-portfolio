import Link from "next/link";
import { Button } from "@/components/ui/button";

type TimelineItem = {
  year: string;
  description: string;
};

const timelineItems: TimelineItem[] = [
  { year: "2005", description: "千葉県柏市に生まれる" },
  { year: "2021", description: "麗澤高校 入学" },
  { year: "2024", description: "電気通信大学 情報理工学域 I類 入学" },
];

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900">
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-8 py-24">

        {/* ラベル */}
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-zinc-500">
          Career
        </p>

        {/* ページ見出し */}
        <h1 className="text-7xl font-black tracking-tight sm:text-8xl">
          History
        </h1>

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


      </section>
    </main>
  );
}
