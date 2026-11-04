#!/usr/bin/env node

// application entry point
import { checkGitRepository, getStagedChanges } from "./git.js";
import { generateCommitMessage } from "./gemini.js";
import { processCommitMessage } from "./prompt.js";
import { executeCommit } from "./commit.js";
import { getApiKey, getGeminiModel, configureMenu } from "./config.js";
import { showModelUsage } from "./usage.js";

async function main() {
	if (process.argv[2] === "config") {
		if (process.argv[3] === "--show") {
			const apiKey = await getApiKey();
			console.log("Current API key	:", apiKey);
			const model = await getGeminiModel();
			console.log("Current model	:", model);
			process.exit(0);
		}

		await configureMenu();
		return;
	} else if (process.argv[2] === "usage") {
		const model = await getGeminiModel();
		await showModelUsage(model);
		return;
	} else if (process.argv[2] === "--help" || process.argv[2] === "-h") {
		console.log("Usage: ai-commit [config|--help|-h|--show]");
		console.log("Commands:");
		console.log("  config       Configure API key and ai model");
		console.log("  usage        Show API usage statistics");
		console.log("  --show       Show current configuration (API key and model)");
		console.log("  --help, -h   Show this help message");
		return;
	}

	const apiKey = await getApiKey();

	console.log("Checking git repository...");
	const isGitRepo = await checkGitRepository();
	if (!isGitRepo) {
		console.error("❌ Not a git repository.");
		process.exit(1);
	}

	const stagedChanges = await getStagedChanges();
	if (!stagedChanges) {
		console.log("ℹ️  No staged changes. Run `git add` to stage your files first.");
		process.exit(0);
	}

	console.log("Analyzing staged changes...");
	let initialMessage = "";
	try {
		initialMessage = await generateCommitMessage(stagedChanges, apiKey);
	} catch (err) {
		console.error("❌ Error generating commit message:", err);
		process.exit(1);
	}

	const finalMsg = await processCommitMessage(initialMessage, stagedChanges, apiKey, generateCommitMessage);

	const success = await executeCommit(finalMsg);
	if (success) {
		console.log("\n✅ Commit successful!");
	} else {
		console.error("\n❌ Commit failed.");
		process.exit(1);
	}
}

main().catch((err) => {
	console.error("An error occurred:", err);
	process.exit(1);
});
