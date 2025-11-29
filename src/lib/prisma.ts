import "server-only";
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const getDatabaseUrl = () => {
  const DEFAULT_LOCAL_DB_URL =
    "postgresql://postgres:postgres@localhost:5433/household?schema=public";

  const primaryDatabaseUrl =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL_UNPOOLED;

  const canUseLocalFallback = process.env.NODE_ENV !== "production";

  const resolvedDatabaseUrl =
    primaryDatabaseUrl ??
    (canUseLocalFallback
      ? process.env.LOCAL_DATABASE_URL ?? DEFAULT_LOCAL_DB_URL
      : undefined);

  if (!resolvedDatabaseUrl) {
    throw new Error(
      "DATABASE_URL (or POSTGRES_PRISMA_URL/POSTGRES_URL) is required in production. For local dev, set DATABASE_URL or LOCAL_DATABASE_URL.",
    );
  }

  return resolvedDatabaseUrl;
};

const createPrismaClient = () => {
  if (typeof window !== "undefined") {
    throw new Error("Prisma client should not be instantiated in the browser.");
  }

  return new PrismaClient({
    datasources: {
      db: { url: getDatabaseUrl() },
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

export const prisma = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}


