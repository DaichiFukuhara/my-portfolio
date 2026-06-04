export type Project = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  href: string;
  embed?: {
    url: string;
    width: number;
    height: number;
  };
};

export const projects: Project[] = [
  {
    slug: "escape",
    title: "Escape Game",
    description: "チーム制作した Java 製脱出ゲームを Web に移植した作品。",
    tags: ["TypeScript", "Vite", "MVC"],
    href: "/projects/escape",
    embed: {
      // TODO: ゲームを単体デプロイ後、本番 URL に差し替える
      url: "http://localhost:5173",
      width: 1200,
      height: 800,
    },
  },
  {
    slug: "portfolio",
    title: "This Portfolio Site",
    description: "Next.js + TypeScript + Tailwind で制作したこのサイト自体。",
    tags: ["Next.js", "TypeScript", "Tailwind"],
    href: "https://github.com/", // TODO: 本物のリポジトリ URL に差し替え
  },
];
