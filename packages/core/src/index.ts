export const APP_NAME = "Humzubaan";

export function getHealthStatus() {
  return {
    status: "ok",
    app: APP_NAME,
    time: new Date().toISOString(),
  };
}

export { connectDB } from "./db/connect";
export { User } from "./models/User";
export type { UserDoc } from "./models/User";
export { AppError } from "./errors";
export { verifyToken, signToken } from "./auth/jwt";
export { registerUser, loginUser, toPublicUser } from "./services/authService";
export { translateText } from "./services/translateService";
export { getUsageToday, getDailyLimit } from "./services/usageService";
export { getAIProvider } from "./ai";