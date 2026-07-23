"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Dumbbell } from "lucide-react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="save-btn" disabled={pending}>
      {pending ? "Giriş yapılıyor..." : "Giriş Yap"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <div className="max-w-sm mx-auto px-6 pt-24 pb-10">
      <div className="flex flex-col items-center text-center mb-10">
        <div className="plate-badge mb-4" style={{ background: "#E8412C", color: "#fff" }}>
          <Dumbbell size={22} />
        </div>
        <h1 className="font-display text-4xl">FITNESS TAKİP</h1>
        <p className="text-sm text-muted mt-1">Devam etmek için giriş yap</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="field-label" htmlFor="username">
            KULLANICI ADI
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            className="fit-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
            placeholder="kullanici_adi"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="password">
            ŞİFRE
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="fit-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
            placeholder="••••••••"
          />
        </div>

        {state.error && (
          <p
            role="alert"
            className="text-sm rounded-2xl px-4 py-3"
            style={{ background: "rgba(232,65,44,0.12)", color: "#E8412C" }}
          >
            {state.error}
          </p>
        )}

        <SubmitButton />
      </form>

      <p className="text-xs text-muted text-center mt-6">
        Hesaplar yönetici tarafından oluşturulur.
      </p>
    </div>
  );
}
