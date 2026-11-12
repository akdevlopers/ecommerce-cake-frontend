"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CheckCircle2, Info, MessageCircle, X, XCircle } from "lucide-react";
import { useUi } from "@/store/ui";
import { useSettings } from "./SettingsProvider";
import NewsletterForm from "./NewsletterForm";
import { u } from "@/lib/site";
import { cn } from "@/lib/format";
const POPUP_KEY = "humuzzdesserts-newsletter-dismissed";
/** Newsletter popup, shown once per browser after a short delay. */
export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = !!localStorage.getItem(POPUP_KEY);
    } catch {
      dismissed = true;
    }
    if (dismissed) return;
    const t = setTimeout(() => setOpen(true), 8000);
    return () => clearTimeout(t);
  }, []);
  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(POPUP_KEY, "1");
    } catch {}
  };
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Newsletter"
    >
      <div className="absolute inset-0 animate-fade-in bg-ink/50" onClick={close} />
      <div className="relative grid w-full max-w-3xl animate-fade-up overflow-hidden rounded-3xl bg-white sm:grid-cols-2">
        <button
          onClick={close}
          className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 shadow-soft"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="relative hidden min-h-[360px] sm:block">
          <Image src={u("1519869325930-281384150729", 700, 800)} alt="" fill sizes="400px" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center p-8 text-center sm:text-left">
          <p className="eyebrow">Sign up for emails</p>
          <h2 className="mb-3 mt-2 text-3xl leading-tight">Be the first to taste what&apos;s new</h2>
          <p className="mb-6 text-sm">
            Subscribe for new flavours, seasonal specials and members-only offers, straight to your inbox.
          </p>
          <NewsletterForm onDone={() => setTimeout(close, 1800)} />
          <button onClick={close} className="mt-4 text-xs text-ink-muted underline">
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
export function Toaster() {
  const toasts = useUi((s) => s.toasts);
  const dismiss = useUi((s) => s.dismissToast);
  return (
    <div
      className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const Icon = t.tone === "error" ? XCircle : t.tone === "info" ? Info : CheckCircle2;
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex animate-fade-up items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-white shadow-card"
          >
            <Icon
              className={cn(
                "h-5 w-5 shrink-0",
                t.tone === "error" ? "text-red-400" : t.tone === "info" ? "text-white" : "text-mint",
              )}
            />
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss">
              <X className="h-4 w-4 opacity-70" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
export function WhatsAppButton() {
  const { whatsapp } = useSettings();
  if (!whatsapp) return null;
  return (
    <a
      href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hi! I'd like to know more about your cakes.")}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-card transition hover:scale-105"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
