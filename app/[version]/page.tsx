import { TopScene } from "@/components/scenes/TopScene";

export default async function Page({
  params,
}: {
  params: Promise<{ version: string }>;
}) {
  const { version } = await params;
  // v0.2.0 では BandSceneLayout がシーンを描画するため、page の返り値は使われない。
  if (version === "v0.2.0") return null;
  return <TopScene />;
}
