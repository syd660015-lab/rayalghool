import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

function getAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please configure it in the Secrets panel.");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export interface AnalysisResult {
  summary: string;
  themes: { theme: string; count: number }[];
  clinicalInsights: string[];
}

export async function analyzeExaminerNotes(notes: string[], figureType: string, scores: Record<number, number>): Promise<AnalysisResult> {
  const filteredNotes = notes.filter(n => n && n.trim().length > 0);
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const maxScore = figureType === 'A' ? 36 : 22;

  const prompt = `Analyze a Rey Complex Figure Test (RCFT) session for Model ${figureType}.
  Total Score: ${totalScore.toFixed(1)} / ${maxScore}
  
  Examiner Notes:
  ${filteredNotes.length > 0 ? filteredNotes.join("\n") : "No specific notes provided."}
  
  Provide:
  1. A concise summary of the patient's performance (considering the score and notes).
  2. Identify common themes or patterns.
  3. Extract clinical insights or recommendations.
  
  Respond in ARABIC. Avoid using markdown formatting in your response. Return ONLY a JSON object matching the requested schema.`;

  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            summary: { type: SchemaType.STRING },
            themes: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  theme: { type: SchemaType.STRING },
                  count: { type: SchemaType.NUMBER }
                },
                required: ["theme", "count"]
              }
            },
            clinicalInsights: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING }
            }
          },
          required: ["summary", "themes", "clinicalInsights"]
        }
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (text) {
      const cleanText = text.trim()
        .replace(/^```json\n?/, "")
        .replace(/\n?```$/, "");
      return JSON.parse(cleanText) as AnalysisResult;
    }
    throw new Error("No response from AI");
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      summary: "فشل تحليل الملاحظات بواسطة الذكاء الاصطناعي. تأكد من إعداد مفتاح API الخاص بـ Gemini.",
      themes: [],
      clinicalInsights: []
    };
  }
}
export async function analyzeDrawingStrategy(strokes: any[], figureType: string): Promise<number> {
  const strokeData = strokes.map(s => ({
    id: s.id,
    color: s.color,
    bounds: s.bounds,
    pointCount: s.points.length
  }));

  const prompt = `Analyze the drawing sequence of a Rey Complex Figure Test (Model ${figureType}).
  The following is a list of strokes in ORDER of drawing:
  ${JSON.stringify(strokeData)}
  
  Based on clinical criteria for Rey Figure Assessment, classify the drawing STRATEGY into one of these types:
  1: Holistic/Structural (Begins with main large rectangle or outer frame)
  2: Internal Structure (Starts with internal details or sub-frames before the outer frame)
  3: Piecemeal (Draws piece by piece adjacent to each other, fragmented but connected)
  4: Fragmentary (Disjointed, no clear structure or sequence)
  5: Random/Chaotic (Unorganized strokes all over the place)
  
  Return ONLY a JSON object with a single field "strategy" containing the integer (1, 2, 3, 4, or 5).`;

  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            strategy: { type: SchemaType.NUMBER }
          },
          required: ["strategy"]
        }
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (text) {
      const parsed = JSON.parse(text);
      return parsed.strategy || 1;
    }
    return 1;
  } catch (error) {
    console.error("Strategy Analysis Error:", error);
    return 1; // Default to type 1
  }
}
