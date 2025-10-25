import { GoogleGenAI, GenerateContentConfig } from '@google/genai';

const API_KEY = 'AIzaSyA9VWJhQyPL5KTLc2PcGU4Xv1ZHTwl0KPM';

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = 'gemini-2.5-flash'; 

/**
 * Generates a cooking recipe based on a list of ingredients.
 * @param ingredients A string containing the comma-separated names of the available ingredients.
 * @returns The generated recipe text from the Gemini model.
 */
export async function generateRecipe(ingredients: string): Promise<string> {
  const systemInstruction = 'You are a helpful and creative culinary AI. Your task is to generate one simple and delicious recipe based only on the provided list of ingredients. The recipe must be formatted clearly with a Title, a concise Ingredients list, and numbered Step-by-step Instructions. Only use ingredients from the list. If possible, suggest an alternative ingredient for a more complex version of the recipe at the end.';

  const userPrompt = `Generate a recipe using these ingredients: ${ingredients}`;

  try {
    const config: GenerateContentConfig = {
      systemInstruction,
      temperature: 0.8, // Slightly creative response
      maxOutputTokens: 2048,
    };

    const response = await ai.models.generateContent({
      model: model,
      contents: userPrompt,
      config: config,
    });

    // Avoid type check error
    const text = response.text ?? "";
    if (!text) throw new Error("No recipe text");
    return text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    return "Failed to generate recipe. Please check your API key and internet connection.";
  }
}