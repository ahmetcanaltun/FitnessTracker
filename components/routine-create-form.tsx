"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { createRoutine } from "@/app/actions/routines";

const initialState: { error: string | null; createdId: string | null } = {
  error: null,
  createdId: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="save-btn" disabled={pending}>
      <Plus size={18} />
      {pending ? "Oluşturuluyor..." : "Rutin Oluştur"}
    </button>
  );
}

export function RoutineCreateForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(createRoutine, initialState);

  // Oluşturulunca doğrudan hareket eklemeye geç — boş rutinde bırakma
  useEffect(() => {
    if (state.createdId) {
      router.push(`/routines/${state.createdId}`);
    }
  }, [state.createdId, router]);

  return (
    <div className="fit-card p-4">
      <h2 className="font-semibold text-sm mb-4">Yeni Rutin</h2>
      <form action={formAction} className="flex flex-col gap-3">
        <div>
          <label className="field-label" htmlFor="routine-name">
            AD
          </label>
          <input
            id="routine-name"
            name="name"
            required
            maxLength={60}
            placeholder="İtiş Günü"
            className="fit-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="routine-notes">
            NOT (İSTEĞE BAĞLI)
          </label>
          <input
            id="routine-notes"
            name="notes"
            maxLength={500}
            placeholder="Pazartesi / Perşembe"
            className="fit-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
          />
        </div>

        {state.error && (
          <p role="alert" className="text-sm" style={{ color: "var(--color-plate-red)" }}>
            {state.error}
          </p>
        )}

        <SubmitButton />
      </form>
    </div>
  );
}
