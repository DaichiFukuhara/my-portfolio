import { notFound } from "next/navigation";
import { versions } from "@/data/versions";
import { isValidVersion } from "@/lib/version-routing";

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
  return <>{children}</>;
}
