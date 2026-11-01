import { NextResponse } from "next/server";
import { getHealthStatus } from "@humzubaan/core";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getHealthStatus());
}