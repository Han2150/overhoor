// Toegangscode = "<mollie-betaal-id>.<handtekening>". De handtekening bewijst dat de server de code heeft uitgegeven.
const enc = new TextEncoder();
export const COOKIE = "ovh_access";
export const PAY_COOKIE = "ovh_pay";
export const PRICE = "2.00";

function secret() {
  const s = Netlify.env.get("ACCESS_SECRET");
  if (!s || s.length < 24) throw new Error("ACCESS_SECRET ontbreekt of is te kort");
  return s;
}
async function hmac(text) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(text)));
  return btoa(String.fromCharCode(...sig)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "").slice(0, 24);
}
export async function makeCode(paymentId) { return paymentId + "." + (await hmac(paymentId)); }
export async function checkCode(code) {
  if (typeof code !== "string") return null;
  code = code.trim();
  const i = code.lastIndexOf(".");
  if (i < 1) return null;
  const id = code.slice(0, i), sig = code.slice(i + 1);
  const good = await hmac(id);
  if (good.length !== sig.length) return null;
  let diff = 0;
  for (let k = 0; k < good.length; k++) diff |= good.charCodeAt(k) ^ sig.charCodeAt(k);
  return diff === 0 ? id : null;
}
export function getCookie(req, name) {
  const m = (req.headers.get("cookie") || "").match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[1]) : null;
}
export function accessCookie(code) {
  return `${COOKIE}=${encodeURIComponent(code)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 730}`;
}
export async function mollie(path, init = {}) {
  const key = Netlify.env.get("MOLLIE_API_KEY");
  if (!key) throw new Error("MOLLIE_API_KEY ontbreekt");
  const r = await fetch("https://api.mollie.com/v2" + path, {
    ...init,
    headers: { Authorization: "Bearer " + key, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error("Mollie " + r.status + ": " + (data.detail || data.title || "fout"));
  return data;
}
// Alleen echte, betaalde Overhoor-betalingen tellen.
export function isValidPurchase(p) {
  return p && p.status === "paid" && p.amount && p.amount.value === PRICE && p.amount.currency === "EUR" &&
    p.metadata && p.metadata.product === "overhoor" && !(p.amountRefunded && p.amountRefunded.value !== "0.00");
}
export const json = (body, init = {}) => new Response(JSON.stringify(body), {
  ...init, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...(init.headers || {}) },
});
