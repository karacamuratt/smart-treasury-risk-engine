import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { WalletService } from './wallet.service';

@Controller('wallets')
export class WalletController {
    constructor(private readonly walletService: WalletService) { }

    @Post()
    async createWallet(@Body() dto: CreateWalletDto) {
        /**
         * Registers a new wallet in the system.
         */
        return this.walletService.createWallet(dto);
    }

    @Get()
    async findAllWallets() {
        /**
         * Returns all registered wallets.
         */
        return this.walletService.findAllWallets();
    }

    @Get(':address')
    async findWalletByAddress(@Param('address') address: string) {
        /**
         * Returns a wallet by Ethereum address.
         */
        return this.walletService.findWalletByAddress(address);
    }
}
