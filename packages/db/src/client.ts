import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { Pool } from "pg";

const envCandidates = [
    resolve(process.cwd(), ".env"),
    resolve(__dirname, "../.env"),
];

for (const filePath of envCandidates) {
    if (existsSync(filePath)) {
        loadEnv({ path: filePath });
    }
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is missing. Add it to .env (root or packages/db/.env).");
}

const parsedUrl = new URL(connectionString);
if (typeof parsedUrl.password !== "string" || parsedUrl.password.length === 0) {
    throw new Error("DATABASE_URL must include a non-empty password.");
}

const pool = new Pool({
    connectionString,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
    adapter,
});
