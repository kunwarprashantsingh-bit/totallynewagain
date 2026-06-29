import { GoogleGenAI } from "@google/genai";

let cachedAi: GoogleGenAI | null = null;

function getAi(): GoogleGenAI {
  if (!cachedAi) {
    const apiKey = (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) || "AI_STUDIO_PLACEHOLDER_KEY";
    cachedAi = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return cachedAi;
}

// Proxied delegate object for 'ai' so that calls like `ai.models.generateContent` work seamlessly
export const ai = new Proxy({} as GoogleGenAI, {
  get(target, prop) {
    const instance = getAi() as any;
    const value = instance[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});

