import {
    BadRequestException,
    ConflictException,
    Injectable,
} from '@nestjs/common';
import { getAddress } from 'ethers';
import { prisma } from '@packages/db';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { getEthBalance } from "@packages/blockchain";
import { scanERC20TransfersMock } from "@packages/blockchain";

@Injectable()
export class WalletService {
    async scanWalletTransfers(address: string) {

        const normalized = this.normalizeEthereumAddress(address);

        /**
         * We intentionally use mock transfer data here.
         *
         * This avoids real blockchain RPC calls during early
         * development and keeps the system deterministic.
         *
         * Later we will replace this with the real scanner
         * using provider.getLogs().
         */

        const transfers = await scanERC20TransfersMock(normalized);

        return {
            wallet: normalized,
            transfers
        };

    }

    async getWalletBalance(address: string) {

        const normalizedAddress = this.normalizeEthereumAddress(address);

        /**
         * Fetch balance directly from blockchain.
         */
        const balance = await getEthBalance(normalizedAddress);

        return {
            address: normalizedAddress,
            balance
        };
    }

    async createWallet(dto: CreateWalletDto) {
        /**
         * Normalize and validate the incoming Ethereum address.
         *
         * getAddress() does two important things:
         * 1. Validates whether the address is a real Ethereum address
         * 2. Returns the checksum version of the address
         */
        const normalizedAddress = this.normalizeEthereumAddress(dto.address);

        /**
         * Check if the wallet already exists in the database.
         *
         * We prevent duplicate registration because the same wallet
         * should not be stored multiple times.
         */
        const existingWallet = await prisma.wallet.findUnique({
            where: {
                address: normalizedAddress,
            },
        });

        if (existingWallet) {
            throw new ConflictException('Wallet already exists.');
        }

        /**
         * Create the wallet record in the database.
         */
        const wallet = await prisma.wallet.create({
            data: {
                address: normalizedAddress,
                label: dto.label?.trim(),
            },
        });

        return wallet;
    }

    async findAllWallets() {
        return prisma.wallet.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findWalletByAddress(address: string) {
        const normalizedAddress = this.normalizeEthereumAddress(address);

        const wallet = await prisma.wallet.findUnique({
            where: {
                address: normalizedAddress,
            },
        });

        if (!wallet) {
            throw new BadRequestException('Wallet not found.');
        }

        return wallet;
    }

    async findWalletTransactions(address: string) {
        const normalizedAddress = this.normalizeEthereumAddress(address);

        const wallet = await prisma.wallet.findUnique({
            where: {
                address: normalizedAddress,
            },
            include: {
                transactions: {
                    orderBy: [
                        { blockNumber: 'desc' },
                        { createdAt: 'desc' },
                    ],
                    include: {
                        logs: true,
                    },
                },
            },
        });

        if (!wallet) {
            throw new BadRequestException('Wallet not found.');
        }

        return {
            wallet: wallet.address,
            count: wallet.transactions.length,
            transactions: wallet.transactions,
        };
    }

    /**
     * Validates and normalizes Ethereum addresses.
     *
     * Why do we normalize?
     * Because the same address can be sent with different casing styles.
     * We want a single canonical representation in our system.
     */
    private normalizeEthereumAddress(address: string): string {
        try {
            return getAddress(address.trim());
        } catch {
            throw new BadRequestException('Invalid Ethereum address.');
        }
    }
}
