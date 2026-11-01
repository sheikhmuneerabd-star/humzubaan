import { getAIProvider } from "../ai";
import { validate } from "../validators/auth";
import { translateSchema } from "../validators/translate";
import { addTokens, getUsageToday, releaseRequest, reserveRequest } from "./usageService";

export async function translateText(userId: string, input: unknown) {
  const data = validate(translateSchema, input);

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
    });
    await addTokens(userId, tokens);
    return { mode: data.mode, ...result, usage: await getUsageToday(userId) };
  } catch (error) {
    await releaseRequest(userId).catch(() => {});
    throw error;
  }
}