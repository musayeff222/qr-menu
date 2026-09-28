import React from "react";
import { motion } from "motion/react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...i: (string | boolean | undefined)[]) {
  return twMerge(clsx(i));
}

/** Shared form control surface — dark mode safe */
export const inputCn = cn(
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900",
  "placeholder:text-gray-400 outline-none transition-shadow",
  "focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20",
  "dark:border-slate-600 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder:text-slate-500"
);

export const selectCn = inputCn;

export const labelCn = "block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5";

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h1>
        {subtitle ? (
          <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400 max-w-2xl">{subtitle}</p>
        ) : null}
      </motion.div>
      {children ? <div className="shrink-0">{children}</div> : null}
    </header>
  );
}

export function SurfaceCard({
  className,
  children,
  hoverLift,
  ...p
}: React.HTMLAttributes<HTMLDivElement> & { hoverLift?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hoverLift ? { y: -4 } : undefined}
      className={cn(
        "rounded-2xl border border-gray-100/80 bg-white shadow-sm shadow-gray-200/40",
        "dark:border-slate-700/80 dark:bg-slate-900/85 dark:shadow-black/40",
        hoverLift && "transition-shadow hover:shadow-lg dark:hover:shadow-black/50",
        className
      )}
      {...p}
    >
      {children}
    </motion.div>
  );
}

export function PrimaryButton({
  className,
  ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold",
        "bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-md shadow-rose-600/25",
        "hover:from-rose-500 hover:to-rose-500 disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...p}
    />
  );
}

export function GhostButton({
  className,
  ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800",
        "hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700/80",
        className
      )}
      {...p}
    />
  );
}

/** Page content wrapper with stagger-friendly spacing */
export function PageShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-8 lg:space-y-10", className)}>{children}</div>;
}
