# Version機能 Phase 2 (再設計版): v0.2.0 "bands" を SPA 型シーン構成として実装

## 目的 / 背景

Phase 2 旧版では v0.2.0 のシーン切替を Next.js のページ遷移（`/v0.2.0/history` 等）として実装したが、結果として v0.1.0 との挙動差が「帯レイアウトの有無」だけになり、「コマンドを変えたら画面そのものが再構成される」という当初のコンセプトが体験として伝わらなかった。

本再設計版では、v0.2.0 を **単一ルート (`/v0.2.0`) の SPA 型** として作り直す。シーン切替は URL の変化を伴わず、React state による Content 帯の差し替えとして実現する。

## 設計判断（前提）

以下は議論で決定済み。実装者が変更してはならない:

- **v0.2.0 のシーンは URL に出さない** — `/v0.2.0` の1ルートのみ。経歴等の共有用 URL は v0.1.0 を使う方針
- **シーン state はリロードで消える** — sessionStorage 等で復元しない。常に top シーンから始まる
- **v0.1.0 の挙動は変更しない** — 既存の URL 構造（`/v0.1.0/history` 等）と挙動は完全保持

## 対象ファイル

### 新規作成

- `components/bands/BandSceneLayout.tsx` — 4帯構成のラッパー兼シーン state 管理
- `components/bands/IdentityBand.tsx`
- `components/bands/ContextBand.tsx`
- `components/bands/StatusBand.tsx`
- `components/layouts/DefaultLayout.tsx` — v0.1.0 用、既存ページから抽出
- `components/scenes/TopScene.tsx` — トップシーンのコンテンツ部分（レイアウト指定なし）
- `components/scenes/HistoryScene.tsx` — 経歴シーンのコンテンツ部分（レイアウト指定なし）
- `lib/band-scene-context.tsx` — シーン state を共有する React Context
- `data/scenes.ts` — シーン定義（id, label, component）の一覧

### 変更

- `data/versions.ts` — `v0.2.0 "bands"` を追加
- `app/[version]/layout.tsx` — `params.version` で `DefaultLayout` / `BandSceneLayout` を切り替え
- `app/[version]/page.tsx` — `params.version` が `v0.2.0` なら何も返さない（または empty fragment）、それ以外は `<TopScene />` を返す
- `app/[version]/history/page.tsx` — v0.1.0 用のまま残す。v0.2.0 では使われない
- `components/CommandLauncher.tsx` — 現在のバージョンを見て、push するか BandScene state を変更するかを分岐

### 注意

- v0.2.0 ではサブパスを持たないため、`/v0.2.0/history` のような URL は **404 になる**（特別なリダイレクトは不要）
- v0.1.0 のルート構造（`app/[version]/history/page.tsx`）はそのまま生かす

## インターフェース / シグネチャ

### `data/scenes.ts`

```typescript
import { TopScene } from "@/components/scenes/TopScene";
import { HistoryScene } from "@/components/scenes/HistoryScene";

export type SceneId = "top" | "history";

export type Scene = {
  id: SceneId;
  label: string; // Context帯表示用、例: "top", "history"
  component: React.ComponentType;
};

export const scenes: Scene[] = [
  { id: "top", label: "top", component: TopScene },
  { id: "history", label: "history", component: HistoryScene },
];

export const defaultSceneId: SceneId = "top";
```

`data/commands.ts` の各コマンドは v0.2.0 用に `sceneId` を持つ形で拡張する案もあるが、本Phase では `commands` の `name` と `scenes` の `id` が一致することを利用してマッピングする（簡素な実装を優先）。

### `lib/band-scene-context.tsx`

```typescript
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { SceneId, defaultSceneId } from "@/data/scenes";

type BandSceneContextValue = {
  currentSceneId: SceneId;
  setCurrentSceneId: (id: SceneId) => void;
};

const BandSceneContext = createContext<BandSceneContextValue | null>(null);

export function BandSceneProvider({ children }: { children: ReactNode }) {
  const [currentSceneId, setCurrentSceneId] = useState<SceneId>(defaultSceneId);
  return (
    <BandSceneContext.Provider value={{ currentSceneId, setCurrentSceneId }}>
      {children}
    </BandSceneContext.Provider>
  );
}

export function useBandScene(): BandSceneContextValue | null {
  return useContext(BandSceneContext);
}
```

`useBandScene` は **null を返しうる**（v0.1.0 では Provider の外にいるため）。これにより CommandLauncher で「Provider があるか = bands バージョンか」を判定できる。

### Provider の配置

`BandSceneProvider` は **`app/layout.tsx` の最上位** に置く。理由:

- CommandLauncher も `app/layout.tsx` 直下に配置されており、v0.2.0 にいる時にシーン state を変えたい
- BandSceneLayout より外側で Provider を持つことで、CommandLauncher からも `useBandScene` でアクセス可能
- v0.1.0 にいる時も Provider 自体は存在するが、誰も state を読まないので無害

ただしこの設計だと「Provider が常に存在する」ため、`useBandScene` で null を返す仕組みは意味がなくなる。代替案として:

**より良い設計**: `useBandScene` ではなく、**`useParams()` で現在のバージョンを確認** して分岐する:

```typescript
const params = useParams();
const isOnBands = params.version === "v0.2.0";
```

CommandLauncher 内では `isOnBands` で分岐する。Provider は常に張られていてよい。

### `components/bands/BandSceneLayout.tsx`

```typescript
"use client";

import { useBandScene } from "@/lib/band-scene-context";
import { scenes } from "@/data/scenes";
import { IdentityBand } from "./IdentityBand";
import { ContextBand } from "./ContextBand";
import { StatusBand } from "./StatusBand";

export function BandSceneLayout() {
  const ctx = useBandScene();
  if (!ctx) return null; // 念のため
  const { currentSceneId } = ctx;
  const scene = scenes.find((s) => s.id === currentSceneId) ?? scenes[0];
  const SceneComponent = scene.component;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100">
      <IdentityBand />
      <ContextBand key={`ctx-${currentSceneId}`} sceneLabel={scene.label} />
      <main
        key={`content-${currentSceneId}`}
        className="band-animate flex-1 px-6 py-12"
        style={{ animationDelay: "160ms" }}
      >
        <div className="mx-auto max-w-3xl">
          <SceneComponent />
        </div>
      </main>
      <StatusBand />
    </div>
  );
}
```

- `BandSceneLayout` は children を **受け取らない**（page.tsx からの渡しは無視）。シーンの中身は state から決まる
- `key={currentSceneId}` を変えることで、シーン切替時に再マウント → CSS アニメーションが発火
- スタガーは `animationDelay` インラインスタイルで指定

### `components/bands/IdentityBand.tsx`

- Client component
- 表示: `d@portfolio:~$`（パスは固定でよい、v0.2.0 では URL がシーンに連動しないため）
- フォント: `font-mono text-xs sm:text-sm`
- 高さ: `py-3 px-6`
- 下線: `border-b border-zinc-300`
- シーン切替時はアニメーションしない（変化しないため `key` を変えない）

### `components/bands/ContextBand.tsx`

```typescript
export function ContextBand({ sceneLabel }: { sceneLabel: string }) {
  return (
    <div
      className="band-animate border-b border-zinc-300 px-6 py-4 font-mono text-base font-medium text-zinc-900"
      style={{ animationDelay: "80ms" }}
    >
      &gt; {sceneLabel}
    </div>
  );
}
```

`key` は親（`BandSceneLayout`）が `key={\`ctx-${currentSceneId}\`}` で渡すので、シーン切替時に再マウント。

### `components/bands/StatusBand.tsx`

- Client component
- 表示: 左に `v0.2.0 "bands"`、右に `>_ open command launcher`
- フォント: `font-mono text-xs text-zinc-500`
- 高さ: `py-2 px-6`
- 上線: `border-t border-zinc-300`
- シーン切替時のアニメーションは入れない（情報が変化しないため）。バージョン切替時はバージョン全体が再マウントされるので別途意識不要

### `components/scenes/TopScene.tsx`

既存 `app/[version]/page.tsx` の `<section>` 内側のみを移植。`min-h-screen` `mx-auto` `max-w-3xl` 等のレイアウト指定は **すべて削除**。テキストサイズ・色・フォントウェイトのみ保持。

```typescript
export function TopScene() {
  return (
    <>
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
        Power Engineer
      </p>
      <h1 className="text-7xl font-black tracking-tight sm:text-8xl">D.</h1>
      <p className="mt-6 max-w-lg text-base leading-relaxed text-zinc-600 sm:text-lg">
        筋トレと音楽を愛するパワー系エンジニア。将来はボディビルダーを本職に、副業としてエンジニアを目指している。
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Button asChild variant="outline"><a href="#">GitHub</a></Button>
        <Button asChild variant="outline"><a href="#">AtCoder</a></Button>
      </div>
    </>
  );
}
```

### `components/scenes/HistoryScene.tsx`

既存 `app/[version]/history/page.tsx` の `<section>` 内側のみを移植。`timelineItems` も同ファイル内に保持。レイアウト指定は削除。

### `components/layouts/DefaultLayout.tsx`

v0.1.0 用の既存ラッパーを抽出:

```typescript
export function DefaultLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900">
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-8 py-24">
        {children}
      </section>
    </main>
  );
}
```

### `app/[version]/layout.tsx` の変更

```typescript
if (version === "v0.2.0") {
  return <BandSceneLayout />; // children は使わない
}
return <DefaultLayout>{children}</DefaultLayout>;
```

v0.2.0 では children を捨てるという挙動になる。これは「`page.tsx` が何を返しても無視され、シーンは state から決まる」設計のため。

### `app/[version]/page.tsx` の変更

```typescript
import { TopScene } from "@/components/scenes/TopScene";

export default async function Page({ params }: { params: Promise<{ version: string }> }) {
  const { version } = await params;
  if (version === "v0.2.0") return null; // BandSceneLayout がシーンを描画する
  return <TopScene />;
}
```

### `app/[version]/history/page.tsx` の変更

```typescript
import { HistoryScene } from "@/components/scenes/HistoryScene";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ version: string }> }) {
  const { version } = await params;
  if (version === "v0.2.0") notFound(); // v0.2.0 では /history は存在しない
  return <HistoryScene />;
}
```

### `app/layout.tsx` の変更

```typescript
import { BandSceneProvider } from "@/lib/band-scene-context";

// body内:
<BandSceneProvider>
  {children}
  <CommandLauncher />
  {/* VersionSelector, VersionSwitchOverlay 等の既存配置はそのまま */}
</BandSceneProvider>
```

### `components/CommandLauncher.tsx` の変更

handleRun ロジックを以下のように分岐:

```typescript
const params = useParams();
const isOnBands = params.version === "v0.2.0";
const { setCurrentSceneId } = useBandScene()!; // Provider 内なので non-null

function handleRun() {
  const found = commands.find((c) => c.name === selected);
  if (!found) {
    setOpen(false);
    return;
  }

  if (found.action === "version") {
    // 既存のバージョン切替処理（変更なし）
    return;
  }

  if (isOnBands && found.action === "push") {
    // v0.2.0 では push の代わりにシーン state を変更
    const sceneId = mapCommandNameToSceneId(found.name); // "history" → "history" 等
    if (sceneId) setCurrentSceneId(sceneId);
    setOpen(false);
    return;
  }

  // v0.1.0 では既存通り router.push
  if (found.action === "push") router.push(found.path);
  if (found.action === "back") router.back();
  setOpen(false);
}
```

`mapCommandNameToSceneId` は単純なマップ関数で、`{ "history": "history", "home": "top" }` 程度の対応表でよい。または `scenes` 配列の `id` と `commands` の `name` が一致するものを探す形でもよい。

## 振る舞い / データフロー

### v0.2.0 内のシーン切替フロー

1. ユーザーが CommandLauncher で `history` を選択
2. CommandLauncher が `useParams` で現在 v0.2.0 にいることを検知
3. `setCurrentSceneId("history")` を実行
4. `BandSceneLayout` が再描画され、`currentSceneId` が変わったため `key` も変わる
5. Context帯と Content帯が再マウントされ、CSS animation `bandSwap` がスタガー発火（Context: 80ms, Content: 160ms）
6. URL は変わらないまま、画面の見た目だけが切り替わる

### v0.1.0 から v0.2.0 への切替フロー

1. ユーザーが VersionSelector で v0.2.0 を選択
2. `router.push("/v0.2.0")` が実行される
3. Phase 1 で実装した `VersionSwitchOverlay` が発火（初回フル画面 / 2回目以降トースト）
4. 新ルートで `app/[version]/layout.tsx` が `BandSceneLayout` を選択
5. `BandSceneProvider` の state は初期値 `top` のため、Top シーンから始まる

### v0.2.0 から v0.1.0 への戻りフロー

1. ユーザーが VersionSelector で v0.1.0 を選択
2. `router.push("/v0.1.0")` が実行される
3. 切替演出発火
4. `BandSceneProvider` の state は v0.2.0 を出ても保持されるが、v0.1.0 では誰も読まないので影響なし
5. v0.1.0 に再度入った時には Provider state は前回のままだが、これも誰も読まないので無害
6. v0.2.0 に再度入った時には state が `top` 以外になっている可能性がある

### state 初期化のタイミング

「リロード時は常に top に戻る」要件を満たすには:

- `BandSceneProvider` の `useState<SceneId>(defaultSceneId)` で十分（マウント時に必ず初期値）
- ただし上記の通り、**バージョンを行き来した時も state が残る**問題がある

これを「v0.2.0 を出たら state を `top` にリセット」する形に変える:

```typescript
// app/[version]/layout.tsx で:
if (version !== "v0.2.0") {
  // v0.2.0 を出たことを Provider に通知して state を top にリセット
}
```

→ シンプルにする実装案: `BandSceneLayout` 自体が **マウント時に必ず `setCurrentSceneId("top")` を実行する** useEffect を持つ。これにより v0.2.0 に入るたびに必ず top から始まる。

```typescript
useEffect(() => {
  setCurrentSceneId("top");
}, []);
```

これで「リロードでも、別バージョンを経由しても、v0.2.0 に入った瞬間は必ず top」が実現できる。

## 受け入れ条件 (Acceptance Criteria)

- [ ] `/v0.2.0` にアクセスすると Top シーンが4帯構成で表示される
- [ ] `/v0.2.0/history` にアクセスすると 404 になる（v0.2.0 ではサブパスは存在しない）
- [ ] `/v0.1.0` および `/v0.1.0/history` の見た目・挙動は Phase 1 完了時点から **完全に保たれている**
- [ ] v0.2.0 にいる時、CommandLauncher で `history` を選ぶと、**URL が変わらないまま** Content 帯が経歴シーンに切り替わる
- [ ] シーン切替時、Context 帯と Content 帯が上から順にスタガーで再描画される
- [ ] v0.2.0 で他のシーンを表示中にブラウザをリロードすると Top シーンに戻る
- [ ] v0.2.0 → v0.1.0 → v0.2.0 と移動した時、v0.2.0 に戻った瞬間に Top シーンから始まる（前回のシーン state を引きずらない）
- [ ] バージョン切替演出（フル画面 / トースト）が Phase 1 設計通りに発火する
- [ ] `prefers-reduced-motion: reduce` で帯アニメーションが無効化される
- [ ] モバイル幅で4帯構成が破綻しない
- [ ] `npm run build` が成功する

## エッジケース / エラー処理

- v0.2.0 にいる時に CommandLauncher で `back` action が呼ばれた場合 → `router.back()` を実行（バージョン切替前のページに戻る挙動でよい）
- v0.2.0 にいる時に CommandLauncher の `home` のような top シーンへの遷移が呼ばれた場合 → `setCurrentSceneId("top")` を実行
- `commands.ts` のコマンドに対応するシーンが `scenes.ts` に存在しない場合 → 何もしない（CommandLauncher を閉じるだけ）
- 同じシーンに切り替える操作（top にいる時に top を選ぶ） → `key` が変わらないので再アニメーションしない

## テスト方針

手動確認:

1. `npm run dev` 起動
2. `/v0.1.0` および `/v0.1.0/history` で既存の見た目が完全に保たれていることを確認
3. `/v0.2.0` で 4帯構成の Top シーンが表示されることを確認
4. CommandLauncher で `history` を選択 → URL が `/v0.2.0` のまま、Content 帯だけ History に切り替わることを確認
5. 4 で切替後にブラウザリロード → Top シーンに戻ることを確認
6. v0.2.0 で History シーンを表示中に v0.1.0 へ切替 → 再度 v0.2.0 へ戻る → Top シーンから始まることを確認
7. `/v0.2.0/history` で 404 が出ることを確認
8. バージョン切替時の演出（初回フル画面 / 2回目トースト）が動作することを確認
9. DevTools で prefers-reduced-motion を有効化 → 帯アニメーションが消えることを確認
10. モバイル幅で表示確認
11. `npm run build` 成功確認

## スコープ外

- 新たなシーン（projects 等）の追加 → 別タスク
- v0.2.0 内でのブラウザ戻る/進む対応 → 仕様上不要（URL が動かないため）
- 隠しコマンド・Labs 的機能 → 別バージョン
- Ctrl+J キーボードショートカット → 別タスク
- バンド遷移の効果音 → スコープ外
- v0.2.0 のシーンを URL 共有可能にする機構 → 仕様上不要（共有は v0.1.0 を使う方針）
