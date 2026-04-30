import path from "path";
import { defineConfig } from "prisma/config";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

export default defineConfig({
    schema: path.join("prisma", "schema.prisma"),
    datasource: {
        url: process.env.DATABASE_URL!,
    },
    migrations: {
        seed: "ts-node --project tsconfig.seed.json prisma/seed.ts",
    },
});