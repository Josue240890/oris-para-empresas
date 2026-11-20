import { promises as fs } from "fs";
import path from "path";
import { MOCK_FOLIOS } from "./mock-data";
import { fetchSheetCsv, mapResumenRows, parseCsv } from "./sheet";
import type {
  DashboardStats,
  Folio,
  FolioAssignment,
  FolioBase,
  FoliosQuery,
  StatsBucket,
  SyncMeta,
} from "./types";
import { DEFAULT_SHEET, sheetCsvUrl } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const FOLIOS_PATH = path.join(DATA_DIR, "folios.json");
const ASSIGNMENTS_PATH = path.join(DATA_DIR, "assignments.json");
const META_PATH = path.join(DATA_DIR, "meta.json");

type MemoryState = {
  folios: FolioBase[];
  assignments: Record<string, FolioAssignment>;
  meta: SyncMeta;
};

const g = globalThis as typeof globalThis & {
  __orisStore?: MemoryState;
};

function defaultMeta(): SyncMeta {
  return {
    source: "mock",
    sheetUrl: sheetCsvUrl(),
    gid: DEFAULT_SHEET.gid,
    lastSyncedAt: null,
    rowCount: MOCK_FOLIOS.length,
    error: null,
  };
}

function memory(): MemoryState {
  if (!g.__orisStore) {
    g.__orisStore = {
      folios: structuredClone(MOCK_FOLIOS),
      assignments: {},
      meta: defaultMeta(),
    };
  }
  return g.__orisStore;
}

async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    /* ignore */
  }
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown) {
  await ensureDir();
  try {
    await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}

export async function hydrateFromDisk() {
  const state = memory();
  const folios = await readJson<FolioBase[] | null>(FOLIOS_PATH, null);
  const assignments = await readJson<Record<string, FolioAssignment>>(
    ASSIGNMENTS_PATH,
    {},
  );
  const meta = await readJson<SyncMeta | null>(META_PATH, null);
  if (folios && folios.length > 0) state.folios = folios;
  state.assignments = assignments;
  if (meta) state.meta = meta;
  return state;
}

let hydrated = false;
async function ready() {
  if (!hydrated) {
    await hydrateFromDisk();
    hydrated = true;
  }
  return memory();
}

export function mergeFolio(
  base: FolioBase,
  assignment?: FolioAssignment,
): Folio {
  const hasLocal =
    assignment &&
    (assignment.idc !== undefined || assignment.coordinador !== undefined);

  let idc = base.idcSheet;
  let coordinador = base.coordinadorSheet;
  let assignmentSource: Folio["assignmentSource"] = "none";

  if (hasLocal && assignment) {
    if (assignment.idc !== undefined) idc = assignment.idc;
    if (assignment.coordinador !== undefined) coordinador = assignment.coordinador;
    assignmentSource = "local";
  } else if (base.idcSheet || base.coordinadorSheet) {
    assignmentSource = "sheet";
  }

  if (!idc && !coordinador) assignmentSource = "none";

  return {
    ...base,
    idc: idc || "",
    coordinador: coordinador || "",
    assignmentSource,
    costoFolio: assignment?.costoFolio ?? null,
    costoIdc: assignment?.costoIdc ?? null,
    notasPresupuesto: assignment?.notasPresupuesto ?? "",
  };
}

function matchesQuery(folio: Folio, q: FoliosQuery) {
  if (q.q) {
    const needle = q.q.toLowerCase();
    const hay = [
      folio.folio,
      folio.sucursal,
      folio.proyecto,
      folio.idc,
      folio.coordinador,
      folio.municipio,
      folio.estado,
      folio.actividad,
      folio.estatus,
    ]
      .join(" ")
      .toLowerCase();
    if (!hay.includes(needle)) return false;
  }
  if (q.idc && folio.idc !== q.idc) return false;
  if (q.coordinador && folio.coordinador !== q.coordinador) return false;
  if (q.mes && folio.mes !== q.mes) return false;
  if (q.estatus && folio.estatus !== q.estatus) return false;
  if (q.sinIdc && folio.idc) return false;
  if (q.sinCoordinador && folio.coordinador) return false;
  return true;
}

export async function listFolios(query: FoliosQuery = {}) {
  const state = await ready();
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(100, Math.max(10, query.pageSize ?? 25));

  const merged = state.folios.map((f) =>
    mergeFolio(f, state.assignments[f.id]),
  );
  const filtered = merged.filter((f) => matchesQuery(f, query));
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    meta: state.meta,
  };
}

export async function getCatalog() {
  const state = await ready();
  const merged = state.folios.map((f) =>
    mergeFolio(f, state.assignments[f.id]),
  );
  const uniq = (vals: string[]) =>
    [...new Set(vals.map((v) => v.trim()).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, "es"),
    );

  return {
    idcs: uniq(merged.map((f) => f.idc)),
    coordinadores: uniq(merged.map((f) => f.coordinador)),
    meses: uniq(merged.map((f) => f.mes)),
    estatus: uniq(merged.map((f) => f.estatus)),
    meta: state.meta,
  };
}

function bucketize(values: string[]): StatsBucket[] {
  const map = new Map<string, number>();
  for (const raw of values) {
    const label = raw.trim() || "Sin asignar";
    map.set(label, (map.get(label) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([label, count]) => ({
      label,
      count,
      sinAsignar: label === "Sin asignar",
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "es"));
}

const MES_ORDER = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export async function getStats(): Promise<DashboardStats> {
  const state = await ready();
  const merged = state.folios.map((f) =>
    mergeFolio(f, state.assignments[f.id]),
  );
  const byMes = bucketize(merged.map((f) => f.mes)).sort((a, b) => {
    if (a.sinAsignar) return 1;
    if (b.sinAsignar) return -1;
    return MES_ORDER.indexOf(a.label) - MES_ORDER.indexOf(b.label);
  });

  return {
    total: merged.length,
    asignadosIdc: merged.filter((f) => f.idc).length,
    asignadosCoordinador: merged.filter((f) => f.coordinador).length,
    sinIdc: merged.filter((f) => !f.idc).length,
    sinCoordinador: merged.filter((f) => !f.coordinador).length,
    byIdc: bucketize(merged.map((f) => f.idc)),
    byCoordinador: bucketize(merged.map((f) => f.coordinador)),
    byMes,
  };
}

export async function upsertAssignment(
  folioId: string,
  patch: Partial<
    Pick<
      FolioAssignment,
      "idc" | "coordinador" | "costoFolio" | "costoIdc" | "notasPresupuesto"
    >
  >,
) {
  const state = await ready();
  const base = state.folios.find((f) => f.id === folioId);
  if (!base) throw new Error("Folio no encontrado");

  const prev = state.assignments[folioId];
  const next: FolioAssignment = {
    folioId,
    idc: patch.idc ?? prev?.idc ?? base.idcSheet ?? "",
    coordinador:
      patch.coordinador ?? prev?.coordinador ?? base.coordinadorSheet ?? "",
    updatedAt: new Date().toISOString(),
    costoFolio:
      patch.costoFolio !== undefined
        ? patch.costoFolio
        : (prev?.costoFolio ?? null),
    costoIdc:
      patch.costoIdc !== undefined ? patch.costoIdc : (prev?.costoIdc ?? null),
    notasPresupuesto:
      patch.notasPresupuesto !== undefined
        ? patch.notasPresupuesto
        : (prev?.notasPresupuesto ?? ""),
  };

  state.assignments[folioId] = next;
  await writeJson(ASSIGNMENTS_PATH, state.assignments);
  return mergeFolio(base, next);
}

export async function syncFromSheet(options?: {
  url?: string;
  csvText?: string;
  forceMock?: boolean;
}) {
  const state = await ready();

  if (options?.forceMock) {
    state.folios = structuredClone(MOCK_FOLIOS);
    state.meta = {
      ...defaultMeta(),
      lastSyncedAt: new Date().toISOString(),
      rowCount: state.folios.length,
      error: null,
    };
    await writeJson(FOLIOS_PATH, state.folios);
    await writeJson(META_PATH, state.meta);
    return state.meta;
  }

  try {
    let csvText = options?.csvText;
    let source: SyncMeta["source"] = csvText ? "csv-upload" : "google-sheet";
    const url = options?.url || sheetCsvUrl();

    if (!csvText) {
      csvText = await fetchSheetCsv(url);
    }

    const rows = parseCsv(csvText);
    const folios = mapResumenRows(rows);
    if (folios.length === 0) {
      throw new Error("No se encontraron folios INC* en el CSV.");
    }

    state.folios = folios;
    state.meta = {
      source,
      sheetUrl: url,
      gid: DEFAULT_SHEET.gid,
      lastSyncedAt: new Date().toISOString(),
      rowCount: folios.length,
      error: null,
    };
    await writeJson(FOLIOS_PATH, state.folios);
    await writeJson(META_PATH, state.meta);
    return state.meta;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error de sync";
    // Fallback a mock si aún no hay base
    if (state.folios.length === 0) {
      state.folios = structuredClone(MOCK_FOLIOS);
    }
    state.meta = {
      ...state.meta,
      source: state.meta.source || "mock",
      lastSyncedAt: state.meta.lastSyncedAt,
      rowCount: state.folios.length,
      error: message,
    };
    await writeJson(META_PATH, state.meta);
    throw Object.assign(new Error(message), { meta: state.meta });
  }
}

export async function getMeta() {
  const state = await ready();
  return state.meta;
}

/** Primera carga: intenta Sheet; si falla, mock. */
export async function bootstrapIfNeeded() {
  const state = await ready();
  if (state.meta.lastSyncedAt && state.folios.length > 0) return state.meta;
  try {
    return await syncFromSheet();
  } catch {
    state.folios = structuredClone(MOCK_FOLIOS);
    state.meta = {
      ...defaultMeta(),
      lastSyncedAt: new Date().toISOString(),
      rowCount: MOCK_FOLIOS.length,
      error:
        "No se pudo leer el Sheet público; se cargó la muestra local. Reintenta en Importar.",
    };
    await writeJson(FOLIOS_PATH, state.folios);
    await writeJson(META_PATH, state.meta);
    return state.meta;
  }
}
