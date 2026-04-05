import { Queue } from "bullmq";
import { config as loadEnv } from "dotenv";
import IORedis from "ioredis";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const envCandidates = [
    resolve(process.cwd(), ".env"),
    resolve(__dirname, "../../../.env"),
];

for (const filePath of envCandidates) {
    if (existsSync(filePath)) {
        loadEnv({ path: filePath });
    }
}

export const TRANSFER_SCAN_QUEUE_NAME = "transfer-scan";
export const SCAN_BLOCK_JOB_NAME = "scan-block";

export interface TransferScanJobData {
    blockNumber: number;
    expectedBlockHash?: string | null;
    confirmations: number;
    source: "listener-live" | "listener-mock";
}

/**
 * Redis connection for BullMQ
 */
function getRedisConnectionOptions() {
    return {
        maxRetriesPerRequest: null,
        lazyConnect: false,
    } as const;
}

export function createRedisConnection() {
    const redisUrl = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
    return new IORedis(redisUrl, getRedisConnectionOptions());
}

const connection = createRedisConnection();

/**
 * Transfer scanning queue
 *
 * This queue will receive jobs from the blockchain listener
 * and process them in worker services.
 */
export const transferQueue = new Queue<TransferScanJobData>(TRANSFER_SCAN_QUEUE_NAME, {
    connection,
    defaultJobOptions: {
        attempts: 3,
        removeOnComplete: 100,
        removeOnFail: 100,
        backoff: {
            type: "exponential",
            delay: 1_000,
        },
    },
});
