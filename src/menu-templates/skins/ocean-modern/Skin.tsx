import { Info, ShoppingBag } from "lucide-react";
import type { GuestSkinProps } from "../../guestSkinContract";
import {
  AddBtn,
  CartOverlay,
  DetailSheet,
  EmptyMenu,
  FallbackImg,
  LangSelect,
  PriceTag,
  ProductSearch,
  SkinChrome,
} from "../../shared/primitives";
import { useSkinModel } from "../../shared/useSkinModel";

export default function Skin(props: GuestSkinProps) {
  const m = useSkinModel(props);
  const jumpTo = (id: number) => {
    m.setActiveCategory(id);
    document.getElementById(`ocean-cat-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <SkinChrome m={m}>
      <div className="skin-ocean-modern min-h-dvh bg-[var(--mt-bg)] pb-24">
        <header className="relative isolate min-h-[38vh] overflow-hidden sm:min-h-[46vh]">
          <FallbackImg src={m.cover} alt="" className="absolute inset-0 h-full w-full object-cover" priority />
          <div className="absolute inset-0 bg-[color-mix(in_oklab,var(--mt-primary)_38%,transparent)]" />
          <div className="absolute right-3 top-3 z-10">
            <LangSelect className="rounded-full bg-white/85 px-1 text-[var(--mt-text)]" value={m.currentLang} onChange={m.setCurrentLang} />
          </div>
          <div className="relative flex min-h-[38vh] flex-col items-center justify-center px-6 py-16 text-center text-white sm:min-h-[46vh]">
            {m.logo ? <img src={m.logo} alt="" className="mb-3 h-14 w-14 rounded-full object-cover ring-2 ring-white/70" /> : null}
            <h1 className="font-[ui-serif] text-4xl font-light tracking-wide sm:text-5xl">{m.name}</h1>
            {m.tagline ? <p className="mt-2 text-[11px] uppercase tracking-[0.28em] text-white/90">{m.tagline}</p> : null}
            {(m.phone || m.mapsUrl) && (
              <a
                href={m.mapsUrl || `tel:${m.phone.replace(/\s/g, "")}`}
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/50 bg-white/15 px-4 text-sm backdrop-blur"
              >
                <Info size={14} /> {m.tx("info", "Məlumat")}
              </a>
            )}
          </div>
        </header>

        <div className="sticky top-0 z-20 border-b border-[var(--mt-muted)]/15 bg-[var(--mt-bg)]/95 px-4 py-3 backdrop-blur">
          <ProductSearch m={m} />
          <label className="mt-2 block">
            <span className="sr-only">{m.tx("categories", "Kateqoriyalar")}</span>
            <select
              className="w-full rounded-full bg-[var(--mt-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--mt-on-primary)] outline-none"
              value={String(m.activeCategory ?? "")}
              onChange={(e) => jumpTo(Number(e.target.value))}
              aria-label={m.tx("categories", "Kateqoriyalar")}
            >
              {m.categories.map((c) => (
                <option key={String(c.id)} value={String(c.id)}>
                  {m.catName(c)}
                </option>
              ))}
            </select>
          </label>
          <nav className="mt-2 flex gap-2 overflow-x-auto" aria-label="Kateqoriyalar">
            {m.categories.map((c) => {
              const id = Number(c.id);
              const on = id === Number(m.activeCategory);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => jumpTo(id)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                    on ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : "bg-[var(--mt-surface)]"
                  }`}
                >
                  {m.catName(c)}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-6">
          {m.grouped.every((g) => g.items.length === 0) ? <EmptyMenu t={m.t} /> : null}
          {m.grouped.map(({ cat, items }) => {
            if (!items.length) return null;
            const cid = Number(cat.id);
            return (
              <section key={cid} id={`ocean-cat-${cid}`} className="mb-10 scroll-mt-28">
                <h2 className="mb-4 font-[ui-serif] text-2xl font-light">{m.catName(cat)}</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {items.map((p) => (
                    <article key={String(p.id)} className="overflow-hidden rounded-2xl bg-[var(--mt-surface)] shadow-sm">
                      <button type="button" className="block w-full text-left" onClick={() => m.setDetail(p)}>
                        <div className="relative">
                          <FallbackImg src={m.productImg(p)} alt="" className="aspect-[16/10] w-full object-cover" />
                          {p.is_featured ? (
                            <span className="absolute left-2 top-2 rounded-full bg-[var(--mt-primary)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--mt-on-primary)]">
                              {m.tx("discount", "Kampaniya")}
                            </span>
                          ) : null}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold">{m.productName(p)}</h3>
                          <PriceTag product={p} className="mt-1 block text-sm text-[var(--mt-primary)]" />
                          {m.productDesc(p) ? (
                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--mt-muted)]">{m.productDesc(p)}</p>
                          ) : null}
                        </div>
                      </button>
                      <div className="px-4 pb-4">
                        <AddBtn
                          m={m}
                          product={p}
                          className="w-full rounded-xl bg-[var(--mt-primary)] py-2 text-sm text-[var(--mt-on-primary)]"
                        />
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <button
          type="button"
          onClick={m.openCart}
          aria-label={m.tx("nav_cart", "Səbət")}
          className="fixed bottom-5 right-5 z-40 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--mt-primary)] px-4 text-sm font-bold text-[var(--mt-on-primary)] shadow-lg"
        >
          <ShoppingBag size={16} />
          {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="right" />
      <DetailSheet m={m}>
        {m.detail ? <FallbackImg src={m.productImg(m.detail)} alt="" className="aspect-[16/10] w-full object-cover" /> : null}
      </DetailSheet>
    </SkinChrome>
  );
}
