import os from "os";
import path from "path";
import fs from "fs/promises";
import { password, select } from "@inquirer/prompts";

const CONFIG_DIR = path.join(os.homedir(), ".ai-commit");
const CONFIG_FILE = path.join(CONFIG_DIR, ".ai-commit.json");

const DEFAULT_MODEL = "gemini-3.5-flash-lite";

interface AppConfig {
	GEMINI_API_KEY?: string;
	GEMINI_MODEL?: string;
}

async function readConfig(): Promise<AppConfig> {
	try {
		const fileContent = await fs.readFile(CONFIG_FILE, "utf-8");
		return JSON.parse(fileContent) as AppConfig;
	} catch {
		return {};
	}
}

async function saveConfig(config: AppConfig): Promise<void> {
	await fs.mkdir(CONFIG_DIR, { recursive: true });

	await fs.writeFile(
		CONFIG_FILE,
		JSON.stringify(config, null, 2),
		{ mode: 0o600 }
	);
}

// Get API key
export async function getApiKey(): Promise<string> {
	const config = await readConfig();

	if (config.GEMINI_API_KEY) {
		return config.GEMINI_API_KEY;
	}

	console.log("\n🔑 Gemini API Key not found.");
	console.log("You can get a free key at: https://aistudio.google.com/app/apikey");

	const apiKey = await password({
		message: "Enter your Gemini API key:",
		mask: "*"
	});

	if (!apiKey || apiKey.trim() === "") {
		console.error("❌ API key is required to use this tool.");
		process.exit(1);
	}

	config.GEMINI_API_KEY = apiKey.trim();
	await saveConfig(config);

	console.log("\n✅ API key saved successfully.\n");

	return apiKey.trim();
}

// Get selected AI model
export async function getGeminiModel(): Promise<string> {
	const config = await readConfig();
	return config.GEMINI_MODEL || DEFAULT_MODEL;
}

// Change AI model
export async function configureModel(): Promise<void> {
	const currentModel = await getGeminiModel();

	console.log("\n⚙️ AI Model Configuration");
	console.log(`Current model: ${currentModel}\n`);

	const newModel = await select({
		message: "Select the new AI model:",
		choices: [
			{ name: "Gemini 3.8 Flash", value: "gemini-3.8-flash" },
			{ name: "Gemini 3.6 Flash", value: "gemini-3.6-flash" },
			{ name: "Exit", value: "exit" }
		]
	});

	if (newModel.trim() === "exit") {
		console.log("Returning to main menu...");
		process.exit(0);
	}

	const config = await readConfig();
	config.GEMINI_MODEL = newModel.trim();

	await saveConfig(config);

	console.log(`\n✅ AI model updated to: ${newModel.trim()}\n`);
}

export async function configureApiKey(): Promise<void> {
	try {
		console.log("\n🔑 Gemini API Key Configuration");
		const apiKey = await password({
			message: "Enter your Gemini API key (CTRL+C to cancel):",
			mask: "*"
		});

		if (!apiKey || apiKey.trim() === "") {
			console.error("❌ API key is required to use this tool.");
			process.exit(1);
		}

		const config = await readConfig();
		config.GEMINI_API_KEY = apiKey.trim();
		await saveConfig(config);

		console.log("\n✅ API key saved successfully.\n");
	} catch (error) {
		console.log("No API key provided. Exiting configuration.");
		process.exit(1);
	}
}

export async function configureMenu(): Promise<void> {
	while (true) {
		const choice = await select({
			message: "Configuration Menu",
			choices: [
				{ name: "Configure Gemini API Key", value: "apiKey" },
				{ name: "Configure Gemini Model", value: "model" },
				{ name: "Exit", value: "exit" },
			]
		});

		switch(choice) {
			case "model":
				await configureModel();
				break;

			case "apiKey":
				await configureApiKey();
				return;

			case "exit":
				console.log("Exiting configuration menu.");
				process.exit(0);
		}
	}
}
