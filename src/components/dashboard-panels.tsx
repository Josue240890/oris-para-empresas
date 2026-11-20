"use client";

import { useEffect, useState } from "react";
import { StatusBanner } from "@/components/status-banner";
import type { DashboardStats, StatsBucket } from "@/lib/types";

export function DashboardPanels() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error de estadísticas");
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <StatusBanner state="loading" message="Calculando estadísticas…" />
    );
  }
  if (error) {
    return <StatusBanner state="error" message={error} />;
  }
  if (!stats || stats.total === 0) {
    return (
      <StatusBanner
        state="empty"
        message="Aún no hay folios. Sincroniza RESUMEN en Importar."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Folios totales" value={stats.total} />
        <StatTile label="Con IDC" value={stats.asignadosIdc} />
        <StatTile label="Con coordinador" value={stats.asignadosCoordinador} />
        <StatTile label="Sin IDC" value={stats.sinIdc} tone="warn" />
      </div>

      <section className="space-y-3">
        <header>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#0b2f2c]">
            Por IDC
          </h2>
          <p className="text-sm text-[#4d6b66]">
            Cuántos folios tiene cada IDC (incluye Sheet + asignaciones
            locales).
          </p>
        </header>
        <RankList rows={stats.byIdc} max={12} />
      </section>

      <section className="space-y-3">
        <header>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#0b2f2c]">
            Por coordinador
          </h2>
          <p className="text-sm text-[#4d6b66]">
            Carga por coordinador para balancear asignación.
          </p>
        </header>
        <RankList rows={stats.byCoordinador} max={12} />
      </section>

      <section className="space-y-3">
        <header>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#0b2f2c]">
            Por mes
          </h2>
          <p className="text-sm text-[#4d6b66]">
            Volumen mensual según la columna MES de RESUMEN.
          </p>
        </header>
        <MonthBars rows={stats.byMes} />
      </section>

      <p className="rounded-lg border border-dashed border-[#1f6f66]/35 bg-[#eef8f5] px-4 py-3 text-sm text-[#2d4a46]">
        Extensión presupuesto: cada folio ya admite{" "}
        <code className="rounded bg-white/80 px-1">costoFolio</code> y{" "}
        <code className="rounded bg-white/80 px-1">costoIdc</code> para
        contrastar costo unitario vs. costo por IDC.
      </p>
    </div>
  );
}

function StatTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "warn";
}) {
  return (
    <div
      className={
        tone === "warn"
          ? "rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-5"
          : "rounded-xl border border-[#c5ddd8] bg-white/85 px-4 py-5"
      }
    >
      <p className="text-xs font-medium tracking-wide text-[#5f7a76] uppercase">
        {label}
      </p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[#0b2f2c] tabular-nums">
        {value.toLocaleString("es-MX")}
      </p>
    </div>
  );
}

function RankList({ rows, max }: { rows: StatsBucket[]; max: number }) {
  const visible = rows.slice(0, max);
  const top = visible[0]?.count || 1;
  return (
    <ul className="space-y-2">
      {visible.map((row) => (
        <li key={row.label} className="space-y-1">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span
              className={
                row.sinAsignar
                  ? "text-amber-800 italic"
                  : "font-medium text-[#0f3d39]"
              }
            >
              {row.label}
            </span>
            <span className="tabular-nums text-[#4d6b66]">
              {row.count.toLocaleString("es-MX")}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#dcebe7]">
            <div
              className="h-full rounded-full bg-[#1f6f66] transition-all duration-700"
              style={{ width: `${Math.max(6, (row.count / top) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function MonthBars({ rows }: { rows: StatsBucket[] }) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex flex-col justify-end rounded-lg border border-[#c5ddd8] bg-white/80 p-3"
        >
          <div
            className="mb-2 w-full rounded-sm bg-[#1f6f66]/85 transition-all duration-700"
            style={{ height: `${Math.max(8, (row.count / max) * 88)}px` }}
          />
          <p className="text-xs capitalize text-[#5f7a76]">{row.label}</p>
          <p className="font-[family-name:var(--font-display)] text-lg font-semibold tabular-nums text-[#0b2f2c]">
            {row.count.toLocaleString("es-MX")}
          </p>
        </div>
      ))}
    </div>
  );
}
