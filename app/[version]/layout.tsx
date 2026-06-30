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

  // v0.2.0 は SPA 型。children は使わず、シーンは state から決まる。
  if (version === "v0.2.0") {
    return <BandSceneLayout />;
  }
  return <DefaultLayout>{children}</DefaultLayout>;
}
