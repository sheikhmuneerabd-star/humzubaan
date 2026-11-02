import { getAIProvider } from "../ai";
import { validate } from "../validators/auth";
import { translateSchema } from "../validators/translate";
import { addTokens, getUsageToday, releaseRequest, reserveRequest } from "./usageService";
import { rateLimit } from "./rateLimit";

export async function translateText(userId: string, input: unknown) {
  const data = validate(translateSchema, input);
  await rateLimit("translate-user", userId, 10, 60); // 1 minute mein 10
  await reserveRequest(userId);

  try {
    const provider = getAIProvider();

    if (data.mode === "incoming") {
      const { result, tokens } = await provider.translateIncoming({
        text: data.text,
        script: data.script,
      });
      await addTokens(userId, tokens);
      return { mode: data.mode, ...result, usage: await getUsageToday(userId) };
    }

    const { result, tokens } = await provider.translateOutgoing({
      text: data.text,
      script: data.script,
      tone: data.tone,
      context: data.context || undefined,
    });
    await addTokens(userId, tokens);
    return { mode: data.mode, ...result, usage: await getUsageToday(userId) };
  } catch (error) {
    await releaseRequest(userId).catch(() => {});
    throw error;
  }
}