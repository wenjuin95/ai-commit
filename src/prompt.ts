// AI prompt construction and user interaction
import {
	select,
	editor,
	confirm
} from "@inquirer/prompts";

export type CommitAction = "accept" | "edit" | "regenerate" | "quit";

export async function processCommitMessage(
	initialMessage: string,
	diff: string,
	apiKey: string,
	generateFn: (diff: string, apiKey: string) => Promise<string>
): Promise<string> {
	let msg = initialMessage;

	while (true) {
		console.log("\n📝 Generated commit message:\n");
		console.log("-".repeat(100));
		console.log(msg);
		console.log("-".repeat(100));

		let choice: CommitAction;

		try {
			choice = await select({
				message: "what would you like to do?",
				choices: [
					{ value: "accept", name: "Accept" },
					{ value: "edit", name: "Edit" },
					{ value: "regenerate", name: "Regenerate" },
					{ value: "quit", name: "Quit" }
				]
			});
		} catch (err) {
			console.log("\nProcess interrupted. Exiting...");
			process.exit(1);
		}

		if (choice === "accept") {
			const confirmAccept = await select({
				message: "Are you sure you want to commit this message?",
				default: true,
				choices: [
					{ value: true, name: "Yes" },
					{ value: false, name: "No" }
				]
			})

			if (confirmAccept) {
				return msg;
			} else {
				continue;
			}
		}

		if (choice === "edit") {
			try {
				const process = await select({
					message: "Open editor to modify the message?",
					default: true,
					choices: [
						{ value: true, name: "Yes" },
						{ value: false, name: "No" }
					]
				})

				if (!process) {
					continue;
				}

				const editedMsg = await editor({
					message: "Edit your commit message (Save and close the editor when done):",
					default: msg,
					waitForUserInput: false
				});

				if (editedMsg.trim().length === 0) {
					console.log("\n⚠️ Commit message cannot be empty. Please provide a valid message.");
					await new Promise(resolve => setTimeout(resolve, 2000));
				} else {
					msg = editedMsg.trim();
				}
			} catch (err) {
				console.log("\nProcess interrupted. Exiting...");
				process.exit(1);
			}
		}

		if (choice === "regenerate") {
			console.log("\nRegenerating commit message...");
			try {
				const newMsg = await generateFn(diff, apiKey);
				msg = newMsg;
			} catch (err) {
				console.error("\n❌ Failed to regenerate message. Please try again or edit manually.");
				await new Promise(resolve => setTimeout(resolve, 2000));
			}
		}

		if (choice === "quit") {
			const confirmQuit = await select({
				message: "Are you sure you want to quit?",
				default: false,
				choices: [
					{ value: true, name: "Yes" },
					{ value: false, name: "No" }
				]
			})

			if (confirmQuit) {
				console.log("\n Operation cancelled. No commit was made.");
				process.exit(0);
			} else {
				continue;
			}
		}
	}
}
