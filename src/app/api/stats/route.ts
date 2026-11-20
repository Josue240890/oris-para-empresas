import { NextResponse } from "next/server";
import { bootstrapIfNeeded, getStats } from "@/lib/store";


export async function GET() {
  try {
    await bootstrapIfNeeded();
    const stats = await getStats();
    return NextResponse.json(stats);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error de estadísticas";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
