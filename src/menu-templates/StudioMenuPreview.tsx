import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, ShieldAlert } from "lucide-react";
import { getSkinMeta } from "./skinCatalog";
import { remapLegacyTemplateId } from "./legacyRemap";
import { fetchStudioPreviewTicket, studioPreviewPath } from "./studioPreview";
import { cn } from "./cn";

export function StudioMenuPreview({
  restaurantId,
  slug,
  templateId,
  restaurantName,
  onClose,
  t,
}: {
  restaurantId: number;
  slug: string;
  templateId: string;
  restaurantName: string;
  onClose: () => void;
  t: (key: string) => string;
}) {
  const skinId = remapLegacyTemplateId(templateId);
  const meta = getSkinMeta(skinId);
  const [ticket, setTicket] = useState<string | null>(null);
  const [ticketReady, setTicketReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setTicketReady(false);
    void fetchStudioPreviewTicket(restaurantId).then((tok) => {
      if (cancelled) return;
      setTicket(tok || "");
      setTicketReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [restaurantId, skinId]);

  const src = ticketReady ? studioPreviewPath(slug, skinId, { ticket }) : "";

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const tx = (key: string, fallback: string) => {
    const v = t(key);
    return !v || v === key ? fallback : v;
  };

  return (
    <div
      className="fixed inset-0 z-[400] flex h-[100dvh] max-h-[100dvh] w-full flex-col bg-slate-950"
      role="dialog"
      aria-modal="true"
      aria-labelledby="studio-preview-title"
      data-testid="studio-preview-overlay"
    >
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-white/10 bg-slate-900 px-3 py-2.5 pt-[max(0.65rem,env(safe-area-inset-top))] sm:px-4">
        <button
          type="button"
          data-testid="studio-preview-back"
          onClick={onClose}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-3 text-sm font-semibold text-slate-900"
        >
          <ArrowLeft size={16} />
          {tx("studio_preview_back", "Panele qayıt")}
        </button>
        <div className="min-w-0 flex-1">
          <h2 id="studio-preview-title" className="truncate text-sm font-bold text-white">
            {tx("studio_preview_title", "Önizləmə")} · {meta.name}
          </h2>
          <p className="truncate text-[11px] text-slate-400">{restaurantName}</p>
        </div>
        {src ? (
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-white/15 px-3 text-xs font-semibold text-white/90 hover:bg-white/10"
          >
            <ExternalLink size={14} />
            {tx("studio_preview_newtab", "Yeni tab")}
          </a>
        ) : null}
      </header>
      <div className="flex shrink-0 items-center gap-2 bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-100 sm:px-4">
        <ShieldAlert size={14} className="shrink-0" />
        {tx("studio_preview_banner", "Önizləmədir — real sifariş göndərilmir.")}
      </div>
      {src ? (
        <iframe
          data-testid="studio-preview-frame"
          title={`${meta.name} önizləmə`}
          src={src}
          className={cn("min-h-0 w-full flex-1 border-0 bg-white")}
        />
      ) : (
        <div className="grid flex-1 place-items-center text-sm text-slate-300" data-testid="studio-preview-loading">
          {tx("loading", "Yüklənir…")}
        </div>
      )}
    </div>
  );
}
