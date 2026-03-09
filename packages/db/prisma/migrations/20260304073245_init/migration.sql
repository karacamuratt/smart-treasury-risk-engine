-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "gasUsed" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "walletId" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionLog" (
    "id" TEXT NOT NULL,
    "contract" TEXT NOT NULL,
    "topic0" TEXT NOT NULL,
    "topic1" TEXT,
    "topic2" TEXT,
    "data" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionId" TEXT NOT NULL,

    CONSTRAINT "TransactionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenHolding" (
    "id" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokenHolding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskEvent" (
    "id" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_address_key" ON "Wallet"("address");

-- CreateIndex
CREATE INDEX "Wallet_address_idx" ON "Wallet"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_txHash_key" ON "Transaction"("txHash");

-- CreateIndex
CREATE INDEX "Transaction_txHash_idx" ON "Transaction"("txHash");

-- CreateIndex
CREATE INDEX "Transaction_blockNumber_idx" ON "Transaction"("blockNumber");

-- CreateIndex
CREATE INDEX "TransactionLog_contract_idx" ON "TransactionLog"("contract");

-- CreateIndex
CREATE INDEX "TokenHolding_wallet_idx" ON "TokenHolding"("wallet");

-- CreateIndex
CREATE INDEX "RiskEvent_wallet_idx" ON "RiskEvent"("wallet");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionLog" ADD CONSTRAINT "TransactionLog_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
