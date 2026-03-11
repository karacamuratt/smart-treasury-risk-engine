import { provider } from "./provider";
import { formatEther } from "ethers";

/**
 * Fetches native ETH balance of a wallet address.
 *
 * This function reads on-chain state using RPC.
 */
export async function getEthBalance(address: string) {
    /**
     * getBalance queries the Ethereum node
     * and returns the balance in Wei (bigint).
     */

    const balanceWei = await provider.getBalance(address);

    /**
     * Convert Wei to ETH for human readability.
     */

    const balanceEth = formatEther(balanceWei);

    return {
        wei: balanceWei.toString(),
        eth: balanceEth,
    };
}
