import { ShoppingBag } from "lucide-react";
import type { GuestSkinProps } from "../../guestSkinContract";
import {
  ViewMenuLink,
  AddBtn,
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
  const initials = m.name.slice(0, 2).toUpperCase();
  return (
    <SkinChrome m={m}>
      <div className="skin-atelier-cover min-h-dvh bg-[var(--mt-bg)]">
        <header className="relative isolate min-h-[100dvh] overflow-hidden">
          <FallbackImg priority src={m.cover} alt="" className="absolute inset-0 h-full min-h-[100dvh] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--mt-bg)] via-black/45 to-black/20" />
          <div className="relative z-10 flex min-h-[100dvh] flex-col justify-end px-6 pb-16 pt-8">
            <p className="font-[ui-serif] text-[11px] uppercase tracking-[0.55em] text-white/70">{m.meta.family}</p>
            <h1 className="mt-4 max-w-xl font-[ui-serif] text-5xl font-light leading-[0.95] text-white sm:text-7xl">{m.name}</h1>
            {m.tagline ? <p className="mt-4 max-w-md text-sm text-white/80">{m.tagline}</p> : null}
            <LangSelect value={m.currentLang} onChange={m.setCurrentLang} className="mt-6 text-white" />
            <ViewMenuLink m={m} className="mt-6 self-start" />
          </div>
          <button
            type="button"
            onClick={m.openCart}
            className="absolute right-5 top-5 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-black/30 text-white backdrop-blur"
            aria-label={m.tx("nav_cart", "Səbət")}
          >
            <span className="absolute -bottom-1 font-[ui-serif] text-[10px] tracking-widest">{initials}</span>
            <ShoppingBag size={18} />
            {m.cartCount > 0 ? <span className="absolute -right-1 -top-1 text-[10px]">{m.cartCount}</span> : null}
          </button>
        </header>
        <nav id="menu-body" className="sticky top-0 z-30 flex gap-4 overflow-x-auto border-b border-white/10 bg-[var(--mt-bg)]/90 px-4 py-3 backdrop-blur" aria-label="Fəsillər">
          {m.categories.map((c) => {
            const id = Number(c.id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => m.setActiveCategory(id)}
                className={`whitespace-nowrap font-[ui-serif] text-sm tracking-wide ${
                  id === Number(m.activeCategory) ? "text-[var(--mt-primary)]" : "text-[var(--mt-muted)]"
                }`}
              >
                {m.catName(c)}
              </button>
            );
          })}
        </nav>
        <div className="mx-auto max-w-3xl px-4 py-10">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p, i) => (
            <article key={String(p.id)} className="mb-16">
              <button type="button" className="w-full text-left" onClick={() => m.setDetail(p)}>
                <FallbackImg
                  src={m.productImg(p)}
                  alt={m.productName(p)}
                  className={`w-full object-cover ${i % 2 === 0 ? "aspect-[4/5]" : "aspect-[16/10]"}`}
                />
              </button>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <button type="button" className="text-left font-[ui-serif] text-3xl font-light" onClick={() => m.setDetail(p)}>
                    {m.productName(p)}
                  </button>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--mt-muted)]">{m.productDesc(p)}</p>
                </div>
                <PriceTag product={p} className="font-[ui-serif] text-xl" />
              </div>
              <AddBtn m={m} product={p} className="mt-4 border-b border-[var(--mt-primary)] text-xs uppercase tracking-[0.2em]" />
            </article>
          ))}
        </div>
      </div>
      <CartOverlay m={m} placement="right" />
      <DetailSheet m={m} />
    </SkinChrome>
  );
}
