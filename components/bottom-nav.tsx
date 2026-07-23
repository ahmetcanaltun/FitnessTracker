"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Dumbbell, User, Utensils } from "lucide-react";

const TABS = [
  { href: "/exercises", label: "Hareketler", icon: Dumbbell },
  { href: "/nutrition", label: "Beslenme", icon: Utensils },
  { href: "/progress", label: "İlerleme", icon: Activity },
  { href: "/profile", label: "Profil", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        // Egzersiz detayında da "Hareketler" sekmesi aktif kalmalı
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link key={tab.href} href={tab.href} className="nav-btn">
            <Icon
              size={20}
              strokeWidth={active ? 2.4 : 1.8}
              style={{ color: active ? "var(--color-plate-red)" : "var(--color-muted)" }}
            />
            <span
              style={{
                fontSize: "10px",
                marginTop: "3px",
                fontWeight: active ? 600 : 400,
                color: active ? "var(--color-ink)" : "var(--color-muted)",
              }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
