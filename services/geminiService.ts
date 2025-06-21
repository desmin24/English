// services/geminiService.ts
//--------------------------------------------------
// 依賴：pnpm add @google/generative-ai
// 參考文件：https://ai.google.dev/tutorials
//--------------------------------------------------

import { GoogleGenerativeAI } from "@google/generative-ai";

//--------------------------------------------------
// 型別（若已在其他檔案宣告，移除重複即可）
//--------------------------------------------------
export interface GeminiTeachingDetails {
  partOfSpeech: string;
  exampleSentence: string;
  explanation: string;
}

export interface GeminiFeedback {
  score: string;
  advice: string;
}

//--------------------------------------------------
// 工具：清理 LLM 可能包在 ```json 區塊的回傳
//--------------------------------------------------
function sanitizeJsonString(raw: string): string {
  return raw.replace(/```json|```/g, "").trim();
}

//--------------------------------------------------
// 讀取 API Key
//--------------------------------------------------
const apiKey = import.meta.env.VITE_GEMINI_API_KEY ?? "";

if (!apiKey) {
  console.warn(
    "⚠️ VITE_GEMINI_API_KEY is missing. Gemini API calls will fail."
  );
}

// Google 官方 SDK
const genAI = new GoogleGenerativeAI(apiKey);

//--------------------------------------------------
// 函式 1：產生單字教學細節
//--------------------------------------------------
export async function generateWordTeachingDetails(
  word: string,
  chineseMeaning: string
): Promise<GeminiTeachingDetails> {
  if (!apiKey) throw new Error("Gemini API key missing.");

  // 取得指定模型
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  // 呼叫生成
  // 呼叫生成（已去掉 role / parts）
const result = await model.generateContent([
  {
    text: `請用 JSON 格式回覆：
{
  "partOfSpeech": "...",
  "exampleSentence": "...",
  "explanation": "..."
}
單字：${word}，中文：${chineseMeaning}`,
  },
]);


  const response = result.response;

  // ---------- 安全檢查 ----------
  if (!response || typeof response.text !== "function") {
    throw new Error("Gemini 回傳異常：response undefined.");
  }

  const rawJson = await response.text();
  if (typeof rawJson !== "string") {
    throw new Error("Gemini 回傳不是字串。");
  }

  const sanitized = sanitizeJsonString(rawJson);
  const parsed = JSON.parse(sanitized) as Partial<GeminiTeachingDetails>;

  if (
    !parsed.partOfSpeech ||
    !parsed.exampleSentence ||
    !parsed.explanation
  ) {
    console.error("Gemini 回傳缺少欄位：", parsed);
    throw new Error("Gemini 回傳缺少必要欄位。");
  }

  return {
    partOfSpeech: parsed.partOfSpeech,
    exampleSentence: parsed.exampleSentence,
    explanation: parsed.explanation,
  };
}

//--------------------------------------------------
// 函式 2：評分學生造句
//--------------------------------------------------
export async function evaluateStudentResponse(
  wordLearned: string,
  studentSentence: string
): Promise<GeminiFeedback> {
  if (!apiKey) throw new Error("Gemini API key missing.");

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  // 呼叫生成（evaluateStudentResponse）
const result = await model.generateContent([
  {
    text: `請以 JSON 格式回覆：
{
  "score": number (1~5),
  "advice": "..."
}
單字：${wordLearned}
學生句子：${studentSentence}`,
  },
]);


  const response = result.response;

  if (!response || typeof response.text !== "function") {
    throw new Error("Gemini 回傳異常：response undefined.");
  }

  const rawJson = await response.text();
  const sanitized = sanitizeJsonString(rawJson);

  // score 可能是字串或數字，因此用 Partial + 強制轉字串
  const parsed = JSON.parse(sanitized) as Partial<GeminiFeedback>;

  return {
    score: String(parsed.score ?? "").trim() || "0",
    advice: parsed.advice ?? "No advice.",
  };
}
