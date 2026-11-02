import { Types } from "mongoose";
import { connectDB } from "../db/connect";
import { AppError } from "../errors";
import { hashPassword, verifyPassword } from "../auth/password";
import { signToken } from "../auth/jwt";
import { User } from "../models/User";
import { Translation } from "../models/Translation";
import { Usage } from "../models/Usage";
import { validate } from "../validators/auth";
import { changePasswordSchema, deleteAccountSchema, updateProfileSchema } from "../validators/user";
import { toPublicUser } from "./authService";
import { rateLimit } from "./rateLimit";

export async function updateProfile(userId: string, input: unknown) {
  const { name } = validate(updateProfileSchema, input);
  await connectDB();
  const user = await User.findByIdAndUpdate(userId, { name }, { new: true });
  if (!user) throw new AppError("Account nahi mila", 404);
  return toPublicUser(user);
}

export async function changePassword(userId: string, input: unknown) {
  const { currentPassword, newPassword } = validate(changePasswordSchema, input);
  // Chori hui session se purana password guess karne se bachao
  await rateLimit("password-user", userId, 5, 900);
  await connectDB();

  const user = await User.findById(userId).select("+passwordHash");
  if (!user) throw new AppError("Account nahi mila", 404);

  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    throw new AppError("Maujooda password galat hai", 400);
  }
  if (currentPassword === newPassword) {
    throw new AppError("Naya password purane se alag hona chahiye", 400);
  }

  user.passwordHash = await hashPassword(newPassword);
  user.tokenValidAfter = new Date(); // is se pehle ke saare tokens band
  await user.save();

  // Maujooda website session chalta rahe, is liye naya token
  const token = await signToken({ userId: String(user._id), role: user.role });
  return { token };
}

export async function deleteAccount(userId: string, input: unknown) {
  const { password } = validate(deleteAccountSchema, input);
  await rateLimit("password-user", userId, 5, 900);
  await connectDB();

  const user = await User.findById(userId).select("+passwordHash");
  if (!user) throw new AppError("Account nahi mila", 404);
  if (!(await verifyPassword(password, user.passwordHash))) {
    throw new AppError("Password galat hai", 400);
  }

  const uid = new Types.ObjectId(userId);
  // Pehle data, aakhir mein user, taake beech mein fail ho to dobara try ho sake
  await Promise.all([Translation.deleteMany({ userId: uid }), Usage.deleteMany({ userId: uid })]);
  await User.deleteOne({ _id: uid });
}