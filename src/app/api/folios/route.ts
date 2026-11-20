import { NextRequest, NextResponse } from "next/server";
import { bootstrapIfNeeded, listFolios } from "@/lib/store";


export async function GET(req: NextRequest) {
  try {
    await bootstrapIfNeeded();
    const sp = req.nextUrl.searchParams;
    const data = await listFolios({
      q: sp.get("q") || undefined,
      idc: sp.get("idc") || undefined,
      coordinador: sp.get("coordinador") || undefined,
      mes: sp.get("mes") || undefined,
      estatus: sp.get("estatus") || undefined,
      sinIdc: sp.get("sinIdc") === "1",
      sinCoordinador: sp.get("sinCoordinador") === "1",
      page: Number(sp.get("page") || 1),
      pageSize: Number(sp.get("pageSize") || 25),
    });
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al listar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
