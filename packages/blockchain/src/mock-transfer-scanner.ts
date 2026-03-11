import { MOCK_ERC20_TRANSFERS } from "./mocks/mock-erc20-transfers";

/**
 * Mock blockchain scanner
 *
 * Instead of querying Ethereum nodes via RPC,
 * this function returns predefined transfer data.
 *
 * This allows deterministic testing and development
 * without relying on live blockchain state.
 */
export async function scanERC20TransfersMock(
    walletAddress: string
) {

    /**
     * NOTE:
     * walletAddress is currently unused in mock mode.
     *
     * In a real blockchain scanner this value would be used
     * to filter Transfer events where:
     *
     *   from == walletAddress
     *   OR
     *   to == walletAddress
     */

    return MOCK_ERC20_TRANSFERS;

}
