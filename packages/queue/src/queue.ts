import { Queue } from "bullmq";
import IORedis from "ioredis";

/**
 * Redis connection for BullMQ
 */
const connection = new IORedis({
    host: "127.0.0.1",
    port: 6379,
});

/**
 * Transfer scanning queue
 *
 * This queue will receive jobs from the blockchain listener
 * and process them in worker services.
 */
export const transferQueue = new Queue("transfer-scan", {
    connection,
});
