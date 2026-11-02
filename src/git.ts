// git-related operation
import { simpleGit } from 'simple-git';

const git = simpleGit();

/**
 * Checks if the current directory belongs to a Git repository.
 */
export async function checkGitRepository(): Promise<boolean> {
	try {
		const isRepo = await git.checkIsRepo();

		if (isRepo) {
			const topLevel = await git.revparse(['--show-toplevel']);
			console.log(`Git repository confirmed at root: ${topLevel.trim()}`);
		}

		return isRepo;
	} catch (err) {
		console.error(`Error checking git repository: ${err}`);
		return false;
	}
}

/**
 * Returns the staged changes (diff) for the current repository.
 */
export async function getStagedChanges(): Promise<string> {
	try {
		const isRepo = await git.checkIsRepo();
		if (!isRepo) {
			throw new Error("Not a git repository");
		}

		const status = await git.status();

		if (status.staged.length === 0) {
			return "";
		}

		const stagedDiff = await git.diff(['--cached']);

		return stagedDiff;
	} catch (err) {
		console.error(`Error getting staged changes: ${err}`);
		throw err;
	}
}
