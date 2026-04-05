import {
    getAddress,
    Interface,
    isAddress,
    zeroPadValue,
} from "ethers";
import { getMockBlockHash, getMockERC20TransferLogs } from "./mocks/mock-block-logs";
import { getBlockchainScanMode, provider } from "./provider";

const erc20Interface = new Interface([
    "event Transfer(address indexed from, address indexed to, uint256 value)",
]);
const transferEvent = erc20Interface.getEvent("Transfer");

if (!transferEvent) {
    throw new Error("ERC20 Transfer event ABI could not be initialized.");
}

const transferTopic = transferEvent.topicHash;

interface SupportedLog {
    address: string;
    blockHash: string | null;
    blockNumber: number;
    transactionHash: string;
    logIndex: number;
    data: string;
    topics: string[];
}

export interface DecodedERC20Transfer {
    eventKey: string;
    blockNumber: number;
    blockHash: string;
    txHash: string;
    logIndex: number;
    tokenAddress: string;
    from: string;
    to: string;
    value: string;
    topic0: string;
    topic1?: string;
    topic2?: string;
    data: string;
    matchedWallets: string[];
}

export interface ScanBlockForTrackedWalletsParams {
    blockNumber: number;
    expectedBlockHash?: string | null;
    trackedWalletAddresses: string[];
}

export interface ScanBlockForTrackedWalletsResult {
    mode: "live" | "mock";
    strategy: "provider.getLogs" | "mock-fixture";
    blockNumber: number;
    blockHash: string | null;
    reorgDetected: boolean;
    scannedLogCount: number;
    matchedTransferCount: number;
    transfers: DecodedERC20Transfer[];
}

function normalizeTrackedWalletAddresses(addresses: string[]) {
    const normalized = new Set<string>();

    for (const address of addresses) {
        if (isAddress(address)) {
            normalized.add(getAddress(address).toLowerCase());
        }
    }

    return [...normalized];
}

function toIndexedAddressTopic(address: string) {
    return zeroPadValue(address, 32).toLowerCase();
}

function dedupeLogs(logs: SupportedLog[]) {
    const uniqueLogs = new Map<string, SupportedLog>();

    for (const log of logs) {
        uniqueLogs.set(`${log.transactionHash}:${log.logIndex}`, log);
    }

    return [...uniqueLogs.values()];
}

async function getLiveLogsForTrackedWallets(
    blockNumber: number,
    trackedWalletTopics: string[],
) {
    const fromLogs = await provider.getLogs({
        fromBlock: blockNumber,
        toBlock: blockNumber,
        topics: [transferTopic, trackedWalletTopics],
    });

    const toLogs = await provider.getLogs({
        fromBlock: blockNumber,
        toBlock: blockNumber,
        topics: [transferTopic, null, trackedWalletTopics],
    });

    return dedupeLogs(
        [...fromLogs, ...toLogs].map((log) => ({
            address: log.address,
            blockHash: log.blockHash ?? null,
            blockNumber: Number(log.blockNumber),
            transactionHash: log.transactionHash,
            logIndex: Number((log as { index?: number; logIndex?: number }).index ?? (log as { logIndex?: number }).logIndex ?? 0),
            data: log.data,
            topics: [...log.topics],
        })),
    );
}

function decodeTransferLog(
    log: SupportedLog,
    trackedWalletSet: Set<string>,
): DecodedERC20Transfer | null {
    const parsed = erc20Interface.parseLog({
        topics: [...log.topics],
        data: log.data,
    });

    if (!parsed || parsed.name !== "Transfer") {
        return null;
    }

    const from = getAddress(parsed.args.from).toLowerCase();
    const to = getAddress(parsed.args.to).toLowerCase();
    const matchedWallets = [from, to].filter((address) =>
        trackedWalletSet.has(address),
    );

    if (matchedWallets.length === 0) {
        return null;
    }

    return {
        eventKey: `${log.transactionHash}:${log.logIndex}`,
        blockNumber: Number(log.blockNumber),
        blockHash: log.blockHash ?? "",
        txHash: log.transactionHash,
        logIndex: log.logIndex,
        tokenAddress: getAddress(log.address),
        from: getAddress(parsed.args.from),
        to: getAddress(parsed.args.to),
        value: (parsed.args.value as bigint).toString(),
        topic0: log.topics[0],
        topic1: log.topics[1],
        topic2: log.topics[2],
        data: log.data,
        matchedWallets: matchedWallets.map((address) => getAddress(address)),
    };
}

export async function scanBlockForTrackedWallets(
    params: ScanBlockForTrackedWalletsParams,
): Promise<ScanBlockForTrackedWalletsResult> {
    const mode = getBlockchainScanMode();
    const trackedWalletAddresses = normalizeTrackedWalletAddresses(
        params.trackedWalletAddresses,
    );
    const trackedWalletSet = new Set(trackedWalletAddresses);

    if (trackedWalletAddresses.length === 0) {
        return {
            mode,
            strategy: mode === "mock" ? "mock-fixture" : "provider.getLogs",
            blockNumber: params.blockNumber,
            blockHash: null,
            reorgDetected: false,
            scannedLogCount: 0,
            matchedTransferCount: 0,
            transfers: [],
        };
    }

    const expectedBlockHash = params.expectedBlockHash?.toLowerCase() ?? null;

    if (mode === "mock") {
        const blockHash = getMockBlockHash(params.blockNumber);

        if (expectedBlockHash && expectedBlockHash !== blockHash.toLowerCase()) {
            return {
                mode,
                strategy: "mock-fixture",
                blockNumber: params.blockNumber,
                blockHash,
                reorgDetected: true,
                scannedLogCount: 0,
                matchedTransferCount: 0,
                transfers: [],
            };
        }

        const logs = getMockERC20TransferLogs(params.blockNumber);
        const transfers = logs
            .map((log) => decodeTransferLog(log, trackedWalletSet))
            .filter((transfer): transfer is DecodedERC20Transfer => Boolean(transfer));

        return {
            mode,
            strategy: "mock-fixture",
            blockNumber: params.blockNumber,
            blockHash,
            reorgDetected: false,
            scannedLogCount: logs.length,
            matchedTransferCount: transfers.length,
            transfers,
        };
    }

    const block = await provider.getBlock(params.blockNumber);

    if (!block?.hash) {
        throw new Error(`Block ${params.blockNumber} could not be loaded from RPC.`);
    }

    if (expectedBlockHash && expectedBlockHash !== block.hash.toLowerCase()) {
        return {
            mode,
            strategy: "provider.getLogs",
            blockNumber: params.blockNumber,
            blockHash: block.hash,
            reorgDetected: true,
            scannedLogCount: 0,
            matchedTransferCount: 0,
            transfers: [],
        };
    }

    const trackedWalletTopics = trackedWalletAddresses.map((address) =>
        toIndexedAddressTopic(address),
    );
    const logs = await getLiveLogsForTrackedWallets(
        params.blockNumber,
        trackedWalletTopics,
    );
    const transfers = logs
        .map((log) => decodeTransferLog(log, trackedWalletSet))
        .filter((transfer): transfer is DecodedERC20Transfer => Boolean(transfer));

    return {
        mode,
        strategy: "provider.getLogs",
        blockNumber: params.blockNumber,
        blockHash: block.hash,
        reorgDetected: false,
        scannedLogCount: logs.length,
        matchedTransferCount: transfers.length,
        transfers,
    };
}
