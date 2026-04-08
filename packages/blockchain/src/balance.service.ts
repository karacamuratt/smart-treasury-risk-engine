import { formatEther } from "ethers";
import { getMockWalletBalanceWei } from "./mocks/mock-wallet-balances";
import { isMockBlockchainMode, provider } from "./provider";

/**
 * Fetches native ETH balance of a wallet address.
 *
 * This function reads on-chain state using RPC.
 */
export async function getEthBalance(address: string) {
    if (isMockBlockchainMode()) {
        const balanceWei = getMockWalletBalanceWei(address);

        return {
            wei: balanceWei,
            eth: formatEther(BigInt(balanceWei)),
            source: "mock",
        };
    }

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
        source: "live",
    };
}
