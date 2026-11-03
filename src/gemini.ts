// gemini api intergration
import { GoogleGenAI } from "@google/genai";
import { getGeminiModel } from "./config.js";

/**
 * Generate a conventional commit message based on the provided Git diff
 * @param diff - The Git diff string to analyze
 * @param apiKey - The Gemini API key
 * @returns A promise that resolves to the generated commit message
*/
export async function generateCommitMessage(diff: string, apiKey: string): Promise<string> {
	if (!diff || diff.trim() === "") {
		throw new Error("Git diff is empty. Cannot generate commit message.");
	}

	const ai = new GoogleGenAI({ apiKey: apiKey });

	const prompt = `
You are an expert software developer.

Analyze the following Git diff.

Generate ONE concise Git commit message
following Conventional Commits.

Rules:
- Use Feat, Fix, Refactor, Docs, Test, or Chore.
- Include a scope when appropriate.
- Use imperative mood.
- Keep the description concise.
- Do not explain the changes.
- Do not include markdown code blocks.
- Do not invent changes.

Return only the commit message.

Git diff:
${diff}
`;

	try {
		const model = await getGeminiModel();
		const response = await ai.models.generateContent({
			model: model,
			contents: prompt,
		})

		const message = response.text;

		if (!message) {
			throw new Error("Received empty response from Gemini.")
		}

		return message.trim();

	} catch (error) {
		console.error("Error generating commit message:", error);
		throw error;
	}

}
