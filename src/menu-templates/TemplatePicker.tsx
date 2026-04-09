import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Eye, Check, Sparkles, MonitorSmartphone } from "lucide-react";
import type { MenuTemplateDef, TemplateCategory } from "./types";
import { MENU_TEMPLATES } from "./registry";
import { cn } from "./cn";

const CATEGORY_ORDER: TemplateCategory[] = [
  "Modern",
  "Luxury",
  "Minimal",
  "Mega",
  "Fast Food",
  "Cafe",
];

export interface TemplatePickerProps {
  restaurantSlug: string;
  selectedId: string;
  onSelect: (def: MenuTemplateDef) => void;
  /** Şablon kartının üzərinə gələndə önizləmə üçün (save olmadan) */
  onPreviewTemplate?: (templateId: string | null) => void;
  /** API-dən gələn fərdi şablonlar */
  extraTemplates?: MenuTemplateDef[];
  /**
   * studio — yalnız “Önizləmə pin” + “Seç”; sağda telefon yoxdur.
   * default — köhnə davranış (hover + tam ekran).
   */
  mode?: "default" | "studio";
  /** studio: önizləməyə sabitlənmiş şablon id */
  pinnedPreviewId?: string | null;
  onPinPreview?: (templateId: string) => void;
}

function normalizeCategory(c: string): TemplateCategory {
  if (CATEGORY_ORDER.includes(c as TemplateCategory)) return c as TemplateCategory;
  return "Modern";
}

export function TemplatePicker({
  restaurantSlug,
  selectedId,
  onSelect,
  onPreviewTemplate,
  extraTemplates = [],
  mode = "default",
  pinnedPreviewId = null,
  onPinPreview,
}: TemplatePickerProps) {
  const [filter, setFilter] = useState<TemplateCategory | "All">("All");
  const allTemplates = useMemo(
    () => [...MENU_TEMPLATES, ...extraTemplates],
    [extraTemplates]
  );
  const grouped = useMemo(() => {
    const g: Record<TemplateCategory, MenuTemplateDef[]> = {
      Modern: [],
      Luxury: [],
      Minimal: [],
      Mega: [],
      "Fast Food": [],
      Cafe: [],
    };
    for (const t of allTemplates) {
      g[normalizeCategory(t.category)].push(t);
    }
    return g;
  }, [allTemplates]);

  const visible =
    filter === "All"
      ? allTemplates
      : grouped[filter as TemplateCategory];

  const pill = (active: boolean) =>
    cn(
      "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
      active
        ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/25"
        : "border border-slate-200 bg-white text-slate-700 hover:border-red-200 hover:bg-red-50/80 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-red-500/40 dark:hover:bg-red-950/30"
    );

  return (
    <div className="space-y-5">
      <div className="relative -mx-1">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide sm:flex-wrap sm:overflow-visible">
          <button type="button" onClick={() => setFilter("All")} className={pill(filter === "All")}>
            Hamısı
            <span
              className={cn(
                "ml-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
                filter === "All"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
              )}
            >
              {allTemplates.length}
            </span>
          </button>
          {CATEGORY_ORDER.map((c) => (
            <button key={c} type="button" onClick={() => setFilter(c)} className={pill(filter === c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {mode === "studio" ? (
        <p className="flex items-start gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs leading-relaxed text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
          <MonitorSmartphone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
          Əvvəlcə şablon seçin, <strong className="font-semibold text-slate-800 dark:text-slate-200">Önizləmə</strong> ilə baxın, sonra{" "}
          <strong className="font-semibold text-slate-800 dark:text-slate-200">Redaktə et</strong>
          ilə menyunu fərdiləşdirin — telefon önizləməsi orada açılır.
        </p>
      ) : (
        <p className="flex items-start gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs leading-relaxed text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
          Kartın üstünə gətirin — sağdakı telefonda şablon dəyişir. Seç düyməsi aktiv şablonu saxlayır.
        </p>
      )}

      <div
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3"
        onMouseLeave={() => (mode === "default" ? onPreviewTemplate?.(null) : undefined)}
      >
        {visible.map((tpl, idx) => (
          <motion.article
            layout
            key={tpl.id}
            title={tpl.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.02, 0.3) }}
            onMouseEnter={() => (mode === "default" ? onPreviewTemplate?.(tpl.id) : undefined)}
            className={cn(
              "group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 dark:border-slate-700 dark:bg-slate-900",
              "hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-black/40",
              selectedId === tpl.id &&
                "ring-2 ring-red-500 ring-offset-2 dark:ring-offset-slate-950",
              mode === "studio" && pinnedPreviewId === tpl.id && "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950"
            )}
          >
            <div className="relative h-40 w-full overflow-hidden sm:h-44">
              <div
                className="absolute inset-0 scale-100 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${tpl.heroImage})` }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, ${tpl.theme.background}f2 0%, transparent 52%), linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 42%)`,
                }}
              />
              <span className="absolute left-3 top-3 rounded-lg bg-black/45 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                {tpl.category}
              </span>
              {selectedId === tpl.id ? (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg">
                  <Check className="h-3 w-3" />
                  Aktiv
                </span>
              ) : null}
              <div className="absolute bottom-0 left-0 right-0 p-3 pt-10">
                <h3 className="line-clamp-1 text-base font-bold tracking-tight text-white drop-shadow-md">
                  {tpl.name}
                </h3>
                <p className="line-clamp-1 text-[13px] text-white/85">{tpl.description}</p>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-3.5">
              <div className="flex gap-2">
                {mode === "studio" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onPinPreview?.(tpl.id)}
                      className={cn(
                        "inline-flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-colors",
                        pinnedPreviewId === tpl.id
                          ? "border-indigo-300 bg-indigo-50 text-indigo-800 dark:border-indigo-500/50 dark:bg-indigo-500/15 dark:text-indigo-200"
                          : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-white hover:text-red-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                      )}
                    >
                      <Eye size={16} strokeWidth={2.25} />
                      Önizləmə
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelect(tpl)}
                      className={cn(
                        "inline-flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-all",
                        selectedId === tpl.id
                          ? "bg-emerald-600 shadow-md shadow-emerald-600/30 hover:bg-emerald-500"
                          : "bg-gradient-to-r from-red-600 to-rose-600 shadow-md shadow-red-500/25 hover:from-red-500 hover:to-rose-500"
                      )}
                    >
                      <Check size={16} strokeWidth={2.25} />
                      {selectedId === tpl.id ? "Seçildi" : "Seç"}
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      href={`/r/${encodeURIComponent(restaurantSlug)}?preview=true&previewTemplate=${encodeURIComponent(tpl.id)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-colors",
                        "border-slate-200 bg-slate-50 text-slate-800 hover:bg-white hover:text-red-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                      )}
                    >
                      <Eye size={16} strokeWidth={2.25} />
                      Tam ekran
                    </a>
                    <button
                      type="button"
                      onClick={() => onSelect(tpl)}
                      className={cn(
                        "inline-flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-all",
                        selectedId === tpl.id
                          ? "bg-emerald-600 shadow-md shadow-emerald-600/30 hover:bg-emerald-500"
                          : "bg-gradient-to-r from-red-600 to-rose-600 shadow-md shadow-red-500/25 hover:from-red-500 hover:to-rose-500"
                      )}
                    >
                      <Check size={16} strokeWidth={2.25} />
                      {selectedId === tpl.id ? "Seçildi" : "Seç"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

export { MENU_TEMPLATES };
