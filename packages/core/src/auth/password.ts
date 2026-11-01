import bcrypt from "bcryptjs";

const COST = 12; // jitna zyada, utna secure aur thora slow

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, COST);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}