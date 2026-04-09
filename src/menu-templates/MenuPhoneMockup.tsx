import React from "react";
import { Radio, Smartphone } from "lucide-react";
import { cn } from "./cn";

export function MenuPhoneMockup({
  iframeSrc,
  reloadKey,
  className,
}: {
  iframeSrc: string;
  reloadKey: number;
  className?: string;
}) {
  return (
    <div className={cn("relative flex flex-col", className)}>
      <div
        className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-red-50/40 px-5 py-4 dark:border-slate-700 dark:from-slate-800/80 dark:via-slate-900 dark:to-red-950/20"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
              <Smartphone className="h-4 w-4" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Canlı önizləmə</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">Real menyunuz, mobil görünüş</p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            <Radio className="h-3 w-3 animate-pulse" />
            Canlı
          </span>
        </div>
      </div>

      <div className="relative flex justify-center bg-gradient-to-b from-slate-100/90 via-slate-50 to-white px-4 pb-6 pt-8 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <div
          className="pointer-events-none absolute left-1/2 top-12 h-48 w-48 -translate-x-1/2 rounded-full bg-red-400/15 blur-3xl dark:bg-red-500/20"
          aria-hidden
        />
        <div className="relative w-[min(100%,292px)] shrink-0">
          <div
            className="absolute left-1/2 top-0 z-20 h-[22px] w-[88px] -translate-x-1/2 rounded-b-[14px] bg-slate-950 shadow-inner dark:bg-black"
            aria-hidden
          />
          <div className="rounded-[2.85rem] border-[11px] border-slate-950 bg-slate-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)] dark:border-black">
            <div className="overflow-hidden rounded-[2.05rem] bg-black ring-1 ring-white/[0.12]">
              {iframeSrc ? (
                <iframe
                  key={`${iframeSrc}-${reloadKey}`}
                  title="Menyu önizləməsi"
                  src={iframeSrc}
                  className="block aspect-[9/19.5] min-h-[min(52vh,380px)] w-full bg-white sm:min-h-[500px] lg:min-h-[548px]"
                />
              ) : (
                <div className="flex aspect-[9/19.5] min-h-[min(52vh,380px)] w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-slate-100 to-slate-200 px-6 text-center sm:min-h-[500px] lg:min-h-[548px] dark:from-slate-800 dark:to-slate-900">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-slate-300/80 dark:bg-slate-600" />
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Menyu yüklənir…</p>
                </div>
              )}
            </div>
          </div>
          <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Dizaynı dəyişdikdən sonra <span className="font-semibold text-slate-700 dark:text-slate-300">Saxla</span> düyməsini
            basın.
          </p>
        </div>
      </div>
    </div>
  );
}
