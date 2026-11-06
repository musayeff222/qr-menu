import React, { useEffect, useMemo, useState } from "react";
import {
  ensureAaTokens,
  tokenContrastReport,
  THEME_PRESETS,
  TOKEN_KEYS,
  type SkinColorTokens,
} from "./tokens";
import { getSkinMeta } from "../skinCatalog";

const LABELS: Record<keyof SkinColorTokens, string> = {
  primary: "Əsas",
  secondary: "İkinci",
  accent: "Vurğu",
  background: "Fon",
  surface: "Səth",
  text: "Mətn",
  muted: "Solğun",
};

export function ThemeEditor({
  templateId,
  saved,
  onDraft,
  onSave,
  onReset,
  busy,
}: {
  templateId: string;
  saved?: SkinColorTokens | null;
  onDraft: (colors: SkinColorTokens) => void;
  onSave: (colors: SkinColorTokens) => void;
  onReset: () => void;
  busy?: boolean;
}) {
  const defaults = getSkinMeta(templateId).defaults;
  const [colors, setColors] = useState<SkinColorTokens>(saved || defaults);

  useEffect(() => {
    setColors(saved || defaults);
    // saved identity is memoized by parent from persisted JSON
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, saved]);

  useEffect(() => {
    onDraft(colors);
  }, [colors, onDraft]);

  const report = useMemo(() => tokenContrastReport(colors), [colors]);
  const warn = report.filter((r) => !r.pass);

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rəng palitrası</p>
      <div className="flex flex-wrap gap-2">
        {THEME_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setColors(ensureAaTokens(p.tokens))}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:border-[var(--mg-brand)]"
          >
            {p.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {TOKEN_KEYS.map((k) => (
          <label key={k} className="block text-xs font-semibold text-slate-600">
            {LABELS[k]}
            <span className="mt-1 flex items-center gap-2">
              <input
                type="color"
                value={colors[k]}
                onChange={(e) => setColors({ ...colors, [k]: e.target.value })}
                className="h-10 w-12 cursor-pointer rounded-lg border border-slate-200 p-1"
              />
              <code className="text-[11px]">{colors[k]}</code>
            </span>
          </label>
        ))}
      </div>
      {warn.length ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          WCAG AA: {warn.map((w) => `${w.pair} ${w.ratio.toFixed(1)}:1`).join(" · ")} — saxlayanda avtomatik düzəldilir.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => onSave(ensureAaTokens(colors))}
          className="rounded-xl bg-[var(--mg-brand)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          Rəngləri saxla
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setColors(defaults);
            onReset();
          }}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold"
        >
          Başlanğıc rənglərinə dön
        </button>
      </div>
    </div>
  );
}
