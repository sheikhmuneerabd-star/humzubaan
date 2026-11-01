import { NextResponse } from "next/server";
import { AppError, connectDB, User, verifyToken } from "@humzubaan/core";

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

// Authorization: Bearer <token> se user nikalta hai
export async function requireUser(req: Request) {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) throw new AppError("Pehle login karein", 401);

  const payload = await verifyToken(token);
  if (!payload) throw new AppError("Session khatam ho gaya, dobara login karein", 401);

  await connectDB();
  const user = await User.findById(payload.userId);
  if (!user) throw new AppError("Account nahi mila", 401);

  return user;
}