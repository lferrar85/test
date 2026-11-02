import type { Metadata } from "next";
import { SolutionPage } from "@/components/pages/SolutionPage";
import { batteryStorage } from "@/lib/content/solutions";

export const metadata: Metadata = { title: "Home battery storage", description: "Compare approved battery storage installers. Learn how batteries work with solar and tariffs and what affects cost." };

export default function Page() {
  return <SolutionPage c={batteryStorage} />;
}
