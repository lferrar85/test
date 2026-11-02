import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getAdminSession } from "./admin-session";

export async function requireAdminPage() {
  await connection(); // admin pages are always rendered at request time
  const s = await getAdminSession();
  if (!s) redirect("/admin/login");
  return s;
}
