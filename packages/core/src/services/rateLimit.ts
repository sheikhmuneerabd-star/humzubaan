import { connectDB } from "../db/connect";
import { AppError } from "../errors";
import { RateLimit } from "../models/RateLimit";

function waitText(seconds: number): string {
  return seconds >= 60 ? `${Math.ceil(seconds / 60)} minute` : `${seconds} second`;
}

// scope: kis cheez ki limit ("login-email"), id: kis ki ("a@b.com"), limit: kitni dafa, windowSec: kitne second mein
export async function rateLimit(scope: string, id: string, limit: number, windowSec: number) {
  await connectDB();

  const windowMs = windowSec * 1000;
  const start = Math.floor(Date.now() / windowMs) * windowMs;
  const key = `${scope}:${id}:${start}`;
  const expiresAt = new Date(start + windowMs + 60_000);

  let count = 0;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const doc = await RateLimit.findOneAndUpdate(
        { _id: key },
        { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
        { upsert: true, new: true }
      );
      count = doc?.count ?? 0;
      break;
    } catch (error) {
      // Do requests ek saath pehli dafa record banayen to ek ko duplicate key milta hai, dobara try
      if ((error as { code?: number }).code === 11000 && attempt === 0) continue;
      throw error;
    }
  }

  if (count > limit) {
    const retryIn = Math.max(1, Math.ceil((start + windowMs - Date.now()) / 1000));
    throw new AppError(`Bohat zyada koshishen. ${waitText(retryIn)} baad dobara try karein.`, 429);
  }
}