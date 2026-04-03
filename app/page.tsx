import { getAllPods, getAllModules } from "@/lib/content";
import { HomeClient } from "./HomeClient";

export default function HomePage() {
  const pods = getAllPods().filter((p) => p.status !== "dropped");
  const modules = getAllModules();

  return <HomeClient pods={pods} modules={modules} />;
}
