export type Version = {
  id: string; // 例: "v0.1.0"
  codename: string; // 例: "default"
  description: string; // 例: "標準ポートフォリオ"
};

export const versions: Version[] = [
  {
    id: "v0.1.0",
    codename: "default",
    description: "標準ポートフォリオ",
  },
  {
    id: "v0.2.0",
    codename: "bands",
    description: "帯シーン構成（実験的）",
  },
];

export const defaultVersion = versions[0];
