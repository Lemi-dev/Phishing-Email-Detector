import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export enum RiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export interface PhishingAnalysis {
  riskLevel: RiskLevel;
  score: number; // 0 to 100
  reasons: string[];
  suspiciousPhrases: {
    phrase: string;
    explanation: string;
  }[];
  summary: string;
  recommendation: string;
}

export async function analyzeEmail(emailText: string): Promise<PhishingAnalysis> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `Analyze the following email for phishing risks. Provide a structured analysis including risk level, a score from 0-100, specific reasons for the risk, suspicious phrases found in the text with explanations, a brief summary, and a recommendation for the user.\n\nEmail Content:\n${emailText}` }],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          riskLevel: {
            type: Type.STRING,
            enum: ["LOW", "MEDIUM", "HIGH"],
            description: "The overall risk level of the email.",
          },
          score: {
            type: Type.NUMBER,
            description: "A numerical risk score from 0 (safe) to 100 (highly dangerous).",
          },
          reasons: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of general reasons why this email is or isn't suspicious.",
          },
          suspiciousPhrases: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phrase: { type: Type.STRING, description: "The specific phrase from the email." },
                explanation: { type: Type.STRING, description: "Why this phrase is suspicious." },
              },
              required: ["phrase", "explanation"],
            },
            description: "Specific phrases identified as suspicious.",
          },
          summary: {
            type: Type.STRING,
            description: "A brief summary of the analysis.",
          },
          recommendation: {
            type: Type.STRING,
            description: "What the user should do next.",
          },
        },
        required: ["riskLevel", "score", "reasons", "suspiciousPhrases", "summary", "recommendation"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Failed to get analysis from AI");
  }

  return JSON.parse(text) as PhishingAnalysis;
}
