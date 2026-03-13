import { JsonRpcProvider } from "ethers";

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

/**
 * JsonRpcProvider is the main class used to communicate
 * with Ethereum nodes via HTTP RPC.
 */

export const provider = new JsonRpcProvider(RPC_URL);
