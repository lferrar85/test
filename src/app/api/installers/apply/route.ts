import { NextResponse } from "next/server";
import { installerApplicationSchema } from "@/lib/domain/schemas";
import { getRepository } from "@/lib/data";
import { hashIp, rateLimit } from "@/lib/utils/request";

export async function POST(req: Request) {
  const ipHash = hashIp(req);
  if (!rateLimit(`apply:${ipHash}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = installerApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form", issues: parsed.error.flatten() }, { status: 422 });
  }
  if (parsed.data.website_hp) return NextResponse.json({ ok: true, id: "ignored" });

  const installer = await getRepository().createInstallerApplication(parsed.data);
  // Documents: in production the client uploads directly to the private
  // Supabase bucket using a signed upload URL issued by /api/installers/upload-url,
  // then references the storage paths here. The demo adapter records metadata only.
  return NextResponse.json({ ok: true, id: installer.id, status: installer.status });
}
