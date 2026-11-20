import type { FolioAssignment } from "./types";

const KEY = "oris.assignments.v1";

export function loadLocalAssignments(): Record<string, FolioAssignment> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, FolioAssignment>;
  } catch {
    return {};
  }
}

export function saveLocalAssignment(assignment: FolioAssignment) {
  if (typeof window === "undefined") return;
  const all = loadLocalAssignments();
  all[assignment.folioId] = assignment;
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export function clearLocalAssignments() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
