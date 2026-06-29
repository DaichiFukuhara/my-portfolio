import { notFound } from "next/navigation";
import { versions } from "@/data/versions";
import { isValidVersion } from "@/lib/version-routing";
import { DefaultLayout } from "@/components/layouts/DefaultLayout";
import { BandSceneLayout } from "@/components/bands/BandSceneLayout";

export function generateStaticParams() {
  return versions.map((v) => ({ version: v.id }));
}

export default async function VersionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ version: string }>;
}) {
  const { version } = await params;
  if (!isValidVersion(version)) {
    notFound();
  }

  // バージョンごとにレイアウトを切り替える（増えたらマップ化する）。
  const Layout = version === "v0.2.0" ? BandSceneLayout : DefaultLayout;
  return <Layout>{children}</Layout>;
}
