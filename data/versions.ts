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
];

export const defaultVersion = versions[0];
