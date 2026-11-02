import { NextResponse } from "next/server";
import { loginUser, rateLimit } from "@humzubaan/core";
import { clientIp, handleError, readJson, setSessionCookie } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await rateLimit("login-ip", clientIp(req), 30, 900); // ek IP se 15 minute mein 30
    const body = await readJson(req);
    const result = await loginUser(body); // andar email ki apni limit bhi hai
    const res = NextResponse.json(result);
    setSessionCookie(res, result.token);
    return res;
  } catch (error) {
    return handleError(error);
  }
}