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
      <div className="skin-bistro-counter min-h-dvh pb-16">
        <header className="overflow-hidden bg-[var(--mt-primary)] py-2 text-[var(--mt-on-primary)]">
          <p className="animate-pulse whitespace-nowrap px-3 text-xs font-black uppercase tracking-[0.35em]">{m.name} · {m.tagline || "COUNTER"} · {m.name}</p>
        </header>
        <div className="flex items-center justify-between px-3 py-3">
          <h1 className="text-2xl font-black">{m.name}</h1>
          <LangSelect value={m.currentLang} onChange={m.setCurrentLang} />
        </div>
        <nav className="flex gap-2 overflow-x-auto px-3" aria-label="Kateqoriyalar">
          {m.categories.map((c, i) => {
            const id = Number(c.id);
            return (
              <button key={id} type="button" onClick={() => m.setActiveCategory(id)} className={`flex h-14 min-w-14 shrink-0 items-center justify-center rounded-full text-sm font-black ${id === Number(m.activeCategory) ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : "bg-[var(--mt-surface)]"}`}>
                {i + 1}
              </button>
            );
          })}
        </nav>
        <div className="mt-4 grid grid-cols-3 gap-2 px-3">
          {m.filtered.length === 0 ? <div className="col-span-3"><EmptyMenu t={m.t} /></div> : null}
          {m.filtered.map((p) => (
            <article key={String(p.id)} className="rounded-xl bg-[var(--mt-surface)] p-2">
              <button type="button" onClick={() => m.setDetail(p)} className="w-full text-left">
                <FallbackImg src={m.productImg(p)} alt="" className="aspect-square w-full rounded-lg object-cover" />
                <p className="mt-1 line-clamp-2 text-[11px] font-bold leading-tight">{m.productName(p)}</p>
                <PriceTag product={p} className="mt-0.5 block text-[11px]" />
              </button>
              <AddBtn m={m} product={p} compact className="mt-1 w-full rounded-lg bg-[var(--mt-primary)] py-2 text-lg font-black text-[var(--mt-on-primary)] disabled:opacity-40" />
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full bg-[var(--mt-surface)] px-5 py-2 text-xs font-black shadow">
          SƏBƏT {m.cartCount} · {m.formatPrice(m.cartTotal)}
        </button>
      </div>
      <CartOverlay m={m} placement="bottom" />
      <DetailSheet m={m} />
    </SkinChrome>
  );
}
