
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function generateWebsiteTemplate(prompt: string): Promise<string> {
  const fullPrompt = `
You are an expert frontend developer specializing in creating beautiful websites with Tailwind CSS.

Your task is to generate a complete, single HTML file based on the following user request.

**User Request:**
"${prompt}"

**Requirements:**
1.  The output must be a single, complete HTML file.
2.  It MUST include the Tailwind CSS CDN script in the <head> section: <script src="https://cdn.tailwindcss.com"></script>.
3.  The HTML should be well-structured, semantic, and visually appealing. Use modern design principles.
4.  Use placeholder images from https://picsum.photos/ if you need images. For example: <img src="https://picsum.photos/800/600" alt="Placeholder">.
5.  Your response should ONLY be the raw HTML code. Do not include any explanations, comments, or markdown formatting like \`\`\`html ... \`\`\`. Your entire response must start directly with \`<!DOCTYPE html>\`.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: fullPrompt,
    });
    
    // Clean up potential markdown formatting from the response
    let htmlContent = response.text.trim();
    if (htmlContent.startsWith('```html')) {
      htmlContent = htmlContent.substring(7);
    }
    if (htmlContent.endsWith('```')) {
      htmlContent = htmlContent.substring(0, htmlContent.length - 3);
    }

    return htmlContent.trim();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate website template. Please check your API key and network connection.");
  }
}
