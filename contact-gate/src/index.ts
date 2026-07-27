interface Env {
  CONTACT_EMAIL: string;
  CONTACT_PHONE: string;
  TURNSTILE_SECRET: string;
}

type Attempt = { count: number; resetAt: number };

const attempts = new Map<string, Attempt>();
const allowedOrigins = new Set([
  "https://jakiesluchawki.github.io",
  "https://mahboob.pl",
  "https://www.mahboob.pl",
  "http://localhost:3000",
]);

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": origin,
});

const json = (body: unknown, status: number, origin: string) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin") ?? "";
    if (!allowedOrigins.has(origin)) return new Response(null, { status: 403 });

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);

    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const now = Date.now();
    const current = attempts.get(ip);
    if (current && current.resetAt > now && current.count >= 6) {
      return json({ error: "Spróbuj ponownie za kilka minut." }, 429, origin);
    }
    attempts.set(ip, current && current.resetAt > now
      ? { ...current, count: current.count + 1 }
      : { count: 1, resetAt: now + 10 * 60 * 1000 });

    let token = "";
    try {
      const body = await request.json<{ token?: string }>();
      token = body.token ?? "";
    } catch {
      return json({ error: "Nieprawidłowe żądanie." }, 400, origin);
    }

    const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET,
        response: token,
        remoteip: ip,
      }),
    });
    const result = await verification.json<{ success?: boolean }>();
    if (!result.success) return json({ error: "Weryfikacja nie powiodła się." }, 403, origin);

    return json({ email: env.CONTACT_EMAIL, phone: env.CONTACT_PHONE }, 200, origin);
  },
};

export default worker;
