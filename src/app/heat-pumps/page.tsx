import type { Metadata } from "next";
import { SolutionPage } from "@/components/pages/SolutionPage";
import { heatPumps } from "@/lib/content/solutions";

export const metadata: Metadata = { title: "Heat pumps", description: "Compare approved heat pump installers. Why design quality matters and what affects the cost." };

export default function Page() {
  return <SolutionPage c={heatPumps} />;
}
