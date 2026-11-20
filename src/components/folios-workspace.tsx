"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { AssignControls } from "@/components/assign-controls";
import { StatusBanner } from "@/components/status-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Folio, SyncMeta } from "@/lib/types";

type Catalog = {
  idcs: string[];
  coordinadores: string[];
  meses: string[];
  estatus: string[];
  meta: SyncMeta;
};

export function FoliosWorkspace() {
  const [items, setItems] = useState<Folio[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [idc, setIdc] = useState("");
  const [coordinador, setCoordinador] = useState("");
  const [mes, setMes] = useState("");
  const [estatus, setEstatus] = useState("");
  const [sinIdc, setSinIdc] = useState(false);
  const [sinCoordinador, setSinCoordinador] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Folio | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  const loadCatalog = useCallback(async () => {
    const res = await fetch("/api/catalog");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error de catálogo");
    setCatalog(data);
  }, []);

  const loadFolios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "25",
      });
      if (debouncedQ) params.set("q", debouncedQ);
      if (idc) params.set("idc", idc);
      if (coordinador) params.set("coordinador", coordinador);
      if (mes) params.set("mes", mes);
      if (estatus) params.set("estatus", estatus);
      if (sinIdc) params.set("sinIdc", "1");
      if (sinCoordinador) params.set("sinCoordinador", "1");

      const res = await fetch(`/api/folios?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cargar folios");
      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    debouncedQ,
    idc,
    coordinador,
    mes,
    estatus,
    sinIdc,
    sinCoordinador,
  ]);

  useEffect(() => {
    loadCatalog().catch((err) =>
      setError(err instanceof Error ? err.message : "Error"),
    );
  }, [loadCatalog]);

  useEffect(() => {
    loadFolios();
  }, [loadFolios]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ, idc, coordinador, mes, estatus, sinIdc, sinCoordinador]);

  function onUpdated(next: Folio) {
    setItems((prev) => prev.map((f) => (f.id === next.id ? next : f)));
    setSelected(next);
    loadCatalog().catch(() => undefined);
  }

  const sample =
    catalog?.meta.source === "mock" || Boolean(catalog?.meta.error);

  return (
    <div className="space-y-5">
      {loading && (
        <StatusBanner state="loading" message="Cargando folios de RESUMEN…" />
      )}
      {error && <StatusBanner state="error" message={error} />}
      {!loading && !error && total === 0 && (
        <StatusBanner
          state="empty"
          message="No hay folios con estos filtros. Ajusta la búsqueda o sincroniza el Sheet en Importar."
        />
      )}
      {sample && !error && (
        <StatusBanner
          state="sample"
          message={
            catalog?.meta.error ||
            "Estás viendo datos de muestra. Conecta el Sheet en Importar para la base completa."
          }
        />
      )}

      <div className="space-y-3 rounded-xl border border-[#c5ddd8] bg-white/80 p-4 shadow-[0_12px_40px_-28px_rgba(7,40,38,0.45)] backdrop-blur">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#6a8a85]" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar folio, sucursal, IDC, coordinador…"
            className="bg-white pl-9"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect
            label="IDC"
            value={idc}
            onChange={setIdc}
            options={catalog?.idcs ?? []}
            allLabel="Todos los IDC"
          />
          <FilterSelect
            label="Coordinador"
            value={coordinador}
            onChange={setCoordinador}
            options={catalog?.coordinadores ?? []}
            allLabel="Todos los coordinadores"
          />
          <FilterSelect
            label="Mes"
            value={mes}
            onChange={setMes}
            options={catalog?.meses ?? []}
            allLabel="Todos los meses"
          />
          <FilterSelect
            label="Estatus"
            value={estatus}
            onChange={setEstatus}
            options={catalog?.estatus ?? []}
            allLabel="Todos los estatus"
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-[#2d4a46]">
            <Checkbox
              checked={sinIdc}
              onCheckedChange={(v) => setSinIdc(v === true)}
            />
            Sin IDC
          </label>
          <label className="flex items-center gap-2 text-sm text-[#2d4a46]">
            <Checkbox
              checked={sinCoordinador}
              onCheckedChange={(v) => setSinCoordinador(v === true)}
            />
            Sin coordinador
          </label>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <p className="text-sm text-[#4d6b66]">
          <span className="font-semibold text-[#0f3d39]">{total}</span> folios
          {catalog?.meta.lastSyncedAt
            ? ` · sync ${new Date(catalog.meta.lastSyncedAt).toLocaleString("es-MX")}`
            : ""}
        </p>
      </div>

      <ul className="divide-y divide-[#d5e6e2] overflow-hidden rounded-xl border border-[#c5ddd8] bg-white/90">
        {items.map((folio) => {
          const open = selected?.id === folio.id;
          return (
            <li
              key={folio.id}
              className="px-4 py-4 transition hover:bg-[#f3faf8]"
              data-testid={`folio-row-${folio.id}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-[family-name:var(--font-display)] text-base font-semibold text-[#0b2f2c]">
                      {folio.folio}
                    </p>
                    {folio.estatus && (
                      <Badge variant="secondary" className="font-normal">
                        {folio.estatus}
                      </Badge>
                    )}
                    {folio.mes && (
                      <Badge
                        variant="outline"
                        className="capitalize border-[#1f6f66]/30 text-[#1f6f66]"
                      >
                        {folio.mes}
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-sm text-[#3d5c57]">
                    {folio.sucursal || "Sin sucursal"}
                    {folio.municipio ? ` · ${folio.municipio}` : ""}
                    {folio.estado ? ` · ${folio.estado}` : ""}
                  </p>
                  <p className="text-sm text-[#5f7a76]">
                    IDC:{" "}
                    <span className="font-medium text-[#0f3d39]">
                      {folio.idc || "—"}
                    </span>
                    {" · "}
                    Coord.:{" "}
                    <span className="font-medium text-[#0f3d39]">
                      {folio.coordinador || "—"}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  data-testid={`asignar-${folio.id}`}
                  aria-expanded={open}
                  className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-[#1f6f66]/40 bg-white px-2.5 text-sm font-medium text-[#0f3d39] transition hover:bg-[#e7f4f1]"
                  onClick={() =>
                    setSelected((prev) =>
                      prev?.id === folio.id ? null : folio,
                    )
                  }
                >
                  {open ? "Ocultar" : "Asignar"}
                </button>
              </div>
              {open && (
                <div
                  className="mt-4 rounded-lg border border-[#1f6f66]/25 bg-[#f3faf8] p-4"
                  data-testid="assign-panel"
                  role="region"
                  aria-label={`Asignar ${folio.folio}`}
                >
                  <p className="mb-3 font-[family-name:var(--font-display)] text-sm font-semibold text-[#0b2f2c]">
                    Asignar {folio.folio}
                  </p>
                  <AssignControls
                    key={folio.id}
                    folio={folio}
                    idcs={catalog?.idcs ?? []}
                    coordinadores={catalog?.coordinadores ?? []}
                    onUpdated={onUpdated}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <p className="text-sm text-[#4d6b66]">
            Página {page} de {totalPages}
          </p>
          <Button
            variant="outline"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  allLabel: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select
        value={value || "__all__"}
        onValueChange={(v) => onChange(!v || v === "__all__" ? "" : v)}
      >
        <SelectTrigger className="w-full bg-white">
          <SelectValue placeholder={allLabel}>
            {value || allLabel}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">{allLabel}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
