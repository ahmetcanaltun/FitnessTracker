import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

// Prisma 7 sürücü adaptörü zorunlu kılıyor (Rust query engine kaldırıldı).
function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL tanımlı değil");
  }
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

// dev'de hot reload her seferinde yeni bağlantı havuzu açmasın diye global'de tutulur
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}

/**
 * İstemci ilk sorguda kurulur.
 *
 * `next build` sırasında sayfa modülleri DATABASE_URL olmadan da import
 * ediliyor; bağlantıyı import anında kurmak build'i kırıyordu. Proxy sayesinde
 * bağlantı yalnızca gerçekten sorgu yapılınca açılıyor.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getClient();
    const value = Reflect.get(client, property, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
