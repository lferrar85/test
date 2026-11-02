import type { MetadataRoute } from "next";
import { site } from "@/lib/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/compare", "/how-it-works", "/why-choose-us", "/approved-installers", "/installers/apply", "/solar-panels", "/battery-storage", "/ev-chargers", "/heat-pumps", "/tree-planting", "/about", "/faqs", "/contact", "/privacy", "/terms"];
  return routes.map((r) => ({ url: `${site.url}${r}`, changeFrequency: r === "" ? "weekly" : "monthly", priority: r === "" ? 1 : r === "/compare" ? 0.9 : 0.6 }));
}
