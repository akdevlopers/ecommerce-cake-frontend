"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Check, Home, Loader2, Pencil, Plus, Sparkles, Trash2, X } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { adminApi } from "@/lib/admin";
import { cn } from "@/lib/format";
import { useUi } from "@/store/ui";

const HIGHLIGHT_COLORS = ["#E31C79", "#2BBEA1", "#F59E0B", "#3B82F6", "#8B5CF6", "#121212"];

export default function HighlightsPage() {
  const toast = useUi((s) => s.toast);
  const [list, setList] = useState(null);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState(null); // { id?, name, color, showOnHome }
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    adminApi("/highlights")
      .then(setList)
      .catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  const replace = (h) => setList((l) => l.map((x) => (x.id === h.id ? { ...x, ...h } : x)));

  async function save() {
    const name = editor.name.trim();
    if (!name) return;
    setBusy(true);
    try {
      const body = JSON.stringify({ name, color: editor.color, showOnHome: editor.showOnHome });
      if (editor.id) {
        replace(await adminApi(`/highlights/${editor.id}`, { method: "PUT", body }));
        toast("Highlight saved");
      } else {
        const h = await adminApi("/highlights", { method: "POST", body });
        setList((l) => [...l, h]);
        toast(`“${h.name}” created`);
      }
      setEditor(null);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function toggleHome(h) {
    replace({ ...h, showOnHome: !h.showOnHome });
    try {
      replace(
        await adminApi(`/highlights/${h.id}`, {
          method: "PUT",
          body: JSON.stringify({ name: h.name, color: h.color, showOnHome: !h.showOnHome }),
        }),
      );
    } catch (e) {
      replace(h);
      toast(e.message, "error");
    }
  }

  async function move(i, dir) {
    const next = [...list];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setList(next);
    try {
      await adminApi("/highlights/order", { method: "PUT", body: JSON.stringify({ ids: next.map((h) => h.id) }) });
    } catch (e) {
      toast(e.message, "error");
      load();
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await adminApi(`/highlights/${confirm.id}`, { method: "DELETE" });
      setList((l) => l.filter((x) => x.id !== confirm.id));
      toast(`“${confirm.name}” deleted`);
      setConfirm(null);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  }

  if (error) return <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>;
  if (!list) return <div className="h-96 animate-pulse rounded-2xl bg-white" />;

  return (
    <>
      <AdminPageHeader
        title="Highlights"
        subtitle="Badges like Bestseller, New or Trending. Switch “Home page tab” on to show one as a tab on the home page."
      >
        <button
          type="button"
          onClick={() => setEditor({ name: "", color: HIGHLIGHT_COLORS[0], showOnHome: true })}
          className="btn-brand btn-sm"
        >
          <Plus className="h-4 w-4" /> Add highlight
        </button>
      </AdminPageHeader>

      {/* How it works */}
      <ol className="mb-6 grid gap-3 text-sm sm:grid-cols-3">
        {[
          ["Create a highlight", "Name + colour, e.g. “Trending”."],
          ["Turn on “Home page tab”", "Choose which highlights appear as home page tabs."],
          ["Tick it on products", "In Products → Edit → Highlights. Tabs appear once a product uses them."],
        ].map(([t, d], i) => (
          <li key={t} className="flex gap-3 rounded-2xl bg-white p-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-light text-sm font-semibold text-brand">
              {i + 1}
            </span>
            <span>
              <span className="block font-medium text-ink">{t}</span>
              <span className="text-xs text-ink-muted">{d}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream text-left text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="w-12 px-3 py-3" />
                <th className="px-5 py-3 font-medium">Highlight</th>
                <th className="whitespace-nowrap px-5 py-3 font-medium">Products</th>
                <th className="whitespace-nowrap px-5 py-3 font-medium">Home page tab</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((h, i) => (
                <tr key={h.id} className="hover:bg-cream/50">
                  <td className="px-3 py-3">
                    <div className="flex flex-col items-center text-ink-muted">
                      <button
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        className="rounded p-0.5 hover:text-ink disabled:invisible"
                        aria-label={`Move ${h.name} up`}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => move(i, 1)}
                        disabled={i === list.length - 1}
                        className="rounded p-0.5 hover:text-ink disabled:invisible"
                        aria-label={`Move ${h.name} down`}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge name={h.name} color={h.color} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    {h.productCount ? (
                      `${h.productCount} product${h.productCount === 1 ? "" : "s"}`
                    ) : (
                      <span className="text-ink-muted">None yet</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Switch checked={h.showOnHome} onChange={() => toggleHome(h)} label={`${h.name} home page tab`} />
                      <HomeStatus h={h} />
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setEditor({ id: h.id, name: h.name, color: h.color, showOnHome: h.showOnHome })}
                        className="rounded-lg p-2 hover:bg-blush hover:text-brand"
                        aria-label={`Edit ${h.name}`}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setConfirm(h)}
                        className="rounded-lg p-2 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Delete ${h.name}`}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!list.length && (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blush text-brand">
                        <Sparkles className="h-6 w-6" />
                      </span>
                      <p>No highlights yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editor && <EditorModal editor={editor} setEditor={setEditor} onSave={save} busy={busy} />}

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/40" onClick={() => !busy && setConfirm(null)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6">
            <h2 className="text-xl">Delete “{confirm.name}”?</h2>
            <p className="mt-2 text-sm">
              {confirm.productCount
                ? `It will be removed from ${confirm.productCount} product(s)${confirm.showOnHome ? " and from the home page tabs" : ""}.`
                : "It isn't used by any product."}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button className="btn-outline btn-sm" onClick={() => setConfirm(null)} disabled={busy}>
                Cancel
              </button>
              <button className="btn btn-sm bg-red-600 text-white hover:bg-red-700" onClick={remove} disabled={busy}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Explains whether the tab is actually visible on the home page right now. */
function HomeStatus({ h }) {
  if (!h.showOnHome) return <span className="text-xs text-ink-muted">Off</span>;
  if (!h.productCount)
    return (
      <span className="text-xs text-amber-700">
        On — appears once a product uses it
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-mint">
      <Home className="h-3.5 w-3.5" /> Showing on home page
    </span>
  );
}

function Badge({ name, color }) {
  return (
    <span
      className="inline-flex max-w-[180px] truncate rounded-full px-3 py-1 text-xs font-semibold text-white"
      style={{ background: color }}
    >
      {name || "Preview"}
    </span>
  );
}

function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn("relative inline-flex h-6 w-11 shrink-0 rounded-full transition", checked ? "bg-mint" : "bg-mist")}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
          checked ? "left-[22px]" : "left-0.5",
        )}
      />
    </button>
  );
}

function EditorModal({ editor, setEditor, onSave, busy }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/40" onClick={() => !busy && setEditor(null)} />
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl">{editor.id ? "Edit highlight" : "Add highlight"}</h2>
          <button onClick={() => setEditor(null)} className="rounded-full p-1.5 hover:bg-mist" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="block">
          <span className="label">Name</span>
          <input
            className="input"
            value={editor.name}
            maxLength={30}
            autoFocus
            onChange={(e) => setEditor((x) => ({ ...x, name: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && onSave()}
            placeholder="e.g. Trending, New, Eid Special"
          />
        </label>

        <div className="mt-4">
          <span className="label">Colour</span>
          <div className="flex items-center gap-2.5">
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setEditor((x) => ({ ...x, color: c }))}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition",
                  editor.color.toLowerCase() === c.toLowerCase() && "ring-2 ring-ink ring-offset-2",
                )}
                style={{ background: c }}
                aria-label={`Colour ${c}`}
              >
                {editor.color.toLowerCase() === c.toLowerCase() && <Check className="h-4 w-4 text-white" />}
              </button>
            ))}
            <input
              type="color"
              value={editor.color}
              onChange={(e) => setEditor((x) => ({ ...x, color: e.target.value }))}
              className="h-8 w-8 cursor-pointer rounded-full border border-line bg-white p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none"
              title="Custom colour"
              aria-label="Custom colour"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3">
          <span>
            <span className="block text-sm font-medium text-ink">Home page tab</span>
            <span className="text-xs text-ink-muted">Show as a tab in “Our Signature Cakes”</span>
          </span>
          <Switch
            checked={editor.showOnHome}
            onChange={() => setEditor((x) => ({ ...x, showOnHome: !x.showOnHome }))}
            label="Home page tab"
          />
        </div>

        <div className="mt-5">
          <span className="label">Preview</span>
          <Badge name={editor.name.trim()} color={editor.color} />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-outline btn-sm" onClick={() => setEditor(null)} disabled={busy}>
            Cancel
          </button>
          <button className="btn-brand btn-sm" onClick={onSave} disabled={busy || !editor.name.trim()}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {editor.id ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
