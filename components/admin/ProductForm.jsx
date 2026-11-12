"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Link2, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { adminApi, dataUrlToUploadPayload, fileToUploadPayload, toPaise, toRupees } from "@/lib/admin";
import { cn } from "@/lib/format";
import { useUi } from "@/store/ui";

const MAX_IMAGES = 5;

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

const blank = {
  name: "",
  slug: "",
  categoryId: "",
  shortDescription: "",
  description: "",
  ingredients: "",
  egglessAvailable: true,
  egglessExtra: "50",
  bestSeller: false,
  featured: false,
  active: true,
  inStock: true,
  weights: [
    { label: "500 g", price: "", comparePrice: "" },
    { label: "1 kg", price: "", comparePrice: "" },
  ],
  images: [],
};

function fromProduct(p) {
  return {
    name: p.name,
    slug: p.slug,
    categoryId: p.category?.id ? String(p.category.id) : "",
    shortDescription: p.shortDescription,
    description: p.description,
    ingredients: p.ingredients,
    egglessAvailable: p.egglessAvailable,
    egglessExtra: toRupees(p.egglessExtra),
    bestSeller: p.bestSeller,
    featured: p.featured,
    active: p.active,
    inStock: p.inStock,
    weights: p.weights.map((w) => ({ label: w.label, price: toRupees(w.price), comparePrice: toRupees(w.comparePrice) })),
    images: p.images,
  };
}

export default function ProductForm({ product }) {
  const router = useRouter();
  const toast = useUi((s) => s.toast);
  const [form, setForm] = useState(product ? fromProduct(product) : blank);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    adminApi("/categories")
      .then(setCategories)
      .catch(() => {});
  }, []);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };
  const setWeight = (i, k, v) =>
    setForm((f) => ({ ...f, weights: f.weights.map((w, idx) => (idx === i ? { ...w, [k]: v } : w)) }));

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

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    const payload = {
      name: form.name,
      slug: form.slug.trim().toLowerCase(),
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      shortDescription: form.shortDescription,
      description: form.description,
      ingredients: form.ingredients,
      egglessAvailable: form.egglessAvailable,
      egglessExtra: toPaise(form.egglessExtra),
      bestSeller: form.bestSeller,
      featured: form.featured,
      active: form.active,
      inStock: form.inStock,
      weights: form.weights
        .filter((w) => w.label.trim() || w.price)
        .map((w) => ({
          label: w.label.trim(),
          price: toPaise(w.price),
          comparePrice: w.comparePrice ? toPaise(w.comparePrice) : null,
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
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setErrors(err.details || {});
      toast(err.message, "error");
      setSaving(false);
    }
  }

  const weightError = Object.entries(errors).find(([k]) => k.startsWith("weights"))?.[1];

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_320px]" noValidate>
      <div className="space-y-6">
        <Card title="Basic details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Product name" error={errors.name} className="sm:col-span-2">
              <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </Field>
            <Field label="URL slug (optional)" error={errors.slug} hint="Auto-generated from the name if empty">
              <input
                className="input"
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="belgian-chocolate-truffle"
              />
            </Field>
            <Field label="Category" error={errors.categoryId}>
              <select className="input" value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Short description"
              error={errors.shortDescription}
              className="sm:col-span-2"
              hint="Shown on the product page next to the price"
            >
              <input
                className="input"
                maxLength={300}
                value={form.shortDescription}
                onChange={(e) => set("shortDescription", e.target.value)}
              />
            </Field>
            <Field label="Full description" error={errors.description} className="sm:col-span-2">
              <textarea
                className="input min-h-[120px]"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
            <Field label="Ingredients & allergens" error={errors.ingredients} className="sm:col-span-2">
              <textarea
                className="input min-h-[80px]"
                value={form.ingredients}
                onChange={(e) => set("ingredients", e.target.value)}
              />
            </Field>
          </div>
        </Card>

        <Card title="Sizes & prices (₹)">
          <div className="space-y-3">
            <div className="hidden grid-cols-[1fr_1fr_1fr_40px] gap-3 text-xs font-medium uppercase tracking-wider text-ink-muted sm:grid">
              <span>Size label</span>
              <span>Price</span>
              <span>Compare-at price (optional)</span>
              <span />
            </div>
            {form.weights.map((w, i) => (
              <div key={i} className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_1fr_40px]">
                <input
                  className="input col-span-2 sm:col-span-1"
                  value={w.label}
                  onChange={(e) => setWeight(i, "label", e.target.value)}
                  placeholder="e.g. 1 kg"
                  aria-label="Size label"
                />
                <input
                  className="input"
                  type="number"
                  min="1"
                  step="1"
                  value={w.price}
                  onChange={(e) => setWeight(i, "price", e.target.value)}
                  placeholder="Price"
                  aria-label="Price in rupees"
                />
                <input
                  className="input"
                  type="number"
                  min="1"
                  step="1"
                  value={w.comparePrice}
                  onChange={(e) => setWeight(i, "comparePrice", e.target.value)}
                  placeholder="MRP"
                  aria-label="Compare-at price in rupees"
                />
                <button
                  type="button"
                  disabled={form.weights.length <= 1}
                  onClick={() =>
                    setForm((f) => ({ ...f, weights: f.weights.filter((_, idx) => idx !== i) }))
                  }
                  className="col-span-2 flex items-center justify-center rounded-xl p-2 text-ink-muted hover:bg-red-50 hover:text-red-600 disabled:opacity-30 sm:col-span-1"
                  aria-label="Remove size"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {weightError && <p className="field-error">{weightError}</p>}
            {form.weights.length < 6 && (
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, weights: [...f.weights, { label: "", price: "", comparePrice: "" }] }))
                }
                className="btn-outline btn-sm"
              >
                <Plus className="h-4 w-4" /> Add size
              </button>
            )}
            <p className="text-xs text-ink-muted">
              The first size is the default and its price is shown on product cards. A compare-at price higher than the
              price shows a sale badge.
            </p>
          </div>
        </Card>

        <Card title={`Images (${form.images.length}/${MAX_IMAGES})`}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {form.images.map((src, i) => (
              <div key={src + i} className="group relative aspect-square overflow-hidden rounded-xl bg-cream">
                <Thumb src={src} />
                {i === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-ink px-2 py-0.5 text-[10px] text-white">
                    Main
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-gradient-to-t from-ink/60 to-transparent p-1.5">
                  <IconBtn onClick={() => moveImage(i, -1)} disabled={i === 0} label="Move left">
                    <ArrowUp className="h-3.5 w-3.5 -rotate-90" />
                  </IconBtn>
                  <IconBtn onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} label="Move right">
                    <ArrowDown className="h-3.5 w-3.5 -rotate-90" />
                  </IconBtn>
                  <IconBtn onClick={() => set("images", form.images.filter((_, idx) => idx !== i))} label="Remove image">
                    <X className="h-3.5 w-3.5" />
                  </IconBtn>
                </div>
              </div>
            ))}
            {form.images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line text-sm text-ink-muted transition hover:border-brand hover:text-brand"
              >
                {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
                {uploading ? "Uploading…" : "Upload"}
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
                  placeholder="…or paste an image URL"
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
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
              </button>
            </div>
          )}
          {errors.images && <p className="field-error">{errors.images}</p>}
          <p className="mt-2 text-xs text-ink-muted">
            JPG, PNG or WEBP. Square photos look best. Uploads are resized automatically; pasted links are copied to
            our image storage. Remove any image marked “Broken” and upload it again.
          </p>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Visibility">
          <Toggle label="Visible in store" checked={form.active} onChange={(v) => set("active", v)} />
          <Toggle label="In stock" checked={form.inStock} onChange={(v) => set("inStock", v)} />
          <Toggle label="Bestseller badge" checked={form.bestSeller} onChange={(v) => set("bestSeller", v)} />
          <Toggle label="Featured on home page" checked={form.featured} onChange={(v) => set("featured", v)} />
        </Card>

        <Card title="Eggless option">
          <Toggle label="Can be made eggless" checked={form.egglessAvailable} onChange={(v) => set("egglessAvailable", v)} />
          {form.egglessAvailable && (
            <Field label="Extra charge for eggless (₹)" error={errors.egglessExtra}>
              <input
                className="input"
                type="number"
                min="0"
                value={form.egglessExtra}
                onChange={(e) => set("egglessExtra", e.target.value)}
              />
            </Field>
          )}
        </Card>

        <div className="sticky top-6 flex gap-2">
          <button type="button" onClick={() => router.push("/admin/products")} className="btn-outline flex-1">
            Cancel
          </button>
          <button type="submit" disabled={saving || uploading} className="btn-brand flex-1">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
          </button>
        </div>
      </div>
    </form>
  );
}

function Card({ title, children }) {
  return (
    <section className="card p-5 md:p-6">
      <h2 className="mb-4 text-lg">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, error, hint, className, children }) {
  return (
    <label className={cn("block", className)}>
      <span className="label">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
      {error && <span className="field-error block">{error}</span>}
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between py-2 text-sm text-ink">
      {label}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
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
    </label>
  );
}

function IconBtn({ onClick, disabled, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-ink hover:bg-brand hover:text-white disabled:opacity-40"
    >
      {children}
    </button>
  );
}
