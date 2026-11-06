import { ShoppingBag } from "lucide-react";
import type { GuestSkinProps } from "../../guestSkinContract";
import {
  AddBtn,
  CartOverlay,
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
      <div className="skin-bistro-rail mx-auto flex min-h-dvh max-w-5xl flex-col md:flex-row">
        <aside className="sticky top-0 z-20 flex shrink-0 items-center gap-2 overflow-x-auto border-b border-[var(--mt-muted)]/15 bg-[var(--mt-surface)] px-3 py-3 md:h-dvh md:w-48 md:flex-col md:items-stretch md:overflow-y-auto md:border-b-0 md:border-r">
          <p className="hidden font-[ui-serif] text-lg tracking-wide md:block">{m.name}</p>
          <nav className="flex gap-1 md:flex-col" aria-label="Kateqoriyalar">
            {m.categories.map((c) => {
              const id = Number(c.id);
              const on = id === Number(m.activeCategory);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => m.setActiveCategory(id)}
                  className={`whitespace-nowrap rounded-none border-b-2 px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.18em] md:border-b-0 md:border-l-2 ${
                    on ? "border-[var(--mt-primary)] text-[var(--mt-primary)]" : "border-transparent text-[var(--mt-muted)]"
                  }`}
                >
                  {m.catName(c)}
                </button>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[var(--mt-muted)]/10 bg-[var(--mt-bg)]/95 px-4 py-3 backdrop-blur">
            <div>
              <p className="font-[ui-serif] text-xl">{m.name}</p>
              {m.tagline ? <p className="text-xs text-[var(--mt-muted)]">{m.tagline}</p> : null}
            </div>
            <div className="flex items-center gap-2">
              <LangSelect value={m.currentLang} onChange={m.setCurrentLang} />
              {m.phone ? (
                <a href={`tel:${m.phone.replace(/\s/g, "")}`} className="hidden text-xs underline sm:inline">
                  {m.phone}
                </a>
              ) : null}
            </div>
          </header>
          <ul className="divide-y divide-[var(--mt-muted)]/10">
            {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
            {m.filtered.map((p) => {
              const open = Number(m.detail?.id) === Number(p.id);
              return (
                <li key={String(p.id)} className="px-4 py-4">
                  <button type="button" className="flex w-full items-center gap-3 text-left" onClick={() => m.setDetail(open ? null : p)}>
                    <FallbackImg src={m.productImg(p)} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 truncate font-semibold">{m.productName(p)}</p>
                        <PriceTag product={p} className="shrink-0 text-sm" />
                      </div>
                      <p className="truncate text-xs text-[var(--mt-muted)]">{m.productDesc(p)}</p>
                    </div>
                  </button>
                  <AddBtn m={m} product={p} className="mt-2 rounded-full bg-[var(--mt-primary)] px-4 text-xs text-[var(--mt-on-primary)]" />
                  {open ? (
                    <div className="mt-3 rounded-xl bg-[var(--mt-surface)] p-3">
                      <p className="text-sm text-[var(--mt-muted)]">{m.productDesc(p) || m.productName(p)}</p>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <button
        type="button"
        onClick={m.openCart}
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[var(--mt-primary)] text-[var(--mt-on-primary)] shadow-lg"
        aria-label={m.tx("nav_cart", "Səbət")}
      >
        <ShoppingBag size={22} />
        {m.cartCount > 0 ? (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--mt-accent)] px-1 text-[10px] font-bold">
            {m.cartCount}
          </span>
        ) : null}
      </button>
      <CartOverlay m={m} placement="center" />
    </SkinChrome>
  );
}
