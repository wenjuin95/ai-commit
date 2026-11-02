import os from "os";
import path from "path";
import fs from "fs/promises";
import { password } from "@inquirer/prompts";

const CONFIG_DIR = path.join(os.homedir(), ".ai-commit");
const CONFIG_FILE = path.join(CONFIG_DIR, ".ai-commit.json");

export async function getApiKey(): Promise<string> {
	try {
		const fileContent = await fs.readFile(CONFIG_FILE, "utf-8");
		const config = JSON.parse(fileContent);
		if (config.GEMINI_API_KEY) {
			return config.GEMINI_API_KEY;
		}
	} catch (err) {

	}

	console.log("\n🔑 Gemini API Key not found.");
	console.log("You can get a free key at: https://aistudio.google.com/app/apikey");

	const apiKey = await password({
		message: "Enter your Gemini API key (it will be saved securely for future use):",
		mask: "*"
	});

	if (!apiKey || apiKey.trim() === "") {
		console.error("❌ API key is required to use this tool.");
		process.exit(1);
	}

	await fs.mkdir(CONFIG_DIR, { recursive: true });

	await fs.writeFile(
		CONFIG_FILE,
		JSON.stringify({ GEMINI_API_KEY: apiKey.trim() }, null, 2),
		{ mode: 0o600 }
	);

	console.log(`\n API key saved successfully to ${CONFIG_FILE}\n`);

	return apiKey.trim();
}
