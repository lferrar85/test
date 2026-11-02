import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return (
    <div className="grid min-h-screen place-items-center bg-ink px-4">
      <Suspense fallback={null}>
        <LoginWithParams searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function LoginWithParams({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <LoginForm next={next ?? "/admin"} demoHint={process.env.NODE_ENV !== "production" && !process.env.ADMIN_PASSWORD} />;
}
