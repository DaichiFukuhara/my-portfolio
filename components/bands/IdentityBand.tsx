/**
 * IdentityBand
 * ------------
 * 最上部のターミナルプロンプト風帯。
 * v0.2.0 では URL がシーンに連動しないため、パスは固定表示でよい。
 * シーン切替時も内容が変わらないのでアニメーションさせない（key を変えない）。
 */
export function IdentityBand() {
  return (
    <header className="border-b border-zinc-300 px-6 py-3 font-mono text-xs text-zinc-500 sm:text-sm">
      <span>d@portfolio:~$</span>
    </header>
  );
}
