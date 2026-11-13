"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  ExternalLink,
  ImagePlus,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { adminApi, dataUrlToUploadPayload, fileToUploadPayload, toPaise, toRupees } from "@/lib/admin";
import { cn } from "@/lib/format";
import { useUi } from "@/store/ui";
import HighlightsCard from "./HighlightsCard";

const MAX_IMAGES = 5;
const MAX_OPTIONS = 3;
const MAX_VARIANTS = 100;

let uidSeq = 0;
const uid = () => `o${++uidSeq}`;

/** Options that have values and therefore make variants. */
const readyOptions = (options) => options.filter((o) => o.values.length);

/** Every combination of the option values, e.g. Red / 1 kg, Red / 2 kg, Blue / 1 kg … */
function combinations(options) {
  return readyOptions(options).reduce(
    (acc, o) => acc.flatMap((combo) => o.values.map((v) => ({ ...combo, [o.uid]: v }))),
    [{}],
  );
}

const variantKey = (values) =>
  Object.keys(values)
    .sort()
    .map((k) => `${k}=${values[k]}`)
    .join("|");

/**
 * Rebuilds the variant list after the options change. Existing rows keep their price,
 * stock and photo; a new combination copies them from the row it grew out of (so adding
 * "Colour" to a cake with sizes keeps the size prices).
 */
function syncVariants(options, previous) {
  const claimed = new Set();
  return combinations(options).map((values) => {
    const exact = previous.find((v) => variantKey(v.values) === variantKey(values));
    const source =
      exact ||
      previous.find((v) => Object.keys(v.values).every((k) => !(k in values) || values[k] === v.values[k]));
    const row = source ? { ...source, values } : { values, price: "", comparePrice: "", image: "", inStock: true };
    // A saved variant id can only belong to one row.
    if (row.id && claimed.has(row.id)) delete row.id;
    if (row.id) claimed.add(row.id);
    return row;
  });
}

const variantName = (options, values) =>
  readyOptions(options)
    .map((o) => values[o.uid])
    .join(" / ");

/** Friendly message for a failed upload (timeouts and crashes come back without a JSON body). */
function uploadError(e) {
  if (e?.status === 0) return "Upload failed: could not reach the server. Please try again.";
  if (e?.status >= 500 || e?.code === "UNKNOWN") return "Upload failed on the server. Please try again in a moment.";
  return e?.message || "Upload failed";
}

/**
 * Admin preview. A plain <img> (not next/image) so any stored link previews, and a
 * link that no longer works shows "Broken" instead of an empty box.
 */
function Thumb({ src }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-red-50 p-2 text-center text-[11px] text-red-700">
        <span className="font-semibold">Broken</span>
        <span className="line-clamp-2 break-all opacity-70">{src}</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" onError={() => setBroken(true)} />;
}

const emptyVariant = () => ({ values: {}, price: "", comparePrice: "", image: "", inStock: true });

const blank = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  ingredients: "",
  active: true,
  inStock: true,
  highlightIds: [],
  options: [],
  variants: [emptyVariant()],
  images: [],
};

function fromProduct(p) {
  const options = (p.options || []).map((o) => ({ uid: uid(), name: o.name, values: [...o.values] }));
  const uidByName = Object.fromEntries(options.map((o) => [o.name, o.uid]));
  const variants = (p.variants || []).map((v) => ({
    id: v.id,
    values: Object.fromEntries(
      Object.entries(v.options || {})
        .filter(([name]) => uidByName[name])
        .map(([name, val]) => [uidByName[name], val]),
    ),
    price: toRupees(v.price),
    comparePrice: toRupees(v.comparePrice),
    image: v.image || "",
    inStock: v.inStock,
  }));
  return {
    name: p.name,
    slug: p.slug,
    shortDescription: p.shortDescription,
    description: p.description,
    ingredients: p.ingredients,
    active: p.active,
    inStock: p.stockSwitch ?? p.inStock,
    highlightIds: (p.highlights || []).map((h) => h.id),
    options,
    // Re-sync so the rows always match the options exactly.
    variants: syncVariants(options, variants.length ? variants : [emptyVariant()]),
    images: p.images,
  };
}

export default function ProductForm({ product }) {
  const router = useRouter();
  const toast = useUi((s) => s.toast);
  const [form, setForm] = useState(() => (product ? fromProduct(product) : blank));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [bulk, setBulk] = useState({ price: "", comparePrice: "" });
  const [master, setMaster] = useState(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const fileRef = useRef(null);

  // Unsaved-changes tracking: warn before leaving the page with edits.
  const initial = useRef(null);
  if (initial.current === null) initial.current = JSON.stringify(form);
  const dirty = JSON.stringify(form) !== initial.current;
  const savedRef = useRef(false);
  useEffect(() => {
    const warn = (e) => {
      if (dirty && !savedRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  // ---------- options (picked from the Variant Master) ----------
  const loadMaster = useCallback(() => {
    setMaster(null);
    adminApi("/variant-types")
      .then(setMaster)
      .catch(() => setMaster([]));
  }, []);
  useEffect(loadMaster, [loadMaster]);

  const masterOf = (name) => master?.find((t) => t.name.toLowerCase() === name.toLowerCase());
  /** All values to offer for an option: the master's, plus any older ones the product still has. */
  const choicesOf = (o) => {
    const fromMaster = masterOf(o.name)?.values || [];
    const extra = o.values.filter((v) => !fromMaster.some((m) => m.value === v)).map((v) => ({ value: v }));
    return [...fromMaster, ...extra];
  };
  const updateOptions = (fn) =>
    setForm((f) => {
      const options = fn(f.options);
      return { ...f, options, variants: syncVariants(options, f.variants) };
    });
  const addOption = (typeId) => {
    const t = master?.find((x) => String(x.id) === String(typeId));
    if (!t) return;
    updateOptions((opts) => [...opts, { uid: uid(), name: t.name, values: [] }].slice(0, MAX_OPTIONS));
  };
  const removeOption = (id) => updateOptions((opts) => opts.filter((o) => o.uid !== id));
  /** Ticks or unticks a value; selected values keep the master's order. */
  const toggleValue = (o, value) => {
    setErrors((x) => ({ ...x, [`opt:${o.uid}`]: "" }));
    const order = choicesOf(o).map((c) => c.value);
    updateOptions((opts) =>
      opts.map((x) => {
        if (x.uid !== o.uid) return x;
        const values = x.values.includes(value) ? x.values.filter((v) => v !== value) : [...x.values, value];
        return { ...x, values: values.sort((a, b) => order.indexOf(a) - order.indexOf(b)) };
      }),
    );
  };
  const setAllValues = (o, on) =>
    updateOptions((opts) =>
      opts.map((x) => (x.uid === o.uid ? { ...x, values: on ? choicesOf(o).map((c) => c.value) : [] } : x)),
    );
  const unusedTypes = (master || []).filter((t) => !form.options.some((o) => o.name.toLowerCase() === t.name.toLowerCase()));

  // ---------- variants ----------
  const setVariant = (i, k, v) => {
    setForm((f) => ({ ...f, variants: f.variants.map((row, idx) => (idx === i ? { ...row, [k]: v } : row)) }));
    setErrors((e) => ({ ...e, [`variants.${i}.${k}`]: "" }));
  };
  const applyBulk = () =>
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v) => ({
        ...v,
        price: bulk.price !== "" ? bulk.price : v.price,
        comparePrice: bulk.comparePrice !== "" ? bulk.comparePrice : v.comparePrice,
      })),
    }));

  // ---------- images ----------
  async function uploadFiles(files) {
    const room = MAX_IMAGES - form.images.length;
    const list = Array.from(files).slice(0, room);
    if (!list.length) {
      toast(`Maximum ${MAX_IMAGES} images`, "error");
      return;
    }
    setUploading(true);
    let failed = 0;
    try {
      for (const file of list) {
        try {
          const payload = await fileToUploadPayload(file);
          const { url } = await adminApi("/uploads", { method: "POST", body: JSON.stringify(payload) });
          setForm((f) => ({ ...f, images: [...f.images, url].slice(0, MAX_IMAGES) }));
          setErrors((e) => ({ ...e, images: "" }));
        } catch (e) {
          failed += 1;
          toast(`${file.name}: ${uploadError(e)}`, "error");
        }
      }
      if (failed && list.length > 1) toast(`${list.length - failed} of ${list.length} images uploaded`, "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  // Pasted links are downloaded by the API and stored in our S3 bucket, so the
  // product never depends on another website's image.
  async function addUrl() {
    let url = urlInput.trim().replace(/^["']|["']$/g, "");
    if (!url) return;
    // A path on this computer can't be fetched by the server: open the file picker instead.
    if (/^(file:|[a-z]:[\\/]|\\\\|\/(users|home)\/)/i.test(url)) {
      toast("That is a file on your computer. Use the Upload box to choose it.", "error");
      fileRef.current?.click();
      return;
    }
    if (/^\/\//.test(url)) url = `https:${url}`;
    else if (!/^(https?:|data:)/i.test(url) && /^[\w-]+(\.[\w-]+)+(\/|$)/.test(url)) url = `https://${url}`;
    if (!/^(https?:\/\/|data:image\/)/i.test(url)) {
      toast("Paste an image link (https://…) or use the Upload box", "error");
      return;
    }
    if (form.images.length >= MAX_IMAGES) {
      toast(`Maximum ${MAX_IMAGES} images`, "error");
      return;
    }
    setUploading(true);
    try {
      // data:image/... links (e.g. copied from Google Images) are uploaded like a file.
      const payload = /^data:/i.test(url) ? await dataUrlToUploadPayload(url) : { url };
      const { url: saved } = await adminApi("/uploads", { method: "POST", body: JSON.stringify(payload) });
      setForm((f) => ({ ...f, images: [...f.images, saved].slice(0, MAX_IMAGES) }));
      setErrors((e) => ({ ...e, images: "" }));
      setUrlInput("");
    } catch (e) {
      toast(uploadError(e), "error");
    } finally {
      setUploading(false);
    }
  }

  const moveImage = (i, dir) => {
    const imgs = [...form.images];
    const j = i + dir;
    if (j < 0 || j >= imgs.length) return;
    [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
    set("images", imgs);
  };

  // ---------- save ----------
  const ready = readyOptions(form.options);
  const hasOptions = ready.length > 0;
  const tooMany = form.variants.length > MAX_VARIANTS;

  async function submit(e) {
    e.preventDefault();
    // Client-side check (the server checks everything again).
    const local = {};
    form.options.forEach((o) => {
      if (!o.values.length) local[`opt:${o.uid}`] = `Tick at least one ${o.name} value, or remove ${o.name}`;
    });
    if (Object.keys(local).length) {
      setErrors(local);
      toast("Please check the options", "error");
      return;
    }

    setSaving(true);
    setErrors({});
    const payload = {
      name: form.name,
      slug: form.slug.trim().toLowerCase(),
      shortDescription: form.shortDescription,
      description: form.description,
      ingredients: form.ingredients,
      active: form.active,
      inStock: form.inStock,
      highlightIds: form.highlightIds,
      options: ready.map((o) => ({ name: o.name.trim(), values: o.values })),
      variants: form.variants.map((v) => ({
        id: v.id,
        options: Object.fromEntries(ready.map((o) => [o.name.trim(), v.values[o.uid]])),
        price: toPaise(v.price),
        comparePrice: v.comparePrice ? toPaise(v.comparePrice) : null,
        image: v.image && form.images.includes(v.image) ? v.image : null,
        inStock: v.inStock,
      })),
      images: form.images,
    };
    try {
      if (product) {
        await adminApi(`/products/${product.id}`, { method: "PUT", body: JSON.stringify(payload) });
        toast("Product saved");
      } else {
        await adminApi("/products", { method: "POST", body: JSON.stringify(payload) });
        toast("Product created");
      }
      savedRef.current = true;
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      // Server errors for options come back by position; show them on the right option.
      const mapped = {};
      for (const [k, msg] of Object.entries(err.details || {})) {
        const m = k.match(/^options\.(\d+)/);
        const key = m && ready[Number(m[1])] ? `opt:${ready[Number(m[1])].uid}` : k;
        if (!mapped[key]) mapped[key] = msg;
      }
      setErrors(mapped);
      toast(err.message, "error");
      setSaving(false);
    }
  }

  const variantErr = (i, k) => errors[`variants.${i}.${k}`];
  const rowError = (i) =>
    Object.entries(errors).find(([k]) => k.startsWith(`variants.${i}.`) && !/\.(price|comparePrice)$/.test(k))?.[1];
  const generalVariantError = errors.variants || errors.options;
  const errorList = [...new Set(Object.values(errors).filter(Boolean))];

  // Summary for the variants card header.
  const available = form.variants.filter((v) => v.inStock);
  const prices = form.variants.map((v) => Number(v.price)).filter((n) => n > 0);
  const fromPrice = prices.length ? Math.min(...prices) : null;
  const missingPrices = form.variants.filter((v) => !(Number(v.price) > 0)).length;

  return (
    <form onSubmit={submit} noValidate>
      {errorList.length > 0 && (
        <div className="mb-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Please fix the following before saving:</p>
            <ul className="mt-1 list-disc pl-5">
              {errorList.slice(0, 6).map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {/* 1. Details */}
          <Card step={1} title="Product details" subtitle="What customers see on the product page.">
            <div className="space-y-4">
              <Field label="Product name" required error={errors.name}>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Belgian Chocolate Truffle"
                />
              </Field>
              <Field
                label="Short description"
                error={errors.shortDescription}
                hint={`Shown next to the price. ${form.shortDescription.length}/300`}
              >
                <input
                  className="input"
                  maxLength={300}
                  value={form.shortDescription}
                  onChange={(e) => set("shortDescription", e.target.value)}
                  placeholder="One line about this product"
                />
              </Field>
              <Field label="Full description" error={errors.description} hint="Shown in the Description tab.">
                <textarea
                  className="input min-h-[120px]"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </Field>
              <Field label="Ingredients & allergens" error={errors.ingredients} hint="Shown in the Ingredients tab.">
                <textarea
                  className="input min-h-[80px]"
                  value={form.ingredients}
                  onChange={(e) => set("ingredients", e.target.value)}
                />
              </Field>
            </div>
          </Card>

          {/* 2. Photos */}
          <Card
            step={2}
            title="Photos"
            subtitle={`${form.images.length} of ${MAX_IMAGES} · the first photo is the main one`}
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {form.images.map((src, i) => (
                <div key={src + i} className="group relative aspect-square overflow-hidden rounded-xl bg-cream">
                  <Thumb src={src} />
                  <span
                    className={cn(
                      "absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium",
                      i === 0 ? "bg-brand text-white" : "bg-white/90 text-ink",
                    )}
                  >
                    {i === 0 ? "Main" : `Photo ${i + 1}`}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-gradient-to-t from-ink/60 to-transparent p-1.5">
                    <IconBtn onClick={() => moveImage(i, -1)} disabled={i === 0} label="Move left">
                      <ArrowUp className="h-3.5 w-3.5 -rotate-90" />
                    </IconBtn>
                    <IconBtn onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} label="Move right">
                      <ArrowDown className="h-3.5 w-3.5 -rotate-90" />
                    </IconBtn>
                    <IconBtn onClick={() => set("images", form.images.filter((_, idx) => idx !== i))} label="Remove photo">
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconBtn>
                  </div>
                </div>
              ))}
              {form.images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line text-sm text-ink-muted transition hover:border-brand hover:bg-blush/40 hover:text-brand"
                >
                  {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
                  {uploading ? "Uploading…" : "Upload photo"}
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              hidden
              onChange={(e) => e.target.files && uploadFiles(e.target.files)}
            />
            {form.images.length < MAX_IMAGES && (
              <div className="mt-4 flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                  <input
                    className="input pl-9"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="…or paste an image link"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addUrl();
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={addUrl}
                  disabled={uploading || !urlInput.trim()}
                  className="btn-outline btn-sm disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            )}
            {errors.images && <p className="field-error">{errors.images}</p>}
            <p className="mt-2 text-xs text-ink-muted">
              JPG, PNG or WEBP · square photos look best · use the arrows to change the order.
            </p>
          </Card>

          {/* 3. Variants & prices */}
          <Card
            step={3}
            title="Variants & prices"
            subtitle={
              hasOptions
                ? `${form.variants.length} variant(s) · ${available.length} available${
                    fromPrice ? ` · from ₹${fromPrice}` : ""
                  }`
                : "Sold in one version? Just enter the price. Sold in sizes, colours…? Add a variant type."
            }
            action={
              <Link href="/admin/variants" target="_blank" className="text-xs font-medium text-brand hover:underline">
                Manage Variant Master ↗
              </Link>
            }
          >
            {/* a. variant types */}
            <div className="space-y-3">
              {form.options.map((o) => {
                const err = errors[`opt:${o.uid}`];
                const choices = choicesOf(o);
                return (
                  <div key={o.uid} className={cn("rounded-2xl border p-4", err ? "border-red-300" : "border-line")}>
                    <div className="mb-3 flex items-center gap-2">
                      <h3 className="flex-1 text-[15px] font-medium text-ink">
                        {o.name}
                        <span className="ml-2 text-xs font-normal text-ink-muted">
                          {o.values.length} of {choices.length} selected
                        </span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setAllValues(o, o.values.length !== choices.length)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-brand hover:bg-blush"
                      >
                        {o.values.length === choices.length ? "Clear all" : "Select all"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeOption(o.uid)}
                        className="rounded-lg p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-600"
                        title={`Remove ${o.name} from this product`}
                        aria-label={`Remove ${o.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {choices.map((c) => {
                        const on = o.values.includes(c.value);
                        return (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => toggleValue(o, c.value)}
                            aria-pressed={on}
                            className={cn(
                              "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition",
                              on
                                ? "border-brand bg-brand-light font-medium text-brand"
                                : "border-line bg-white text-ink-soft hover:border-ink-muted",
                            )}
                          >
                            <span
                              className={cn(
                                "flex h-4 w-4 items-center justify-center rounded border",
                                on ? "border-brand bg-brand text-white" : "border-line bg-white",
                              )}
                            >
                              {on && <Check className="h-3 w-3" strokeWidth={3} />}
                            </span>
                            {c.colorHex && (
                              <span
                                className="h-3.5 w-3.5 rounded-full border border-black/10"
                                style={{ background: c.colorHex }}
                              />
                            )}
                            {c.value}
                          </button>
                        );
                      })}
                      {!choices.length && (
                        <p className="text-sm text-ink-muted">
                          No {o.name} values yet.{" "}
                          <Link href="/admin/variants" target="_blank" className="text-brand underline">
                            Add them in Variant Master
                          </Link>
                          , then{" "}
                          <button type="button" onClick={loadMaster} className="text-brand underline">
                            reload
                          </button>
                          .
                        </p>
                      )}
                    </div>
                    {err && <p className="field-error">{err}</p>}
                  </div>
                );
              })}

              {form.options.length < MAX_OPTIONS && (
                <div className="flex flex-wrap items-center gap-2">
                  {master === null ? (
                    <span className="flex items-center gap-2 text-sm text-ink-muted">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading variant types…
                    </span>
                  ) : master.length === 0 ? (
                    <p className="text-sm text-ink-muted">
                      No variant types yet.{" "}
                      <Link href="/admin/variants/new" target="_blank" className="text-brand underline">
                        Create one (e.g. Size)
                      </Link>{" "}
                      then{" "}
                      <button type="button" onClick={loadMaster} className="text-brand underline">
                        reload
                      </button>
                      .
                    </p>
                  ) : (
                    <>
                      {unusedTypes.length > 0 && <span className="text-sm text-ink-soft">Add variant type:</span>}
                      {unusedTypes.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => addOption(t.id)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-ink-muted/50 px-3.5 py-1.5 text-sm text-ink transition hover:border-brand hover:bg-blush hover:text-brand"
                        >
                          <Plus className="h-3.5 w-3.5" /> {t.name}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={loadMaster}
                        className="rounded-lg p-1.5 text-ink-muted hover:bg-blush hover:text-brand"
                        title="Reload variant types"
                        aria-label="Reload variant types"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* b. prices */}
            <div className="mt-6 border-t border-line pt-5">
              {!hasOptions ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Price (₹)" required error={variantErr(0, "price")}>
                    <RupeeInput value={form.variants[0]?.price ?? ""} onChange={(v) => setVariant(0, "price", v)} />
                  </Field>
                  <Field
                    label="MRP (₹)"
                    error={variantErr(0, "comparePrice")}
                    hint="Optional. Higher than price shows a sale badge."
                  >
                    <RupeeInput
                      value={form.variants[0]?.comparePrice ?? ""}
                      onChange={(v) => setVariant(0, "comparePrice", v)}
                    />
                  </Field>
                </div>
              ) : (
                <>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-[15px] font-medium text-ink">Price for each variant</h3>
                    {form.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setBulkOpen((o) => !o)}
                        className="text-xs font-medium text-brand hover:underline"
                      >
                        {bulkOpen ? "Close" : "Use the same price for all"}
                      </button>
                    )}
                  </div>

                  {bulkOpen && (
                    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl bg-cream p-3">
                      <label className="block w-32 flex-1">
                        <span className="mb-1 block text-xs text-ink-soft">Price (₹)</span>
                        <RupeeInput value={bulk.price} onChange={(v) => setBulk((b) => ({ ...b, price: v }))} small />
                      </label>
                      <label className="block w-32 flex-1">
                        <span className="mb-1 block text-xs text-ink-soft">MRP (₹, optional)</span>
                        <RupeeInput
                          value={bulk.comparePrice}
                          onChange={(v) => setBulk((b) => ({ ...b, comparePrice: v }))}
                          small
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          applyBulk();
                          setBulkOpen(false);
                          setBulk({ price: "", comparePrice: "" });
                        }}
                        disabled={bulk.price === "" && bulk.comparePrice === ""}
                        className="btn-brand btn-sm h-10 disabled:opacity-50"
                      >
                        Apply to {form.variants.length} variants
                      </button>
                    </div>
                  )}

                  <div className="overflow-hidden rounded-2xl border border-line">
                    <div className="hidden grid-cols-[minmax(0,1.3fr)_110px_110px_64px_96px] gap-3 bg-cream px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-ink-muted md:grid">
                      <span>Variant</span>
                      <span>Price ₹</span>
                      <span>MRP ₹</span>
                      <span>Photo</span>
                      <span className="text-right">Available</span>
                    </div>
                    <ul className="divide-y divide-line">
                      {form.variants.map((v, i) => {
                        const name = variantName(form.options, v.values);
                        const err = rowError(i);
                        const off =
                          Number(v.comparePrice) > Number(v.price) && Number(v.price) > 0
                            ? Math.round((1 - Number(v.price) / Number(v.comparePrice)) * 100)
                            : 0;
                        return (
                          <li key={variantKey(v.values)} className={cn("px-4 py-3", !v.inStock && "bg-cream/60")}>
                            <div className="grid grid-cols-2 items-center gap-3 md:grid-cols-[minmax(0,1.3fr)_110px_110px_64px_96px]">
                              <div className="col-span-2 flex items-center gap-2 md:col-span-1">
                                <span className={cn("text-sm font-medium text-ink", !v.inStock && "text-ink-muted")}>
                                  {name}
                                </span>
                                {off > 0 && (
                                  <span className="rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-semibold text-brand">
                                    -{off}%
                                  </span>
                                )}
                                {!v.inStock && (
                                  <span className="rounded-full bg-mist px-2 py-0.5 text-[10px] font-medium text-ink-soft">
                                    Sold out
                                  </span>
                                )}
                              </div>
                              <label className="block">
                                <span className="mb-1 block text-xs text-ink-muted md:hidden">Price ₹</span>
                                <RupeeInput
                                  value={v.price}
                                  onChange={(val) => setVariant(i, "price", val)}
                                  error={!!variantErr(i, "price")}
                                  small
                                  label={`Price of ${name}`}
                                />
                              </label>
                              <label className="block">
                                <span className="mb-1 block text-xs text-ink-muted md:hidden">MRP ₹</span>
                                <RupeeInput
                                  value={v.comparePrice}
                                  onChange={(val) => setVariant(i, "comparePrice", val)}
                                  error={!!variantErr(i, "comparePrice")}
                                  placeholder="—"
                                  small
                                  label={`MRP of ${name}`}
                                />
                              </label>
                              <PhotoPicker
                                images={form.images}
                                value={form.images.includes(v.image) ? v.image : ""}
                                onChange={(src) => setVariant(i, "image", src)}
                                label={name}
                              />
                              <div className="flex justify-end">
                                <Switch
                                  checked={v.inStock}
                                  onChange={(on) => setVariant(i, "inStock", on)}
                                  label={`${name} available`}
                                />
                              </div>
                            </div>
                            {(variantErr(i, "price") || variantErr(i, "comparePrice") || err) && (
                              <p className="field-error">
                                {variantErr(i, "price") || variantErr(i, "comparePrice") || err}
                              </p>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  {missingPrices > 0 && (
                    <p className="mt-2 text-xs text-amber-700">
                      {missingPrices} variant(s) still need a price.
                    </p>
                  )}
                  {tooMany && (
                    <p className="field-error">
                      {form.variants.length} variants — the maximum is {MAX_VARIANTS}. Untick some values.
                    </p>
                  )}
                  <p className="mt-3 text-xs text-ink-muted">
                    MRP is optional — if higher than the price, a sale badge is shown. Photo: which picture to show when a
                    customer picks this variant. Switch off “Available” to show a variant as sold out.
                  </p>
                </>
              )}
              {generalVariantError && <p className="field-error">{generalVariantError}</p>}
            </div>
          </Card>
        </div>

        {/* sidebar */}
        <div className="space-y-6">
          <Card title="Status">
            <Toggle
              label="Show in store"
              hint="Off = hidden from customers"
              checked={form.active}
              onChange={(v) => set("active", v)}
            />
            <Toggle
              label="Available to order"
              hint="Off = whole product shows as sold out"
              checked={form.inStock}
              onChange={(v) => set("inStock", v)}
            />
          </Card>

          <HighlightsCard
            selectedIds={form.highlightIds}
            onSelectedChange={(ids) => set("highlightIds", ids)}
          />

          <Card title="Store link">
            <Field
              label="Web address"
              error={errors.slug}
              hint={form.slug ? undefined : "Leave empty to create it from the name"}
            >
              <div className="flex items-center overflow-hidden rounded-xl border border-line bg-white focus-within:border-ink">
                <span className="shrink-0 bg-cream px-3 py-3 text-xs text-ink-muted">/product/</span>
                <input
                  className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm outline-none"
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  placeholder="auto"
                  aria-label="Web address"
                />
              </div>
            </Field>
          </Card>
        </div>
      </div>

      {/* sticky action bar */}
      <div className="sticky bottom-0 z-30 -mx-4 mt-8 border-t border-line bg-white/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex items-center justify-end gap-3">
          <span className="mr-auto hidden text-sm text-ink-muted sm:block">
            {dirty ? "You have unsaved changes" : "No changes yet"}
          </span>
          <button type="button" onClick={() => router.push("/admin/products")} className="btn-outline btn-sm">
            Cancel
          </button>
          <button type="submit" disabled={saving || uploading || tooMany} className="btn-brand btn-sm min-w-[140px]">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {product ? "Save changes" : "Create product"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Card({ step, title, subtitle, action, children }) {
  return (
    <section className="card p-5 md:p-6">
      <div className="mb-5 flex items-start gap-3">
        {step && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-light text-sm font-semibold text-brand">
            {step}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-lg leading-7">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>}
        </div>
        {action && <div className="pt-1">{action}</div>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, required, error, hint, className, children }) {
  return (
    <label className={cn("block", className)}>
      <span className="label">
        {label}
        {required && <span className="text-brand"> *</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
      {error && <span className="field-error block">{error}</span>}
    </label>
  );
}

function RupeeInput({ value, onChange, placeholder = "0", small, error, label }) {
  return (
    <div
      className={cn(
        "flex items-center overflow-hidden rounded-xl border bg-white focus-within:border-ink",
        error ? "border-red-400" : "border-line",
      )}
    >
      <span className={cn("pl-3 text-ink-muted", small ? "text-sm" : "")}>₹</span>
      <input
        type="number"
        inputMode="numeric"
        min="1"
        step="1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className={cn(
          "w-full min-w-0 bg-transparent px-2 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          small ? "h-10 text-sm" : "h-12",
        )}
      />
    </div>
  );
}

/** Small photo chooser: shows the chosen photo; click to pick another from the product's photos. */
function PhotoPicker({ images, value, onChange, label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  const shown = value || images[0];
  return (
    <div ref={ref} className="relative">
      <span className="mb-1 block text-xs text-ink-muted md:hidden">Photo</span>
      <button
        type="button"
        onClick={() => images.length && setOpen((o) => !o)}
        disabled={!images.length}
        title={images.length ? "Choose photo" : "Upload photos first"}
        aria-label={`Photo for ${label}`}
        className={cn(
          "relative h-10 w-10 overflow-hidden rounded-lg border bg-cream transition hover:border-brand disabled:cursor-not-allowed disabled:opacity-40",
          value ? "border-brand" : "border-line",
        )}
      >
        {shown ? <Thumb src={shown} /> : <ImagePlus className="m-auto h-4 w-4 text-ink-muted" />}
        {!value && shown && <span className="absolute inset-0 bg-white/50" />}
      </button>
      {open && (
        <div className="absolute left-0 top-12 z-40 w-[232px] rounded-2xl border border-line bg-white p-3 shadow-card md:left-auto md:right-0">
          <p className="mb-2 text-xs font-medium text-ink">Photo for {label}</p>
          <div className="grid grid-cols-4 gap-2">
            {images.map((src, n) => (
              <button
                key={src}
                type="button"
                onClick={() => {
                  onChange(src);
                  setOpen(false);
                }}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-lg border-2",
                  value === src ? "border-brand" : "border-transparent hover:border-line",
                )}
                aria-label={`Photo ${n + 1}`}
              >
                <Thumb src={src} />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={cn(
              "mt-2 w-full rounded-lg px-2 py-1.5 text-xs transition",
              !value ? "bg-cream font-medium text-ink" : "text-ink-soft hover:bg-cream",
            )}
          >
            Use main photo
          </button>
        </div>
      )}
    </div>
  );
}

function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
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

function Toggle({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        {hint && <p className="text-xs text-ink-muted">{hint}</p>}
      </div>
      <Switch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

function IconBtn({ onClick, disabled, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-ink hover:bg-brand hover:text-white disabled:opacity-40"
    >
      {children}
    </button>
  );
}
