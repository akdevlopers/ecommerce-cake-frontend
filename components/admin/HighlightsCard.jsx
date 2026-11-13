"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Loader2, Plus, X } from "lucide-react";
import { adminApi } from "@/lib/admin";
import { cn } from "@/lib/format";
import { useUi } from "@/store/ui";

const PRESETS = ["#E31C79", "#2BBEA1", "#F59E0B", "#3B82F6", "#8B5CF6", "#121212"];

/**
 * Product form: choose which highlights (badges) this product has. Renaming, colours,
 * home page tabs and deleting are managed on the Highlights page; "+" quickly adds a new one.
 */
export default function HighlightsCard({ selectedIds, onSelectedChange }) {
  const toast = useUi((s) => s.toast);
  const [list, setList] = useState(null);
  const [draft, setDraft] = useState(null); // { name, color } while adding
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminApi("/highlights")
      .then(setList)
      .catch(() => setList([]));
  }, []);

  const toggle = (id) =>
    onSelectedChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);

  async function create() {
    const name = draft.name.trim();
    if (!name) return;
    setBusy(true);
    try {
      const h = await adminApi("/highlights", {
        method: "POST",
        body: JSON.stringify({ name, color: draft.color, showOnHome: true }),
      });
      setList((l) => [...l, h]);
      onSelectedChange([...selectedIds, h.id]);
      setDraft(null);
      toast(`“${h.name}” added — save the product to apply it`);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card p-5 md:p-6">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-lg">Highlights</h2>
        {!draft && (
          <button
            type="button"
            onClick={() => setDraft({ name: "", color: PRESETS[0] })}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white shadow-soft transition hover:bg-brand-dark"
            title="Add a new highlight"
            aria-label="Add a new highlight"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="mb-4 text-xs text-ink-muted">Tap to add or remove a badge on this product.</p>

      {draft && (
        <div className="mb-4 rounded-2xl border border-line bg-cream p-3">
          <input
            className="input h-10 text-sm"
            value={draft.name}
            maxLength={30}
            autoFocus
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                create();
              }
              if (e.key === "Escape") setDraft(null);
            }}
            placeholder="New highlight, e.g. Trending"
            aria-label="New highlight name"
          />
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex gap-1.5">
              {PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, color: c }))}
                  className={cn("h-6 w-6 rounded-full transition", draft.color === c && "ring-2 ring-ink ring-offset-1")}
                  style={{ background: c }}
                  aria-label={`Colour ${c}`}
                />
              ))}
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-white"
                aria-label="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={create}
                disabled={busy || !draft.name.trim()}
                className="flex h-8 items-center gap-1 rounded-lg bg-brand px-3 text-xs font-medium text-white disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Add
              </button>
            </div>
          </div>
        </div>
      )}

      {list === null ? (
        <p className="flex items-center gap-2 text-xs text-ink-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
        </p>
      ) : list.length ? (
        <div className="flex flex-wrap gap-2">
          {list.map((h) => {
            const on = selectedIds.includes(h.id);
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => toggle(h.id)}
                aria-pressed={on}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition",
                  on ? "text-white" : "bg-white hover:opacity-80",
                )}
                style={on ? { background: h.color, borderColor: h.color } : { borderColor: h.color, color: h.color }}
              >
                {on ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Plus className="h-3.5 w-3.5" />}
                {h.name}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-ink-muted">No highlights yet — use + to create one.</p>
      )}

      <Link href="/admin/highlights" target="_blank" className="mt-4 inline-block text-xs font-medium text-brand hover:underline">
        Manage highlights &amp; home page tabs ↗
      </Link>
    </section>
  );
}
