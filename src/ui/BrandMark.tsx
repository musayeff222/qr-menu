import React from "react";

export function BrandMark({
  className = "h-10 w-10",
  title = "MenuGo",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <img
      src="/logo-symbol.svg"
      alt={title}
      className={className}
      width={40}
      height={40}
    />
  );
}

export function BrandWordmark({
  className = "text-[1.35rem] font-extrabold tracking-tight",
  ink = false,
}: {
  className?: string;
  ink?: boolean;
}) {
  return (
    <span className={className} style={{ letterSpacing: "-0.04em" }}>
      Menu
      <span className={ink ? "text-[var(--mg-brand-strong)]" : "text-[var(--mg-brand)]"}>Go</span>
    </span>
  );
}
