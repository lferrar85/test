import { NextResponse } from "next/server";
import { getPublicTreeStats } from "@/lib/data/public-stats";

export async function GET() {
  const stats = await getPublicTreeStats();
  return NextResponse.json(stats, { headers: { "Cache-Control": "public, max-age=300" } });
}
