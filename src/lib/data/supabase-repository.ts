import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Repository } from "./repository";

/**
 * Supabase adapter. Wire-up status: SCHEMA READY, ADAPTER STUB.
 *
 * The SQL in supabase/migrations/0001_init.sql creates every table this adapter
 * needs, with row-level security so homeowners' data is only readable by the
 * service role / admins. To go live:
 *   1. Create a Supabase project and run the migration.
 *   2. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (server only) and
 *      NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.
 *   3. Implement each method below against the tables (the demo repository
 *      documents the expected behaviour) and switch DATA_BACKEND=supabase.
 *
 * Until then every method throws so misconfiguration is loud, not silent.
 */
export function createSupabaseRepository(): Repository {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set when DATA_BACKEND=supabase");
  const client: SupabaseClient = createClient(url, key, { auth: { persistSession: false } });
  void client;
  const notImplemented = (m: string) => async (): Promise<never> => {
    throw new Error(`SupabaseRepository.${m} is not implemented yet. See src/lib/data/supabase-repository.ts`);
  };
  return {
    kind: "supabase",
    listInstallers: notImplemented("listInstallers"),
    getInstaller: notImplemented("getInstaller"),
    getInstallerBySlug: notImplemented("getInstallerBySlug"),
    createInstallerApplication: notImplemented("createInstallerApplication"),
    updateInstaller: notImplemented("updateInstaller"),
    setInstallerStatus: notImplemented("setInstallerStatus"),
    listEnquiries: notImplemented("listEnquiries"),
    getEnquiry: notImplemented("getEnquiry"),
    createEnquiry: notImplemented("createEnquiry"),
    updateEnquiry: notImplemented("updateEnquiry"),
    listQuotesForEnquiry: notImplemented("listQuotesForEnquiry"),
    listTreePlantings: notImplemented("listTreePlantings"),
    recordCompletedInstallation: notImplemented("recordCompletedInstallation"),
    confirmPlanting: notImplemented("confirmPlanting"),
    getStats: notImplemented("getStats"),
  };
}
