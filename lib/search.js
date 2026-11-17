/**
 * Product search used by the search popup and the /search page. Everything comes from the
 * products in the database — no hard-coded suggestions.
 */
const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "");

function haystack(p) {
  return norm(
    [
      p.name,
      p.shortDescription,
      ...(p.highlights || []).map((h) => h.name),
      ...(p.variants || []).map((v) => v.label),
    ].join(" "),
  );
}

/** Every word of the query must appear; products whose name matches rank first. */
export function searchProducts(products, query) {
  const words = norm(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return products
    .map((p) => {
      const text = haystack(p);
      if (!words.every((w) => text.includes(w))) return null;
      const name = norm(p.name);
      const score = (name.startsWith(words[0]) ? 3 : 0) + words.filter((w) => name.includes(w)).length;
      return { p, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}

/** Quick-search chips: the highlight names actually used on products (e.g. Bestseller, Trending). */
export function searchSuggestions(products, max = 6) {
  const seen = new Map();
  for (const p of products) {
    for (const h of p.highlights || []) {
      const key = norm(h.name);
      if (!seen.has(key)) seen.set(key, { name: h.name, color: h.color, count: 0 });
      seen.get(key).count++;
    }
  }
  return [...seen.values()].sort((a, b) => b.count - a.count).slice(0, max);
}
