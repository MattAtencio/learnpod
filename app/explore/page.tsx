import { getAllPods, getAllLessons, getAllModules } from "@/lib/content";
import { ExploreClient } from "./ExploreClient";

export default function ExplorePage() {
  const pods = getAllPods().filter((p) => p.status !== "dropped");
  const lessons = getAllLessons();
  const modules = getAllModules();
  return <ExploreClient pods={pods} lessons={lessons} modules={modules} />;
}
