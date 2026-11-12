"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/format";
export default function NewsletterForm({ dark = false, onDone }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    setState("loading");
    try {
      await api("/newsletter", { method: "POST", body: JSON.stringify({ email }) });
      setState("done");
      onDone?.();
    } catch (err) {
      setState("error");
      setError(err instanceof ApiError ? err.details?.email || err.message : "Please try again");
    }
  }
  if (state === "done") {
    return <p className={cn("text-sm font-medium", dark ? "text-white" : "text-mint")}>Thanks for subscribing! 🎂</p>;
  }
  return (
    <form onSubmit={submit} className="w-full">
      <div
        className={cn("flex overflow-hidden rounded-full border", dark ? "border-white/30" : "border-line bg-white")}
      >
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className={cn(
            "min-w-0 flex-1 bg-transparent px-5 py-3 text-base outline-none sm:text-sm",
            dark ? "text-white placeholder:text-white/60" : "text-ink placeholder:text-ink-muted",
          )}
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="m-1 flex items-center gap-1 rounded-full bg-brand px-4 text-xs font-medium uppercase tracking-wider text-white transition hover:bg-ink disabled:opacity-60"
          aria-label="Subscribe"
        >
          <span className="hidden sm:inline">Subscribe</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      {state === "error" && <p className="field-error pl-4">{error}</p>}
    </form>
  );
}
