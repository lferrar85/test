import { cacheLife, cacheTag } from "next/cache";
import { getRepository } from "./index";

/** Public, cacheable figures. Only VERIFIED tree plantings are exposed. */
export async function getPublicTreeStats() {
  "use cache";
  cacheTag("trees");
  cacheLife("hours");
  const stats = await getRepository().getStats();
  return {
    treesConfirmedPlanted: stats.treesConfirmedPlanted,
    treesDue: stats.treesDue,
    completedInstallations: stats.completedInstallations,
    plantingPartner: process.env.TREE_PARTNER_NAME ?? null,
    demo: getRepository().kind === "demo",
  };
}
