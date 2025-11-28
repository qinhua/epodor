import { GoogleGenAI } from "@google/genai";
import { ComponentData } from "../types";

// NOTE: In a real production app, never expose API keys on the client.
// This is for demonstration within the constraints of the provided environment.
const apiKey = process.env.API_KEY || "";

let genAI: GoogleGenAI | null = null;

try {
  if (apiKey) {
    genAI = new GoogleGenAI({ apiKey });
  }
} catch (error) {
  console.error("Failed to initialize Gemini", error);
}

export const getAIResponse = async (
  query: string,
  componentContext?: ComponentData
): Promise<string> => {
  if (!genAI) {
    return "API Key 未配置，请检查环境设置。";
  }

  const systemInstruction = `
    你是一个名为 Epodor AI 的资深电子工程师和导师。
    你的目标是清晰、简洁、准确地用中文解释电子概念。
    
    原则：
    1. 即使包含技术术语，也必须用通俗易懂的中文解释（比如用“水流”比喻“电流”）。
    2. 回答格式要清晰，可以使用分点陈述。
    3. 语气要专业但亲切，鼓励用户探索。
    
    ${
      componentContext
        ? `用户当前正在学习 ${componentContext.name} (${componentContext.type})。请将你的回答重点集中在这个元件上。`
        : ""
    }
    
    请始终使用中文回答所有问题，不要使用英文回答，除非解释特定的英文术语。
  `;

  try {
    const model = "gemini-2.5-flash";
    const response = await genAI.models.generateContent({
      model,
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    });

    return response.text || "暂时无法生成回复，请稍后再试。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "与 Epodor AI 服务通信时发生错误。";
  }
};
