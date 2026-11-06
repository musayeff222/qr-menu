import React, { useEffect, useId, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Store } from "lucide-react";
import { useI18nBundle } from "../i18n/bundleContext";
import { AuthSplitLayout } from "./AuthSplitLayout";

const USERNAME_TAKEN = "Bu login artıq götürülüb";

export default function RegisterPage() {
  const bundle = useI18nBundle();
  const navigate = useNavigate();
  const [lang, setLang] = useState("az");
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [createdFallback, setCreatedFallback] = useState<string | null>(null);

  const nameId = useId();
  const userId = useId();
  const phoneId = useId();
  const passId = useId();
  const errorRef = useRef<HTMLParagraphElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const userRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then((s: { default_language?: string }) => {
        if (s.default_language) setLang(s.default_language);
      })
      .catch(() => {});
  }, []);

  const t = (key: string) => bundle[lang]?.[key] || bundle.az?.[key] || key;

  const showError = (msg: string, focus?: HTMLInputElement | null) => {
    setError(msg);
    window.requestAnimationFrame(() => {
      focus?.focus();
      errorRef.current?.focus();
    });
  };

  const goNext = () => {
    setError("");
    if (step === 1) {
      if (!fullName.trim()) {
        showError(t("full_name_label"), nameRef.current);
        return;
      }
      if (!username.trim()) {
        showError(t("username"), userRef.current);
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!phone.trim()) {
        showError(t("phone_label"), phoneRef.current);
        return;
      }
      if (!password) {
        showError(t("password"), passRef.current);
        return;
      }
      setStep(3);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (step < 3) {
      goNext();
      return;
    }
    setError("");
    setBusy(true);
    const uname = username.trim().toLowerCase();
    try {
      const res = await fetch("/api/public/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          username: uname,
          password,
          phone: phone.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const raw = String(data.error || "");
        setError(raw === USERNAME_TAKEN ? t("register_username_taken") : raw || t("server_error"));
        setBusy(false);
        if (raw === USERNAME_TAKEN) setStep(1);
        return;
      }

      try {
        const loginRes = await fetch("/api/restaurant/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: uname, password }),
        });
        const loginData = await loginRes.json().catch(() => ({}));
        if (loginRes.ok && loginData.success && loginData.token) {
          localStorage.setItem("restaurantSession", loginData.token);
          localStorage.setItem("restaurantId", String(loginData.restaurantId));
          navigate(`/restaurant/${loginData.restaurantId}/onboarding`, { replace: true });
          return;
        }
      } catch {
        /* auto-login optional */
      }
      setCreatedFallback(uname);
    } catch {
      setError(t("register_network_error"));
    } finally {
      setBusy(false);
    }
  };

  const fieldCls =
    "min-h-[48px] w-full rounded-xl border border-[var(--mg-border)] bg-white px-4 py-3 text-base text-[var(--mg-ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--mg-brand)]/35 focus:border-[var(--mg-brand)]";
  const primaryCls =
    "min-h-[48px] w-full touch-manipulation rounded-xl bg-[var(--mg-brand)] py-3 text-base font-semibold text-white hover:bg-[var(--mg-brand-strong)] disabled:opacity-60";
  const ghostCls =
    "min-h-[48px] flex-1 rounded-xl border border-[var(--mg-border)] bg-white py-3 text-sm font-semibold text-[var(--mg-ink)]";

  if (createdFallback) {
    return (
      <AuthSplitLayout defaultTitle={t("landing_sales_title")} defaultSubtitle={t("register_sub")}>
        <div className="w-full rounded-2xl border border-[var(--mg-border)] bg-white p-6 text-center shadow-xl sm:p-8">
          <p className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--mg-brand-soft)] text-xl font-bold text-[var(--mg-brand-strong)]">
            ✓
          </p>
          <h1 className="text-xl font-bold text-[var(--mg-ink)]">{t("register_success_title")}</h1>
          <p className="mt-2 text-sm text-[var(--mg-muted)]">{t("register_created_login")}</p>
          <Link
            to="/panel"
            state={{ username: createdFallback, registered: true }}
            className={`${primaryCls} mt-6 inline-flex items-center justify-center`}
          >
            {t("login")}
          </Link>
          <Link to="/" className="mt-4 inline-block text-sm text-[var(--mg-brand-strong)] hover:underline">
            ← {t("landing_nav_start")}
          </Link>
        </div>
      </AuthSplitLayout>
    );
  }

  const steps = [
    { n: 1, label: t("register_step_account") },
    { n: 2, label: t("register_step_security") },
    { n: 3, label: t("register_step_confirm") },
  ];

  return (
    <AuthSplitLayout defaultTitle={t("landing_sales_title")} defaultSubtitle={t("register_sub")}>
      <div className="w-full rounded-2xl border border-[var(--mg-border)] bg-white p-5 shadow-xl sm:p-8">
        <div className="mb-1 flex items-center justify-center gap-2 text-xl font-bold text-[var(--mg-brand-strong)]">
          <Store className="shrink-0" size={22} aria-hidden /> {t("register_title")}
        </div>
        <label className="mb-4 flex justify-end">
          <span className="sr-only">{t("language")}</span>
          <select
            aria-label={t("language")}
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="rounded-lg border border-[var(--mg-border)] bg-white px-2 py-1 text-xs font-bold"
          >
            <option value="az">AZ</option>
            <option value="en">EN</option>
            <option value="ru">RU</option>
            <option value="tr">TR</option>
          </select>
        </label>
        <p className="mb-5 text-center text-sm leading-relaxed text-[var(--mg-muted)]">{t("register_sub_profile")}</p>

        <ol className="mb-6 grid grid-cols-3 gap-2" aria-label="Qeydiyyat addımları">
          {steps.map((s) => (
            <li key={s.n} className="min-w-0">
              <div
                className={`h-1.5 rounded-full ${step >= s.n ? "bg-[var(--mg-brand)]" : "bg-[var(--mg-border)]"}`}
                aria-hidden
              />
              <p
                className={`mt-1.5 truncate text-[11px] font-semibold ${
                  step === s.n ? "text-[var(--mg-ink)]" : "text-[var(--mg-muted)]"
                }`}
              >
                {s.n}. {s.label}
              </p>
            </li>
          ))}
        </ol>

        <form onSubmit={submit} className="space-y-4" noValidate>
          {step === 1 && (
            <>
              <div>
                <label htmlFor={nameId} className="mb-1.5 block text-sm font-medium text-[var(--mg-ink)]">
                  {t("full_name_label")}
                </label>
                <input
                  id={nameId}
                  ref={nameRef}
                  className={fieldCls}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  aria-invalid={!!error}
                />
              </div>
              <div>
                <label htmlFor={userId} className="mb-1.5 block text-sm font-medium text-[var(--mg-ink)]">
                  {t("username")}
                </label>
                <input
                  id={userId}
                  ref={userRef}
                  className={fieldCls}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                  aria-invalid={!!error}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label htmlFor={phoneId} className="mb-1.5 block text-sm font-medium text-[var(--mg-ink)]">
                  {t("phone_label")}
                </label>
                <input
                  id={phoneId}
                  ref={phoneRef}
                  className={fieldCls}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  aria-invalid={!!error}
                />
              </div>
              <div>
                <label htmlFor={passId} className="mb-1.5 block text-sm font-medium text-[var(--mg-ink)]">
                  {t("password")}
                </label>
                <div className="relative">
                  <input
                    id={passId}
                    ref={passRef}
                    type={showPassword ? "text" : "password"}
                    className={`${fieldCls} pr-12`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    aria-invalid={!!error}
                    aria-describedby={`${passId}-hint`}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--mg-muted)] hover:text-[var(--mg-ink)]"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? t("register_hide_password") : t("register_show_password")}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p id={`${passId}-hint`} className="mt-1.5 text-xs text-[var(--mg-muted)]">
                  {t("register_password_hint")}
                </p>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-3 rounded-xl border border-[var(--mg-border)] bg-[var(--mg-paper)] p-4 text-sm">
              <p>
                <span className="text-[var(--mg-muted)]">{t("full_name_label")}: </span>
                <strong className="text-[var(--mg-ink)]">{fullName}</strong>
              </p>
              <p>
                <span className="text-[var(--mg-muted)]">{t("username")}: </span>
                <strong className="text-[var(--mg-ink)]">{username.trim().toLowerCase()}</strong>
              </p>
              <p>
                <span className="text-[var(--mg-muted)]">{t("phone_label")}: </span>
                <strong className="text-[var(--mg-ink)]">{phone}</strong>
              </p>
              <p>
                <span className="text-[var(--mg-muted)]">{t("password")}: </span>
                <strong className="tracking-widest text-[var(--mg-ink)]">••••••••</strong>
              </p>
            </div>
          )}

          {error ? (
            <p ref={errorRef} tabIndex={-1} role="alert" aria-live="assertive" className="text-sm text-[var(--mg-danger)]">
              {error}
            </p>
          ) : null}

          {step < 3 ? (
            <div className="flex gap-2">
              {step > 1 ? (
                <button type="button" className={ghostCls} onClick={() => { setError(""); setStep((s) => s - 1); }}>
                  {t("onboarding_back")}
                </button>
              ) : null}
              <button type="button" className={primaryCls} onClick={goNext}>
                {t("onboarding_next")}
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button type="button" className={ghostCls} onClick={() => { setError(""); setStep(2); }}>
                {t("onboarding_back")}
              </button>
              <button type="submit" disabled={busy} className={primaryCls}>
                {busy ? "…" : t("register_create")}
              </button>
            </div>
          )}
        </form>

        <div className="mt-6 space-y-2 text-center text-sm text-[var(--mg-muted)]">
          <p>
            {t("register_have_account")}{" "}
            <Link to="/panel" className="font-medium text-[var(--mg-brand-strong)] hover:underline">
              {t("login")}
            </Link>
          </p>
          <Link to="/" className="block text-[var(--mg-brand-strong)] hover:underline">
            ← {t("landing_nav_start")}
          </Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
