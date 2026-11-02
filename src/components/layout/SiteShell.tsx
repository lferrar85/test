import { Suspense } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Logo } from "@/components/brand/Logo";

function HeaderFallback({ theme }: { theme: "light" | "dark" }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="container-wide flex h-[4.5rem] items-center lg:h-20">
        <Logo onInk={theme === "dark"} />
      </div>
    </header>
  );
}

export function SiteShell({ children, theme = "light" }: { children: React.ReactNode; theme?: "light" | "dark" }) {
  return (
    <>
      <Suspense fallback={<HeaderFallback theme={theme} />}>
        <Header theme={theme} />
      </Suspense>
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
