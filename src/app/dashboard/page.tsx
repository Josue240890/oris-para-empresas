import { DashboardPanels } from "@/components/dashboard-panels";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6 max-w-2xl">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[#0b2f2c] sm:text-4xl">
          Estadísticas
        </h1>
        <p className="mt-2 text-[#4d6b66]">
          Conteos por IDC, por coordinador y por mes a partir de la base
          sincronizada.
        </p>
      </header>
      <DashboardPanels />
    </div>
  );
}
