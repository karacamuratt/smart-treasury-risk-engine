/**
 * Mock ERC20 transfer data used for development and testing.
 *
 * IMPORTANT:
 * This file simulates blockchain responses so we do not depend
 * on real RPC calls during early development stages.
 *
 * Replace this with real blockchain scanning logic later.
 */

export const MOCK_ERC20_TRANSFERS = [
    {
        token: "0xMockTokenAddress00000000000000000000000001",
        from: "0x1111111111111111111111111111111111111111",
        to: "0x2222222222222222222222222222222222222222",
        value: "5000000000000000000",
        txHash: "0xmocktxhash1"
    },
    {
        token: "0xMockTokenAddress00000000000000000000000002",
        from: "0x3333333333333333333333333333333333333333",
        to: "0x4444444444444444444444444444444444444444",
        value: "15000000000000000000",
        txHash: "0xmocktxhash2"
    },
    {
        token: "0xMockTokenAddress00000000000000000000000003",
        from: "0x5555555555555555555555555555555555555555",
        to: "0x6666666666666666666666666666666666666666",
        value: "900000000000000000",
        txHash: "0xmocktxhash3"
    }
];
