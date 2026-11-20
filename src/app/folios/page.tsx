import { FoliosWorkspace } from "@/components/folios-workspace";

export default function FoliosPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6 max-w-2xl">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[#0b2f2c] sm:text-4xl">
          Folios
        </h1>
        <p className="mt-2 text-[#4d6b66]">
          Busca, filtra y asigna cada folio a un IDC y un coordinador. Los
          cambios se guardan en local.
        </p>
      </header>
      <FoliosWorkspace />
    </div>
  );
}
