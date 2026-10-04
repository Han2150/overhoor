import { mollie, json, PAY_COOKIE, PRICE } from "../lib/token.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Gebruik POST" }, { status: 405 });
  const origin = new URL(req.url).origin;
  try {
    const p = await mollie("/payments", {
      method: "POST",
      body: JSON.stringify({
        amount: { currency: "EUR", value: PRICE },
        description: "Overhoor – toegang",
        redirectUrl: origin + "/bedankt.html",
        metadata: { product: "overhoor" },
      }),
    });
    return json({ url: p._links.checkout.href }, {
      headers: { "Set-Cookie": `${PAY_COOKIE}=${p.id}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=7200` },
    });
  } catch (e) {
    console.error(e);
    return json({ error: "Betalen kon niet worden gestart." }, { status: 502 });
  }
};
export const config = { path: "/api/pay" };
