
import { GoogleGenAI, Type } from "@google/genai";
import type { DesignVariation } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    designs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          html: { type: Type.STRING },
        },
        required: ["name", "html"],
      },
    },
  },
  required: ["designs"],
};

export const generateDesigns = async (code: string, style: string): Promise<DesignVariation[]> => {
  const prompt = `
    You are an expert UI/UX designer and senior frontend developer specializing in rapid prototyping and modern aesthetics.
    Your task is to take the user's provided HTML code and completely redesign it based on a specified style. You must generate THREE distinct, high-quality variations.

    **Instructions:**
    1.  **Analyze Structure:** Carefully analyze the structure, content, and semantics of the provided HTML.
    2.  **Preserve Content & Functionality:** The original text content and JavaScript functionality (any content inside <script> tags or onclick attributes) MUST be preserved.
    3.  **Complete Style Overhaul:** You MUST completely replace all existing styling. Remove any existing '<link rel="stylesheet">' tags and the entire content of any '<style>' tags.
    4.  **Use Tailwind CSS:** Apply all new styling using Tailwind CSS utility classes ONLY. You MUST include the Tailwind CSS CDN script ('<script src="https://cdn.tailwindcss.com"></script>') in the <head> of EACH generated HTML variation. Do not use any inline 'style' attributes or '<style>' blocks for the new design.
    5.  **Adhere to Style:** The redesign for all three variations must strictly adhere to the requested design style: "${style}". Each variation should be a unique interpretation of this style.
    6.  **Responsiveness:** Ensure all generated designs are fully responsive and look great on all screen sizes (mobile, tablet, desktop).
    7.  **Return Full HTML:** Each variation must be a complete, valid HTML document, starting with '<!DOCTYPE html>'.

    **User's HTML Code:**
    \`\`\`html
    ${code}
    \`\`\`

    **Requested Design Style:** ${style}

    Generate three unique and visually stunning redesigns based on these instructions.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.8,
        topP: 0.95,
      },
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);

    if (parsedResponse && Array.isArray(parsedResponse.designs)) {
      return parsedResponse.designs;
    } else {
      throw new Error("Invalid response format from API.");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate designs from the API.");
  }
};
