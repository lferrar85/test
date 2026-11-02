import type { Metadata } from "next";
import { SolutionPage } from "@/components/pages/SolutionPage";
import { solarPanels } from "@/lib/content/solutions";

export const metadata: Metadata = { title: "Solar panels for UK homes", description: "Compare approved solar panel installers. Understand how home solar works, what affects the cost and what a good installer checks." };

export default function Page() {
  return <SolutionPage c={solarPanels} />;
}
