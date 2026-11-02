import { NextResponse } from "next/server";
import { deleteAllTranslations, listTranslations, saveTranslation } from "@humzubaan/core";
import { handleError, readJson, requireUser } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireUser(req);
    const params = Object.fromEntries(new URL(req.url).searchParams);
    return NextResponse.json(await listTranslations(String(user._id), params));
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const body = await readJson(req);
    return NextResponse.json(await saveTranslation(String(user._id), body), { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

// Poori history delete (website par confirm ke baad)
export async function DELETE(req: Request) {
  try {
    const user = await requireUser(req);
    const deleted = await deleteAllTranslations(String(user._id));
    return NextResponse.json({ deleted });
  } catch (error) {
    return handleError(error);
  }
}