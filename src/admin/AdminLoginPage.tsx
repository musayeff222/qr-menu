import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...i: (string | boolean | undefined)[]) {
  return twMerge(clsx(i));
}

function Card({
  className,
  children,
  ...p
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900/80 shadow-sm overflow-hidden",
        className
      )}
      {...p}
    >
      {children}
    </div>
  );
}

function Button({
  className,
  ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50",
        className
      )}
      {...p}
    />
  );
}

/** Super Admin girişi — əsas saytda düymə yoxdur; yalnız bu URL ilə. */
export default function AdminLoginPage() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password: password.trim() }),
    });
    const data = await res.json();
    if (data.success && data.token) {
      localStorage.setItem("adminSession", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.user));
      nav("/admin", { replace: true });
    } else setError(data.error || "Login failed");
  };

  return (
    <div className="min-h-screen bg-[var(--mg-paper)] dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 dark:bg-slate-900">
        <div className="text-2xl font-bold text-[var(--mg-brand-strong)] mb-6 flex items-center gap-2 justify-center">
          <ShieldCheck size={28} /> MenuGo Super Admin
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input
            className="w-full min-h-[48px] p-3 border border-[var(--mg-border)] rounded-xl dark:border-slate-600 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--mg-brand)]/25"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="İstifadəçi"
            required
            autoComplete="username"
          />
          <input
            type="password"
            className="w-full min-h-[48px] p-3 border border-[var(--mg-border)] rounded-xl dark:border-slate-600 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--mg-brand)]/25"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifrə"
            required
            autoComplete="current-password"
          />
          {error && <p className="text-[var(--mg-danger)] text-sm">{error}</p>}
          <Button type="submit" className="w-full min-h-[48px] bg-[var(--mg-brand)] text-white py-3 hover:bg-[var(--mg-brand-strong)]">
            Daxil ol
          </Button>
        </form>
      </Card>
    </div>
  );
}
