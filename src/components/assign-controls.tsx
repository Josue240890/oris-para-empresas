"use client";

import { useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Folio } from "@/lib/types";
import { saveLocalAssignment } from "@/lib/local-assignments";

type Props = {
  folio: Folio;
  idcs: string[];
  coordinadores: string[];
  onUpdated: (folio: Folio) => void;
};

export function AssignControls({
  folio,
  idcs,
  coordinadores,
  onUpdated,
}: Props) {
  const [idc, setIdc] = useState(folio.idc);
  const [coordinador, setCoordinador] = useState(folio.coordinador);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const idcOptions = useMemo(() => {
    const set = new Set(idcs);
    if (idc) set.add(idc);
    return [...set].sort((a, b) => a.localeCompare(b, "es"));
  }, [idcs, idc]);

  const coordOptions = useMemo(() => {
    const set = new Set(coordinadores);
    if (coordinador) set.add(coordinador);
    return [...set].sort((a, b) => a.localeCompare(b, "es"));
  }, [coordinadores, coordinador]);

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/folios/${encodeURIComponent(folio.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idc, coordinador }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar");
      const next = data.folio as Folio;
      saveLocalAssignment({
        folioId: next.id,
        idc: next.idc,
        coordinador: next.coordinador,
        updatedAt: new Date().toISOString(),
        costoFolio: next.costoFolio,
        costoIdc: next.costoIdc,
        notasPresupuesto: next.notasPresupuesto,
      });
      onUpdated(next);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`idc-${folio.id}`}>IDC</Label>
          <Select
            value={idc || "__none__"}
            onValueChange={(v) => setIdc(!v || v === "__none__" ? "" : v)}
          >
            <SelectTrigger id={`idc-${folio.id}`} className="w-full bg-white">
              <SelectValue placeholder="Sin IDC">{idc || "Sin IDC"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Sin IDC</SelectItem>
              {idcOptions.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            className="bg-white"
            placeholder="O escribe un IDC nuevo"
            value={idc}
            onChange={(e) => setIdc(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`coord-${folio.id}`}>Coordinador</Label>
          <Select
            value={coordinador || "__none__"}
            onValueChange={(v) =>
              setCoordinador(!v || v === "__none__" ? "" : v)
            }
          >
            <SelectTrigger id={`coord-${folio.id}`} className="w-full bg-white">
              <SelectValue placeholder="Sin coordinador">
                {coordinador || "Sin coordinador"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Sin coordinador</SelectItem>
              {coordOptions.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            className="bg-white"
            placeholder="O escribe un coordinador nuevo"
            value={coordinador}
            onChange={(e) => setCoordinador(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={save}
          disabled={saving}
          className="bg-[#1f6f66] hover:bg-[#185a53]"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" /> Guardando…
            </>
          ) : (
            "Guardar asignación"
          )}
        </Button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm text-[#1f6f66]">
            <Check className="size-4" /> Guardado
          </span>
        )}
        {error && <span className="text-sm text-red-700">{error}</span>}
      </div>
      <p className="text-xs text-[#5f7a76]">
        Stub presupuesto: costo por folio / costo por IDC — campos listos para
        la siguiente fase.
      </p>
    </div>
  );
}
