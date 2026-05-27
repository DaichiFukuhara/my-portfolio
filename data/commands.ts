export type Command =
  | { name: string; description: string; action: "push"; path: string }
  | { name: string; description: string; action: "back" };

export const commands: Command[] = [
  { name: "home", description: "トップページへ移動する", action: "push", path: "/" },
  { name: "history", description: "経歴ページへ移動する", action: "push", path: "/history" },
  { name: "cd -", description: "ひとつ前のページに戻る", action: "back" },
];
