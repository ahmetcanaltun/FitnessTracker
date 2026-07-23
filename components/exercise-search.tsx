"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";

/**
 * Arama kutusu + kas grubu chip'leri. Filtre durumu URL'de tutulur, böylece
 * liste sunucuda render edilir ve geri tuşu doğru çalışır.
 */
export function ExerciseSearch({
  categories,
  initialQuery,
  initialCategory,
}: {
  categories: string[];
  initialQuery: string;
  initialCategory: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [, startTransition] = useTransition();

  // Her tuşta istek atmamak için kısa gecikme
  useEffect(() => {
    if (query === initialQuery) return;

    const timeout = setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (initialCategory) params.set("kategori", initialCategory);
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    }, 250);

    return () => clearTimeout(timeout);
  }, [query, initialQuery, initialCategory, pathname, router]);

  function categoryHref(category: string) {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category) params.set("kategori", category);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl fit-input mb-3">
        <Search size={16} style={{ color: "var(--color-muted)" }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hareket ara..."
          aria-label="Hareket ara"
          className="bg-transparent outline-none w-full text-sm"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {["", ...categories].map((category) => (
          <button
            key={category || "all"}
            onClick={() => router.replace(categoryHref(category), { scroll: false })}
            className="fit-chip shrink-0"
            data-active={initialCategory === category}
          >
            {category || "Tümü"}
          </button>
        ))}
      </div>
    </>
  );
}
