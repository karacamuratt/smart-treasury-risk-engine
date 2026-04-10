import { config as loadEnv } from "dotenv";
import { JsonRpcProvider } from "ethers";
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

/**
 * Blockchain RPC Provider
 *
 * This provider is responsible for connecting our backend
 * to an Ethereum RPC node.
 *
 * RPC nodes allow reading blockchain state and submitting transactions.
 */

const RPC_URL =
    process.env.RPC_HTTP_URL ||
    "https://eth.llamarpc.com";

export function getBlockchainScanMode() {
    const mode = process.env.BLOCKCHAIN_SCAN_MODE?.toLowerCase();

    if (mode === "live" || mode === "mock") {
        return mode;
    }

    return process.env.RPC_HTTP_URL ? "live" : "mock";
}

export function isMockBlockchainMode() {
    return getBlockchainScanMode() === "mock";
}

/**
 * JsonRpcProvider is the main class used to communicate
 * with Ethereum nodes via HTTP RPC.
 */

export const provider = new JsonRpcProvider(RPC_URL);
