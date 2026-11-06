import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("src/menu-templates/skins");

const HEAD = `import { ShoppingBag } from "lucide-react";
import type { GuestSkinProps } from "../../guestSkinContract";
import {
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
`;

function file(id, inner) {
  const dir = path.join(ROOT, id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "Skin.tsx"),
    `${HEAD}${inner}\n}\n`
  );
}

const remaining = {
  "bistro-split": `
  return (
    <SkinChrome m={m}>
      <div className="skin-bistro-split min-h-dvh">
        <header className="grid min-h-[52vh] md:grid-cols-2">
          <FallbackImg src={m.cover} alt="" className="h-full min-h-[240px] w-full object-cover" />
          <div className="flex flex-col justify-center bg-[var(--mt-secondary)] px-6 py-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em]">{m.meta.family}</p>
            <h1 className="mt-2 font-[ui-serif] text-4xl">{m.name}</h1>
            {m.tagline ? <p className="mt-3 text-sm">{m.tagline}</p> : null}
            <LangSelect className="mt-6" value={m.currentLang} onChange={m.setCurrentLang} />
          </div>
        </header>
        <nav className="flex gap-6 overflow-x-auto border-b px-4 py-3" aria-label="Kateqoriyalar">
          {m.categories.map((c) => {
            const id = Number(c.id);
            const on = id === Number(m.activeCategory);
            return (
              <button key={id} type="button" onClick={() => m.setActiveCategory(id)} className={\`whitespace-nowrap pb-1 text-sm font-semibold \${on ? "border-b-2 border-[var(--mt-primary)]" : "text-[var(--mt-muted)]"}\`}>
                {m.catName(c)}
              </button>
            );
          })}
        </nav>
        <div className="mx-auto grid max-w-5xl gap-6 p-4 md:grid-cols-2">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p, i) => (
            <article key={String(p.id)} className={\`overflow-hidden rounded-2xl bg-[var(--mt-surface)] \${i % 2 ? "md:translate-y-8" : ""}\`}>
              <button type="button" className="w-full text-left" onClick={() => m.setDetail(p)}>
                <FallbackImg src={m.productImg(p)} alt={m.productName(p)} className="aspect-[5/4] w-full object-cover" />
                <div className="flex items-start justify-between gap-3 p-4">
                  <div>
                    <p className="font-[ui-serif] text-xl">{m.productName(p)}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-[var(--mt-muted)]">{m.productDesc(p)}</p>
                  </div>
                  <PriceTag product={p} />
                </div>
              </button>
              <button type="button" disabled={!m.canOrder} onClick={() => m.handleAdd(p)} className="mx-4 mb-4 rounded-full bg-[var(--mt-primary)] px-4 py-2 text-xs font-bold text-[var(--mt-on-primary)] disabled:opacity-40">
                {m.t("add_to_cart") || "Əlavə et"}
              </button>
            </article>
          ))}
        </div>
        <div className="sticky bottom-0 z-30 flex items-center justify-between bg-[var(--mt-surface)] px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,.08)]">
          <button type="button" onClick={m.openCart} className="text-sm font-bold">Səbət · {m.cartCount}</button>
          <span className="tabular-nums font-bold">{m.formatPrice(m.cartTotal)}</span>
        </div>
      </div>
      <CartOverlay m={m} placement="right" />
      <DetailSheet m={m} />
    </SkinChrome>
  );`,

  "bistro-ledger": `
  return (
    <SkinChrome m={m}>
      <div className="skin-bistro-ledger mx-auto min-h-dvh max-w-xl bg-[var(--mt-bg)] px-4 py-6" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 27px, color-mix(in oklab, var(--mt-muted) 18%, transparent) 28px)" }}>
        <header className="mb-6 border-b border-dashed border-[var(--mt-muted)] pb-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em]">Ledger</p>
          <h1 className="mt-1 font-[ui-serif] text-3xl">{m.name}</h1>
          <LangSelect className="mt-3 justify-center" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        {m.grouped.map((g, gi) => (
          <section key={String(g.cat.id)} className="mb-6">
            <button type="button" onClick={() => m.setActiveCategory(Number(g.cat.id))} className="mb-2 w-full text-left font-mono text-xs font-bold uppercase tracking-[0.25em] text-[var(--mt-primary)]">
              {String(gi + 1).padStart(2, "0")} — {m.catName(g.cat)}
            </button>
            {g.items.map((p, pi) => (
              <div key={String(p.id)} className="flex items-baseline gap-2 py-1.5 font-mono text-sm">
                <span className="text-[var(--mt-muted)]">{String(pi + 1).padStart(2, "0")}</span>
                <button type="button" className="min-w-0 flex-1 truncate text-left" onClick={() => m.setDetail(p)}>{m.productName(p)}</button>
                <span className="flex-1 border-b border-dotted border-[var(--mt-muted)]" />
                <PriceTag product={p} className="text-xs" />
                <button type="button" disabled={!m.canOrder} onClick={() => m.handleAdd(p)} className="text-xs font-bold text-[var(--mt-primary)] disabled:opacity-40">+</button>
              </div>
            ))}
          </section>
        ))}
        <button type="button" onClick={m.openCart} className="fixed bottom-6 right-4 rounded-l-xl border border-dashed bg-[var(--mt-surface)] px-4 py-3 font-mono text-xs">
          RECEIPT · {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="center" />
      <DetailSheet m={m} />
    </SkinChrome>
  );`,

  "bistro-market": `
  return (
    <SkinChrome m={m}>
      <div className="skin-bistro-market min-h-dvh">
        <header className="grid grid-cols-3 grid-rows-2 gap-1 p-1">
          <FallbackImg src={m.cover} alt="" className="col-span-2 row-span-2 h-full min-h-[180px] w-full object-cover" />
          <div className="bg-[var(--mt-primary)] p-3 text-[var(--mt-on-primary)]">
            <h1 className="text-lg font-black leading-tight">{m.name}</h1>
          </div>
          <LangSelect value={m.currentLang} onChange={m.setCurrentLang} className="bg-[var(--mt-secondary)] p-3" />
        </header>
        <nav className="grid grid-cols-3 gap-2 p-3" aria-label="Bazar">
          {m.categories.map((c) => {
            const id = Number(c.id);
            return (
              <button key={id} type="button" onClick={() => m.setActiveCategory(id)} className={\`aspect-square rounded-lg p-2 text-left text-xs font-bold \${id === Number(m.activeCategory) ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : "bg-[var(--mt-surface)]"}\`}>
                {m.catName(c)}
              </button>
            );
          })}
        </nav>
        <div className="columns-2 gap-3 px-3 pb-24 sm:columns-3">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p, i) => (
            <article key={String(p.id)} className="mb-3 break-inside-avoid overflow-hidden rounded-xl bg-[var(--mt-surface)]">
              <button type="button" onClick={() => m.setDetail(p)} className="w-full text-left">
                <FallbackImg src={m.productImg(p)} alt="" className={\`w-full object-cover \${i % 3 === 0 ? "aspect-[3/4]" : "aspect-square"}\`} />
                <div className="p-2">
                  <p className="text-sm font-bold">{m.productName(p)}</p>
                  <PriceTag product={p} className="text-xs" />
                </div>
              </button>
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} className="fixed bottom-5 right-4 rounded-full bg-[var(--mt-accent)] px-4 py-3 text-sm font-bold text-[var(--mt-on-primary)]">
          Səbət {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="left" />
      <DetailSheet m={m} />
    </SkinChrome>
  );`,

  "bistro-counter": `
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
        <ol className="flex gap-2 overflow-x-auto px-3" aria-label="Addımlar">
          {m.categories.map((c, i) => {
            const id = Number(c.id);
            return (
              <li key={id}>
                <button type="button" onClick={() => m.setActiveCategory(id)} className={\`flex h-14 min-w-14 items-center justify-center rounded-full text-sm font-black \${id === Number(m.activeCategory) ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : "bg-[var(--mt-surface)]"}\`}>
                  {i + 1}
                </button>
              </li>
            );
          })}
        </ol>
        <div className="mt-4 grid grid-cols-3 gap-2 px-3">
          {m.filtered.length === 0 ? <div className="col-span-3"><EmptyMenu t={m.t} /></div> : null}
          {m.filtered.map((p) => (
            <article key={String(p.id)} className="rounded-xl bg-[var(--mt-surface)] p-2">
              <button type="button" onClick={() => m.setDetail(p)} className="w-full text-left">
                <FallbackImg src={m.productImg(p)} alt="" className="aspect-square w-full rounded-lg object-cover" />
                <p className="mt-1 line-clamp-2 text-[11px] font-bold leading-tight">{m.productName(p)}</p>
              </button>
              <button type="button" disabled={!m.canOrder} onClick={() => m.handleAdd(p)} className="mt-1 w-full rounded-lg bg-[var(--mt-primary)] py-2 text-lg font-black text-[var(--mt-on-primary)] disabled:opacity-40">+</button>
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full bg-[var(--mt-surface)] px-5 py-2 text-xs font-black shadow">
          SƏBƏT {m.cartCount} · {m.formatPrice(m.cartTotal)}
        </button>
      </div>
      <CartOverlay m={m} placement="bottom" />
      <DetailSheet m={m} />
    </SkinChrome>
  );`,

  "noir-columns": `
  return (
    <SkinChrome m={m}>
      <div className="skin-noir-columns min-h-dvh bg-[var(--mt-bg)]">
        <header className="flex flex-col items-center border-y border-[var(--mt-muted)]/30 py-8">
          <p className="font-[ui-serif] text-4xl tracking-[0.4em]">{m.name.slice(0, 1)}</p>
          <h1 className="mt-2 font-[ui-serif] text-2xl">{m.name}</h1>
          <LangSelect className="mt-3" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <div className="grid md:grid-cols-[180px_1fr]">
          <nav className="hidden border-r border-[var(--mt-muted)]/20 p-4 md:block" aria-label="Fəsillər">
            {m.categories.map((c) => {
              const id = Number(c.id);
              return (
                <button key={id} type="button" onClick={() => m.setActiveCategory(id)} className={\`mb-3 block w-full text-left font-[ui-serif] \${id === Number(m.activeCategory) ? "text-[var(--mt-primary)]" : "text-[var(--mt-muted)]"}\`}>
                  {m.catName(c)}
                </button>
              );
            })}
          </nav>
          <div className="md:hidden flex gap-3 overflow-x-auto px-4 py-3">
            {m.categories.map((c) => (
              <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className="whitespace-nowrap text-sm">{m.catName(c)}</button>
            ))}
          </div>
          <div className="p-4">
            {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
            {m.filtered.map((p, i) => (
              <article key={String(p.id)} className={\`mb-8 grid items-center gap-4 md:grid-cols-2 \${i % 2 ? "md:[&>div:first-child]:order-2" : ""}\`}>
                <FallbackImg src={m.productImg(p)} alt="" className="aspect-[4/5] w-full object-cover" />
                <div>
                  <p className="font-[ui-serif] text-2xl">{m.productName(p)}</p>
                  <p className="mt-2 text-sm text-[var(--mt-muted)]">{m.productDesc(p)}</p>
                  <PriceTag product={p} className="mt-3 block" />
                  <button type="button" disabled={!m.canOrder} onClick={() => m.handleAdd(p)} className="mt-3 text-xs uppercase tracking-[0.25em] underline disabled:opacity-40">Add</button>
                </div>
              </article>
            ))}
          </div>
        </div>
        <button type="button" onClick={m.openCart} className="fixed right-4 top-6 z-30 rounded-full border border-[var(--mt-muted)]/40 px-3 py-2 text-xs">
          BAG {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="right" />
    </SkinChrome>
  );`,

  "tasting-chapters": `
  return (
    <SkinChrome m={m}>
      <div className="skin-tasting-chapters min-h-dvh">
        <header className="mx-auto max-w-lg px-4 py-10 text-center">
          <p className="text-[11px] uppercase tracking-[0.5em]">Tasting</p>
          <h1 className="mt-2 font-[ui-serif] text-4xl">{m.name}</h1>
          <LangSelect className="mt-4 justify-center" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="mx-auto flex max-w-lg justify-center gap-2 px-4" aria-label="Kurslar">
          {m.categories.map((c, i) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={\`h-9 w-9 rounded-full text-xs font-bold \${Number(c.id) === Number(m.activeCategory) ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : "bg-[var(--mt-surface)]"}\`}>
              {i + 1}
            </button>
          ))}
        </nav>
        <div className="mx-auto max-w-lg px-4 py-8">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p, i) => (
            <section key={String(p.id)} className="mb-6 border border-[var(--mt-muted)]/20 bg-[var(--mt-surface)] p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--mt-muted)]">Course {i + 1}</p>
              <button type="button" className="mt-1 w-full text-left font-[ui-serif] text-2xl" onClick={() => m.setDetail(Number(m.detail?.id) === Number(p.id) ? null : p)}>
                {m.productName(p)}
              </button>
              {Number(m.detail?.id) === Number(p.id) ? <p className="mt-2 text-sm text-[var(--mt-muted)]">{m.productDesc(p)}</p> : null}
              <div className="mt-3 flex items-center justify-between">
                <PriceTag product={p} />
                <button type="button" disabled={!m.canOrder} onClick={() => m.handleAdd(p)} className="text-xs font-bold uppercase tracking-widest disabled:opacity-40">Select</button>
              </div>
            </section>
          ))}
        </div>
        <div className="sticky bottom-0 bg-[var(--mt-surface)] px-4 py-3">
          <button type="button" onClick={m.openCart} className="w-full text-center text-sm font-semibold">Tasting bag · {m.cartCount} · {m.formatPrice(m.cartTotal)}</button>
        </div>
      </div>
      <CartOverlay m={m} placement="bottom" />
      <DetailSheet m={m} />
    </SkinChrome>
  );`,

  "gallery-plates": `
  return (
    <SkinChrome m={m}>
      <div className="skin-gallery-plates min-h-dvh">
        <header className="relative h-40 overflow-hidden">
          <FallbackImg src={m.cover} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 p-4 text-white">
            <h1 className="font-[ui-serif] text-3xl">{m.name}</h1>
            <LangSelect value={m.currentLang} onChange={m.setCurrentLang} />
          </div>
        </header>
        <nav className="flex gap-2 overflow-x-auto p-3" aria-label="Qalereya">
          {m.categories.map((c) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[var(--mt-surface)] text-[10px] font-bold">
              {m.catName(c).slice(0, 3)}
            </button>
          ))}
        </nav>
        <div className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p, i) => (
            <button key={String(p.id)} type="button" onClick={() => m.setDetail(p)} className={\`relative overflow-hidden \${i % 5 === 0 ? "col-span-2 aspect-[16/9]" : "aspect-square"}\`}>
              <FallbackImg src={m.productImg(p)} alt={m.productName(p)} className="h-full w-full object-cover" />
              <span className="absolute bottom-2 left-2 text-xs font-bold text-white drop-shadow">{m.productName(p)}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={m.openCart} className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-black/70 px-3 py-2 text-xs text-white">
          <ShoppingBag size={14} /> {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="right" />
      <DetailSheet m={m}>
        {m.detail ? <FallbackImg src={m.productImg(m.detail)} alt="" className="aspect-[4/3] w-full object-cover" /> : null}
      </DetailSheet>
    </SkinChrome>
  );`,

  "menu-paper": `
  return (
    <SkinChrome m={m}>
      <div className="skin-menu-paper mx-auto min-h-dvh max-w-md bg-[var(--mt-bg)] px-8 py-10 shadow-inner">
        <header className="mb-8 text-center">
          <h1 className="font-[ui-serif] text-4xl italic">{m.name}</h1>
          {m.tagline ? <p className="mt-2 text-xs tracking-[0.3em] uppercase">{m.tagline}</p> : null}
          <LangSelect className="mt-4 justify-center" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="mb-6 space-y-1 text-center" aria-label="Bölmələr">
          {m.categories.map((c) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={\`block w-full font-[ui-serif] \${Number(c.id) === Number(m.activeCategory) ? "italic text-[var(--mt-primary)]" : "text-[var(--mt-muted)]"}\`}>
              {m.catName(c)}
            </button>
          ))}
        </nav>
        {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
        {m.filtered.map((p) => (
          <div key={String(p.id)} className="mb-3">
            <div className="flex items-baseline gap-2">
              <button type="button" className="font-[ui-serif] text-lg" onClick={() => m.setDetail(Number(m.detail?.id) === Number(p.id) ? null : p)}>{m.productName(p)}</button>
              <span className="flex-1 border-b border-dotted border-[var(--mt-muted)]" />
              <PriceTag product={p} className="font-[ui-serif]" />
            </div>
            {Number(m.detail?.id) === Number(p.id) ? (
              <div className="pb-2 pl-1">
                <p className="text-xs italic text-[var(--mt-muted)]">{m.productDesc(p)}</p>
                <button type="button" disabled={!m.canOrder} onClick={() => m.handleAdd(p)} className="mt-1 text-[11px] uppercase tracking-widest disabled:opacity-40">Add</button>
              </div>
            ) : null}
          </div>
        ))}
        <button type="button" onClick={m.openCart} className="mt-10 w-full border border-dashed py-3 text-center font-[ui-serif]">
          Folded receipt · {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="center" />
    </SkinChrome>
  );`,

  "cafe-homestead": `
  return (
    <SkinChrome m={m}>
      <div className="skin-cafe-homestead min-h-dvh pb-24">
        <header className="relative overflow-hidden px-5 pb-8 pt-10">
          {m.logo ? <img src={m.logo} alt="" className="mb-3 h-14 w-14 rounded-full object-cover" /> : null}
          <h1 className="font-[ui-serif] text-4xl leading-tight">{m.name}</h1>
          {m.tagline ? <p className="mt-2 text-sm text-[var(--mt-muted)]">{m.tagline}</p> : null}
          <LangSelect className="absolute right-4 top-6" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="flex gap-2 overflow-x-auto px-4" aria-label="Menyu">
          {m.categories.map((c) => {
            const id = Number(c.id);
            return (
              <button key={id} type="button" onClick={() => m.setActiveCategory(id)} className={\`rounded-full px-4 py-2 text-sm font-semibold \${id === Number(m.activeCategory) ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : "bg-[var(--mt-surface)]"}\`}>
                {m.catName(c)}
              </button>
            );
          })}
        </nav>
        <div className="mt-4 grid grid-cols-2 gap-3 px-4">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p) => (
            <article key={String(p.id)} className="overflow-hidden rounded-[1.6rem] bg-[var(--mt-surface)] shadow-sm">
              <button type="button" onClick={() => m.setDetail(p)} className="w-full text-left">
                <FallbackImg src={m.productImg(p)} alt="" className="aspect-[4/3] w-full object-cover" />
                <div className="p-3">
                  <p className="font-semibold">{m.productName(p)}</p>
                  <PriceTag product={p} className="text-sm text-[var(--mt-primary)]" />
                </div>
              </button>
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} className="fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[var(--mt-primary)] px-6 py-3 text-sm font-bold text-[var(--mt-on-primary)] shadow-lg">
          <ShoppingBag size={16} /> {m.cartCount} · {m.formatPrice(m.cartTotal)}
        </button>
      </div>
      <CartOverlay m={m} placement="bottom" />
      <DetailSheet m={m} />
    </SkinChrome>
  );`,

  "patisserie-sheets": `
  return (
    <SkinChrome m={m}>
      <div className="skin-patisserie-sheets min-h-dvh">
        <header className="relative h-48">
          <div className="absolute inset-x-6 top-6 h-36 rotate-[-4deg] rounded-3xl bg-[var(--mt-secondary)]" />
          <div className="absolute inset-x-4 top-10 h-36 rotate-[3deg] rounded-3xl bg-[var(--mt-surface)] shadow" />
          <div className="relative flex h-48 items-end px-6 pb-4">
            <h1 className="font-[ui-serif] text-3xl italic">{m.name}</h1>
          </div>
          <LangSelect className="absolute right-4 top-4" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="flex gap-2 overflow-x-auto px-4 py-3" aria-label="Filter">
          {m.categories.map((c) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={\`rounded-full px-3 py-1 text-xs font-bold \${Number(c.id) === Number(m.activeCategory) ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : "bg-[var(--mt-secondary)]"}\`}>
              {m.catName(c)}
            </button>
          ))}
        </nav>
        <div className="space-y-6">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p) => (
            <article key={String(p.id)}>
              <button type="button" onClick={() => m.setDetail(p)} className="w-full">
                <FallbackImg src={m.productImg(p)} alt="" className="aspect-[3/4] w-full object-cover" />
              </button>
              <div className="flex items-center justify-between px-4 py-3">
                <p className="font-[ui-serif] text-xl">{m.productName(p)}</p>
                <button type="button" disabled={!m.canOrder} onClick={() => m.handleAdd(p)} className="rounded-full bg-[var(--mt-primary)] px-3 py-1 text-xs font-bold text-[var(--mt-on-primary)] disabled:opacity-40">
                  {m.formatPrice(m.displayMinPrice(p))}
                </button>
              </div>
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} className="fixed right-0 top-1/3 z-30 origin-right rotate-90 rounded-b-xl bg-[var(--mt-accent)] px-4 py-2 text-xs font-bold text-[var(--mt-on-primary)]">
          RIBBON {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="bottom" />
      <DetailSheet m={m} />
    </SkinChrome>
  );`,

  "roastery-journal": `
  return (
    <SkinChrome m={m}>
      <div className="skin-roastery-journal mx-auto min-h-dvh max-w-3xl px-4 py-8">
        <header className="border-y-4 border-[var(--mt-text)] py-4">
          <div className="flex items-end justify-between">
            <h1 className="font-[ui-serif] text-4xl">{m.name}</h1>
            <LangSelect value={m.currentLang} onChange={m.setCurrentLang} />
          </div>
          <p className="mt-1 text-[11px] uppercase tracking-[0.4em]">{m.tagline || "Roastery Journal"}</p>
        </header>
        <nav className="my-6 columns-2 text-sm" aria-label="Mündəricat">
          {m.categories.map((c, i) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className="mb-1 block w-full text-left">
              {i + 1}. {m.catName(c)}
            </button>
          ))}
        </nav>
        {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
        {m.filtered.map((p, i) => (
          <article key={String(p.id)} className={\`mb-8 grid gap-4 \${i === 0 ? "md:grid-cols-2" : ""}\`}>
            {i === 0 ? <FallbackImg src={m.productImg(p)} alt="" className="aspect-[4/3] w-full object-cover" /> : null}
            <div>
              <button type="button" className="text-left font-[ui-serif] text-2xl" onClick={() => m.setDetail(p)}>{m.productName(p)}</button>
              <p className="mt-2 text-sm leading-relaxed text-[var(--mt-muted)]">{m.productDesc(p)}</p>
              <div className="mt-3 flex items-center justify-between">
                <PriceTag product={p} />
                <button type="button" disabled={!m.canOrder} onClick={() => m.handleAdd(p)} className="text-xs font-bold uppercase tracking-widest disabled:opacity-40">Cup</button>
              </div>
            </div>
          </article>
        ))}
        <button type="button" onClick={m.openCart} className="fixed right-4 top-8 z-30 rotate-12 bg-[var(--mt-secondary)] px-2 py-6 text-[10px] font-bold" style={{ writingMode: "vertical-rl" }}>
          BOOKMARK {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="right" />
      <DetailSheet m={m} />
    </SkinChrome>
  );`,

  "cafe-polaroid": `
  return (
    <SkinChrome m={m}>
      <div className="skin-cafe-polaroid min-h-dvh overflow-x-hidden pb-24">
        <header className="relative h-52">
          <FallbackImg src={m.cover} alt="" className="absolute left-6 top-8 h-32 w-28 rotate-[-12deg] object-cover shadow-xl" />
          <FallbackImg src={m.logo || m.cover} alt="" className="absolute right-8 top-12 h-28 w-24 rotate-[8deg] object-cover shadow-xl" />
          <h1 className="absolute bottom-2 left-4 font-[ui-serif] text-3xl">{m.name}</h1>
          <LangSelect className="absolute right-3 top-3" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="flex gap-3 overflow-x-auto px-4 py-4" aria-label="Hekayələr">
          {m.categories.map((c) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={\`grid h-16 w-16 shrink-0 place-items-center rounded-full border-4 text-[10px] font-bold \${Number(c.id) === Number(m.activeCategory) ? "border-[var(--mt-primary)]" : "border-[var(--mt-muted)]/30"}\`}>
              {m.catName(c).slice(0, 2)}
            </button>
          ))}
        </nav>
        <div className="flex flex-wrap justify-center gap-4 px-3">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p, i) => (
            <article key={String(p.id)} className={\`w-[46%] bg-white p-2 shadow-md \${i % 2 ? "rotate-2" : "-rotate-2"}\`}>
              <button type="button" onClick={() => m.setDetail(p)} className="w-full">
                <FallbackImg src={m.productImg(p)} alt="" className="aspect-square w-full object-cover" />
                <p className="mt-2 text-center text-xs font-semibold">{m.productName(p)}</p>
              </button>
              <button type="button" disabled={!m.canOrder} onClick={() => m.handleAdd(p)} className="mt-1 w-full text-[10px] font-bold text-[var(--mt-primary)] disabled:opacity-40">+</button>
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} className="fixed bottom-5 right-5 z-30 rounded-2xl bg-[var(--mt-surface)] px-4 py-3 text-xs font-bold shadow">
          Tray {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="bottom" />
      <DetailSheet m={m} />
    </SkinChrome>
  );`,

  "cafe-calendar": `
  return (
    <SkinChrome m={m}>
      <div className="skin-cafe-calendar min-h-dvh">
        <header className="flex items-center justify-between px-4 py-5">
          <div>
            <p className="rounded-full bg-[var(--mt-secondary)] px-3 py-1 text-[11px] font-bold uppercase">Today special</p>
            <h1 className="mt-2 text-2xl font-black">{m.name}</h1>
          </div>
          <LangSelect value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="flex gap-2 overflow-x-auto px-4" aria-label="Günlər">
          {m.categories.map((c, i) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={\`min-w-16 rounded-2xl px-3 py-3 text-center \${Number(c.id) === Number(m.activeCategory) ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : "bg-[var(--mt-surface)]"}\`}>
              <span className="block text-[10px] uppercase">Day</span>
              <span className="text-lg font-black">{i + 1}</span>
            </button>
          ))}
        </nav>
        <div className="relative mx-4 mt-6 border-l-2 border-[var(--mt-primary)] pl-5">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p, i) => (
            <article key={String(p.id)} className="relative mb-6">
              <span className="absolute -left-[27px] top-2 h-3 w-3 rounded-full bg-[var(--mt-primary)]" />
              <p className="text-[10px] uppercase text-[var(--mt-muted)]">{String(9 + i).padStart(2, "0")}:00</p>
              <button type="button" className="mt-1 flex w-full items-center gap-3 text-left" onClick={() => m.setDetail(p)}>
                <FallbackImg src={m.productImg(p)} alt="" className="h-14 w-14 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{m.productName(p)}</p>
                  <PriceTag product={p} className="text-xs" />
                </div>
              </button>
            </article>
          ))}
        </div>
        <div className="sticky bottom-0 bg-[var(--mt-surface)] px-4 py-3">
          <button type="button" onClick={m.openCart} className="w-full rounded-2xl bg-[var(--mt-primary)] py-3 font-bold text-[var(--mt-on-primary)]">Günün sifarişi · {m.cartCount}</button>
        </div>
      </div>
      <CartOverlay m={m} placement="right" />
      <DetailSheet m={m} />
    </SkinChrome>
  );`,

  "speed-lane": `
  return (
    <SkinChrome m={m}>
      <div className="skin-speed-lane grid min-h-dvh grid-cols-[72px_1fr]">
        <nav className="flex flex-col gap-2 overflow-y-auto bg-[var(--mt-surface)] py-3" aria-label="Lane">
          {m.categories.map((c) => {
            const id = Number(c.id);
            return (
              <button key={id} type="button" onClick={() => m.setActiveCategory(id)} className={\`mx-1 rounded-2xl px-1 py-3 text-[10px] font-bold leading-tight \${id === Number(m.activeCategory) ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : ""}\`}>
                {m.catName(c)}
              </button>
            );
          })}
        </nav>
        <div className="flex min-w-0 flex-col">
          <header className="flex items-center gap-2 px-3 py-3">
            <h1 className="min-w-0 flex-1 truncate text-lg font-black">{m.name}</h1>
            <LangSelect value={m.currentLang} onChange={m.setCurrentLang} />
          </header>
          <ul className="flex-1 divide-y">
            {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
            {m.filtered.map((p) => (
              <li key={String(p.id)} className="flex items-center gap-2 px-3 py-2">
                <FallbackImg src={m.productImg(p)} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => m.setDetail(p)}>
                  <p className="truncate text-sm font-bold">{m.productName(p)}</p>
                  <PriceTag product={p} className="text-xs" />
                </button>
                <button type="button" disabled={!m.canOrder} onClick={() => m.handleAdd(p)} className="h-10 w-10 rounded-full bg-[var(--mt-primary)] text-lg font-black text-[var(--mt-on-primary)] disabled:opacity-40">+</button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={m.openCart} className="sticky bottom-0 flex items-center justify-between bg-[var(--mt-primary)] px-3 py-3 text-sm font-black text-[var(--mt-on-primary)]">
            <span>{m.cartCount} ədəd</span>
            <span>{m.formatPrice(m.cartTotal)}</span>
          </button>
        </div>
      </div>
      <CartOverlay m={m} placement="bottom" />
      <DetailSheet m={m} />
    </SkinChrome>
  );`,

  "build-a-meal": `
  const step = Math.max(0, m.categories.findIndex((c) => Number(c.id) === Number(m.activeCategory)));
  return (
    <SkinChrome m={m}>
      <div className="skin-build-a-meal min-h-dvh pb-24">
        <header className="px-4 pt-6">
          <p className="text-xs font-bold uppercase tracking-[0.3em]">Build a meal</p>
          <h1 className="text-3xl font-black">{m.name}</h1>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--mt-secondary)]">
            <div className="h-full bg-[var(--mt-primary)]" style={{ width: \`\${((step + 1) / Math.max(m.categories.length, 1)) * 100}%\` }} />
          </div>
          <LangSelect className="mt-3" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="mt-4 flex gap-2 overflow-x-auto px-4" aria-label="Mərhələ">
          {m.categories.map((c, i) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={\`rounded-2xl px-3 py-2 text-xs font-black \${Number(c.id) === Number(m.activeCategory) ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : "bg-[var(--mt-surface)]"}\`}>
              {i + 1}. {m.catName(c)}
            </button>
          ))}
        </nav>
        <div className="mt-4 space-y-3 px-4">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p) => (
            <article key={String(p.id)} className="flex gap-3 rounded-2xl bg-[var(--mt-surface)] p-3">
              <FallbackImg src={m.productImg(p)} alt="" className="h-20 w-20 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-bold">{m.productName(p)}</p>
                <p className="line-clamp-2 text-xs text-[var(--mt-muted)]">{m.productDesc(p)}</p>
                <div className="mt-2 flex items-center justify-between">
                  <PriceTag product={p} className="text-sm" />
                  <button type="button" disabled={!m.canOrder} onClick={() => m.handleAdd(p)} className="rounded-full bg-[var(--mt-primary)] px-3 py-1 text-xs font-black text-[var(--mt-on-primary)] disabled:opacity-40">Add</button>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="fixed inset-x-0 bottom-0 bg-[var(--mt-surface)] px-4 py-3">
          <button type="button" onClick={m.openCart} className="w-full rounded-2xl border-2 border-[var(--mt-primary)] py-3 font-black">
            Addım {step + 1} · Səbət {m.cartCount}
          </button>
        </div>
      </div>
      <CartOverlay m={m} placement="bottom" />
      <DetailSheet m={m} />
    </SkinChrome>
  );`,

  "pizza-slices": `
  return (
    <SkinChrome m={m}>
      <div className="skin-pizza-slices min-h-dvh pb-24">
        <header className="flex flex-col items-center pt-8">
          <div className="grid h-28 w-28 place-items-center rounded-full bg-[var(--mt-primary)] text-3xl font-black text-[var(--mt-on-primary)]">🍕</div>
          <h1 className="mt-3 text-3xl font-black">{m.name}</h1>
          <LangSelect className="mt-2" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="mt-4 flex snap-x gap-3 overflow-x-auto px-4" aria-label="Dilimler">
          {m.categories.map((c) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={\`snap-center whitespace-nowrap rounded-full px-5 py-3 text-sm font-black \${Number(c.id) === Number(m.activeCategory) ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : "bg-[var(--mt-surface)]"}\`}>
              {m.catName(c)}
            </button>
          ))}
        </nav>
        <div className="mt-6 flex flex-col items-center gap-8">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p) => (
            <article key={String(p.id)} className="w-[min(100%,280px)] text-center">
              <button type="button" onClick={() => m.setDetail(p)}>
                <FallbackImg src={m.productImg(p)} alt="" className="mx-auto aspect-square w-56 rounded-full object-cover shadow-lg" />
                <p className="mt-3 text-lg font-black">{m.productName(p)}</p>
              </button>
              <PriceTag product={p} className="block" />
              <button type="button" disabled={!m.canOrder} onClick={() => m.handleAdd(p)} className="mt-2 rounded-full bg-[var(--mt-primary)] px-6 py-2 text-sm font-black text-[var(--mt-on-primary)] disabled:opacity-40">SIZE +</button>
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} className="fixed bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-full bg-[var(--mt-accent)] px-6 py-3 font-black text-[var(--mt-on-primary)]">
          Checkout · {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="bottom" />
      <DetailSheet m={m} />
    </SkinChrome>
  );`,

  "burger-stack": `
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
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={\`flex-1 truncate rounded-t-xl px-2 py-2 text-[11px] font-black \${Number(c.id) === Number(m.activeCategory) ? "bg-[var(--mt-surface)]" : "bg-[var(--mt-secondary)]"}\`}>
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
            </article>
          ))}
        </div>
        <div className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-3 overflow-hidden rounded-2xl bg-[var(--mt-surface)]">
          <button type="button" onClick={() => m.onOpenOrders?.()} className="py-3 text-xs font-bold">Sifariş</button>
          <button type="button" onClick={m.openCart} className="bg-[var(--mt-primary)] py-3 text-xs font-black text-[var(--mt-on-primary)]">Səbət {m.cartCount}</button>
          <button type="button" onClick={m.onCheckout} className="py-3 text-xs font-bold">Ödə</button>
        </div>
      </div>
      <CartOverlay m={m} placement="bottom" />
      <DetailSheet m={m} />
    </SkinChrome>
  );`,

  "izakaya-night": `
  return (
    <SkinChrome m={m}>
      <div className="skin-izakaya-night grid min-h-dvh bg-[var(--mt-bg)] md:grid-cols-[140px_1fr]">
        <aside className="border-r border-[var(--mt-muted)]/20 p-4">
          <p className="writing-vertical hidden text-xs tracking-[0.5em] md:block">IZAKAYA</p>
          <h1 className="mt-4 font-[ui-serif] text-xl">{m.name}</h1>
          <nav className="mt-6 flex flex-col gap-3" aria-label="Index">
            {m.categories.map((c) => (
              <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={\`text-left text-xs tracking-widest \${Number(c.id) === Number(m.activeCategory) ? "text-[var(--mt-primary)]" : "text-[var(--mt-muted)]"}\`}>
                {m.catName(c)}
              </button>
            ))}
          </nav>
          <LangSelect className="mt-6" value={m.currentLang} onChange={m.setCurrentLang} />
        </aside>
        <div className="p-4">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p) => (
            <article key={String(p.id)} className="mb-4 grid grid-cols-[1fr_120px] overflow-hidden rounded-xl bg-[var(--mt-surface)]">
              <div className="p-4">
                <button type="button" className="text-left font-[ui-serif] text-xl" onClick={() => m.setDetail(p)}>{m.productName(p)}</button>
                <p className="mt-1 line-clamp-2 text-xs text-[var(--mt-muted)]">{m.productDesc(p)}</p>
                <div className="mt-3 flex items-center justify-between">
                  <PriceTag product={p} />
                  <button type="button" disabled={!m.canOrder} onClick={() => m.handleAdd(p)} className="text-[11px] uppercase tracking-widest disabled:opacity-40">+</button>
                </div>
              </div>
              <FallbackImg src={m.productImg(p)} alt="" className="h-full w-full object-cover" />
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} className="fixed right-3 top-4 rounded-full bg-[var(--mt-primary)] px-3 py-2 text-[10px] font-bold text-[var(--mt-on-primary)]">
          {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="right" />
      <DetailSheet m={m} />
    </SkinChrome>
  );`,

  "neon-snap": `
  return (
    <SkinChrome m={m}>
      <div className="skin-neon-snap relative h-dvh overflow-y-auto scroll-smooth snap-y snap-mandatory">
        <header className="relative flex h-dvh snap-start items-end overflow-hidden">
          <FallbackImg src={m.cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 p-6">
            <h1 className="text-5xl font-black uppercase italic text-[var(--mt-primary)] drop-shadow">{m.name}</h1>
            <LangSelect className="mt-4 text-white" value={m.currentLang} onChange={m.setCurrentLang} />
          </div>
        </header>
        <div className="pointer-events-none fixed right-3 top-1/3 z-30 flex flex-col gap-2">
          {m.categories.map((c) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={\`pointer-events-auto h-2.5 w-2.5 rounded-full \${Number(c.id) === Number(m.activeCategory) ? "bg-[var(--mt-primary)]" : "bg-white/40"}\`} aria-label={m.catName(c)} />
          ))}
        </div>
        {m.filtered.length === 0 ? <div className="snap-start"><EmptyMenu t={m.t} /></div> : null}
        {m.filtered.map((p) => (
          <section key={String(p.id)} className="relative flex h-dvh snap-start flex-col justify-end">
            <FallbackImg src={m.productImg(p)} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="relative z-10 bg-gradient-to-t from-black/80 p-5 text-white">
              <p className="text-3xl font-black">{m.productName(p)}</p>
              <p className="mt-1 text-sm text-white/80">{m.productDesc(p)}</p>
              <div className="mt-4 flex items-center justify-between">
                <PriceTag product={p} className="text-xl text-[var(--mt-primary)]" />
                <button type="button" disabled={!m.canOrder} onClick={() => m.handleAdd(p)} className="rounded-full bg-[var(--mt-primary)] px-5 py-2 font-black text-black disabled:opacity-40">ADD</button>
              </div>
            </div>
          </section>
        ))}
        <button type="button" onClick={m.openCart} className="fixed bottom-6 left-4 z-40 rounded-2xl bg-white/15 px-4 py-3 text-sm font-bold text-white backdrop-blur">
          Tray {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="bottom" />
    </SkinChrome>
  );`,

  "lounge-glass": `
  return (
    <SkinChrome m={m}>
      <div className="skin-lounge-glass min-h-dvh bg-[var(--mt-bg)]">
        <header className="relative isolate px-4 pb-10 pt-16">
          <FallbackImg src={m.cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div className="relative mx-auto max-w-md rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl">
            <h1 className="font-[ui-serif] text-3xl text-white">{m.name}</h1>
            {m.tagline ? <p className="mt-2 text-sm text-white/70">{m.tagline}</p> : null}
            <LangSelect className="mt-4 text-white" value={m.currentLang} onChange={m.setCurrentLang} />
          </div>
        </header>
        <nav className="sticky top-2 z-20 mx-4 flex gap-2 overflow-x-auto rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur" aria-label="Glass">
          {m.categories.map((c) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={\`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold \${Number(c.id) === Number(m.activeCategory) ? "bg-white/30" : "text-white/70"}\`}>
              {m.catName(c)}
            </button>
          ))}
        </nav>
        <div className="space-y-4 p-4">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p) => (
            <article key={String(p.id)} className="overflow-hidden rounded-3xl border border-white/15 bg-white/10 backdrop-blur">
              <button type="button" className="w-full text-left" onClick={() => m.setDetail(Number(m.detail?.id) === Number(p.id) ? null : p)}>
                <div className="flex items-center gap-3 p-3">
                  <FallbackImg src={m.productImg(p)} alt="" className="h-16 w-16 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{m.productName(p)}</p>
                    <PriceTag product={p} className="text-sm" />
                  </div>
                </div>
              </button>
              {Number(m.detail?.id) === Number(p.id) ? (
                <div className="px-4 pb-4">
                  <p className="text-sm text-[var(--mt-muted)]">{m.productDesc(p)}</p>
                  <button type="button" disabled={!m.canOrder} onClick={() => m.handleAdd(p)} className="mt-3 rounded-full bg-[var(--mt-primary)] px-4 py-2 text-xs font-bold text-[var(--mt-on-primary)] disabled:opacity-40">Add</button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} className="fixed bottom-5 right-5 z-30 rounded-full border border-white/20 bg-white/15 px-4 py-3 text-sm backdrop-blur">
          {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="right" />
    </SkinChrome>
  );`,

  "speakeasy-book": `
  return (
    <SkinChrome m={m}>
      <div className="skin-speakeasy-book min-h-dvh bg-[var(--mt-bg)] px-3 py-6">
        <header className="mx-auto mb-6 max-w-lg rounded-xl border-[12px] border-[var(--mt-secondary)] bg-[var(--mt-surface)] px-6 py-10 text-center shadow-2xl">
          <p className="text-[10px] tracking-[0.6em]">SPEAKEASY</p>
          <h1 className="mt-3 font-[ui-serif] text-4xl">{m.name}</h1>
          <LangSelect className="mt-4 justify-center" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="mx-auto mb-4 flex max-w-lg gap-2 overflow-x-auto" aria-label="Fəsil">
          {m.categories.map((c, i) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={\`whitespace-nowrap px-3 py-1 font-[ui-serif] \${Number(c.id) === Number(m.activeCategory) ? "underline" : "text-[var(--mt-muted)]"}\`}>
              Ch.{i + 1}
            </button>
          ))}
        </nav>
        <div className="mx-auto grid max-w-lg gap-px bg-[var(--mt-muted)]/20 sm:grid-cols-2">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p) => (
            <article key={String(p.id)} className="bg-[var(--mt-surface)] p-4">
              <button type="button" className="w-full text-left font-[ui-serif] text-xl" onClick={() => m.setDetail(p)}>{m.productName(p)}</button>
              <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-[var(--mt-muted)]">{m.productDesc(p)}</p>
              <div className="mt-3 flex items-center justify-between">
                <PriceTag product={p} />
                <button type="button" disabled={!m.canOrder} onClick={() => m.handleAdd(p)} className="text-[10px] uppercase tracking-widest disabled:opacity-40">Mark</button>
              </div>
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} className="fixed bottom-0 right-0 z-30 origin-bottom-right -rotate-6 bg-[var(--mt-secondary)] px-5 py-6 text-xs font-bold">
          FOLD {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="center" />
      <DetailSheet m={m} />
    </SkinChrome>
  );`,

  "midnight-table": `
  return (
    <SkinChrome m={m}>
      <div className="skin-midnight-table min-h-dvh bg-[var(--mt-bg)]">
        <header className="flex flex-col items-center pt-10">
          <div className="grid h-36 w-36 place-items-center rounded-full bg-[radial-gradient(circle,var(--mt-primary),transparent_70%)]">
            <h1 className="max-w-[7rem] text-center font-[ui-serif] text-xl leading-tight">{m.name}</h1>
          </div>
          <LangSelect className="mt-4" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="mx-auto mt-6 flex max-w-xs flex-wrap justify-center gap-2" aria-label="Wheel">
          {m.categories.map((c) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={\`h-16 w-16 rounded-full text-[10px] font-bold \${Number(c.id) === Number(m.activeCategory) ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : "bg-[var(--mt-surface)]"}\`}>
              {m.catName(c)}
            </button>
          ))}
        </nav>
        <div className="mx-auto mt-8 max-w-lg space-y-6 px-4">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p, i) => (
            <article key={String(p.id)} className={\`flex items-center gap-4 \${i % 2 ? "flex-row-reverse text-right" : ""}\`}>
              <FallbackImg src={m.productImg(p)} alt="" className="h-24 w-24 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <button type="button" className="font-[ui-serif] text-xl" onClick={() => m.setDetail(p)}>{m.productName(p)}</button>
                <PriceTag product={p} className="mt-1 block text-sm" />
                <button type="button" disabled={!m.canOrder} onClick={() => m.handleAdd(p)} className="mt-2 text-[11px] uppercase tracking-widest disabled:opacity-40">Seat</button>
              </div>
            </article>
          ))}
        </div>
        <div className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-3 rounded-full bg-[var(--mt-surface)] px-4 py-2">
          <button type="button" onClick={() => m.onOpenOrders?.()} aria-label="Sifarişlər" className="h-10 w-10 rounded-full bg-[var(--mt-secondary)]">•</button>
          <button type="button" onClick={m.openCart} aria-label="Səbət" className="h-10 w-10 rounded-full bg-[var(--mt-primary)] text-[var(--mt-on-primary)]">{m.cartCount}</button>
        </div>
      </div>
      <CartOverlay m={m} placement="bottom" />
      <DetailSheet m={m} />
    </SkinChrome>
  );`,

  "street-market": `
  return (
    <SkinChrome m={m}>
      <div className="skin-street-market min-h-dvh">
        <header className="bg-[var(--mt-primary)] px-4 py-6 text-[var(--mt-on-primary)]">
          <p className="text-[11px] font-black uppercase tracking-[0.4em]">Open market</p>
          <h1 className="text-3xl font-black">{m.name}</h1>
          <LangSelect className="mt-2" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="grid grid-cols-2 gap-2 p-3" aria-label="Stall">
          {m.categories.map((c) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={\`rounded-none border-4 px-3 py-4 text-left text-sm font-black uppercase \${Number(c.id) === Number(m.activeCategory) ? "border-[var(--mt-primary)] bg-[var(--mt-secondary)]" : "border-[var(--mt-text)] bg-[var(--mt-surface)]"}\`}>
              {m.catName(c)}
            </button>
          ))}
        </nav>
        <div className="columns-2 gap-2 px-3 pb-24">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p) => (
            <article key={String(p.id)} className="mb-2 break-inside-avoid border-2 border-[var(--mt-text)] bg-[var(--mt-surface)]">
              <FallbackImg src={m.productImg(p)} alt="" className="aspect-[4/3] w-full object-cover" />
              <div className="p-2">
                <p className="text-sm font-black">{m.productName(p)}</p>
                <div className="mt-1 flex items-center justify-between">
                  <PriceTag product={p} className="text-xs" />
                  <button type="button" disabled={!m.canOrder} onClick={() => m.handleAdd(p)} className="bg-[var(--mt-primary)] px-2 py-1 text-[10px] font-black text-[var(--mt-on-primary)] disabled:opacity-40">ADD</button>
                </div>
              </div>
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} className="fixed left-0 top-1/3 z-30 bg-[var(--mt-accent)] px-2 py-8 text-xs font-black" style={{ writingMode: "vertical-rl" }}>
          CART {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="left" />
    </SkinChrome>
  );`,

  "street-zine": `
  return (
    <SkinChrome m={m}>
      <div className="skin-street-zine min-h-dvh overflow-hidden bg-[var(--mt-bg)]">
        <header className="relative px-4 py-8">
          <h1 className="rotate-[-3deg] bg-[var(--mt-primary)] px-3 py-2 text-4xl font-black uppercase italic text-[var(--mt-on-primary)] inline-block">{m.name}</h1>
          <p className="mt-3 rotate-2 bg-[var(--mt-secondary)] px-2 py-1 text-xs font-black uppercase inline-block">{m.tagline || "ZINE"}</p>
          <LangSelect className="absolute right-3 top-3" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="mb-4 overflow-hidden whitespace-nowrap bg-[var(--mt-text)] py-2 text-[var(--mt-bg)]" aria-label="Marquee">
          <div className="flex gap-8 px-4">
            {m.categories.map((c) => (
              <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className="text-sm font-black uppercase">
                ★ {m.catName(c)}
              </button>
            ))}
          </div>
        </nav>
        <div className="flex flex-wrap gap-4 px-4 pb-24">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p, i) => (
            <article key={String(p.id)} className={\`relative w-[46%] border-4 border-black bg-white p-2 \${i % 3 === 0 ? "rotate-2" : i % 3 === 1 ? "-rotate-3" : "rotate-1"}\`}>
              <button type="button" onClick={() => m.setDetail(p)}>
                <FallbackImg src={m.productImg(p)} alt="" className="aspect-square w-full object-cover" />
                <p className="mt-1 text-xs font-black uppercase">{m.productName(p)}</p>
              </button>
              <button type="button" disabled={!m.canOrder} onClick={() => m.handleAdd(p)} className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-[var(--mt-primary)] text-sm font-black disabled:opacity-40">+</button>
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} className="fixed inset-x-0 bottom-0 z-30 bg-black py-3 text-center text-sm font-black uppercase tracking-widest text-white">
          Ticket stub · {m.cartCount} · {m.formatPrice(m.cartTotal)}
        </button>
      </div>
      <CartOverlay m={m} placement="bottom" />
      <DetailSheet m={m} />
    </SkinChrome>
  );`,

  "street-filmstrip": `
  return (
    <SkinChrome m={m}>
      <div className="skin-street-filmstrip min-h-dvh bg-[var(--mt-bg)]">
        <header className="flex items-center gap-2 overflow-x-auto bg-black px-3 py-3 text-white">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="h-4 w-6 shrink-0 rounded-sm bg-white/30" />
          ))}
          <h1 className="shrink-0 px-3 text-sm font-black tracking-[0.4em]">{m.name.toUpperCase()}</h1>
          <LangSelect className="ml-auto text-white" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="flex gap-3 overflow-x-auto px-4 py-4" aria-label="Reel">
          {m.categories.map((c) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={\`h-24 w-20 shrink-0 rounded-sm bg-[var(--mt-surface)] p-2 text-[10px] font-bold \${Number(c.id) === Number(m.activeCategory) ? "ring-2 ring-[var(--mt-primary)]" : ""}\`}>
              {m.catName(c)}
            </button>
          ))}
        </nav>
        <div className="space-y-3 px-3 pb-28">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p) => (
            <article key={String(p.id)} className="overflow-hidden rounded-sm bg-[var(--mt-surface)]">
              <button type="button" className="flex w-full items-stretch text-left" onClick={() => m.setDetail(Number(m.detail?.id) === Number(p.id) ? null : p)}>
                <FallbackImg src={m.productImg(p)} alt="" className="h-28 w-40 object-cover" />
                <div className="flex flex-1 items-center justify-between px-3">
                  <p className="font-bold">{m.productName(p)}</p>
                  <PriceTag product={p} />
                </div>
              </button>
              {Number(m.detail?.id) === Number(p.id) ? (
                <div className="flex items-center justify-between bg-black px-3 py-2 text-white">
                  <p className="text-xs">{m.productDesc(p)}</p>
                  <button type="button" disabled={!m.canOrder} onClick={() => m.handleAdd(p)} className="text-xs font-black disabled:opacity-40">ADD</button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
        <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 overflow-x-auto bg-black px-3 py-3">
          <button type="button" onClick={m.openCart} className="shrink-0 rounded-sm bg-[var(--mt-primary)] px-4 py-2 text-xs font-black text-[var(--mt-on-primary)]">
            REEL CART {m.cartCount}
          </button>
        </div>
      </div>
      <CartOverlay m={m} placement="bottom" />
    </SkinChrome>
  );`,

  "street-map": `
  return (
    <SkinChrome m={m}>
      <div className="skin-street-map min-h-dvh">
        <header className="relative h-56 overflow-hidden">
          <FallbackImg src={m.cover} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[var(--mt-primary)]/30" />
          <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-[var(--mt-surface)] p-4 shadow">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Route</p>
            <h1 className="text-2xl font-black">{m.name}</h1>
          </div>
          <LangSelect className="absolute right-3 top-3" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="relative mx-6 mt-4 border-l-2 border-dashed border-[var(--mt-primary)] pl-6" aria-label="Stops">
          {m.categories.map((c, i) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className="relative mb-4 block w-full text-left">
              <span className={\`absolute -left-[31px] top-0 grid h-6 w-6 place-items-center rounded-full text-[10px] font-black \${Number(c.id) === Number(m.activeCategory) ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : "bg-[var(--mt-surface)]"}\`}>{i + 1}</span>
              {m.catName(c)}
            </button>
          ))}
        </nav>
        <div className="space-y-3 p-4">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p) => (
            <article key={String(p.id)} className="rounded-2xl border border-[var(--mt-muted)]/20 bg-[var(--mt-surface)] p-3 shadow-sm">
              <div className="flex gap-3">
                <span className="mt-1 h-3 w-3 rounded-full bg-[var(--mt-primary)]" />
                <div className="min-w-0 flex-1">
                  <button type="button" className="text-left font-bold" onClick={() => m.setDetail(p)}>{m.productName(p)}</button>
                  <p className="text-xs text-[var(--mt-muted)]">{m.productDesc(p)}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <PriceTag product={p} />
                    <button type="button" disabled={!m.canOrder} onClick={() => m.handleAdd(p)} className="text-xs font-bold uppercase disabled:opacity-40">Pin add</button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} className="fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-[var(--mt-primary)] text-[var(--mt-on-primary)] shadow-lg">
          {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="center" />
      <DetailSheet m={m} />
    </SkinChrome>
  );`,

  "street-tickets": `
  return (
    <SkinChrome m={m}>
      <div className="skin-street-tickets min-h-dvh bg-[var(--mt-bg)] pb-8">
        <header className="mx-4 mt-4 rounded-xl border-2 border-dashed border-[var(--mt-text)] bg-[var(--mt-surface)] px-4 py-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em]">Admit one</p>
          <h1 className="text-3xl font-black">{m.name}</h1>
          <LangSelect className="mt-2" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="mt-4 flex gap-2 overflow-x-auto px-4" aria-label="Tabs">
          {m.categories.map((c, i) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={\`min-w-16 rounded-t-lg px-3 py-4 text-2xl font-black \${Number(c.id) === Number(m.activeCategory) ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : "bg-[var(--mt-surface)]"}\`}>
              {i + 1}
            </button>
          ))}
        </nav>
        <div className="space-y-4 px-4">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p) => (
            <article key={String(p.id)} className="relative overflow-hidden rounded-xl bg-[var(--mt-surface)]">
              <div className="pointer-events-none absolute left-0 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--mt-bg)]" />
              <div className="pointer-events-none absolute right-0 top-1/2 h-6 w-6 translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--mt-bg)]" />
              <button type="button" className="flex w-full items-center gap-3 p-4 text-left" onClick={() => m.setDetail(Number(m.detail?.id) === Number(p.id) ? null : p)}>
                <FallbackImg src={m.productImg(p)} alt="" className="h-16 w-16 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-black">{m.productName(p)}</p>
                  <PriceTag product={p} className="font-mono text-sm" />
                </div>
              </button>
              {Number(m.detail?.id) === Number(p.id) ? (
                <div className="border-t border-dashed px-4 py-3">
                  <p className="text-xs text-[var(--mt-muted)]">{m.productDesc(p)}</p>
                  <button type="button" disabled={!m.canOrder} onClick={() => m.handleAdd(p)} className="mt-2 font-mono text-xs font-bold uppercase disabled:opacity-40">Tear & add</button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} className="mx-4 mt-6 w-[calc(100%-2rem)] rounded-xl bg-[var(--mt-primary)] py-3 font-mono text-sm font-black text-[var(--mt-on-primary)]">
          DRAWER · {m.cartCount} · {m.formatPrice(m.cartTotal)}
        </button>
      </div>
      <CartOverlay m={m} placement="bottom" />
    </SkinChrome>
  );`,
};

for (const [id, inner] of Object.entries(remaining)) {
  file(id, inner);
}

const count = fs.readdirSync(ROOT).filter((d) => fs.existsSync(path.join(ROOT, d, "Skin.tsx"))).length;
console.log(`Wrote remaining skins. Total Skin.tsx folders: ${count}`);
