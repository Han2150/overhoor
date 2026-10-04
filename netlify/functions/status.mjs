import { json, getCookie, checkCode, COOKIE } from "../lib/token.mjs";

export default async (req) => json({ access: !!(await checkCode(getCookie(req, COOKIE))) });
export const config = { path: "/api/status" };
