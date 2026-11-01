import { NextResponse } from "next/server";
import { getUsageToday } from "@humzubaan/core";
import { handleError, requireUser } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireUser(req);
    return NextResponse.json(await getUsageToday(String(user._id)));
  } catch (error) {
    return handleError(error);
  }
}