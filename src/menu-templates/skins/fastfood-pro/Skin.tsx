import { Clock3, Instagram, MapPin, Phone, ShoppingBag } from "lucide-react";
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
  ViewMenuLink,
} from "../../shared/primitives";
import { useSkinModel } from "../../shared/useSkinModel";

const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

function todayHours(raw: string): string {
  if (!raw.trim()) return "";
  try {
    const parsed = JSON.parse(raw) as {
      slots?: Record<string, Array<{ open?: string; close?: string }>>;
    };
    const slots = parsed.slots?.[DAYS[new Date().getDay()]];
    if (!slots?.length) return "";
    return slots
      .filter((s) => s.open && s.close)
      .map((s) => `${s.open}–${s.close}`)
      .join(", ");
  } catch {
    return raw.length < 80 ? raw : "";
  }
}

export default function Skin(props: GuestSkinProps) {
  const m = useSkinModel(props);
  const hours = todayHours(m.openingHours);
  const featured = m.products.filter((p) => p.is_featured).slice(0, 8);

  return (
    <SkinChrome m={m}>
      <div className="skin-fastfood-pro mx-auto min-h-dvh max-w-lg bg-[var(--mt-bg)] pb-28">
        <header className="relative px-4 pb-6 pt-5">
          <div className="absolute right-4 top-4 z-10">
            <LangSelect value={m.currentLang} onChange={m.setCurrentLang} />
          </div>
          <div className="overflow-hidden rounded-[1.6rem] bg-[var(--mt-surface)] shadow-sm">
            <div className="relative h-44 sm:h-52">
              <FallbackImg src={m.cover} alt="" className="h-full w-full object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            </div>
            <div className="relative -mt-10 flex flex-col items-center px-4 pb-5 text-center">
              {m.logo ? (
                <img
                  src={m.logo}
                  alt=""
                  className="h-[4.5rem] w-[4.5rem] rounded-full border-4 border-[var(--mt-surface)] object-cover shadow-md"
                />
              ) : (
                <div className="grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full border-4 border-[var(--mt-surface)] bg-[var(--mt-secondary)] text-lg font-black text-[var(--mt-text)] shadow-md">
                  {m.name.slice(0, 1)}
                </div>
              )}
              <h1 className="mt-3 text-2xl font-black tracking-tight">{m.name}</h1>
              {m.tagline ? <p className="mt-1 text-sm text-[var(--mt-muted)]">{m.tagline}</p> : null}
              <ViewMenuLink m={m} className="mt-4 w-full max-w-sm rounded-full bg-[var(--mt-primary)] py-3 text-[var(--mt-on-primary)]" />
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl bg-[var(--mt-surface)]">
            {m.mapsUrl ? (
              <a href={m.mapsUrl} className="flex items-center gap-3 border-b border-[var(--mt-muted)]/10 px-4 py-3 text-sm" target="_blank" rel="noreferrer">
                <MapPin size={16} className="shrink-0 text-[var(--mt-accent)]" />
                <span className="min-w-0 truncate">{m.tx("address", "Xəritə")}</span>
              </a>
            ) : null}
            {m.phone ? (
              <a href={`tel:${m.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 border-b border-[var(--mt-muted)]/10 px-4 py-3 text-sm">
                <Phone size={16} className="shrink-0 text-[var(--mt-accent)]" />
                <span>{m.phone}</span>
              </a>
            ) : null}
            {m.instagram ? (
              <a href={m.instagram.startsWith("http") ? m.instagram : `https://instagram.com/${m.instagram.replace(/^@/, "")}`} className="flex items-center gap-3 border-b border-[var(--mt-muted)]/10 px-4 py-3 text-sm" target="_blank" rel="noreferrer">
                <Instagram size={16} className="shrink-0 text-[var(--mt-accent)]" />
                <span className="truncate">{m.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@")}</span>
              </a>
            ) : null}
            {hours ? (
              <p className="flex items-center gap-3 px-4 py-3 text-sm">
                <Clock3 size={16} className="shrink-0 text-[var(--mt-accent)]" />
                <span>
                  {m.tx("hours_today", "Bu gün")}: {hours}
                </span>
              </p>
            ) : null}
          </div>
        </header>

        <div id="menu-body">
          <nav className="sticky top-0 z-20 flex gap-1 overflow-x-auto bg-[var(--mt-bg)] px-4 py-2" aria-label="Kateqoriyalar">
            {m.categories.map((c) => {
              const id = Number(c.id);
              const on = id === Number(m.activeCategory);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => m.setActiveCategory(id)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${
                    on ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : "bg-[var(--mt-surface)]"
                  }`}
                >
                  {m.catName(c)}
                </button>
              );
            })}
          </nav>

          {featured.length > 0 ? (
            <section className="mt-2 px-4" aria-label={m.tx("featured", "Seçilmiş")}>
              <p className="mb-2 text-sm font-black">{m.tx("featured", "Seçilmiş")}</p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {featured.map((p) => (
                  <button
                    key={`feat-${String(p.id)}`}
                    type="button"
                    onClick={() => m.setDetail(p)}
                    className="w-28 shrink-0 text-left"
                  >
                    <FallbackImg src={m.productImg(p)} alt="" className="h-24 w-28 rounded-2xl object-cover" />
                    <p className="mt-1 truncate text-xs font-bold">{m.productName(p)}</p>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <div className="mt-2 space-y-3 px-4">
            {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
            {m.filtered.map((p) => (
              <article key={String(p.id)} className="flex gap-3 rounded-2xl bg-[var(--mt-surface)] p-3 shadow-sm">
                <div className="min-w-0 flex-1">
                  <button type="button" className="w-full text-left" onClick={() => m.setDetail(p)}>
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-black leading-tight">{m.productName(p)}</h2>
                      {p.is_featured ? (
                        <span className="shrink-0 rounded bg-[var(--mt-secondary)] px-1.5 py-0.5 text-[10px] font-black uppercase">
                          {m.tx("new_badge", "Yeni")}
                        </span>
                      ) : null}
                    </div>
                    {m.productDesc(p) ? (
                      <p className="mt-1 line-clamp-2 text-xs text-[var(--mt-muted)]">{m.productDesc(p)}</p>
                    ) : null}
                  </button>
                  <div className="mt-2 flex items-center gap-2">
                    <PriceTag product={p} className="text-base font-black" />
                    <AddBtn
                      m={m}
                      product={p}
                      compact
                      className="grid h-9 w-9 place-items-center rounded-full bg-[var(--mt-secondary)] text-lg text-[var(--mt-text)]"
                    />
                  </div>
                </div>
                <button type="button" onClick={() => m.setDetail(p)} className="shrink-0">
                  <FallbackImg src={m.productImg(p)} alt="" className="h-24 w-24 rounded-2xl object-cover" />
                </button>
              </article>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={m.openCart}
          aria-label={m.tx("nav_cart", "Səbət")}
          className="fixed inset-x-3 bottom-3 z-40 flex min-h-12 items-center justify-between rounded-full bg-[var(--mt-primary)] px-5 text-sm font-black text-[var(--mt-on-primary)] shadow-lg"
        >
          <span className="inline-flex items-center gap-2">
            <ShoppingBag size={18} /> {m.tx("nav_cart", "Səbət")}
          </span>
          <span className="tabular-nums">
            {m.cartCount} · {m.formatPrice(m.cartTotal)}
          </span>
        </button>
      </div>
      <CartOverlay m={m} placement="bottom" />
      <DetailSheet m={m}>
        {m.detail ? <FallbackImg src={m.productImg(m.detail)} alt="" className="aspect-[16/10] w-full object-cover" /> : null}
      </DetailSheet>
    </SkinChrome>
  );
}
