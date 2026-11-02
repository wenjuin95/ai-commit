// Create Git commits
import { simpleGit } from 'simple-git';

const git = simpleGit();

export async function executeCommit(message: string): Promise<boolean> {
	try {
		const status = await git.status();
		const hasStagedChanges = status.staged.length > 0 || status.created.length > 0;

		if (!hasStagedChanges) {
			console.error("\n❌ Error: No staged changes found to commit. Did you unstage them?");
			return false;
		}

		await git.commit(message);

		return true;
	} catch (err) {
		console.error("\n❌ Error during commit execution:", err);
		return false;
	}
}
