import { connectDB } from "../db/connect";
import { User } from "../models/User";
import { AppError } from "../errors";
import { hashPassword, verifyPassword } from "../auth/password";
import { signToken } from "../auth/jwt";
import { validate, registerSchema, loginSchema } from "../validators/auth";
import { rateLimit } from "./rateLimit";

type UserLike = {
  _id: unknown;
  name: string;
  email: string;
  role: string;
  preferredLanguage: string;
  preferredScript: string;
};

// Bahar sirf wohi cheezein jayengi jo safe hain (passwordHash kabhi nahi)
export function toPublicUser(u: UserLike) {
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    preferredLanguage: u.preferredLanguage,
    preferredScript: u.preferredScript,
  };
}

// Jab email nahi milta tab bhi password check ka waqt barabar rakhne ke liye
let dummyHash: Promise<string> | null = null;
function getDummyHash() {
  return (dummyHash ??= hashPassword("dummy-password-for-timing"));
}

export async function registerUser(input: unknown) {
  const { name, email, password } = validate(registerSchema, input);
  await connectDB();

  if (await User.exists({ email })) {
    throw new AppError("Is email se account pehle se maujood hai", 409);
  }

  const passwordHash = await hashPassword(password);

  let user;
  try {
    user = await User.create({ name, email, passwordHash });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      throw new AppError("Is email se account pehle se maujood hai", 409);
    }
    throw error;
  }

  const token = await signToken({ userId: String(user._id), role: user.role });
  return { token, user: toPublicUser(user) };
}

export async function loginUser(input: unknown) {
  const { email, password } = validate(loginSchema, input);
  // Ek email par bar bar password guess karne se bachao
  await rateLimit("login-email", email, 10, 900);
  await connectDB();

  const user = await User.findOne({ email }).select("+passwordHash");
  const hash = user ? user.passwordHash : await getDummyHash();
  const ok = await verifyPassword(password, hash);

  if (!user || !ok) {
    // Dono surat mein ek hi message, taake koi ye na jaan sake ke email registered hai
    throw new AppError("Email ya password galat hai", 401);
  }

  const token = await signToken({ userId: String(user._id), role: user.role });
  return { token, user: toPublicUser(user) };
}