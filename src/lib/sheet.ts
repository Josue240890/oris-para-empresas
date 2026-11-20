import type { FolioBase } from "./types";

function cell(row: Record<string, string>, ...keys: string[]) {
  for (const key of keys) {
    const direct = row[key];
    if (direct != null && String(direct).trim() !== "") return String(direct).trim();
  }
  const lowerMap = new Map(
    Object.entries(row).map(([k, v]) => [k.trim().toLowerCase(), v]),
  );
  for (const key of keys) {
    const found = lowerMap.get(key.trim().toLowerCase());
    if (found != null && String(found).trim() !== "") return String(found).trim();
  }
  return "";
}

function normalizeMes(raw: string) {
  const v = raw.trim().toLowerCase();
  if (!v) return "";
  const map: Record<string, string> = {
    ene: "enero",
    enero: "enero",
    feb: "febrero",
    febrero: "febrero",
    mar: "marzo",
    marzo: "marzo",
    abr: "abril",
    abril: "abril",
    may: "mayo",
    mayo: "mayo",
    jun: "junio",
    junio: "junio",
    jul: "julio",
    julio: "julio",
    ago: "agosto",
    agosto: "agosto",
    sep: "septiembre",
    sept: "septiembre",
    septiembre: "septiembre",
    oct: "octubre",
    octubre: "octubre",
    nov: "noviembre",
    noviembre: "noviembre",
    dic: "diciembre",
    diciembre: "diciembre",
  };
  return map[v] ?? (v.length <= 12 && !v.includes("/") ? v : "");
}

/** Parse CSV text to objects (handles quotes / commas). */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (c === "\n" || c === "\r") {
      if (c === "\r" && next === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      continue;
    }
    field += c;
  }
  if (field.length || row.length) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  }
  if (rows.length === 0) return [];

  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((cols) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      if (!h) return;
      obj[h] = (cols[idx] ?? "").trim();
    });
    return obj;
  });
}

export function mapResumenRows(rows: Record<string, string>[]): FolioBase[] {
  const out: FolioBase[] = [];
  const seen = new Set<string>();

  const skipFolios = new Set(["SIN FOLIO", "PENDIENTE", "N/A", "NA", "-", "#N/A"]);

  for (const row of rows) {
    const folio = cell(row, "FOLIO");
    if (!folio) continue;
    if (skipFolios.has(folio.toUpperCase())) continue;

    const baseId = folio;
    let id = baseId;
    let n = 1;
    while (seen.has(id)) {
      id = `${baseId}#${++n}`;
    }
    seen.add(id);

    out.push({
      id,
      folio,
      proyecto: cell(row, "PROYECTO"),
      subproyecto: cell(row, "SUBPROYECTO"),
      cr: cell(row, "CR", "CR "),
      sucursal: cell(row, "SUCURSAL"),
      estado: cell(row, "ESTADO"),
      municipio: cell(row, "DELEGACIÓN/MUNICIPIO", "DELEGACION/MUNICIPIO"),
      actividad: cell(row, "ACTIVIDAD"),
      estatus: cell(row, "ESTATUS"),
      coordinadorSheet: cell(row, "COORDINADOR"),
      idcSheet: cell(row, "IDC"),
      mes: normalizeMes(cell(row, "MES")),
      sla: cell(row, "SLA"),
      slaDocumentacion: cell(row, "SLA DOCUMENTACIÓN", "SLA DOCUMENTACION"),
      linkDrive: cell(row, "LINK DRIVE FACTURACIÓN", "LINK DRIVE FACTURACION"),
      fechaProgramada: cell(row, "FECHA PROGRAMADA DE INICIO"),
      fechaReal: cell(row, "FECHA REAL", "FECHA REAL "),
    });
  }

  return out;
}

export async function fetchSheetCsv(url: string, signal?: AbortSignal) {
  const res = await fetch(url, {
    signal,
    redirect: "follow",
    headers: { Accept: "text/csv,text/plain,*/*" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`No se pudo leer el Sheet (HTTP ${res.status}).`);
  }
  const text = await res.text();
  if (text.includes("<!DOCTYPE html") || text.includes("<html")) {
    throw new Error(
      "El Sheet no es público o requiere acceso. Usa carga CSV o datos de muestra.",
    );
  }
  return text;
}
