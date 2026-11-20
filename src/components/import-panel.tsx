"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Upload } from "lucide-react";
import { StatusBanner } from "@/components/status-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SyncMeta } from "@/lib/types";

export function ImportPanel() {
  const [meta, setMeta] = useState<SyncMeta | null>(null);
  const [defaultUrl, setDefaultUrl] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refreshMeta() {
    const res = await fetch("/api/sync");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error");
    setMeta(data.meta);
    setDefaultUrl(data.defaultCsvUrl || "");
    if (!url) setUrl(data.defaultCsvUrl || "");
  }

  useEffect(() => {
    refreshMeta()
      .catch((err) => setError(err instanceof Error ? err.message : "Error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function syncSheet() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url || undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "No se pudo sincronizar");
      }
      setMeta(data.meta);
      setMessage(
        `Sincronizados ${data.meta.rowCount.toLocaleString("es-MX")} folios desde RESUMEN.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de sync");
      await refreshMeta().catch(() => undefined);
    } finally {
      setBusy(false);
    }
  }

  async function loadMock() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceMock: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setMeta(data.meta);
      setMessage("Se cargó la muestra local (mock).");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function onUpload(file: File | null) {
    if (!file) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await fetch("/api/sync", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "No se pudo importar el CSV");
      }
      setMeta(data.meta);
      setMessage(
        `Importados ${data.meta.rowCount.toLocaleString("es-MX")} folios desde CSV.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de carga");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {loading && (
        <StatusBanner state="loading" message="Leyendo estado de sync…" />
      )}
      {error && <StatusBanner state="error" message={error} />}
      {message && <StatusBanner state="sample" message={message} />}

      {meta && !loading && (
        <div className="rounded-xl border border-[#c5ddd8] bg-white/85 px-4 py-4 text-sm text-[#2d4a46]">
          <p>
            Fuente:{" "}
            <strong>
              {meta.source === "google-sheet"
                ? "Google Sheet (CSV)"
                : meta.source === "csv-upload"
                  ? "CSV cargado"
                  : "Muestra local"}
            </strong>
          </p>
          <p>
            Folios en base:{" "}
            <strong>{meta.rowCount.toLocaleString("es-MX")}</strong>
          </p>
          <p>
            Última sync:{" "}
            {meta.lastSyncedAt
              ? new Date(meta.lastSyncedAt).toLocaleString("es-MX")
              : "—"}
          </p>
          {meta.error && (
            <p className="mt-2 text-amber-800">Aviso: {meta.error}</p>
          )}
        </div>
      )}

      <section className="space-y-3 rounded-xl border border-[#c5ddd8] bg-white/85 p-4">
        <header>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#0b2f2c]">
            Conectar Sheet
          </h2>
          <p className="text-sm text-[#4d6b66]">
            Pestaña RESUMEN vía export CSV. Si el libro deja de ser público,
            sube un CSV o usa la muestra.
          </p>
        </header>
        <div className="space-y-1.5">
          <Label htmlFor="sheet-url">URL CSV del Sheet</Label>
          <Input
            id="sheet-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={defaultUrl || "https://docs.google.com/.../export?format=csv&gid=..."}
            className="bg-white"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={syncSheet}
            disabled={busy}
            className="bg-[#1f6f66] hover:bg-[#185a53]"
          >
            {busy ? (
              <Loader2 className="animate-spin" />
            ) : (
              <RefreshCw />
            )}
            Sincronizar ahora
          </Button>
          <Button variant="outline" onClick={loadMock} disabled={busy}>
            Usar muestra local
          </Button>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-[#c5ddd8] bg-white/85 p-4">
        <header>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#0b2f2c]">
            Subir CSV
          </h2>
          <p className="text-sm text-[#4d6b66]">
            Exporta RESUMEN desde Google Sheets y cárgalo aquí.
          </p>
        </header>
        <Label
          htmlFor="csv-file"
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#1f6f66]/40 bg-[#f3faf8] px-4 py-8 text-sm text-[#2d4a46] transition hover:bg-[#e7f4f1]"
        >
          <Upload className="size-5 text-[#1f6f66]" />
          Elegir archivo .csv
          <Input
            id="csv-file"
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
          />
        </Label>
      </section>

      <section className="space-y-2 text-sm text-[#4d6b66]">
        <h3 className="font-semibold text-[#0f3d39]">Persistencia local</h3>
        <p>
          La base de folios y las asignaciones se guardan en{" "}
          <code className="rounded bg-white/80 px-1">data/*.json</code> en el
          servidor. Las asignaciones también se reflejan en{" "}
          <code className="rounded bg-white/80 px-1">localStorage</code> del
          navegador.
        </p>
        <p>
          Migración futura: mover esos JSON a Postgres/SQLite con las mismas
          tablas (<code>folios</code>, <code>assignments</code>) y campos stub
          de presupuesto.
        </p>
      </section>
    </div>
  );
}
