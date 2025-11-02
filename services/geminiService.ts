import { GoogleGenAI, Type } from "@google/genai";
import type { DesignVariation } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const redesignResponseSchema = {
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
    const basePrompt = `
    You are an expert UI/UX designer and senior frontend developer specializing in rapid prototyping and modern aesthetics.
    Your task is to take the user's provided HTML code and completely redesign it based on a specified style. You must generate THREE distinct, high-quality variations.

    **Instructions:**
    1.  **Analyze Structure:** Carefully analyze the structure, content, and semantics of the provided HTML.
    2.  **Preserve Content & Functionality:** The original text content and JavaScript functionality (any content inside <script> tags or onclick attributes) MUST be preserved.
    3.  **Complete Style Overhaul:** You MUST completely replace all existing styling. Remove any existing '<link rel="stylesheet">' tags and the entire content of any '<style>' tags.
    4.  **Use Tailwind CSS:** Apply all new styling using Tailwind CSS utility classes ONLY. You MUST include the Tailwind CSS CDN script ('<script src="https://cdn.tailwindcss.com"></script>') in the <head> of EACH generated HTML variation. Do not use any inline 'style' attributes or '<style>' blocks for the new design.
    5.  **Responsiveness:** Ensure all generated designs are fully responsive and look great on all screen sizes (mobile, tablet, desktop).
    6.  **Return Full HTML:** Each variation must be a complete, valid HTML document, starting with '<!DOCTYPE html>'.`;

    const aiChoiceInstruction = `
    **Style Direction:** The user has selected "AI's Choice" ("На усмотрение ИИ").
    1.  First, analyze the HTML content to understand its purpose (e.g., product landing page, blog post, corporate "about us" page).
    2.  Based on your analysis, choose an appropriate and effective design style (e.g., 'Minimalist', 'Corporate', 'Cyberpunk', etc.).
    3.  Generate three unique variations that embody this chosen style. Each variation should be a different take, but all should clearly belong to the same style family you've chosen.
    4.  In the 'name' field for each design, include the style you chose, like "AI's Choice: Modern Corporate" or "AI's Choice: Playful Brutalism".`;

    const specificStyleInstruction = `
    **Style Direction:** The redesign for all three variations must strictly adhere to the requested design style: "${style}". Each variation should be a unique interpretation of this style.`;

  const prompt = `
    ${basePrompt}
    ${style === 'На усмотрение ИИ' ? aiChoiceInstruction : specificStyleInstruction}

    **User's HTML Code:**
    \`\`\`html
    ${code}
    \`\`\`

    Generate three unique and visually stunning redesigns based on these instructions.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: redesignResponseSchema,
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

const applyDesignResponseSchema = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: "Креативное название для примененного дизайна, например, 'Корпоративный стиль на главной странице'",
    },
    html: { type: Type.STRING },
  },
  required: ["name", "html"],
};

export const applyDesign = async (referenceHtml: string, targetHtml: string): Promise<DesignVariation> => {
  const prompt = `
    You are a world-class AI assistant, acting as a senior UI/UX designer and frontend developer.
    Your task is to expertly transfer the visual design from a 'Reference HTML' to a new 'Target HTML' structure.

    **Core Instructions:**
    1.  **Analyze the Reference Design:** Deeply analyze the 'Reference HTML' to understand its design system. Identify the color palette, typography (fonts, sizes, weights), spacing, component styles (buttons, cards, headers), and overall layout philosophy. The design is implemented using Tailwind CSS.
    2.  **Preserve Target Content:** The text content, images, links, and any existing JavaScript functionality (onclick handlers, <script> tags) of the 'Target HTML' MUST be preserved perfectly.
    3.  **Apply Styles Semantically:** Apply the design system from the reference to the target. Map styles for corresponding elements (e.g., \`h1\`, \`p\`, \`button\`).
    4.  **Style New Elements Consistently:** If the 'Target HTML' has elements that don't exist in the reference, you MUST create new styles for them that are visually consistent with the reference's design system.
    5.  **Use Tailwind CSS Only:** All styling MUST be done using Tailwind CSS utility classes. The final HTML must include the Tailwind CDN script ('<script src="https://cdn.tailwindcss.com"></script>') in the \`<head>\`. Do not use inline styles or \`<style>\` blocks.
    6.  **Return Full HTML:** The output must be a single, complete, valid HTML document.

    **Reference HTML (The Design Source):**
    \`\`\`html
    ${referenceHtml}
    \`\`\`

    **Target HTML (The Content and Structure):**
    \`\`\`html
    ${targetHtml}
    \`\`\`

    Now, generate the final HTML for the target page with the reference design applied.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: applyDesignResponseSchema,
        temperature: 0.5,
      },
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);

    if (parsedResponse && parsedResponse.html) {
      return parsedResponse as DesignVariation;
    } else {
      throw new Error("Invalid response format from API for applying design.");
    }
  } catch (error) {
    console.error("Error calling Gemini API for applying design:", error);
    throw new Error("Failed to apply design from the API.");
  }
};