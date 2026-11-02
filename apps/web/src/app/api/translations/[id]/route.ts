import { NextResponse } from "next/server";
import { deleteTranslation, getTranslation } from "@humzubaan/core";
import { handleError, requireUser } from "@/lib/api";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser(req);
    const { id } = await params;
    return NextResponse.json(await getTranslation(String(user._id), id));
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser(req);
    const { id } = await params;
    await deleteTranslation(String(user._id), id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}