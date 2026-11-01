import { NextResponse } from "next/server";
import { loginUser } from "@humzubaan/core";
import { handleError, readJson } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await readJson(req);
    const result = await loginUser(body);
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}