import { versions, defaultVersion } from "@/data/versions";

/** 指定されたバージョン ID が存在するか */
export function isValidVersion(id: string | undefined): boolean {
  return !!id && versions.some((v) => v.id === id);
}

/**
 * useParams から得た version をそのまま使えるか確認し、
 * undefined や不正値のときは defaultVersion にフォールバックする。
 */
export function resolveVersion(version: string | undefined): string {
  return isValidVersion(version) ? (version as string) : defaultVersion.id;
}

/**
 * 現在の pathname からバージョン部分を取り除いたサブパスを返す。
 * 例: ("/v0.1.0/history", "v0.1.0") -> "/history"
 *     ("/v0.1.0", "v0.1.0")         -> ""
 * バージョン配下でないパス（/projects 等）は "" を返し、切替先のトップへ向かう。
 */
export function stripVersion(pathname: string, currentVersion: string): string {
  const prefix = `/${currentVersion}`;
  if (pathname === prefix) return "";
  if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  return "";
}

/** バージョン ID とサブパスから遷移先パスを組み立てる */
export function buildVersionPath(versionId: string, subPath: string): string {
  return `/${versionId}${subPath}`;
}
