
import { GoogleGenAI, Type } from "@google/genai";
import type { AspectRatio } from '../types';

let ai: GoogleGenAI | undefined;

function getAi() {
  if (!ai) {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
}

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

export async function analyzeGarment(base64Image: string, mimeType: string = 'image/jpeg'): Promise<string> {
  const model = 'gemini-2.5-flash';
  const imagePart = fileToGenerativePart(base64Image, mimeType);
  const prompt = `Analyze the image of this woman's clothing item. Provide a detailed description covering its type, style, color, fabric, and overall vibe. Focus on creating a rich description that can be used to generate a new image of a model wearing it.`;

  const response = await getAi().models.generateContent({
    model,
    contents: { parts: [imagePart, { text: prompt }] },
  });

  return response.text || "A stylish garment.";
}

export async function generateModelImages(prompts: string[], aspectRatio: AspectRatio): Promise<string[]> {
    const model = 'imagen-4.0-generate-001';
    
    const imagePromises = prompts.map(prompt => 
      getAi().models.generateImages({
        model,
        prompt: `${prompt}, high fashion photography, hyperrealistic, 8k, sharp focus`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio,
        }
      }).catch(e => {
        console.error("Error generating individual image:", e);
        return null;
      })
    );

    const results = await Promise.all(imagePromises);
    
    // Filter out failed requests and extract image bytes safely
    return results
      .map(res => res?.generatedImages?.[0]?.image?.imageBytes)
      .filter((bytes): bytes is string => !!bytes);
}

export async function describeGeneratedImage(base64Image: string): Promise<{ description: string; recommendations: string }> {
  const model = 'gemini-2.5-flash';
  const imagePart = fileToGenerativePart(base64Image, 'image/jpeg');
  const prompt = `Describe the style of the outfit shown. Then, provide recommendations for climate/weather this outfit is suitable for. Return a JSON object with two keys: "description" and "recommendations".`;

  const response = await getAi().models.generateContent({
      model,
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
          responseMimeType: "application/json",
          responseSchema: {
              type: Type.OBJECT,
              properties: {
                  description: { type: Type.STRING },
                  recommendations: { type: Type.STRING }
              },
              required: ["description", "recommendations"]
          }
      }
  });

  try {
    // Clean up potential markdown backticks just in case, though responseMimeType usually handles it
    const text = response.text || "{}";
    const jsonStartIndex = text.indexOf('{');
    const jsonEndIndex = text.lastIndexOf('}');
    
    if (jsonStartIndex === -1 || jsonEndIndex === -1) {
        throw new Error("No JSON found in response");
    }
    
    const jsonStr = text.substring(jsonStartIndex, jsonEndIndex + 1);
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse JSON from Gemini:", response.text);
    return {
      description: "A stylish and modern outfit.",
      recommendations: "Suitable for mild weather conditions."
    };
  }
}

export async function editImage(base64Image: string, prompt: string): Promise<string> {
    const model = 'gemini-2.5-flash-image';
    const imagePart = fileToGenerativePart(base64Image, 'image/jpeg');

    const response = await getAi().models.generateContent({
      model,
      contents: {
        parts: [
          imagePart,
          { text: prompt },
        ],
      },
    });

    // Iterate through all parts to find the image, as per guidelines
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
            return part.inlineData.data;
        }
    }

    throw new Error("Could not extract edited image from API response. The model may have returned text instead.");
}
