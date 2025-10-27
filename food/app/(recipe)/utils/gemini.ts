import { GoogleGenAI, GenerateContentConfig } from '@google/genai';

const API_KEY = 'AIzaSyA9VWJhQyPL5KTLc2PcGU4Xv1ZHTwl0KPM';

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = 'gemini-2.5-flash'; 

/**
 * Generates a cooking recipe based on a list of ingredients.
 * @param prompt A string containing the comma-separated names of the available ingredients.
 * @returns The generated recipe text from the Gemini model.
 */
export async function generateRecipe(prompt: string): Promise<string> {
  const systemInstruction = 'You are a helpful and creative culinary AI. Your task is to generate one simple and delicious recipe based only on the provided list of ingredients. The recipe must be formatted clearly with a Title, a concise Ingredients list, and numbered Step-by-step Instructions. Only use ingredients from the list. If possible, suggest an alternative ingredient for a more complex version of the recipe at the end.';

  const userPrompt = prompt;

  try {
    const config: GenerateContentConfig = {
      systemInstruction,
      temperature: 0.8, // Slightly creative response
      maxOutputTokens: 8192, // Fix: Increase max token to avoid Gemini error
    };

    const response = await ai.models.generateContent({
      model: model,
      contents: userPrompt,
      config: config,
    });

    //console.log(JSON.stringify(response, null, 2)); // Log Gemini return data for trouble shooting

    // Check Gemini response data
    const candidate = response.candidates?.[0];
    if (!candidate) {
      throw new Error("No recipe candidate returned");
    }

    if (candidate.finishReason === "MAX_TOKENS") {
      console.warn("Gemini output truncated: reached maxOutputTokens.", candidate);
    } else if (candidate.finishReason && candidate.finishReason !== "FINISH_REASON_UNSPECIFIED") {
      console.warn("Gemini blocked or altered the output", candidate.finishReason, candidate.safetyRatings);
    }

    const text =
      candidate.content?.parts
        ?.map((part) => (typeof part === "object" && part !== null && "text" in part && typeof (part as { text?: unknown }).text === "string"
          ? (part as { text: string }).text
          : ""))
        .join("")
        .trim() ?? "";

    if (!text) {
      throw new Error(`No recipe text (finish reason: ${candidate.finishReason ?? "unknown"})`);
    }

    return text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    return "Failed to generate recipe. Please check your API key and internet connection.";
  }
}
