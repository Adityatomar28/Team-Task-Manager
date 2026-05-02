const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const connectionString = process.env.DATABASE_URL;
const useMemoryDb =
  process.env.NODE_ENV !== "production" && process.env.USE_REMOTE_DATABASE !== "true";

if (useMemoryDb) {
  module.exports = require("./memory-prisma");
  return;
}

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
