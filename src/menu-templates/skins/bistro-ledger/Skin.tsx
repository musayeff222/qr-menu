import { ShoppingBag } from "lucide-react";
import type { GuestSkinProps } from "../../guestSkinContract";
import {
  AddBtn,
  CartCheckoutBar,
  CartLines,
  CartOverlay,
  DetailSheet,
  EmptyMenu,
  FallbackImg,
  LangSelect,
  PriceTag,
  SkinChrome,
} from "../../shared/primitives";
import { useSkinModel } from "../../shared/useSkinModel";

export default function Skin(props: GuestSkinProps) {
  const m = useSkinModel(props);

  return (
    <SkinChrome m={m}>
      <div className="skin-bistro-ledger mx-auto min-h-dvh max-w-xl bg-[var(--mt-bg)] px-4 py-6" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 27px, color-mix(in oklab, var(--mt-muted) 18%, transparent) 28px)" }}>
        <header className="mb-6 border-b border-dashed border-[var(--mt-muted)] pb-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em]">Ledger</p>
          <h1 className="mt-1 font-[ui-serif] text-3xl">{m.name}</h1>
          <LangSelect className="mt-3 justify-center" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="contents" aria-label="Kateqoriyalar">
        {m.grouped.map((g, gi) => (
          <section key={String(g.cat.id)} className="mb-6">
            <button type="button" onClick={() => m.setActiveCategory(Number(g.cat.id))} className="mb-2 w-full text-left font-mono text-xs font-bold uppercase tracking-[0.25em] text-[var(--mt-primary)]">
              {String(gi + 1).padStart(2, "0")} — {m.catName(g.cat)}
            </button>
            {g.items.map((p, pi) => (
              <div key={String(p.id)} className="flex min-w-0 items-baseline gap-2 py-1.5 font-mono text-sm">
                <span className="shrink-0 text-[var(--mt-muted)]">{String(pi + 1).padStart(2, "0")}</span>
                <div className="flex min-w-0 flex-1 items-baseline gap-2">
                  <button type="button" className="min-w-0 truncate text-left" onClick={() => m.setDetail(p)}>{m.productName(p)}</button>
                  <span className="min-w-4 flex-1 border-b border-dotted border-[var(--mt-muted)]" />
                </div>
                <PriceTag product={p} className="shrink-0 text-xs" />
                <AddBtn m={m} product={p} compact className="shrink-0 text-xs font-bold text-[var(--mt-primary)] disabled:opacity-40" />
              </div>
            ))}
          </section>
        ))}
        </nav>
        <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="fixed bottom-6 right-4 rounded-l-xl border border-dashed bg-[var(--mt-surface)] px-4 py-3 font-mono text-xs">
          {m.tx("nav_cart", "Səbət")} · {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="center" />
      <DetailSheet m={m} />
    </SkinChrome>
  );
}
