import { NextResponse } from "next/server";
import { rateLimit, registerUser } from "@humzubaan/core";
import { clientIp, handleError, readJson, setSessionCookie } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await rateLimit("register-ip", clientIp(req), 5, 3600); // ek IP se ghante mein 5 accounts
    const body = await readJson(req);
    const result = await registerUser(body);
    const res = NextResponse.json(result, { status: 201 });
    setSessionCookie(res, result.token);
    return res;
  } catch (error) {
    return handleError(error);
  }
}