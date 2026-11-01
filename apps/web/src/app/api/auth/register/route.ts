import { NextResponse } from "next/server";
import { registerUser } from "@humzubaan/core";
import { handleError, readJson } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await readJson(req);
    const result = await registerUser(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}