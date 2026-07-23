import Link from "next/link";
import { LogOut, Users } from "lucide-react";
import { requireUser, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { monthYearLabel } from "@/lib/dates";
import { upper } from "@/lib/design";
import { StatBox } from "@/components/stat-box";
import { GoalForm } from "@/components/goal-form";

export default async function ProfilePage() {
  const sessionUser = await requireUser();

  const [user, entryCount, exerciseCount, mealCount, goal] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: sessionUser.id },
      select: { name: true, username: true, role: true, createdAt: true },
    }),
    prisma.exerciseEntry.count({ where: { userId: sessionUser.id } }),
    prisma.exerciseEntry
      .groupBy({ by: ["exerciseId"], where: { userId: sessionUser.id } })
      .then((rows) => rows.length),
    prisma.mealEntry.count({ where: { userId: sessionUser.id } }),
    prisma.nutritionGoal.findUnique({ where: { userId: sessionUser.id } }),
  ]);

  return (
    <div className="px-5 pt-10 pb-28 flex flex-col items-center text-center">
      <div className="avatar-circle mb-4">{upper(user.name.charAt(0))}</div>
      <h2 className="font-display text-2xl">{upper(user.name)}</h2>
      <p className="text-sm text-muted">@{user.username}</p>
      <p className="text-sm mb-6 text-muted">Üyelik: {monthYearLabel(user.createdAt)}</p>

      <div className="grid grid-cols-2 gap-3 w-full mb-3">
        <StatBox label="Toplam Hareket" value={exerciseCount} />
        <StatBox label="Toplam Kayıt" value={entryCount} />
        <StatBox label="Besin Kaydı" value={mealCount} />
        <StatBox label="Rol" value={user.role === "admin" ? "Yönetici" : "Üye"} />
      </div>

      <GoalForm
        initial={{
          kcalGoal: goal?.kcalGoal ?? 2600,
          proteinGoal: goal?.proteinGoal ?? 180,
          carbsGoal: goal?.carbsGoal ?? 280,
          fatGoal: goal?.fatGoal ?? 80,
          waterGoalGlasses: goal?.waterGoalGlasses ?? 8,
        }}
      />

      {user.role === "admin" && (
        <Link
          href="/admin/users"
          className="fit-card w-full p-4 mt-3 flex items-center justify-center gap-2 text-sm"
        >
          <Users size={16} style={{ color: "var(--color-muted)" }} />
          Kullanıcı Yönetimi
        </Link>
      )}

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
        className="w-full mt-3"
      >
        <button
          type="submit"
          className="fit-card w-full p-4 flex items-center justify-center gap-2 text-sm"
          style={{ color: "var(--color-plate-red)" }}
        >
          <LogOut size={16} />
          Çıkış Yap
        </button>
      </form>
    </div>
  );
}
