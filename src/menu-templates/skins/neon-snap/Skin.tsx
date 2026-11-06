import { ShoppingBag } from "lucide-react";
import type { GuestSkinProps } from "../../guestSkinContract";
import {
  ViewMenuLink,
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
      <div className="skin-neon-snap relative h-dvh overflow-y-auto scroll-smooth snap-y snap-mandatory">
        <header className="relative flex h-dvh snap-start items-end overflow-hidden">
          <FallbackImg priority src={m.cover} alt="" className="absolute inset-0 h-full min-h-[100dvh] w-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 p-6">
            <h1 className="text-5xl font-black uppercase italic text-[var(--mt-primary)] drop-shadow">{m.name}</h1>
            <LangSelect className="mt-4 text-white" value={m.currentLang} onChange={m.setCurrentLang} />
            <ViewMenuLink m={m} className="mt-5" />
          </div>
        </header>
        <nav className="pointer-events-none fixed right-3 top-1/3 z-30 flex flex-col gap-2" aria-label="Kateqoriyalar">
          {m.categories.map((c) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={`pointer-events-auto h-2.5 w-2.5 rounded-full ${Number(c.id) === Number(m.activeCategory) ? "bg-[var(--mt-primary)]" : "bg-white/40"}`} aria-label={m.catName(c)} />
          ))}
        </nav>
        <div id="menu-body" />
        {m.filtered.length === 0 ? <div className="snap-start"><EmptyMenu t={m.t} /></div> : null}
        {m.filtered.map((p) => (
          <section key={String(p.id)} className="relative flex h-dvh snap-start flex-col justify-end">
            <FallbackImg src={m.productImg(p)} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="relative z-10 bg-gradient-to-t from-black/80 p-5 text-white">
              <button type="button" className="w-full text-left text-3xl font-black" onClick={() => m.setDetail(p)}>
                {m.productName(p)}
              </button>
              <p className="mt-1 line-clamp-2 text-sm text-white/80">{m.productDesc(p)}</p>
              <div className="mt-4 flex items-center justify-between">
                <PriceTag product={p} className="text-xl text-[var(--mt-primary)]" />
                <AddBtn m={m} product={p} className="rounded-full bg-[var(--mt-primary)] px-5 py-2 font-black text-black disabled:opacity-40" />
              </div>
            </div>
          </section>
        ))}
        <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="fixed bottom-6 left-4 z-40 min-h-11 rounded-2xl bg-white/15 px-4 py-3 text-sm font-bold text-white backdrop-blur">
          {m.tx("nav_cart", "Səbət")} {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="bottom" />
      <DetailSheet m={m} />
    </SkinChrome>
  );
}
