import { NextResponse } from "next/server";
import { translateText } from "@humzubaan/core";
import { handleError, readJson, requireUser } from "@/lib/api";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const body = await readJson(req);
    const result = await translateText(String(user._id), body);
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}