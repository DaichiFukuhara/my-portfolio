# Version機能 Phase 2: v0.2.0 "bands" 追加と帯シーン構成

## 目的 / 背景

Phase 1 で構築したバージョン機能の基盤に、初の追加バージョン `v0.2.0 "bands"` を実装する。本バージョンは画面を **Identity / Context / Content / Status の4帯** に分割した「シーン再構成型」UI を提供する。コマンドや URL が変わると、ページ遷移ではなく帯の中身が上から順に差し替わる視覚体験を作る。

Phase 1 で実装した切替演出（フル画面オーバーレイ + トースト）が本Phaseで初めて実発火する。

## 設計思想

### 「Scene」と「Layout」の分離

既存のページコンポーネント（top, history）は `min-h-screen` や `mx-auto max-w-3xl` のような **レイアウト責務** と **コンテンツ責務** が混在している。本Phaseではこれを分離する:

- **Scene コンポーネント** — コンテンツのみを持つ（見出し・段落・リスト等）。レイアウト指定（padding, max-width, min-height, 中央寄せ等）を持たない
- **Layout コンポーネント** — Scene を受け取り、そのバージョンに応じた配置・サイズで包む

これにより、同じ Scene が `DefaultLayout`（v0.1.0）でも `BandSceneLayout`（v0.2.0）でも正しく表示される。

### バージョンによるレイアウト分岐

`app/[version]/layout.tsx` で `params.version` を見て、使う Layout コンポーネントを切り替える。Scene を表す各 `page.tsx` は Scene コンポーネントを返すだけになる。

## 対象ファイル

### 新規作成

- `components/bands/BandSceneLayout.tsx` — 4帯構成のラッパー
- `components/bands/IdentityBand.tsx` — 最上部のプロンプト風帯
- `components/bands/ContextBand.tsx` — 現在のシーン名表示帯
- `components/bands/StatusBand.tsx` — 画面下部のステータス帯
- `components/layouts/DefaultLayout.tsx` — v0.1.0 用の既存レイアウト（現在のページから抽出）
- `components/scenes/TopScene.tsx` — トップシーンのコンテンツ（既存 `app/[version]/page.tsx` から抽出）
- `components/scenes/HistoryScene.tsx` — 経歴シーンのコンテンツ（既存 `app/[version]/history/page.tsx` から抽出）

### 変更

- `data/versions.ts` — `v0.2.0 "bands"` を追加
- `app/[version]/layout.tsx` — `params.version` で `DefaultLayout` / `BandSceneLayout` を切り替え
- `app/[version]/page.tsx` — `<TopScene />` を返すだけに
- `app/[version]/history/page.tsx` — `<HistoryScene />` を返すだけに
- `app/globals.css` — 帯遷移用のアニメーション keyframes を追加

## インターフェース / シグネチャ

### `data/versions.ts` 追加分

```typescript
export const versions: Version[] = [
  { id: "v0.1.0", codename: "default", description: "標準ポートフォリオ" },
  { id: "v0.2.0", codename: "bands", description: "帯シーン構成（実験的）" },
];
```

### `components/layouts/DefaultLayout.tsx`

```typescript
type Props = { children: React.ReactNode };
export function DefaultLayout({ children }: Props): JSX.Element;
```

中身は既存ページの外側（`<main className="min-h-screen bg-zinc-100 text-zinc-900"><section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-8 py-24">{children}</section></main>`）をそのまま移植する。

### `components/bands/BandSceneLayout.tsx`

```typescript
type Props = { children: React.ReactNode };
export function BandSceneLayout({ children }: Props): JSX.Element;
```

縦方向に 4 帯を積む CSS Grid または flex レイアウト:

```
┌─────────────────────────────┐
│ IdentityBand (auto height)  │
├─────────────────────────────┤
│ ContextBand  (auto height)  │
├─────────────────────────────┤
│ Content      (flex: 1)      │  ← {children}
│                             │
├─────────────────────────────┤
│ StatusBand   (auto height)  │
└─────────────────────────────┘
```

`min-h-screen` を全体に適用。Content 部分が縦方向の残り空間を埋める。背景は `bg-zinc-100`、帯の区切りは細い `border-zinc-300` 程度の罫線で表現。

Content 部分は `{children}` をそのまま包むが、内側に `mx-auto max-w-3xl px-8 py-12` 程度の余白を持たせる（Scene 側はレイアウト指定を持たないため、ここで指定する）。

### `components/bands/IdentityBand.tsx`

- Client component（`usePathname` を使うため）
- 表示内容: ターミナルプロンプト風テキスト
  - 例: `d@portfolio:/v0.2.0/history$`
  - パス部分は `usePathname()` から取得（バージョン部分を含む現在パス全体）
- フォント: モノスペース（`font-mono`）、サイズ `text-xs` か `text-sm`
- 高さ: `py-3` 程度
- 横方向 padding: `px-6` 程度

### `components/bands/ContextBand.tsx`

- Client component
- 表示内容: 現在のシーン名
  - 例: `> top` / `> history`
  - 判定: `usePathname()` の末尾セグメントから導出。`/v0.2.0` なら `top`、`/v0.2.0/history` なら `history`
- フォント: モノスペース、サイズ `text-base`
- 文字色は本文より少し強め（`text-zinc-900 font-medium`）
- 高さ: `py-4` 程度

### `components/bands/StatusBand.tsx`

- Client component
- 表示内容（左から右へ、または中央寄せ）:
  - 左: 現在のバージョン情報 `v0.2.0 "bands"`
  - 中央 or 右: 操作ヒント `>_ open command launcher`
- フォント: モノスペース、サイズ `text-xs`
- 色: `text-zinc-500` 程度の控えめなトーン
- 高さ: `py-2` 程度

### `components/scenes/TopScene.tsx`

既存 `app/[version]/page.tsx` の `<section>` 内側のみを移植:

- ラベル `Power Engineer`
- 名前 `D.`
- 自己紹介テキスト
- GitHub / AtCoder ボタン

`min-h-screen` や `max-w-3xl` 等のレイアウト指定は **付けない**。テキストサイズ・フォント・色のみ保持。

### `components/scenes/HistoryScene.tsx`

既存 `app/[version]/history/page.tsx` の `<section>` 内側のみを移植:

- ラベル `Career`
- 見出し `History`
- タイムライン（`timelineItems` も同ファイル内で保持）

同様にレイアウト指定は付けない。

### `app/[version]/layout.tsx` 変更

Phase 1 で実装した `notFound()` 処理に加えて、レイアウト分岐を追加:

```typescript
import { DefaultLayout } from "@/components/layouts/DefaultLayout";
import { BandSceneLayout } from "@/components/bands/BandSceneLayout";

// (notFound チェック後)
const Layout = version === "v0.2.0" ? BandSceneLayout : DefaultLayout;
return <Layout>{children}</Layout>;
```

判定はベタ書きでよい（バージョンが増えたらマップに置き換える）。

### `app/globals.css` 追加分

```css
@layer utilities {
  @keyframes bandSwap {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .band-animate {
    animation: bandSwap 280ms ease-out both;
  }

  @media (prefers-reduced-motion: reduce) {
    .band-animate {
      animation: none;
    }
  }
}
```

## 振る舞い / データフロー

### Scene 切替時のアニメーション

`/v0.2.0` から `/v0.2.0/history` のような、**bands バージョン内** での Scene 切替時に、帯が上から順にスタガーで再描画される。

実装方法は **`key={pathname}` による再マウント + CSS animation-delay でスタガー**:

```tsx
// BandSceneLayout 内の擬似コード
const pathname = usePathname();

<div className="flex flex-col min-h-screen">
  <IdentityBand
    key={pathname}
    style={{ animationDelay: "0ms" }}
    className="band-animate"
  />
  <ContextBand
    key={pathname}
    style={{ animationDelay: "80ms" }}
    className="band-animate"
  />
  <main
    key={pathname}
    style={{ animationDelay: "160ms" }}
    className="band-animate"
  >
    {children}
  </main>
  <StatusBand
    key={pathname}
    style={{ animationDelay: "240ms" }}
    className="band-animate"
  />
</div>;
```

合計約 400ms 程度で全帯が落ち着く。`prefers-reduced-motion: reduce` 環境では `band-animate` が無効化される。

### バージョン切替時の演出（Phase 1 の機構が初発火）

- v0.1.0 → v0.2.0 の遷移時、`VersionSwitchOverlay` が以下の挙動を取る:
  - セッション中初回: フル画面オーバーレイで `switched to v0.2.0 "bands". reloading scene...` を 1.5秒表示
  - 2回目以降: トースト表示
- オーバーレイがフェードアウトした後、その下では `BandSceneLayout` の4帯がスタガーで現れる
- v0.2.0 → v0.1.0 の戻りも同様の演出（テキストは `switched to v0.1.0 "default". reloading scene...`）

### Status 帯の挙動

- 表示内容は現在のバージョンに依存（例: `v0.2.0 "bands"`）
- `useParams` で現在のバージョン ID を取得し、`versions` 配列から該当エントリを引いて表示
- バージョン切替時は本帯の内容も変化する

## 受け入れ条件 (Acceptance Criteria)

- [ ] `data/versions.ts` に `v0.2.0 "bands"` が追加され、VersionSelector と CommandLauncher の両方で選択肢として表示される
- [ ] `/v0.2.0` でトップシーンが、`/v0.2.0/history` で経歴シーンが、それぞれ 4帯構成で表示される
- [ ] `/v0.1.0` および `/v0.1.0/history` の見た目は Phase 1 完了時点から **一切変わっていない**
- [ ] `v0.2.0` の Identity 帯にプロンプト風テキストが表示され、現在パスが反映される
- [ ] `v0.2.0` の Context 帯に `> top` / `> history` 等のシーン名が表示される
- [ ] `v0.2.0` の Status 帯にバージョン情報と操作ヒントが表示される
- [ ] `v0.2.0` 内で Scene を切り替えた時（例: トップ → history）、4帯が上から順にスタガーで再描画される
- [ ] バージョン切替時、初回はフル画面オーバーレイ、2回目以降はトーストが表示される（Phase 1 機構の実発火確認）
- [ ] `prefers-reduced-motion: reduce` 環境では帯アニメーションが無効化される
- [ ] モバイル幅（375px）でも 4帯が縦に積まれて表示される（各帯の高さは自動調整、Content 帯が縦スクロール可能）
- [ ] `npm run build` が成功する

## エッジケース / エラー処理

- 同一バージョン・同一シーンへの遷移（例: `/v0.2.0/history` から `/v0.2.0/history`）→ `key={pathname}` が変わらないので再アニメーションしない
- 非常に縦が短いビューポート（高さ 400px 等）→ Content 帯が `min-h-0` で潰れ、内部スクロールで対応
- `prefers-reduced-motion: reduce` 環境での切替演出（フル画面オーバーレイ）→ オーバーレイ自体は表示するが、フェードアニメーションは省略して即時表示・即時消去でよい（実装簡易化のため初期は通常通りでも可）

## テスト方針

手動確認のみ:

1. `npm run dev` 起動
2. `/v0.1.0` で既存の見た目が完全に保たれていることを確認
3. `/v0.2.0` にアクセスし、4帯構成で表示されることを確認
4. `/v0.2.0/history` に遷移し、4帯が上から順にスタガーで再描画されることを目視確認
5. VersionSelector で v0.1.0 → v0.2.0 切替を実行 → 初回フル画面オーバーレイが発火することを確認
6. 同セッション内で再度切替（v0.2.0 → v0.1.0）→ トーストが発火することを確認
7. ブラウザの「縮小モーション」設定をオンにして再度切替 → 帯アニメーションが無効化されていることを確認（macOS: システム設定 → アクセシビリティ → ディスプレイ → 視差効果を減らす / Chrome DevTools: Rendering タブ → Emulate CSS media feature prefers-reduced-motion）
8. モバイル幅（DevTools の iPhone SE プリセット等）で表示崩れがないことを確認
9. `npm run build` 成功確認

## スコープ外

- 新たな Scene（projects ページ等）の追加 → 別タスク
- 隠しコマンドや Labs 的な機能の実装 → 別バージョン（Phase 3 以降）
- 帯の中身を「武骨」コンセプトでさらに装飾する（ASCII アート挿入等） → 後続改良
- Ctrl+J キーボードショートカット → 別タスク
- リクルーターへの「v0.2.0 を試してみて」案内表示 → 別タスク
- バンド遷移時の効果音やハプティクス → スコープ外
