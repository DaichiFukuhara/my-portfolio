import { versions } from "@/data/versions";

export type Command =
  // versioned が true の push は path をサブパス扱いし、現在のバージョンを前置する
  //   （例: path "/projects" + バージョン v0.1.0 -> /v0.1.0/projects）。
  // false（省略）の push は path をそのまま遷移先にする
  //   （バージョン外の絶対パスや外部リンクを追加したい場合に使う。現状は該当なし）。
  | {
      name: string;
      description: string;
      action: "push";
      path: string;
      versioned?: boolean;
    }
  | { name: string; description: string; action: "back" }
  | { name: string; description: string; action: "version"; versionId: string };

const baseCommands: Command[] = [
  { name: "home", description: "トップページへ移動する", action: "push", path: "", versioned: true },
  { name: "history", description: "経歴ページへ移動する", action: "push", path: "/history", versioned: true },
  { name: "projects", description: "プロジェクト一覧へ移動する", action: "push", path: "/projects", versioned: true },
  { name: "cd -", description: "ひとつ前のページに戻る", action: "back" },
];

// versions 配列から全バージョン分の切替コマンドを動的生成する
const versionCommands: Command[] = versions.map((v) => ({
  name: `version: ${v.codename}`,
  description: `${v.id} (${v.description}) に切り替える`,
  action: "version",
  versionId: v.id,
}));

export const commands: Command[] = [...baseCommands, ...versionCommands];
