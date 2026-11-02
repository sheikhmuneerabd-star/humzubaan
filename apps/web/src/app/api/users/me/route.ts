import { NextResponse } from "next/server";
import { deleteAccount, toPublicUser, updateProfile } from "@humzubaan/core";
import { clearSessionCookie, handleError, readJson, requireUser } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireUser(req);
    return NextResponse.json({ user: toPublicUser(user) });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireUser(req);
    const body = await readJson(req);
    return NextResponse.json({ user: await updateProfile(String(user._id), body) });
  } catch (error) {
    return handleError(error);
  }
}

// Account aur uska saara data delete
export async function DELETE(req: Request) {
  try {
    const user = await requireUser(req);
    const body = await readJson(req);
    await deleteAccount(String(user._id), body);
    const res = NextResponse.json({ ok: true });
    clearSessionCookie(res);
    return res;
  } catch (error) {
    return handleError(error);
  }
}