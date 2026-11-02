import { SignJWT, jwtVerify } from "jose";

export type TokenPayload = {
  userId: string;
  role: "user" | "admin";
};

export type VerifiedToken = TokenPayload & { issuedAt: number };

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET .env.local mein set nahi hai ya 32 characters se chhota hai");
  }
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN ?? "7d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<VerifiedToken | null> {
  const secret = getSecret(); // config ka error chhupna nahi chahiye
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    return {
      userId: payload.sub,
      role: payload.role === "admin" ? "admin" : "user",
      issuedAt: typeof payload.iat === "number" ? payload.iat : 0,
    };
  } catch {
    return null; // token galat ya expire
  }
}