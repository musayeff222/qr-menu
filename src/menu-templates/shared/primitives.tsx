import React, { useEffect, useState } from "react";
import { Minus, Plus, Search, Trash2, X } from "lucide-react";
import { cn } from "../cn";
import type { CartLine } from "../guestSkinContract";
import {
  displayMinPrice,
  formatManat,
  variantsOf,
  type SkinModel,
} from "./useSkinModel";

export function LangSelect({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (l: string) => void;
  className?: string;
}) {
  return (
    <label className={cn("inline-flex items-center", className)}>
      <span className="sr-only">Dil</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-[color-mix(in_oklab,currentColor_20%,transparent)] bg-transparent px-2 py-1 text-xs font-bold outline-none"
        aria-label="Dil"
      >
        <option value="az">AZ</option>
        <option value="en">EN</option>
        <option value="ru">RU</option>
        <option value="tr">TR</option>
      </select>
    </label>
  );
}

export function PriceTag({
  product,
  from,
  className,
}: {
  product: Record<string, unknown>;
  from?: boolean;
  className?: string;
}) {
  const vars = variantsOf(product);
  const showFrom = from ?? vars.length > 0;
  return (
    <span className={cn("whitespace-nowrap tabular-nums font-semibold", className)}>
      {showFrom ? <span className="mr-0.5 hidden font-medium sm:inline">dən </span> : null}
      {formatManat(displayMinPrice(product))}
    </span>
  );
}

export function QtyStepper({
  qty,
  onMinus,
  onPlus,
  className,
}: {
  qty: number;
  onMinus: () => void;
  onPlus: () => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <button type="button" aria-label="Azalt" onClick={onMinus} className="grid h-11 w-11 place-items-center rounded-full bg-[var(--mt-secondary)]">
        <Minus size={14} />
      </button>
      <span className="min-w-6 text-center text-sm font-bold tabular-nums">{qty}</span>
      <button type="button" aria-label="Artır" onClick={onPlus} className="grid h-11 w-11 place-items-center rounded-full bg-[var(--mt-primary)] text-[var(--mt-on-primary)]">
        <Plus size={14} />
      </button>
    </div>
  );
}

function PlatePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative grid max-h-52 place-items-center overflow-hidden bg-[color-mix(in_oklab,var(--mt-secondary)_70%,var(--mt-surface))]",
        className
      )}
      aria-hidden
    >
      <svg viewBox="0 0 80 80" className="h-[62%] w-[62%] text-[var(--mt-muted)]" fill="none">
        <ellipse cx="40" cy="42" rx="26" ry="22" stroke="currentColor" strokeWidth="1.6" opacity="0.45" />
        <ellipse cx="40" cy="40" rx="18" ry="15" stroke="currentColor" strokeWidth="1.4" />
        <path d="M28 38c3 6 21 6 24 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="40" cy="36" r="2.2" fill="currentColor" opacity="0.55" />
      </svg>
    </div>
  );
}

export function FallbackImg({
  src,
  alt,
  className,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (!src || broken) return <PlatePlaceholder className={className} />;
  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        className,
        !loaded && "bg-[color-mix(in_oklab,var(--mt-secondary)_55%,var(--mt-surface))]"
      )}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => setBroken(true)}
    />
  );
}

export function AddBtn({
  m,
  product,
  className,
  compact,
}: {
  m: SkinModel;
  product: Record<string, unknown>;
  className?: string;
  compact?: boolean;
}) {
  const label = m.tx("add_to_cart", "Əlavə et");
  return (
    <button
      type="button"
      disabled={!m.canOrder}
      onClick={() => m.handleAdd(product)}
      aria-label={label}
      className={cn(
        "inline-flex min-h-11 min-w-11 touch-manipulation items-center justify-center font-bold disabled:opacity-40",
        className
      )}
    >
      {compact ? "+" : label}
    </button>
  );
}

export function ProductSearch({ m, className }: { m: SkinModel; className?: string }) {
  return (
    <label className={cn("relative block", className)}>
      <span className="sr-only">Axtar</span>
      <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mt-muted)]" />
      <input
        type="search"
        value={m.query}
        onChange={(e) => m.setQuery(e.target.value)}
        placeholder={m.tx("search", "Axtar…")}
        className="w-full rounded-xl border border-[var(--mt-muted)]/20 bg-[var(--mt-surface)] py-2.5 pl-9 pr-3 text-sm outline-none"
      />
    </label>
  );
}

export function EmptyMenu({ t }: { t: (k: string) => string }) {
  return (
    <p className="px-4 py-10 text-center text-sm text-[var(--mt-muted)]">{t("no_products") === "no_products" ? "Bu kateqoriyada məhsul yoxdur" : t("no_products")}</p>
  );
}

export function VariantSheet({ m }: { m: SkinModel }) {
  const prod = m.variantPick;
  if (!prod) return null;
  const vars = m.variantsOf(prod);
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-3 sm:items-center" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-[var(--mt-surface)] p-4 text-[var(--mt-text)] shadow-xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--mt-muted)]">{m.tx("menu_variant_subtitle", "Çeşid seçin")}</p>
            <h3 className="text-lg font-bold">{m.productName(prod)}</h3>
          </div>
          <button type="button" aria-label="Bağla" onClick={() => m.setVariantPick(null)}>
            <X size={20} />
          </button>
        </div>
        <div className="grid gap-2">
          {vars.map((v) => (
            <button
              key={String(v.id)}
              type="button"
              onClick={() => m.pickVariant(prod, v)}
              className="flex items-center justify-between rounded-xl border border-[var(--mt-muted)]/20 px-3 py-3 text-left"
            >
              <span className="font-semibold">{String(v.name)}</span>
              <span className="tabular-nums">{m.formatPrice(v.price)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function NoteSheet({ m }: { m: SkinModel }) {
  if (!m.noteLineId) return null;
  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center bg-black/50 p-3 sm:items-center" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-[var(--mt-surface)] p-4 text-[var(--mt-text)] shadow-xl">
        <h3 className="mb-2 text-lg font-bold">{m.tx("note", "Qeyd")}</h3>
        <textarea
          className="mb-3 h-28 w-full rounded-xl border border-[var(--mt-muted)]/25 bg-[var(--mt-bg)] p-3 text-sm outline-none"
          value={m.noteDraft}
          onChange={(e) => m.setNoteDraft(e.target.value)}
        />
        <div className="flex gap-2">
          <button type="button" className="flex-1 rounded-xl bg-[var(--mt-secondary)] py-2.5 text-sm font-semibold" onClick={() => m.setNoteLineId(null)}>
            {m.tx("cancel", "Ləğv")}
          </button>
          <button type="button" className="flex-1 rounded-xl bg-[var(--mt-primary)] py-2.5 text-sm font-semibold text-[var(--mt-on-primary)]" onClick={m.saveNote}>
            {m.tx("save", "Saxla")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DetailSheet({ m, children }: { m: SkinModel; children?: React.ReactNode }) {
  const prod = m.detail;
  if (!prod) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto bg-[var(--mt-surface)] text-[var(--mt-text)] shadow-2xl sm:rounded-3xl">
        <button type="button" className="absolute right-3 top-3 z-10 rounded-full bg-black/40 p-2 text-white" aria-label="Bağla" onClick={() => m.setDetail(null)}>
          <X size={18} />
        </button>
        {children}
        <div className="p-5">
          <h3 className="text-2xl font-bold">{m.productName(prod)}</h3>
          {m.productDesc(prod) ? <p className="mt-2 text-sm leading-relaxed text-[var(--mt-muted)]">{m.productDesc(prod)}</p> : null}
          <div className="mt-4 flex items-center justify-between gap-3">
            <PriceTag product={prod} className="text-lg" />
            <button
              type="button"
              disabled={!m.canOrder}
              onClick={() => {
                m.handleAdd(prod);
                m.setDetail(null);
              }}
              className="min-h-11 min-w-11 rounded-full bg-[var(--mt-primary)] px-5 py-2.5 text-sm font-bold text-[var(--mt-on-primary)] disabled:opacity-40"
            >
              {m.tx("add_to_cart", "Əlavə et")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CartLines({ m }: { m: SkinModel }) {
  if (!m.cart.length) {
    return <p className="px-4 py-8 text-center text-sm text-[var(--mt-muted)]">{m.tx("cart_empty", "Səbət boşdur")}</p>;
  }
  return (
    <ul className="space-y-3">
      {m.cart.map((line: CartLine) => (
        <li key={line.lineId} className="rounded-xl border border-[var(--mt-muted)]/15 bg-[var(--mt-bg)] p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold">{m.productName(line.product)}</p>
              {line.variantLabel ? <p className="text-xs text-[var(--mt-muted)]">{line.variantLabel}</p> : null}
              {line.note ? <p className="text-xs italic text-[var(--mt-muted)]">{line.note}</p> : null}
            </div>
            <p className="shrink-0 tabular-nums font-bold">{m.formatPrice(line.unitPrice * line.quantity)}</p>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <QtyStepper
              qty={line.quantity}
              onMinus={() => m.decreaseCartLineQty(line.lineId)}
              onPlus={() => m.increaseCartLineQty(line.lineId)}
            />
            <div className="flex gap-2">
              <button type="button" className="text-xs font-semibold underline" onClick={() => m.openNote(line.lineId, line.note)}>
                {m.tx("note", "Qeyd")}
              </button>
              <button type="button" aria-label="Sil" onClick={() => m.removeCartLine(line.lineId)} className="text-[var(--mt-danger)]">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CartCheckoutBar({ m }: { m: SkinModel }) {
  return (
    <div className="mt-4 space-y-2">
      {!m.ordersAllowed && m.ordersClosedHint ? (
        <p className="text-center text-xs text-[var(--mt-danger)]">{m.ordersClosedHint}</p>
      ) : null}
      <div className="flex items-center justify-between text-sm font-bold">
        <span>{m.tx("total", "Cəmi")}</span>
        <span className="tabular-nums">{m.formatPrice(m.cartTotal)}</span>
      </div>
      <button
        type="button"
        disabled={!m.canOrder || m.cart.length === 0}
        onClick={m.onCheckout}
        className="min-h-11 w-full rounded-2xl bg-[var(--mt-primary)] py-3 text-sm font-bold text-[var(--mt-on-primary)] disabled:opacity-40"
      >
        {m.tx("checkout_title", "Sifarişi tamamla")}
      </button>
      {m.onOpenOrders ? (
        <button type="button" onClick={m.onOpenOrders} className="w-full py-2 text-xs font-semibold text-[var(--mt-muted)]">
          {m.tx("my_orders", "Sifarişlərim")}
        </button>
      ) : null}
    </div>
  );
}

export function CartOverlay({
  m,
  placement = "bottom",
}: {
  m: SkinModel;
  placement?: "bottom" | "right" | "left" | "center";
}) {
  if (!m.cartOpen) return null;
  const pos =
    placement === "right"
      ? "items-stretch justify-end"
      : placement === "left"
        ? "items-stretch justify-start"
        : placement === "center"
          ? "items-center justify-center p-4"
          : "items-end justify-center";
  const panel =
    placement === "right" || placement === "left"
      ? "h-full w-[min(100%,380px)]"
      : placement === "center"
        ? "max-h-[88vh] w-full max-w-md rounded-3xl"
        : "max-h-[80vh] w-full rounded-t-3xl";
  return (
    <div className={cn("fixed inset-0 z-[75] flex bg-black/45", pos)} role="dialog" aria-modal="true">
      <div className={cn("flex flex-col overflow-hidden bg-[var(--mt-surface)] p-4 text-[var(--mt-text)] shadow-2xl", panel)}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold">{m.tx("cart", "Səbət")}</h3>
          <button type="button" aria-label="Bağla" onClick={m.closeCart}>
            <X size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <CartLines m={m} />
        </div>
        <CartCheckoutBar m={m} />
      </div>
    </div>
  );
}

export function ViewMenuLink({
  m,
  targetId = "menu-body",
  className,
}: {
  m: SkinModel;
  targetId?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--mt-primary)] px-5 text-sm font-bold text-[var(--mt-on-primary)]",
        className
      )}
      onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" })}
    >
      {m.tx("view_menu", "Menyuya bax")}
    </button>
  );
}

export function SkinChrome({ m, children }: { m: SkinModel; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (m.noteLineId) m.setNoteLineId(null);
      else if (m.variantPick) m.setVariantPick(null);
      else if (m.detail) m.setDetail(null);
      else if (m.cartOpen) m.closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [m]);
  return (
    <div
      className="min-h-dvh w-full min-w-0 max-w-[100vw] overflow-x-hidden text-[var(--mt-text)]"
      style={{ ...m.cssVars, background: "var(--mt-bg)", color: "var(--mt-text)" }}
      data-skin={m.meta.id}
    >
      {children}
      <VariantSheet m={m} />
      <NoteSheet m={m} />
    </div>
  );
}
