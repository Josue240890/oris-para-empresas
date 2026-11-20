"use client";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  state: "loading" | "error" | "empty" | "ok" | "sample";
  message: string;
  className?: string;
};

export function StatusBanner({ state, message, className }: Props) {
  if (state === "ok") return null;

  const styles = {
    loading: "border-[#1f6f66]/30 bg-[#e7f4f1] text-[#0f3d39]",
    error: "border-red-300 bg-red-50 text-red-900",
    empty: "border-amber-200 bg-amber-50 text-amber-950",
    sample: "border-[#c9a227]/40 bg-[#fff8e6] text-[#5c4a10]",
    ok: "",
  }[state];

  const Icon =
    state === "loading"
      ? Loader2
      : state === "error"
        ? AlertCircle
        : CheckCircle2;

  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
        styles,
        className,
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          state === "loading" && "animate-spin",
        )}
      />
      <p>{message}</p>
    </div>
  );
}
