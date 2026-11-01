import { NextResponse } from "next/server";
import { toPublicUser } from "@humzubaan/core";
import { handleError, requireUser } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireUser(req);
    return NextResponse.json({ user: toPublicUser(user) });
  } catch (error) {
    return handleError(error);
  }
}