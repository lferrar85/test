import "server-only";
import type { Repository } from "./repository";
import { demoRepository } from "./demo-repository";

let repo: Repository | null = null;

/** Returns the configured repository. Defaults to the demo adapter. */
export function getRepository(): Repository {
  if (repo) return repo;
  if (process.env.DATA_BACKEND === "supabase") {
    // Lazy import keeps supabase-js out of the bundle in demo mode.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createSupabaseRepository } = require("./supabase-repository") as typeof import("./supabase-repository");
    repo = createSupabaseRepository();
  } else {
    repo = demoRepository;
  }
  return repo;
}
