import { NextResponse } from "next/server";
import { bootstrapIfNeeded, getCatalog } from "@/lib/store";


export async function GET() {
  try {
    await bootstrapIfNeeded();
    const catalog = await getCatalog();
    return NextResponse.json(catalog);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error de catálogo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
