import { getAllPods } from "@/lib/content";
import { PodsListClient } from "./PodsListClient";

export default function PodsPage() {
  const pods = getAllPods().filter((p) => p.status !== "dropped");
  return <PodsListClient pods={pods} />;
}
