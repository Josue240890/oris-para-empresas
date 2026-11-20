import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <section className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%27120%27 height=%27120%27 viewBox=%270 0 120 120%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath d=%27M0 60h120M60 0v120%27 stroke=%27%231f6f66%27 stroke-opacity=%270.08%27 stroke-width=%271%27 fill=%27none%27/%3E%3C/svg%3E')]"
      />
      <div className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-6xl flex-col justify-center px-4 py-16 sm:px-6">
        <p className="animate-oris-rise text-sm font-semibold tracking-[0.28em] text-[#1f6f66] uppercase">
          Operaciones de campo
        </p>
        <h1 className="animate-oris-rise mt-3 max-w-3xl font-[family-name:var(--font-display)] text-5xl leading-[0.95] font-extrabold tracking-tight text-[#062421] sm:text-7xl md:text-8xl">
          ORIS
          <span className="mt-2 block text-2xl font-semibold tracking-normal text-[#2d4a46] sm:text-3xl md:text-4xl">
            para empresas
          </span>
        </h1>
        <div className="animate-oris-line mt-6 h-1 w-40 rounded-full bg-[#c9a227]" />
        <p className="animate-oris-rise-delay mt-6 max-w-xl text-base leading-relaxed text-[#3d5c57] sm:text-lg">
          Base de folios desde RESUMEN, asignación a IDC y coordinadores, y
          estadísticas claras — listo para crecer hacia presupuesto.
        </p>
        <div className="animate-oris-rise-delay mt-8 flex flex-wrap gap-3">
          <Link
            href="/folios"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#1f6f66] px-6 text-base font-medium text-white transition hover:bg-[#185a53]"
          >
            Abrir folios <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-[#1f6f66]/40 bg-white/70 px-6 text-base font-medium text-[#0f3d39] transition hover:bg-white"
          >
            Ver estadísticas
          </Link>
        </div>
      </div>
    </section>
  );
}
