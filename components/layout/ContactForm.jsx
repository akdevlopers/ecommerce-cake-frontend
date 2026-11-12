"use client";
import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { api, ApiError } from "@/lib/api";
const empty = { name: "", email: "", phone: "", message: "" };
export default function ContactForm() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  async function submit(e) {
    e.preventDefault();
    setState("loading");
    setErrors({});
    setError("");
    try {
      await api("/contact", { method: "POST", body: JSON.stringify(form) });
      setState("sent");
      setForm(empty);
    } catch (err) {
      setState("idle");
      if (err instanceof ApiError) {
        setErrors(err.details || {});
        setError(err.message);
      } else setError("Could not send your message");
    }
  }
  if (state === "sent") {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-mint" />
        <h3 className="text-2xl">Message sent!</h3>
        <p>Thank you — we&apos;ll get back to you shortly.</p>
        <button onClick={() => setState("idle")} className="btn-outline btn-sm mt-2">
          Send another
        </button>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
      <h3 className="text-2xl sm:col-span-2">Send a message</h3>
      <label>
        <span className="label">Name</span>
        <input className="input" value={form.name} onChange={set("name")} required autoComplete="name" />
        {errors.name && <span className="field-error block">{errors.name}</span>}
      </label>
      <label>
        <span className="label">Email</span>
        <input
          className="input"
          type="email"
          value={form.email}
          onChange={set("email")}
          required
          autoComplete="email"
        />
        {errors.email && <span className="field-error block">{errors.email}</span>}
      </label>
      <label className="sm:col-span-2">
        <span className="label">Phone (optional)</span>
        <input className="input" value={form.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" />
      </label>
      <label className="sm:col-span-2">
        <span className="label">Message</span>
        <textarea className="input min-h-[140px]" value={form.message} onChange={set("message")} required />
        {errors.message && <span className="field-error block">{errors.message}</span>}
      </label>
      {error && !Object.keys(errors).length && <p className="field-error sm:col-span-2">{error}</p>}
      <button className="btn-dark sm:col-span-2 sm:justify-self-start" disabled={state === "loading"}>
        {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send message
      </button>
    </form>
  );
}
