import { NextResponse } from "next/server";
import { AppError, connectDB, User, verifyToken } from "@humzubaan/core";

export const SESSION_COOKIE = "hz_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // JWT_EXPIRES_IN (7d) ke barabar rakhein

const cookieBase = {
  httpOnly: true, // website ka JavaScript is cookie ko nahi parh sakta
  sameSite: "lax" as const, // dusri site se POST/DELETE par cookie nahi jati
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(SESSION_COOKIE, token, { ...cookieBase, maxAge: SESSION_MAX_AGE });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", { ...cookieBase, maxAge: 0 });
}

// Vercel jaisi hosting par ye header platform khud sahi set karta hai
export function clientIp(req: Request): string {
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "local";
}

export function handleError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(error); // asal error sirf server ke terminal mein
  return NextResponse.json(
    { error: "Server mein masla aa gaya. Thori dair baad try karein." },
    { status: 500 }
  );
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new AppError("Request body sahi JSON nahi hai", 400);
  }
}

function readCookie(req: Request, name: string): string {
  const header = req.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i === -1) continue;
    if (part.slice(0, i).trim() === name) {
      try {
        return decodeURIComponent(part.slice(i + 1).trim());
      } catch {
        return "";
      }
    }
  }
  return "";
}

// Extension: Authorization: Bearer <token>. Website: httpOnly cookie
export async function requireUser(req: Request) {
  const header = req.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const token = bearer || readCookie(req, SESSION_COOKIE);
  if (!token) throw new AppError("Pehle login karein", 401);

  const payload = await verifyToken(token);
  if (!payload) throw new AppError("Session khatam ho gaya, dobara login karein", 401);

  await connectDB();
  const user = await User.findById(payload.userId);
  if (!user) throw new AppError("Account nahi mila", 401);

  // Password badalne se pehle bane tokens band
  const validAfter = user.tokenValidAfter ? Math.floor(user.tokenValidAfter.getTime() / 1000) : 0;
  if (payload.issuedAt < validAfter) {
    throw new AppError("Password badal gaya hai, dobara login karein", 401);
  }

  return user;
}