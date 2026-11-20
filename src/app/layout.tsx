import type { Metadata } from "next";
import { Manrope, Syne } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ORIS para empresas",
  description:
    "Asigna folios a IDC y coordinadores, sincroniza RESUMEN y consulta estadísticas.",
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      translate="no"
      className={`notranslate ${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="oris-atmosphere relative min-h-full flex flex-col font-[family-name:var(--font-body)] text-[#0b2f2c]">
        <div className="oris-grid pointer-events-none absolute inset-0" />
        <SiteHeader />
        <main className="relative z-10 flex-1">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
