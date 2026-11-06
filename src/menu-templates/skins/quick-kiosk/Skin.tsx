import type { GuestSkinProps } from "../../guestSkinContract";
import {
  AddBtn,
  CartCheckoutBar,
  CartLines,
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
  return (
    <SkinChrome m={m}>
      <div className="skin-quick-kiosk flex min-h-dvh flex-col bg-[var(--mt-bg)] pb-28">
        <header className="px-4 pb-4 pt-6">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-3xl font-black uppercase leading-none tracking-tight sm:text-5xl">{m.name}</h1>
            <LangSelect value={m.currentLang} onChange={m.setCurrentLang} />
          </div>
          {m.tagline ? <p className="mt-2 text-sm font-semibold text-[var(--mt-muted)]">{m.tagline}</p> : null}
          <ProductSearch m={m} className="mt-3" />
        </header>
        <nav className="grid min-w-0 grid-cols-2 gap-3 px-4" aria-label="Kateqoriyalar">
          {m.categories.map((c) => {
            const id = Number(c.id);
            const on = id === Number(m.activeCategory);
            return (
              <button
                key={id}
                type="button"
                onClick={() => m.setActiveCategory(id)}
                className={`min-h-16 min-w-0 overflow-hidden break-words rounded-3xl px-2.5 py-3 text-left text-[13px] font-black uppercase leading-tight sm:min-h-20 sm:px-3 sm:text-lg ${
                  on ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : "bg-[var(--mt-surface)]"
                }`}
              >
                {m.catName(c)}
              </button>
            );
          })}
        </nav>
        <div className="mt-5 grid min-w-0 grid-cols-2 gap-3 px-4">
          {m.filtered.length === 0 ? (
            <div className="col-span-2">
              <EmptyMenu t={m.t} />
            </div>
          ) : null}
          {m.filtered.map((p) => (
            <article key={String(p.id)} className="flex flex-col overflow-hidden rounded-3xl bg-[var(--mt-surface)]">
              <button type="button" onClick={() => m.setDetail(p)} className="text-left">
                <FallbackImg src={m.productImg(p)} alt={m.productName(p)} className="aspect-square w-full object-cover" />
                <div className="p-3">
                  <p className="line-clamp-2 min-h-10 text-sm font-extrabold leading-tight">{m.productName(p)}</p>
                  <PriceTag product={p} className="mt-1 block text-base" />
                </div>
              </button>
              <AddBtn m={m} product={p} compact className="mx-3 mb-3 rounded-2xl bg-[var(--mt-primary)] py-3 text-base text-[var(--mt-on-primary)]" />
            </article>
          ))}
        </div>
        {m.detail ? (
          <div className="fixed inset-0 z-[70] flex items-end bg-black/50">
            <div className="w-full rounded-t-[2rem] bg-[var(--mt-surface)] p-5">
              <p className="text-2xl font-black">{m.productName(m.detail)}</p>
              <p className="mt-2 text-sm text-[var(--mt-muted)]">{m.productDesc(m.detail)}</p>
              <PriceTag product={m.detail} className="mt-3 block text-xl" />
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button type="button" className="rounded-2xl bg-[var(--mt-secondary)] py-3 font-bold" onClick={() => m.setDetail(null)}>
                  Bağla
                </button>
                <button
                  type="button"
                  disabled={!m.canOrder}
                  className="rounded-2xl bg-[var(--mt-primary)] py-3 font-black text-[var(--mt-on-primary)] disabled:opacity-40"
                  onClick={() => {
                    m.handleAdd(m.detail!);
                    m.setDetail(null);
                  }}
                >
                  {m.tx("add_to_cart", "Əlavə et")}
                </button>
              </div>
            </div>
          </div>
        ) : null}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-[var(--mt-surface)] px-4 py-3">
          {m.cartOpen ? (
            <div className="mb-3 max-h-[40vh] overflow-y-auto">
              <CartLines m={m} />
              <CartCheckoutBar m={m} />
            </div>
          ) : null}
          <button
            type="button"
            onClick={m.cartOpen ? m.closeCart : m.openCart}
            aria-label={m.tx("nav_cart", "Səbət")}
            className="flex min-h-11 w-full items-center justify-between rounded-2xl bg-[var(--mt-primary)] px-4 py-4 text-[var(--mt-on-primary)]"
          >
            <span className="text-lg font-black">{m.tx("nav_cart", "Səbət")} · {m.cartCount}</span>
            <span className="text-lg font-black tabular-nums">{m.formatPrice(m.cartTotal)}</span>
          </button>
        </div>
      </div>
    </SkinChrome>
  );
}
