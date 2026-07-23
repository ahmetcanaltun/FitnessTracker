"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { normalizeUsername } from "@/lib/username";

export type LoginState = { error: string | null };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Kullanıcı adı ve şifre gerekli." };
  }

  try {
    // Başarılı olursa signIn NEXT_REDIRECT fırlatır ve buradan çıkar.
    await signIn("credentials", { username, password, redirectTo: "/exercises" });
    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      // Hangi bilginin yanlış olduğunu sızdırmamak için tek mesaj
      return { error: "Kullanıcı adı veya şifre hatalı." };
    }
    throw error;
  }
}
