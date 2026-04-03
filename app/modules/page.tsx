import { getAllModules } from "@/lib/content";
import { ModulesListClient } from "./ModulesListClient";

export default function ModulesPage() {
  const modules = getAllModules();
  return <ModulesListClient modules={modules} />;
}
