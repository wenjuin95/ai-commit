import os from "os";
import path from "path";
import fs from "fs/promises";

const USAGE_DIR = path.join(os.homedir(), ".ai-commit");
const USAGE_FILE = path.join(USAGE_DIR, "usage.json");

interface ModelQuota {
	rpd: number;
	tpm: number;
	rpm: number;
}

const MODEL_QUOTAS: Record<string, ModelQuota> = {
	"gemini-3.5-flash-lite": {
		rpd: 500,
		tpm: 250000,
		rpm: 15
	},
	"gemini-3.6-flash": {
		rpd: 20,
		tpm: 250000,
		rpm: 5
	},
	"gemini-3.8-flash": {
		rpd: 20,
		tpm: 250000,
		rpm: 5
	}
};

export interface UsageRecord {
	date: string;
	timestamp?: number;
	model: string;
	inputTokens: number;
	outputTokens: number;
	thinkingTokens: number;
	totalTokens: number;
}

interface UsageData {
	records: UsageRecord[];
}

// read usage from json file
async function readUsage(): Promise<UsageData> {
	try {
		const content = await fs.readFile(USAGE_FILE, "utf-8");
		return JSON.parse(content) as UsageData;
	} catch {
		return { records: [] };
	}
}

// Record a new usage entry
export async function recordUsage(record: UsageRecord): Promise<void> {
	await fs.mkdir(USAGE_DIR, { recursive: true });

	const data = await readUsage();
	data.records.push(record);

	await fs.writeFile(
		USAGE_FILE,
		JSON.stringify(data, null, 2),
		{ mode: 0o600 }
	);
}

// Calculate percentage with a safeguard against division by zero
function getPercentage(used: number, limit: number): number {
	if (limit <= 0) return 0;

	return Math.min(100, (used / limit) * 100);
}

// Create a simple text-based progress bar
function createProgressBar(percentage: number): string {
	const length = 20;
	const filled = Math.round((percentage / 100) * length);

	return "█".repeat(filled) + "░".repeat(length - filled);
}

//get model usage stats
async function getModelUsage(model: string) {
	const quota = MODEL_QUOTAS[model];

	if (!quota) {
		throw new Error(`No quota configuration found for ${model}`);
	}

	const data = await readUsage();

	const now = Date.now();
	const oneMinuteAgo = now - 60 * 1000;

	const modelRecords = data.records.filter(
		record => record.model === model
	);

	// Today's requests (local calendar day)
	const todayRecords = modelRecords.filter(record => {
		const recordDate = new Date(
			record.timestamp ?? record.date
		);

		return (
			!Number.isNaN(recordDate.getTime()) &&
			recordDate.toDateString() === new Date().toDateString()
		);
	});

	// Requests made during the last 60 seconds
	const recentRecords = modelRecords.filter(record => {
		const recordTime = new Date(
			record.timestamp ?? record.date
		).getTime();

		return (
			Number.isFinite(recordTime) &&
			recordTime > oneMinuteAgo &&
			recordTime <= now
		);
	});

	const rpdUsed = todayRecords.length;
	const rpmUsed = recentRecords.length;

	const tpmUsed = recentRecords.reduce(
		(sum, record) => sum + record.inputTokens,
		0
	);

	return {
		rpd: {
			used: rpdUsed,
			limit: quota.rpd,
			remaining: Math.max(0, quota.rpd - rpdUsed),
			percentage: getPercentage(rpdUsed, quota.rpd)
		},

		tpm: {
			used: tpmUsed,
			limit: quota.tpm,
			remaining: Math.max(0, quota.tpm - tpmUsed),
			percentage: getPercentage(tpmUsed, quota.tpm)
		},

		rpm: {
			used: rpmUsed,
			limit: quota.rpm,
			remaining: Math.max(0, quota.rpm - rpmUsed),
			percentage: getPercentage(rpmUsed, quota.rpm)
		}
	};
}

// Display model usage stats in a user-friendly format
export async function showModelUsage(model: string): Promise<void> {
    const quota = MODEL_QUOTAS[model];

    if (!quota) {
        console.log(`No quota configuration found for ${model}`);
        return;
    }

    const usage = await getModelUsage(model);

    console.log(`\n📊 Gemini API Usage: ${model}`);
    console.log("================================");

    console.log("\nRPD - Requests Per Day");
    console.log(
        `[${createProgressBar(usage.rpd.percentage)}] ` +
        `${usage.rpd.percentage.toFixed(1)}%`
    );
    console.log(`${usage.rpd.used}/${usage.rpd.limit} requests`);

    console.log("\nTPM - Tokens Per Minute");
    console.log(
        `[${createProgressBar(usage.tpm.percentage)}] ` +
        `${usage.tpm.percentage.toFixed(1)}%`
    );
    console.log(
        `${usage.tpm.used.toLocaleString()}/` +
        `${usage.tpm.limit.toLocaleString()} tokens`
    );

    console.log("\nRPM - Requests Per Minute");
    console.log(
        `[${createProgressBar(usage.rpm.percentage)}] ` +
        `${usage.rpm.percentage.toFixed(1)}%`
    );
    console.log(`${usage.rpm.used}/${usage.rpm.limit} requests`);

    console.log("================================\n");
}
