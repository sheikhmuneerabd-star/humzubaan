import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

const usageSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    requestDate: { type: String, required: true }, // "2026-11-02" (UTC)
    translationCount: { type: Number, default: 0, min: 0 },
    tokenUsage: { type: Number, default: 0, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Ek user ka ek din mein sirf ek record
usageSchema.index({ userId: 1, requestDate: 1 }, { unique: true });

export type UsageDoc = InferSchemaType<typeof usageSchema>;

export const Usage: Model<UsageDoc> =
  (models.Usage as Model<UsageDoc>) || model<UsageDoc>("Usage", usageSchema);

export { Types };