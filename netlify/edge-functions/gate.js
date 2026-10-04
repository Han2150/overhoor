// Laat /app alleen zien aan wie een geldige toegangscode in een cookie heeft.
const enc = new TextEncoder();
async function hmac(text, secret) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(text)));
  return btoa(String.fromCharCode(...sig)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "").slice(0, 24);
}
export default async (req, context) => {
  const secret = Netlify.env.get("ACCESS_SECRET");
  const raw = context.cookies.get("ovh_access");
  if (secret && raw) {
    const code = decodeURIComponent(raw);
    const i = code.lastIndexOf(".");
    if (i > 0 && (await hmac(code.slice(0, i), secret)) === code.slice(i + 1)) return context.next();
  }
  return Response.redirect(new URL("/?toegang=nodig#prijs", req.url), 302);
};
export const config = { path: ["/app", "/app/*"] };
