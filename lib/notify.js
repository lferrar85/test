// Optional: forward each submission to a webhook (Zapier, Make, Slack, your CRM...).
// Set WEBHOOK_URL. Failures are logged and never block the visitor.
export async function notify(event) {
  const url = process.env.WEBHOOK_URL;
  if (!url) return;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error(`[notify] webhook responded ${res.status}`);
  } catch (err) {
    console.error('[notify] webhook failed:', err.message);
  }
}
