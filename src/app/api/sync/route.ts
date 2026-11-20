import { NextRequest, NextResponse } from "next/server";
import { getMeta, syncFromSheet } from "@/lib/store";
import { sheetCsvUrl } from "@/lib/types";


export async function GET() {
  try {
    const meta = await getMeta();
    return NextResponse.json({
      meta,
      defaultCsvUrl: sheetCsvUrl(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      const forceMock = form.get("forceMock") === "1";
      if (forceMock) {
        const meta = await syncFromSheet({ forceMock: true });
        return NextResponse.json({ ok: true, meta });
      }
      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: "Adjunta un archivo CSV." },
          { status: 400 },
        );
      }
      const csvText = await file.text();
      const meta = await syncFromSheet({ csvText });
      return NextResponse.json({ ok: true, meta });
    }

    const body = (await req.json().catch(() => ({}))) as {
      url?: string;
      forceMock?: boolean;
      csvText?: string;
    };

    if (body.forceMock) {
      const meta = await syncFromSheet({ forceMock: true });
      return NextResponse.json({ ok: true, meta });
    }

    const meta = await syncFromSheet({
      url: body.url,
      csvText: body.csvText,
    });
    return NextResponse.json({ ok: true, meta });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error de sync";
    const meta =
      err && typeof err === "object" && "meta" in err
        ? (err as { meta: unknown }).meta
        : undefined;
    return NextResponse.json({ ok: false, error: message, meta }, { status: 502 });
  }
}
