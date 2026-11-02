import type { Metadata } from "next";
import { Suspense } from "react";
import { Journey } from "@/components/journey/Journey";

export const metadata: Metadata = {
  title: "Compare solar quotes",
  description: "Answer a few quick questions and we'll match you with approved solar installers in your area. Free, independent and no obligation.",
  robots: { index: true, follow: true },
};

export default function ComparePage({ searchParams }: { searchParams: Promise<{ postcode?: string; interest?: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-[100svh] bg-cream" aria-busy="true" />}>
      <JourneyWithParams searchParams={searchParams} />
    </Suspense>
  );
}

async function JourneyWithParams({ searchParams }: { searchParams: Promise<{ postcode?: string; interest?: string }> }) {
  const params = await searchParams;
  return <Journey initialPostcode={params.postcode} initialInterest={params.interest} />;
}
