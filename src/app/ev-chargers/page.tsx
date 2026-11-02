import type { Metadata } from "next";
import { SolutionPage } from "@/components/pages/SolutionPage";
import { evChargers } from "@/lib/content/solutions";

export const metadata: Metadata = { title: "Home EV chargers", description: "Compare approved EV charger installers. Smart, solar-aware home charging explained." };

export default function Page() {
  return <SolutionPage c={evChargers} />;
}
