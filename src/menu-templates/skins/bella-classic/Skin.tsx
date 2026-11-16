import { ShoppingBag } from "lucide-react";
import type { GuestSkinProps } from "../../guestSkinContract";
import {
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

  return (
    <SkinChrome m={m}>
      <div className="skin-bella-classic mx-auto flex min-h-dvh max-w-5xl bg-[var(--mt-bg)] md:gap-0">
        <aside className="hidden w-52 shrink-0 border-r border-[var(--mt-muted)]/20 px-5 py-10 md:block">
          <p className="font-[ui-serif] text-lg italic">{m.name}</p>
          <nav className="mt-8 space-y-1" aria-label="Bölmələr">
            {m.categories.map((c) => {
              const id = Number(c.id);
              return (
                <a
                  key={id}
                  href={`#bella-cat-${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    m.setActiveCategory(id);
                    document.getElementById(`bella-cat-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`block py-1.5 font-[ui-serif] text-sm ${
                    id === Number(m.activeCategory) ? "italic text-[var(--mt-primary)]" : "text-[var(--mt-muted)]"
                  }`}
                >
                  {m.catName(c)}
                </a>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 px-5 pb-24 pt-8 sm:px-8">
          <header className="mb-8 text-center">
            {m.logo ? <img src={m.logo} alt="" className="mx-auto mb-3 h-12 w-12 rounded-full object-cover" /> : null}
            <h1 className="font-[ui-serif] text-4xl italic leading-tight sm:text-5xl">{m.name}</h1>
            {m.tagline ? (
              <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-[var(--mt-muted)]">{m.tagline}</p>
            ) : null}
            <div className="mt-4 flex justify-center">
              <LangSelect value={m.currentLang} onChange={m.setCurrentLang} />
            </div>
          </header>

          <nav className="mb-8 flex gap-3 overflow-x-auto pb-1 md:hidden" aria-label="Bölmələr">
            {m.categories.map((c) => {
              const id = Number(c.id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    m.setActiveCategory(id);
                    document.getElementById(`bella-cat-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`whitespace-nowrap font-[ui-serif] text-sm ${
                    id === Number(m.activeCategory) ? "italic text-[var(--mt-primary)]" : "text-[var(--mt-muted)]"
                  }`}
                >
                  {m.catName(c)}
                </button>
              );
            })}
          </nav>

          {m.grouped.every((g) => g.items.length === 0) ? <EmptyMenu t={m.t} /> : null}
          {m.grouped.map(({ cat, items }) => {
            if (!items.length) return null;
            const cid = Number(cat.id);
            return (
              <section key={cid} id={`bella-cat-${cid}`} className="mb-10 scroll-mt-6">
                <h2 className="mb-4 border-b border-[var(--mt-muted)]/25 pb-2 text-center font-[ui-serif] text-xl italic">
                  {m.catName(cat)}
                </h2>
                <ul className="space-y-4">
                  {items.map((p) => {
                    return (
                      <li key={String(p.id)}>
                        <article className="flex items-start gap-3">
                          <button type="button" onClick={() => m.setDetail(p)} className="shrink-0">
                            <FallbackImg src={m.productImg(p)} alt="" className="h-[4.5rem] w-[4.5rem] rounded-md object-cover" />
                          </button>
                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 items-baseline gap-2">
                              <button
                                type="button"
                                className="min-w-0 truncate text-left font-[ui-serif] text-lg"
                                onClick={() => m.setDetail(p)}
                              >
                                {m.productName(p)}
                              </button>
                              <span className="min-w-6 flex-1 border-b border-dotted border-[var(--mt-muted)]/70" />
                              <PriceTag product={p} className="shrink-0 font-[ui-serif]" />
                            </div>
                            {m.productDesc(p) ? (
                              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--mt-muted)]">
                                {m.productDesc(p)}
                              </p>
                            ) : null}
                            {p.is_featured ? (
                              <span className="mt-1 inline-block text-[10px] uppercase tracking-widest text-[var(--mt-primary)]">
                                {m.tx("discount", "Kampaniya")}
                              </span>
                            ) : null}
                            <AddBtn m={m} product={p} className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[var(--mt-primary)]" />
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={m.openCart}
        aria-label={m.tx("nav_cart", "Səbət")}
        className="fixed bottom-5 left-1/2 z-40 flex min-h-11 -translate-x-1/2 items-center gap-2 rounded-sm border border-[var(--mt-muted)]/30 bg-[var(--mt-surface)] px-6 font-[ui-serif] text-sm shadow-sm"
      >
        <ShoppingBag size={16} /> {m.tx("nav_cart", "Səbət")} · {m.cartCount}
      </button>
      <CartOverlay m={m} placement="center" />
      <DetailSheet m={m}>
        {m.detail ? <FallbackImg src={m.productImg(m.detail)} alt="" className="aspect-[16/10] w-full object-cover" /> : null}
      </DetailSheet>
    </SkinChrome>
  );
}
