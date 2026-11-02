import { NextResponse } from "next/server";
import { enquiryInputSchema } from "@/lib/domain/schemas";
import { getRepository } from "@/lib/data";
import { hashIp, rateLimit } from "@/lib/utils/request";

export async function POST(req: Request) {
  const ipHash = hashIp(req);
  if (!rateLimit(`enq:${ipHash}`, 8)) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = enquiryInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check your answers", issues: parsed.error.flatten() }, { status: 422 });
  }
  if (parsed.data.website) {
    // Honeypot filled: pretend success without storing.
    return NextResponse.json({ ok: true, id: "ignored", reference: "GSC-0000" });
  }
  const repo = getRepository();
  const enquiry = await repo.createEnquiry(parsed.data, { ipHash });
  // TODO(integration): notify matched installers + send homeowner confirmation email (Resend/Postmark).
  return NextResponse.json({ ok: true, id: enquiry.id, reference: enquiry.reference, matched: enquiry.matchedInstallerIds.length });
}
