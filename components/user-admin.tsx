"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Trash2, UserPlus } from "lucide-react";
import type { Role } from "@/lib/generated/prisma/enums";
import { USERNAME_RULE_TEXT } from "@/lib/username";
import { createUser, deleteUser, type CreateUserState } from "@/app/actions/users";

type UserRow = {
  id: string;
  name: string;
  username: string;
  role: Role;
  memberSince: string;
};

const initialState: CreateUserState = { error: null, success: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="save-btn" disabled={pending}>
      <UserPlus size={18} />
      {pending ? "Ekleniyor..." : "Kullanıcı Ekle"}
    </button>
  );
}

export function UserAdmin({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(createUser, initialState);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function remove(userId: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteUser(userId);
      if (!result.ok) {
        setError(result.error);
      }
      setConfirmId(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex flex-col gap-2 mb-6">
        {users.map((user) => (
          <div key={user.id} className="fit-card p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {user.name}
                {user.role === "admin" && <span className="fit-tag ml-2">yönetici</span>}
              </p>
              <p className="font-mono text-muted truncate" style={{ fontSize: "11px" }}>
                @{user.username}
              </p>
            </div>

            {user.id !== currentUserId &&
              (confirmId === user.id ? (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => remove(user.id)}
                    className="text-xs px-3 py-1.5 rounded-full"
                    style={{ background: "var(--color-plate-red)", color: "#fff" }}
                  >
                    Sil
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="text-xs text-muted px-2"
                  >
                    Vazgeç
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(user.id)}
                  aria-label={`${user.name} kullanıcısını sil`}
                  className="tap shrink-0"
                  style={{ color: "var(--color-muted)" }}
                >
                  <Trash2 size={16} />
                </button>
              ))}
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-sm mb-3" style={{ color: "var(--color-plate-red)" }}>
          {error}
        </p>
      )}

      <div className="fit-card p-4">
        <h2 className="font-semibold text-sm mb-4">Yeni Kullanıcı</h2>
        <form action={formAction} className="flex flex-col gap-3">
          <div>
            <label className="field-label" htmlFor="name">
              AD
            </label>
            <input
              id="name"
              name="name"
              required
              maxLength={60}
              className="fit-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="new-username">
              KULLANICI ADI
            </label>
            <input
              id="new-username"
              name="username"
              type="text"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              pattern="[a-zA-Z0-9][a-zA-Z0-9._-]{0,28}[a-zA-Z0-9]"
              required
              className="fit-input w-full rounded-2xl px-4 py-3 text-sm font-mono outline-none"
              placeholder="ahmet"
            />
            <p className="text-muted mt-1" style={{ fontSize: "10px" }}>
              {USERNAME_RULE_TEXT}
            </p>
          </div>
          <div>
            <label className="field-label" htmlFor="new-password">
              ŞİFRE (EN AZ 8 KARAKTER)
            </label>
            <input
              id="new-password"
              name="password"
              type="password"
              required
              minLength={8}
              className="fit-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="role">
              ROL
            </label>
            <select
              id="role"
              name="role"
              defaultValue="member"
              className="fit-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
            >
              <option value="member">Üye</option>
              <option value="admin">Yönetici</option>
            </select>
          </div>

          {state.error && (
            <p role="alert" className="text-sm" style={{ color: "var(--color-plate-red)" }}>
              {state.error}
            </p>
          )}
          {state.success && (
            <p className="text-sm" style={{ color: "var(--color-plate-green)" }}>
              {state.success}
            </p>
          )}

          <SubmitButton />
        </form>
      </div>
    </>
  );
}
