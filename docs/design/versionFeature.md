# Version機能 Phase 1: 基盤構築

## 目的 / 背景

ポートフォリオサイトに「バージョン」概念を導入する。バージョンは「コードネーム付きの累積機能セット」として複数を切り替え可能にする設計だが、本Phaseでは **v0.1.0 "default" の1個だけ** を実装し、将来のバージョン追加に必要な基盤（URL構造・切替UI・切替演出機構）を完成させる。

Phase 1の時点では切替先が存在しないため切替自体は発生しないが、後続のPhase 2で `data/versions.ts` にバージョンを1行追加するだけで全機能が動作する状態を目指す。

## 対象ファイル

### 新規作成

- `data/versions.ts` — バージョンメタデータの中央管理
- `app/[version]/layout.tsx` — バージョンを動的ルートで受けるレイアウト。不正バージョン時の404処理
- `app/[version]/page.tsx` — トップページ（既存 `app/page.tsx` から移動）
- `app/[version]/history/page.tsx` — 経歴ページ（既存 `app/history/page.tsx` から移動）
- `components/VersionSelector.tsx` — 左下固定の切替UI
- `components/VersionSwitchOverlay.tsx` — 切替演出（フル画面 + トースト）

### 変更

- `app/layout.tsx` — `VersionSelector` と `VersionSwitchOverlay` を追加
- `app/page.tsx` — `redirect("/v0.1.0")` だけのファイルに置き換え
- `data/commands.ts` — path を `/{version}/...` の形に変えるか、または「現在のバージョンを動的に組み込む」ロジックを CommandLauncher 側に移す（どちらかを実装者が選択）
- `components/CommandLauncher.tsx` — 現在のバージョンを `useParams` で取得し、ナビゲーション先パスにバージョンを反映。`version` 切替コマンドも追加

### 削除

- `app/history/page.tsx` — `app/[version]/history/page.tsx` に移動するため

## インターフェース / シグネチャ

### `data/versions.ts`

```typescript
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
```

### `app/[version]/layout.tsx`

- `generateStaticParams` で `versions` から `{ version: v.id }` を返す
- `params.version` が `versions` に存在しなければ `notFound()`
- それ以外は `{children}` をそのまま返す

### `components/VersionSelector.tsx`

- Client component
- 画面左下に固定配置（`fixed bottom-6 left-6 z-50`）
- 表示内容: 歯車アイコン（`@phosphor-icons/react` の `GearIcon`）と現在バージョンIDを並列表示
  - 例: `⚙  [v0.1.0]`
  - 両方とも1つのクリック領域として動作（押せる範囲を広く取る）
- クリックで Dialog を開く
- Dialog 内に Select で `versions` を選択肢として表示。各選択肢は `v0.1.0 — default` のように `id — codename` 形式で表示
- 「Run」ボタンで `router.push` を実行。遷移先は **現在のサブパスを保持したまま** バージョン部分だけを置き換える
  - 例: `/v0.1.0/history` で `v0.2.0` を選択 → `/v0.2.0/history` に遷移

### `components/VersionSwitchOverlay.tsx`

- Client component、`app/layout.tsx` に配置
- `usePathname` を監視し、パスのバージョン部分（先頭セグメント）が変化した時に発火
- セッション中の初回判定: `sessionStorage.getItem("versionSwitchSeen")` の有無
  - **無い場合（初回）**: フル画面オーバーレイ
    - 黒背景・白いモノスペースフォント・中央寄せ
    - 表示テキスト: `switched to v0.X.X "codename". reloading scene...`
    - 約 1.5秒 表示後にフェードアウト
    - 表示完了時に `sessionStorage.setItem("versionSwitchSeen", "1")`
  - **ある場合（2回目以降）**: トースト
    - 画面右上または中央上部に小さく表示
    - 同テキストを約 1.2秒 表示後にフェードアウト
- 同一バージョン内のページ遷移（例: `/v0.1.0/` → `/v0.1.0/history`）では発火しない
- 初期マウント時（ページを最初に開いた時）も発火しない

### `data/commands.ts`

`Command` 型に `version` action を追加:

```typescript
type Command =
  | { name: string; action: "push"; path: string } // path はバージョン込みかバージョン抜きかを実装者が決定
  | { name: string; action: "back" }
  | { name: string; action: "version"; versionId: string };
```

`versions` 配列をループして全バージョン分の `version` コマンドを動的生成する設計が望ましい（手動列挙だとバージョン追加時に変更箇所が増える）。

### `components/CommandLauncher.tsx`

- `useParams` で現在のバージョンを取得
- `push` action のパスを組み立てる時に、現在のバージョンを反映
- `version` action のときは、現在のサブパスを保持したまま `router.push` を実行（VersionSelectorと同じロジック）

## 振る舞い / データフロー

### URL設計

| URL                                   | 挙動                        |
| ------------------------------------- | --------------------------- |
| `/`                                   | `redirect("/v0.1.0")`       |
| `/v0.1.0`                             | トップページ                |
| `/v0.1.0/history`                     | 経歴ページ                  |
| `/v9.9.9` 等の存在しないバージョン    | 404                         |
| `/history` 等のバージョンなしサブパス | 404（リダイレクトはしない） |

### バージョン切替フロー

1. ユーザーが VersionSelector、CommandLauncher、または直接URLでバージョンを切り替える
2. `router.push("/v0.X.X/{現在のサブパス}")` が実行される
3. Next.js のページ遷移が発火し、新バージョンのページがマウントされる
4. `VersionSwitchOverlay` の `usePathname` 監視がバージョン部分の変化を検知
5. `sessionStorage` の状態で分岐:
   - 初回 → フル画面オーバーレイ → 完了時にフラグ保存
   - 2回目以降 → トースト
6. 一定時間後にフェードアウト

### 「現在のパスを保持して遷移」のロジック

VersionSelector・CommandLauncher の両方で必要なロジック。次のような形:

```typescript
const params = useParams();
const pathname = usePathname();
const currentVersion = params.version as string;
const subPath = pathname.replace(`/${currentVersion}`, "") || "";
const targetPath = `/${newVersionId}${subPath}`;
router.push(targetPath);
```

共通ヘルパー関数として `lib/version-routing.ts` 等に切り出すと再利用しやすい。

## 受け入れ条件 (Acceptance Criteria)

- [ ] `/` にアクセスすると `/v0.1.0` にリダイレクトされる
- [ ] `/v0.1.0` でトップページ、`/v0.1.0/history` で経歴ページが表示される
- [ ] `/v9.9.9` 等の存在しないバージョンで404ページが表示される
- [ ] 画面左下に歯車アイコンと `[v0.1.0]` が並列で表示される
- [ ] 左下UIをクリックすると Dialog が開き、バージョン選択用 Select が表示される
- [ ] CommandLauncher を開くと、既存コマンド（history等）に加えて `version: default` 相当の選択肢が表示される
- [ ] CommandLauncher で history を選んだ場合、現在のバージョンを保持した `/v0.X.X/history` に遷移する
- [ ] `data/versions.ts` の `versions` 配列に1行追加するだけで、VersionSelector と CommandLauncher の両方に新バージョンが選択肢として現れる
- [ ] `VersionSwitchOverlay` のフル画面・トースト両モードのコンポーネントが実装されている（Phase 1では実発火不可、コードレベルで存在することを確認）
- [ ] `npm run build` が成功する
- [ ] 既存ページ（トップ、history）の見た目が変わっていない

## エッジケース / エラー処理

- 存在しないバージョン URL → `notFound()` で標準404
- `sessionStorage` 利用不可（プライベートブラウジング等） → try/catch で握りつぶし、毎回フル画面演出になる挙動を許容
- VersionSelector で現在と同じバージョンを選択 → 遷移しない（または遷移しても切替演出は出ない）
- `useParams` で `version` が `undefined`（`/` から遷移する一瞬など） → defaultVersion を使用するフォールバック

## テスト方針

手動確認のみ:

1. `npm run dev` 起動
2. `http://localhost:3000/` → `/v0.1.0` に自動リダイレクトされることを確認
3. `/v0.1.0/history` で経歴ページが表示されることを確認
4. `/v9.9.9` で404が出ることを確認
5. 左下UIが表示され、クリックで Dialog が開くことを確認
6. CommandLauncher（`>_` ボタン）を開き、`version` 系コマンドが選択肢に含まれることを確認
7. CommandLauncher で `history` を選択し、URLが `/v0.1.0/history` になることを確認
8. `npm run build` 成功確認

## スコープ外

本Phaseでは以下を**実装しない**:

- 新バージョン `v0.2.0 "bands"` の追加 → Phase 2
- 帯シーン構成（Identity / Context / Content / Status 4帯） → Phase 2
- Ctrl+J キーボードショートカット → 別タスク
- prefers-reduced-motion 対応 → 後続Phase
- リクルーターへの「他バージョンがあるよ」誘導表示 → Phase 2以降
- バージョン切替演出の実環境動作確認（切替先がないため不可能） → Phase 2で実施
