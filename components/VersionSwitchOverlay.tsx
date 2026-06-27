"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { versions } from "@/data/versions";

/**
 * VersionSwitchOverlay
 * --------------------
 * バージョンが切り替わった瞬間に「演出」を出すための表示専用コンポーネント。
 *
 * 役割:
 *   - URL の先頭セグメント（= 現在のバージョン）が変化したことを検知し、
 *     `switched to v0.X.X "codename". reloading scene...` というメッセージを出す。
 *   - 初回はフル画面オーバーレイ、2回目以降は控えめなトーストで表示する。
 *
 * 配置:
 *   ルートレイアウト（app/layout.tsx）に常駐させる。usePathname を監視するため、
 *   どのページに遷移しても同じインスタンスが切替を検知できる必要がある。
 *
 * Phase 1 では切替先バージョンが 1 つしか無いため実際には発火しないが、
 * Phase 2 でバージョンを増やした時点でそのまま動作する（コードレベルで存在を保証）。
 */

/** sessionStorage に「フル画面演出を一度見た」フラグを記録するキー */
const SEEN_KEY = "versionSwitchSeen";

/** フェードアウトにかける時間 (ms)。CSS の transition-opacity duration-500 と一致させる */
const FADE_MS = 500;

/** フル画面演出の表示時間 (ms)。フェード開始までの待ち時間 */
const FULL_DURATION_MS = 1500;

/** トースト演出の表示時間 (ms)。フェード開始までの待ち時間 */
const TOAST_DURATION_MS = 1200;

/**
 * pathname の先頭セグメントを取り出し、それが有効なバージョン ID なら返す。
 * バージョン配下でないパス（例: "/projects"）や不正値の場合は null を返し、
 * 呼び出し側で「演出を出さない」判断に使う。
 *
 * 例: "/v0.1.0/history" -> "v0.1.0" / "/projects" -> null
 */
function getVersionSegment(pathname: string): string | null {
  const seg = pathname.split("/")[1] ?? "";
  return versions.some((v) => v.id === seg) ? seg : null;
}

/** 現在表示中の演出の状態。null のときは何も表示しない */
type OverlayState = {
  /** フル画面 or トーストの表示モード */
  mode: "full" | "toast";
  /** 画面に出すメッセージ本文 */
  text: string;
  /** true の間は opacity-0 を当ててフェードアウトさせる */
  leaving: boolean;
};

export function VersionSwitchOverlay() {
  const pathname = usePathname();

  // 直前に検知していたバージョン。これと現在値を比較して「変化したか」を判定する。
  // state ではなく ref にしているのは、比較用の値が変わっても再レンダー不要なため。
  const prevVersion = useRef<string | null>(null);

  // 初回マウントかどうか。最初のレンダーでは演出を出したくないので、
  // 1 回目だけ prevVersion を記録して素通りさせるためのフラグ。
  const initialized = useRef(false);

  // 表示中の演出。null なら非表示。
  const [state, setState] = useState<OverlayState | null>(null);

  useEffect(() => {
    const current = getVersionSegment(pathname);

    // --- 1) 初期マウント時は発火しない ---
    // ページを最初に開いた時点では「切替」ではないので、基準値だけ記録して終了。
    if (!initialized.current) {
      initialized.current = true;
      prevVersion.current = current;
      return;
    }

    // --- 2) バージョン部分が変化した時だけ発火 ---
    // current が null（バージョン外パス）や前回と同一（同一バージョン内のページ遷移）
    // の場合は演出を出さず、基準値の更新だけ行う。
    if (!current || current === prevVersion.current) {
      prevVersion.current = current;
      return;
    }
    prevVersion.current = current;

    // ここに来た時点で「別バージョンへ切り替わった」ことが確定している。
    const version = versions.find((v) => v.id === current);
    if (!version) return; // 念のためのガード（getVersionSegment 通過済みなので基本到達しない）

    const text = `switched to ${version.id} "${version.codename}". reloading scene...`;

    // --- 3) 初回かどうかで演出モードを決める ---
    // sessionStorage にフラグがあれば「2回目以降」とみなしトースト、無ければフル画面。
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      // プライベートブラウジング等で sessionStorage が使えない場合は握りつぶし、
      // 毎回フル画面演出になる挙動を許容する（仕様のエッジケース通り）。
      seen = false;
    }

    const mode: OverlayState["mode"] = seen ? "toast" : "full";
    const duration = mode === "full" ? FULL_DURATION_MS : TOAST_DURATION_MS;

    // --- 4) 表示 → フェード → 撤去 のタイマー制御 ---
    // 表示開始。この setState はバージョン変化時にしか走らないため再帰描画は起きない。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ mode, text, leaving: false });

    // duration 経過後にフェードアウト開始（opacity を 0 へ）。
    const fadeTimer = setTimeout(
      () => setState((s) => (s ? { ...s, leaving: true } : s)),
      duration
    );

    // フェード完了後に DOM から撤去し、フル画面を見せ終えたらフラグを保存する。
    const removeTimer = setTimeout(() => {
      setState(null);
      if (mode === "full") {
        try {
          sessionStorage.setItem(SEEN_KEY, "1");
        } catch {
          // 保存に失敗しても致命的ではないので握りつぶす（次回もフル画面になるだけ）。
        }
      }
    }, duration + FADE_MS);

    // pathname が再変化した場合や撤去前のアンマウントに備え、タイマーを掃除する。
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [pathname]);

  // 非表示状態では何もレンダーしない。
  if (!state) return null;

  // --- フル画面オーバーレイ（初回）---
  // 黒背景・白モノスペース・中央寄せ。leaving に応じて opacity をトグルしフェードさせる。
  if (state.mode === "full") {
    return (
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-500 ${
          state.leaving ? "opacity-0" : "opacity-100"
        }`}
        aria-live="polite"
      >
        <p className="px-8 text-center font-mono text-lg text-white">
          {state.text}
        </p>
      </div>
    );
  }

  // --- トースト（2回目以降）---
  // 画面右上に小さく表示。同じく leaving でフェードアウトする。
  return (
    <div
      className={`fixed top-6 right-6 z-[100] bg-black px-4 py-2 font-mono text-sm text-white shadow-lg transition-opacity duration-500 ${
        state.leaving ? "opacity-0" : "opacity-100"
      }`}
      aria-live="polite"
    >
      {state.text}
    </div>
  );
}
