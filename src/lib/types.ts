/** Base folio imported from RESUMEN (Google Sheet). */
export type FolioBase = {
  id: string;
  folio: string;
  proyecto: string;
  subproyecto: string;
  cr: string;
  sucursal: string;
  estado: string;
  municipio: string;
  actividad: string;
  estatus: string;
  /** Valor original del Sheet (puede sobrescribirse localmente). */
  coordinadorSheet: string;
  /** Valor original del Sheet (puede sobrescribirse localmente). */
  idcSheet: string;
  mes: string;
  sla: string;
  slaDocumentacion: string;
  linkDrive: string;
  fechaProgramada: string;
  fechaReal: string;
};

/**
 * Asignación local (Apps Script–like).
 * Prioridad: local > sheet.
 */
export type FolioAssignment = {
  folioId: string;
  idc: string;
  coordinador: string;
  updatedAt: string;
  /** Stub: costo unitario del folio (presupuesto futuro). */
  costoFolio?: number | null;
  /** Stub: prorrateo / costo atribuido al IDC (presupuesto futuro). */
  costoIdc?: number | null;
  notasPresupuesto?: string;
};

export type Folio = FolioBase & {
  idc: string;
  coordinador: string;
  assignmentSource: "local" | "sheet" | "none";
  costoFolio: number | null;
  costoIdc: number | null;
  notasPresupuesto: string;
};

export type SyncMeta = {
  source: "google-sheet" | "csv-upload" | "mock";
  sheetUrl?: string;
  gid?: string;
  lastSyncedAt: string | null;
  rowCount: number;
  error?: string | null;
};

export type StatsBucket = {
  label: string;
  count: number;
  sinAsignar?: boolean;
};

export type DashboardStats = {
  total: number;
  asignadosIdc: number;
  asignadosCoordinador: number;
  sinIdc: number;
  sinCoordinador: number;
  byIdc: StatsBucket[];
  byCoordinador: StatsBucket[];
  byMes: StatsBucket[];
};

export type FoliosQuery = {
  q?: string;
  idc?: string;
  coordinador?: string;
  mes?: string;
  estatus?: string;
  sinIdc?: boolean;
  sinCoordinador?: boolean;
  page?: number;
  pageSize?: number;
};

export const DEFAULT_SHEET = {
  spreadsheetId: "1APH7yi9IFOZ0vT37KJXmHlQoPr8zBy2eIZvDYv6_KsI",
  gid: "1101700716",
  tabName: "RESUMEN",
} as const;

export function sheetCsvUrl(
  spreadsheetId = DEFAULT_SHEET.spreadsheetId,
  gid = DEFAULT_SHEET.gid,
) {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
}
