import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const translationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    originalText: { type: String, required: true, maxlength: 2000 },
    translatedText: { type: String, required: true, maxlength: 4000 },
    sourceLanguage: { type: String, default: "", maxlength: 50 },
    targetLanguage: { type: String, default: "", maxlength: 50 },
    tone: { type: String, default: "", maxlength: 30 },
    translationType: { type: String, enum: ["incoming", "outgoing"], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

translationSchema.index({ userId: 1, createdAt: -1 });

export type TranslationDoc = InferSchemaType<typeof translationSchema>;

export const Translation: Model<TranslationDoc> =
  (models.Translation as Model<TranslationDoc>) ||
  model<TranslationDoc>("Translation", translationSchema);