"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/folios", label: "Folios" },
  { href: "/dashboard", label: "Estadísticas" },
  { href: "/importar", label: "Importar" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="relative z-20 border-b border-white/10 bg-[#071a1c]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-[#e8f7f4] transition group-hover:text-white sm:text-2xl">
            ORIS
          </span>
          <span className="hidden text-xs font-medium uppercase tracking-[0.18em] text-[#7eb8ae] sm:inline">
            para empresas
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-sm font-medium transition sm:px-3",
                  active
                    ? "bg-[#1f6f66] text-white"
                    : "text-[#b7d4cf] hover:bg-white/10 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
