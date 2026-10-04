import { mollie, json, checkCode, accessCookie, isValidPurchase } from "../lib/token.mjs";

// Code invullen op een ander apparaat.
export default async (req) => {
  if (req.method !== "POST") return json({ error: "Gebruik POST" }, { status: 405 });
  const { code } = await req.json().catch(() => ({}));
  const id = await checkCode(code);
  if (!id) return json({ ok: false, error: "Deze code klopt niet. Controleer of je hem helemaal hebt overgenomen." }, { status: 400 });
  try {
    const p = await mollie("/payments/" + id);
    if (!isValidPurchase(p)) return json({ ok: false, error: "Bij deze code hoort geen geldige betaling." }, { status: 400 });
  } catch (e) {
    console.error(e);
    return json({ ok: false, error: "Controleren lukt nu niet. Probeer het zo opnieuw." }, { status: 502 });
  }
  return json({ ok: true }, { headers: { "Set-Cookie": accessCookie(code.trim()) } });
};
export const config = { path: "/api/redeem" };
