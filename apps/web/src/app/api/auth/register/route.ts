import { NextResponse } from "next/server";
import { registerUser } from "@humzubaan/core";
import { handleError, readJson, setSessionCookie } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await readJson(req);
    const result = await registerUser(body);
    const res = NextResponse.json(result, { status: 201 });
    setSessionCookie(res, result.token);
    return res;
  } catch (error) {
    return handleError(error);
  }
}