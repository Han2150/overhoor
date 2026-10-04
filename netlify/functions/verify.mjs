import { mollie, json, getCookie, makeCode, accessCookie, isValidPurchase, PAY_COOKIE } from "../lib/token.mjs";

export default async (req) => {
  const id = getCookie(req, PAY_COOKIE);
  if (!id || !/^tr_[A-Za-z0-9]+$/.test(id)) return json({ status: "none" });
  try {
    const p = await mollie("/payments/" + id);
    if (!isValidPurchase(p)) return json({ status: p.status || "unknown" });
    const code = await makeCode(p.id);
    const headers = new Headers({ "Content-Type": "application/json", "Cache-Control": "no-store" });
    headers.append("Set-Cookie", accessCookie(code));
    headers.append("Set-Cookie", `${PAY_COOKIE}=; Path=/; Max-Age=0`);
    return new Response(JSON.stringify({ status: "paid", code }), { headers });
  } catch (e) {
    console.error(e);
    return json({ status: "error" }, { status: 502 });
  }
};
export const config = { path: "/api/verify" };
