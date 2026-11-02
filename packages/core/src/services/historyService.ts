import { Types } from "mongoose";
import { connectDB } from "../db/connect";
import { AppError } from "../errors";
import { Translation } from "../models/Translation";
import { validate } from "../validators/auth";
import { listQuerySchema, saveTranslationSchema } from "../validators/translations";

const MAX_SAVED = 500;

type Row = {
  _id: unknown;
  translationType: string;
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  tone: string;
  createdAt?: Date;
};

function toItem(d: Row) {
  return {
    id: String(d._id),
    type: d.translationType,
    originalText: d.originalText,
    translatedText: d.translatedText,
    sourceLanguage: d.sourceLanguage,
    targetLanguage: d.targetLanguage,
    tone: d.tone,
    createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : null,
  };
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toObjectId(id: string) {
  if (!Types.ObjectId.isValid(id)) throw new AppError("Translation nahi mili", 404);
  return new Types.ObjectId(id);
}

export async function saveTranslation(userId: string, input: unknown) {
  const data = validate(saveTranslationSchema, input);
  await connectDB();
  const uid = new Types.ObjectId(userId);

  const count = await Translation.countDocuments({ userId: uid });
  if (count >= MAX_SAVED) {
    throw new AppError(`History bhar gayi (${MAX_SAVED} items). Purani translations delete karein.`, 400);
  }

  const doc = await Translation.create({ userId: uid, ...data });
  return toItem(doc as unknown as Row);
}

export async function listTranslations(userId: string, query: unknown) {
  const { q, page, limit } = validate(listQuerySchema, query);
  await connectDB();

  const filter: Record<string, unknown> = { userId: new Types.ObjectId(userId) };
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i"); // user ka text regex nahi, sirf search
    filter.$or = [{ originalText: rx }, { translatedText: rx }];
  }

  const [rows, total] = await Promise.all([
    Translation.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Translation.countDocuments(filter),
  ]);

  return {
    items: (rows as unknown as Row[]).map(toItem),
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getTranslation(userId: string, id: string) {
  await connectDB();
  const doc = await Translation.findOne({
    _id: toObjectId(id),
    userId: new Types.ObjectId(userId),
  }).lean();
  if (!doc) throw new AppError("Translation nahi mili", 404);
  return toItem(doc as unknown as Row);
}

export async function deleteTranslation(userId: string, id: string) {
  await connectDB();
  const res = await Translation.deleteOne({
    _id: toObjectId(id),
    userId: new Types.ObjectId(userId),
  });
  if (!res.deletedCount) throw new AppError("Translation nahi mili", 404);
}

export async function deleteAllTranslations(userId: string) {
  await connectDB();
  const res = await Translation.deleteMany({ userId: new Types.ObjectId(userId) });
  return res.deletedCount ?? 0;
}