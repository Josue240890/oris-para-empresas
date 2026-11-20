import { ImportPanel } from "@/components/import-panel";

export default function ImportarPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[#0b2f2c] sm:text-4xl">
          Importar
        </h1>
        <p className="mt-2 text-[#4d6b66]">
          Sincroniza la pestaña RESUMEN del Google Sheet, sube un CSV o usa la
          muestra local.
        </p>
      </header>
      <ImportPanel />
    </div>
  );
}
