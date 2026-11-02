import { NextResponse } from "next/server";
import { changePassword } from "@humzubaan/core";
import { handleError, readJson, requireUser, setSessionCookie } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const body = await readJson(req);
    const { token } = await changePassword(String(user._id), body);
    const res = NextResponse.json({ ok: true });
    setSessionCookie(res, token); // naya token sirf cookie mein
    return res;
  } catch (error) {
    return handleError(error);
  }
}