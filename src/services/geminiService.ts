import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AnalysisResult {
  summary: string;
  themes: { theme: string; count: number }[];
  clinicalInsights: string[];
}

export async function analyzeExaminerNotes(notes: string[]): Promise<AnalysisResult> {
  const filteredNotes = notes.filter(n => n && n.trim().length > 0);
  if (filteredNotes.length === 0) {
    return {
      summary: "لا توجد ملاحظات كافية للتحليل.",
      themes: [],
      clinicalInsights: []
    };
  }

  const prompt = `Analyze the following examiner notes from a Rey Complex Figure Test (RCFT) session.
  Notes:
  ${filteredNotes.join("\n")}
  
  Provide:
  1. A concise summary of the patient's performance based on these notes.
  2. Identify common themes or recurring patterns in the notes.
  3. Extract clinical insights or recommendations.
  
  Respond in ARABIC.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            themes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  theme: { type: Type.STRING },
                  count: { type: Type.NUMBER }
                },
                required: ["theme", "count"]
              }
            },
            clinicalInsights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "themes", "clinicalInsights"]
        }
      }
    });

    if (response.text) {
      const cleanText = response.text.trim()
        .replace(/^```json\n?/, "")
        .replace(/\n?```$/, "");
      return JSON.parse(cleanText) as AnalysisResult;
    }
    throw new Error("No response from AI");
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      summary: "فشل تحليل الملاحظات بواسطة الذكاء الاصطناعي.",
      themes: [],
      clinicalInsights: []
    };
  }
}
