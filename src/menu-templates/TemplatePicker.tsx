import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Eye, Check } from "lucide-react";
import type { MenuTemplateDef, TemplateCategory } from "./types";
import { MENU_TEMPLATES } from "./registry";
import { cn } from "./cn";
import { DEMO_MENU_PREVIEW_SLUG } from "../demoMenuSlug";

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
  /** API-dən gələn fərdi şablonlar */
  extraTemplates?: MenuTemplateDef[];
}

function normalizeCategory(c: string): TemplateCategory {
  if (CATEGORY_ORDER.includes(c as TemplateCategory)) return c as TemplateCategory;
  return "Modern";
}

export function TemplatePicker({
  restaurantSlug,
  selectedId,
  onSelect,
  extraTemplates = [],
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("All")}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
            filter === "All"
              ? "bg-red-600 text-white border-red-600"
              : "bg-white text-gray-700 border-gray-200"
          )}
        >
          Hamısı · {allTemplates.length}
        </button>
        {CATEGORY_ORDER.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
              filter === c
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-gray-700 border-gray-200"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {visible.map((tpl, idx) => (
          <motion.article
            layout
            key={tpl.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.02, 0.3) }}
            className={cn(
              "rounded-2xl border overflow-hidden bg-white shadow-sm flex flex-col",
              selectedId === tpl.id && "ring-2 ring-red-500 ring-offset-2"
            )}
          >
            <div className="relative h-36 w-full overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${tpl.heroImage})` }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, ${tpl.theme.background}f2 0%, transparent 55%), linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 40%)`,
                }}
              />
              <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/50 text-white backdrop-blur-sm">
                {tpl.category}
              </span>
              <div className="absolute bottom-2 left-2 right-2">
                <h3 className="text-white font-bold text-sm drop-shadow-md line-clamp-1">
                  {tpl.name}
                </h3>
                <p className="text-white/80 text-[11px] line-clamp-1">{tpl.description}</p>
              </div>
            </div>
            <div className="p-3 flex flex-col gap-2 flex-1">
              <p className="text-xs text-gray-500 font-mono">{tpl.id}</p>
              <div className="flex gap-2 mt-auto">
                <a
                  href={`/r/${DEMO_MENU_PREVIEW_SLUG}?preview=true&previewTemplate=${encodeURIComponent(tpl.id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border border-gray-200 text-gray-800 text-sm font-medium hover:bg-gray-50"
                >
                  <Eye size={16} />
                  Bax
                </a>
                <button
                  type="button"
                  onClick={() => onSelect(tpl)}
                  className={cn(
                    "flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-sm font-medium text-white",
                    selectedId === tpl.id ? "bg-green-600" : "bg-red-600"
                  )}
                >
                  <Check size={16} />
                  {selectedId === tpl.id ? "Seçildi" : "Seç"}
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

export { MENU_TEMPLATES };
