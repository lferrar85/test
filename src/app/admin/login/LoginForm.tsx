"use client";

import { useActionState } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { login } from "../actions";

export function LoginForm({ next, demoHint }: { next: string; demoHint: boolean }) {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="w-full max-w-sm rounded-[var(--r-lg)] bg-white p-8 shadow-2xl">
      <div className="flex items-center gap-3">
        <LogoMark className="h-9 w-9" />
        <div>
          <p className="font-display text-lg font-bold leading-none">GoSolarCompare</p>
          <p className="text-xs text-muted">Administrator sign in</p>
        </div>
      </div>
      <input type="hidden" name="next" value={next} />
      <label className="label mt-8" htmlFor="email">Email</label>
      <input id="email" name="email" type="email" autoComplete="username" required className="field" defaultValue={state?.email ?? ""} />
      <label className="label mt-4" htmlFor="password">Password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      {state?.error && <p role="alert" className="error-text mt-3">{state.error}</p>}
      <button disabled={pending} className="mt-6 w-full rounded-full bg-ink py-3 font-semibold text-cream hover:bg-ink-2 disabled:opacity-50">{pending ? "Signing in…" : "Sign in"}</button>
      {demoHint && <p className="mt-4 text-center text-xs text-muted">Development build: any email with the password <code className="rounded bg-cream-2 px-1">demo</code>. Set ADMIN_PASSWORD to change this.</p>}
      <p className="mt-4 text-center text-xs text-muted">This placeholder gate will be replaced by Supabase Auth with role-based access before launch.</p>
    </form>
  );
}
