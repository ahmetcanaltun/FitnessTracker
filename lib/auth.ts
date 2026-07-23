import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "./prisma";
import { normalizeUsername } from "./username";
import type { Role } from "./generated/prisma/enums";

// Kayıt kapalı (plan.md §13): sadece admin'in oluşturduğu hesaplar giriş yapabilir.
// Credentials provider JWT session stratejisi gerektirir, adapter kullanılmaz.

const credentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      username: string;
      role: Role;
    };
  }

  // authorize() e-posta yerine kullanıcı adı döndürüyor
  interface User {
    username: string;
    role: Role;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Kullanıcı adı", type: "text" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { username: normalizeUsername(parsed.data.username) },
        });
        if (!user) {
          // Kullanıcı yokken de hash karşılaştırması yaparak yanıt süresini
          // sabitliyoruz; aksi halde hangi adların kayıtlı olduğu anlaşılır.
          await bcrypt.compare(parsed.data.password, "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvali");
          return null;
        }

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: Role }).role;
        token.username = (user as { username: string }).username;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      session.user.username = token.username as string;
      return session;
    },
  },
});

/** Server component / action içinde oturumu zorunlu kılar. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user;
}

/** Admin gerektiren işlemler için. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}
