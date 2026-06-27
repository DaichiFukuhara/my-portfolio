import { redirect } from "next/navigation";
import { defaultVersion } from "@/data/versions";

export default function RootPage() {
  redirect(`/${defaultVersion.id}`);
}
