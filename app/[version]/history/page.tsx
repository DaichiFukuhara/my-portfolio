import { notFound } from "next/navigation";
import { HistoryScene } from "@/components/scenes/HistoryScene";

export default async function Page({
  params,
}: {
  params: Promise<{ version: string }>;
}) {
  const { version } = await params;
  // v0.2.0 ではサブパスを持たないため /history は存在しない。
  if (version === "v0.2.0") notFound();
  return <HistoryScene />;
}
