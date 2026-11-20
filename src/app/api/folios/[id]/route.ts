import { NextRequest, NextResponse } from "next/server";
import { upsertAssignment } from "@/lib/store";


export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as {
      idc?: string;
      coordinador?: string;
      costoFolio?: number | null;
      costoIdc?: number | null;
      notasPresupuesto?: string;
    };
    const folio = await upsertAssignment(decodeURIComponent(id), body);
    return NextResponse.json({ folio });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al asignar";
    const status = message.includes("no encontrado") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
