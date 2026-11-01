import { Types } from "mongoose";
import { connectDB } from "../db/connect";
import { AppError } from "../errors";
import { Usage } from "../models/Usage";

function today(): string {
  return new Date().toISOString().slice(0, 10); // UTC din
}

export function getDailyLimit(): number {
  const n = Number(process.env.DAILY_REQUEST_LIMIT);
  return Number.isFinite(n) && n > 0 ? n : 50;
}

// Request shuru hone se pehle ek "slot" lena. Ye ek hi atomic step hai,
// isliye do requests ek saath aayen to bhi limit paar nahi hoti.
export async function reserveRequest(userId: string) {
  await connectDB();
  const limit = getDailyLimit();
  try {
    await Usage.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),
        requestDate: today(),
        translationCount: { $lt: limit },
      },
      { $inc: { translationCount: 1 } },
      { upsert: true }
    );
  } catch (error) {
    // Record maujood hai magar count limit tak pohanch chuka, to upsert duplicate key deta hai
    if ((error as { code?: number }).code === 11000) {
      throw new AppError(
        `Aaj ki limit (${limit} translations) poori ho gayi. Kal dobara try karein.`,
        429
      );
    }
    throw error;
  }
}

// AI fail ho jaye to user ka slot wapas kar dete hain
export async function releaseRequest(userId: string) {
  await Usage.updateOne(
    { userId: new Types.ObjectId(userId), requestDate: today(), translationCount: { $gt: 0 } },
    { $inc: { translationCount: -1 } }
  );
}

export async function addTokens(userId: string, tokens: number) {
  if (!tokens) return;
  await Usage.updateOne(
    { userId: new Types.ObjectId(userId), requestDate: today() },
    { $inc: { tokenUsage: tokens } }
  );
}

export async function getUsageToday(userId: string) {
  await connectDB();
  const doc = await Usage.findOne({
    userId: new Types.ObjectId(userId),
    requestDate: today(),
  });
  const limit = getDailyLimit();
  const used = doc?.translationCount ?? 0;
  return {
    date: today(),
    used,
    limit,
    remaining: Math.max(0, limit - used),
    tokensUsed: doc?.tokenUsage ?? 0,
  };
}