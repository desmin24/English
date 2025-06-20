
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_TEXT } from '../constants';
import { GeminiTeachingDetails, GeminiFeedback } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable is not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "DUMMY_KEY_FOR_INITIALIZATION" });

function sanitizeJsonString(jsonStr: string): string {
  let cleanStr = jsonStr.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = cleanStr.match(fenceRegex);
  if (match && match[2]) {
    cleanStr = match[2].trim();
  }
  return cleanStr;
}

export async function generateWordTeachingDetails(word: string, chineseMeaning: string): Promise<GeminiTeachingDetails> {
  if (!API_KEY) throw new Error("API_KEY is not configured for Gemini Service.");
  
  const prompt = `You are 小雅老師, a friendly, humorous, and encouraging English teacher for Taiwanese elementary and middle school students (CEFR A1-A2).
Your task is to provide information for the English word: "${word}" which means "${chineseMeaning}".
Please provide the following in JSON format:
{
  "partOfSpeech": "n. / v. / adj. / adv. / prep. / conj. / pron. / interj.",
  "exampleSentence": "A simple, life-oriented English sentence, max 12 words, using the word '${word}'. Include the word itself.",
  "exampleSentenceTranslation": "Chinese translation of the example sentence.",
  "challengePrompt": "A fun and encouraging question or sentence-making prompt for the student using the word '${word}'. Be creative and engaging. For example, if the word is 'happy', you could ask '什麼事情會讓你感到 happy 呢？分享一下吧！'"
}

Maintain a 活潑 (lively), 有趣 (interesting), and 鼓勵 (encouraging) tone. Sentences should not be too long. Ensure the example sentence correctly uses the word "${word}".`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });
    
    const rawJson = response.text;
    const sanitizedJson = sanitizeJsonString(rawJson);
    const parsedData = JSON.parse(sanitizedJson) as GeminiTeachingDetails;
    
    if (!parsedData.partOfSpeech || !parsedData.exampleSentence || !parsedData.exampleSentenceTranslation || !parsedData.challengePrompt) {
        console.error("Gemini response missing fields:", parsedData);
        throw new Error("Gemini response missing required fields.");
    }
    if (!parsedData.exampleSentence.toLowerCase().includes(word.toLowerCase())) {
        console.warn(`Gemini's example sentence for "${word}" ("${parsedData.exampleSentence}") might not contain the word as expected.`);
    }

    return parsedData;

  } catch (error) {
    console.error("Error generating word teaching details for '"+word+"':", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage.includes("API key not valid")) {
       throw new Error("Gemini API key is not valid. Please check your configuration.");
    }
    throw new Error(`小雅老師的魔法水晶球好像有點秀逗了，無法取得「${word}」的詳細資料耶！`);
  }
}

export async function evaluateStudentResponse(wordLearned: string, studentResponse: string): Promise<GeminiFeedback> {
  if (!API_KEY) throw new Error("API_KEY is not configured for Gemini Service.");

  const prompt = `You are 小雅老師, a friendly, humorous, and encouraging English teacher for Taiwanese elementary and middle school students (CEFR A1-A2).
The student was learning the word "${wordLearned}" and attempted this: "${studentResponse}".

Please provide feedback as a JSON object with a single key "feedbackText".
Example response: {"feedbackText": "哇！你的句子「${studentResponse}」非常棒！完全正確喔！🍎 你真是個語言小天才！" }

1. Start with strong positive affirmation (e.g., "太棒了！", "哇！你太厲害了！").
2. If the response is relevant and correct (even if simple, like "I like ${wordLearned}"), praise them.
3. If there are minor errors (common for A1-A2 learners like verb conjugation, plurals, articles, or slight misuse of "${wordLearned}"), gently correct it with a brief explanation. For example: "「${studentResponse}」很棒的嘗試喔！小提醒：...可以改成...會更棒！"
4. If the student says "✔️ 完成", "ok", "next", or similar indicating they want to skip the challenge, acknowledge it positively like "收到！看來你已經準備好迎接下一個挑戰了！很棒喔！👍"
5. End with more encouragement (e.g., "你真是個語言小天才！", "繼續加油，你超棒的！💪").
Maintain a 活潑 (lively), 有趣 (interesting), and 鼓勵 (encouraging) tone. Your entire feedback should be within the "feedbackText" string. Keep it concise.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.5,
      }
    });

    const rawJson = response.text;
    const sanitizedJson = sanitizeJsonString(rawJson);
    const parsedData = JSON.parse(sanitizedJson) as GeminiFeedback;

    if (!parsedData.feedbackText) {
        console.error("Gemini feedback response missing 'feedbackText':", parsedData);
        throw new Error("Gemini feedback response missing 'feedbackText' field.");
    }
    return parsedData;

  } catch (error) {
    console.error("Error evaluating student response for '"+wordLearned+"':", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
     if (errorMessage.includes("API key not valid")) {
       throw new Error("Gemini API key is not valid. Please check your configuration.");
    }
    throw new Error(`小雅老師的魔法水晶球好像有點秀逗了，無法給出評價耶！`);
  }
}
