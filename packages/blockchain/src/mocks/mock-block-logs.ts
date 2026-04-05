import { Interface } from "ethers";
import { MOCK_ERC20_TRANSFERS } from "./mock-erc20-transfers";

const erc20Interface = new Interface([
    "event Transfer(address indexed from, address indexed to, uint256 value)",
]);
const resolvedTransferEvent = erc20Interface.getEvent("Transfer");

if (!resolvedTransferEvent) {
    throw new Error("ERC20 Transfer event ABI could not be initialized.");
}

const transferEvent = resolvedTransferEvent;

export interface MockBlockchainLog {
    address: string;
    blockNumber: number;
    blockHash: string;
    transactionHash: string;
    logIndex: number;
    removed: boolean;
    data: string;
    topics: string[];
}

export function getMockBlockNumber() {
    return Number(process.env.MOCK_SCAN_BLOCK_NUMBER ?? 19_000_000);
}

export function getMockBlockHash(blockNumber: number) {
    return `0x${blockNumber.toString(16).padStart(64, "0")}`;
}

export function getMockERC20TransferLogs(
    blockNumber = getMockBlockNumber(),
) {
    const blockHash = getMockBlockHash(blockNumber);

    return MOCK_ERC20_TRANSFERS.map<MockBlockchainLog>((transfer, index) => {
        const event = erc20Interface.encodeEventLog(
            transferEvent,
            [transfer.from, transfer.to, BigInt(transfer.value)],
        );

        return {
            address: transfer.token,
            blockNumber,
            blockHash,
            transactionHash: transfer.txHash,
            logIndex: index,
            removed: false,
            data: event.data,
            topics: event.topics,
        };
    });
}
