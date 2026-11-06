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
      <div className="skin-burger-stack min-h-dvh pb-28">
        <header className="px-4 pt-8">
          <h1 className="text-5xl font-black leading-[0.8] tracking-tighter">
            <span className="block text-[var(--mt-primary)]">{m.name.split(" ")[0]}</span>
            <span className="-mt-1 block">{m.name.split(" ").slice(1).join(" ") || "STACK"}</span>
          </h1>
          <LangSelect className="mt-3" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="mt-4 flex gap-1 px-4" aria-label="Tabs">
          {m.categories.map((c) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={`flex-1 truncate rounded-t-xl px-2 py-2 text-[11px] font-black ${Number(c.id) === Number(m.activeCategory) ? "bg-[var(--mt-surface)]" : "bg-[var(--mt-secondary)]"}`}>
              {m.catName(c)}
            </button>
          ))}
        </nav>
        <div className="relative px-4 pt-2">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p, i) => (
            <article key={String(p.id)} className="relative mb-[-28px] overflow-hidden rounded-[1.8rem] bg-[var(--mt-surface)] shadow-lg" style={{ zIndex: 20 - i }}>
              <button type="button" className="flex w-full items-center gap-3 p-3 text-left" onClick={() => m.setDetail(p)}>
                <FallbackImg src={m.productImg(p)} alt="" className="h-20 w-20 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-black">{m.productName(p)}</p>
                  <PriceTag product={p} />
                </div>
              </button>
              <AddBtn m={m} product={p} compact className="mx-3 mb-3 rounded-full bg-[var(--mt-primary)] px-3 py-1.5 text-xs font-black text-[var(--mt-on-primary)] disabled:opacity-40" />
            </article>
          ))}
        </div>
        <div className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-3 overflow-hidden rounded-2xl bg-[var(--mt-surface)]">
          <button type="button" onClick={() => m.onOpenOrders?.()} className="py-3 text-xs font-bold">Sifariş</button>
          <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="min-h-11 bg-[var(--mt-primary)] py-3 text-xs font-black text-[var(--mt-on-primary)]">{m.tx("nav_cart", "Səbət")} {m.cartCount}</button>
          <button type="button" onClick={m.onCheckout} className="py-3 text-xs font-bold">Ödə</button>
        </div>
      </div>
      <CartOverlay m={m} placement="bottom" />
      <DetailSheet m={m} />
    </SkinChrome>
  );
}
