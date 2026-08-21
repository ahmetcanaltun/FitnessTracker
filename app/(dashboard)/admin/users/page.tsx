import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { monthYearLabel } from "@/lib/dates";
import { UserAdmin } from "@/components/user-admin";

export default async function AdminUsersPage() {
  const sessionUser = await requireUser();
  if (sessionUser.role !== "admin") {
    redirect("/profile");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, username: true, role: true, createdAt: true },
  });

  return (
    <div className="px-5 pt-6 pb-28">
      <Link href="/profile" className="flex items-center gap-1 mb-6 text-muted">
        <ChevronLeft size={18} />
        <span className="text-sm">Profil</span>
      </Link>

      <h1 className="page-title">KULLANICILAR</h1>
      <p className="page-sub mb-5">Kayıt formu herkese açık değil; hesaplar buradan eklenir.</p>

      <UserAdmin
        currentUserId={sessionUser.id}
        users={users.map((user) => ({
          ...user,
          memberSince: monthYearLabel(user.createdAt),
        }))}
      />
    </div>
  );
}
