import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/domain/schemas";
import { hashIp, rateLimit } from "@/lib/utils/request";

export async function POST(req: Request) {
  if (!rateLimit(`contact:${hashIp(req)}`, 5)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const parsed = contactSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the form", issues: parsed.error.flatten() }, { status: 422 });
  if (parsed.data.website) return NextResponse.json({ ok: true });
  // TODO(integration): forward to helpdesk / email provider. Logged server-side only in demo mode.
  console.info("[contact] message received", { topic: parsed.data.topic, from: parsed.data.email });
  return NextResponse.json({ ok: true });
}
