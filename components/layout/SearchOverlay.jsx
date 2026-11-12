"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useUi } from "@/store/ui";
import { api } from "@/lib/api";
import { money } from "@/lib/format";
export default function SearchOverlay() {
  const open = useUi((s) => s.searchOpen);
  const setOpen = useUi((s) => s.setSearchOpen);
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      api(`/products?q=${encodeURIComponent(term)}`)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);
  if (!open) return null;
  const close = () => setOpen(false);
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Search">
      <div className="absolute inset-0 animate-fade-in bg-ink/40" onClick={close} />
      <div className="relative animate-fade-up bg-white py-8 shadow-card">
        <div className="container max-w-3xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!q.trim()) return;
              close();
              router.push(`/search?q=${encodeURIComponent(q.trim())}`);
            }}
            className="flex items-center gap-3 border-b-2 border-ink pb-3"
          >
            <Search className="h-5 w-5 text-ink" />
            <label htmlFor="site-search" className="sr-only">
              Search cakes
            </label>
            <input
              id="site-search"
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for cakes…"
              className="flex-1 bg-transparent text-xl text-ink outline-none placeholder:text-ink-muted"
            />
            <button type="button" onClick={close} aria-label="Close search" className="rounded-full p-2 hover:bg-mist">
              <X className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            {loading && <p className="py-3 text-sm text-ink-muted">Searching…</p>}
            {!loading && q.trim().length >= 2 && results.length === 0 && (
              <p className="py-3 text-sm text-ink-muted">No cakes found for “{q}”.</p>
            )}
            <ul className="divide-y divide-line">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/product/${p.slug}`}
                    onClick={close}
                    className="flex items-center gap-4 py-3 hover:text-brand"
                  >
                    <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-cream">
                      {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="56px" className="object-cover" />}
                    </span>
                    <span className="flex-1 font-heading font-medium text-ink">{p.name}</span>
                    <span className="text-sm">{money(p.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
            {!q && (
              <div className="flex flex-wrap gap-2 pt-2 text-sm">
                <span className="text-ink-muted">Popular:</span>
                {["Chocolate", "Red Velvet", "Cheesecake", "Birthday"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setQ(t)}
                    className="rounded-full bg-cream px-3 py-1 hover:bg-blush hover:text-brand"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
