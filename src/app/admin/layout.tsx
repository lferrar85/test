import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { LayoutDashboard, Building2, Inbox, TreePine, LogOut, ExternalLink } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { getAdminSession } from "@/lib/auth/admin-session";
import { getRepository } from "@/lib/data";
import { logout } from "./actions";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | GoSolarCompare Admin" }, robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-2" aria-busy="true" />}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}

async function AdminGate({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) {
    // The login page lives inside this segment, so it renders without the chrome.
    return <>{children}</>;
  }
  const demo = getRepository().kind === "demo";
  const nav = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/installers", label: "Installers", icon: Building2 },
    { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
    { href: "/admin/trees", label: "Tree planting", icon: TreePine },
  ];
  return (
    <div className="min-h-screen bg-cream-2 text-ink lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="flex flex-col border-b border-ink/10 bg-ink text-cream lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-5 py-5">
          <LogoMark className="h-8 w-8" />
          <div>
            <p className="font-display font-bold leading-none">GoSolarCompare</p>
            <p className="text-xs text-cream/60">Administration</p>
          </div>
        </div>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 no-scrollbar lg:flex-col lg:pb-0">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium text-cream/85 hover:bg-white/10 hover:text-cream">
              <n.icon className="h-4 w-4" aria-hidden="true" /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto hidden space-y-3 px-5 py-5 text-xs text-cream/60 lg:block">
          <p>Signed in as <span className="text-cream">{session.email}</span></p>
          <Link href="/" className="inline-flex items-center gap-1 hover:text-cream"><ExternalLink className="h-3 w-3" /> View site</Link>
          <form action={logout}><button className="inline-flex items-center gap-1 hover:text-cream"><LogOut className="h-3 w-3" /> Sign out</button></form>
        </div>
      </aside>
      <div className="min-w-0">
        {demo && (
          <div className="border-b border-sky-2 bg-sky px-6 py-2 text-xs font-medium text-ink">
            Demo data backend. Changes persist only while the server is running. Set DATA_BACKEND=supabase to use a database.
          </div>
        )}
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
