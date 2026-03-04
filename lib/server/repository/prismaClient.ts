import { PrismaClient } from "@prisma/client";

declare global {
  var __pnFormPrisma__: PrismaClient | undefined;
}

function createClient() {
  return new PrismaClient();
}

export const prisma = globalThis.__pnFormPrisma__ ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__pnFormPrisma__ = prisma;
}
