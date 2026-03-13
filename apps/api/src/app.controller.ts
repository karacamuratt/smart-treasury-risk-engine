import { Controller, Get } from '@nestjs/common';
import { prisma } from '@packages/db';

@Controller()
export class AppController {
    @Get('/health')
    health() {
        return {
            ok: true,
            service: 'api',
            ts: new Date().toISOString(),
        };
    }

    @Get('/wallet-count')
    async walletCount() {
        const count = await prisma.wallet.count();

        return {
            wallets: count,
        };
    }
}
