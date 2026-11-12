"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, Search, ShoppingBag, Truck, X } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { NAV } from "@/lib/site";
import { cartCount, useCart } from "@/store/cart";
import { useUi } from "@/store/ui";
import { cn } from "@/lib/format";
import { useHydrated } from "@/lib/useHydrated";
export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = useCart((s) => s.items);
  const openDrawer = useCart((s) => s.openDrawer);
  const setSearchOpen = useUi((s) => s.setSearchOpen);
  const hydrated = useHydrated();
  const count = hydrated ? cartCount(items) : 0;
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setMobileOpen(false), [pathname]);
  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 bg-white/95 backdrop-blur transition-shadow",
          scrolled ? "shadow-soft" : "border-b border-line",
        )}
      >
        <div
          className={cn("container flex items-center justify-between gap-2 transition-all sm:gap-4", scrolled ? "h-16" : "h-[72px] sm:h-20")}
        >
          <button className="-ml-2 p-2 text-ink lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </button>

          <Logo className="mr-auto lg:mr-6" />

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
            {NAV.map((item) =>
              item.children ? (
                <div key={item.label} className="group relative">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1 py-7 text-[15px] font-medium transition hover:text-brand",
                      isActive(item.href) && item.label !== "Pages" ? "text-brand" : "text-ink",
                    )}
                  >
                    {item.label}
                    <ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180" />
                  </Link>
                  <div className="invisible absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 translate-y-2 rounded-2xl bg-white p-3 opacity-0 shadow-card transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {item.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="block rounded-lg px-3 py-2 text-sm text-ink-soft transition hover:bg-blush hover:pl-4 hover:text-brand"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "py-7 text-[15px] font-medium transition hover:text-brand",
                    isActive(item.href) ? "text-brand" : "text-ink",
                  )}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="-mr-2 flex shrink-0 items-center sm:mr-0 sm:gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-full p-2.5 text-ink transition hover:bg-blush hover:text-brand"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              href="/track-order"
              className="hidden rounded-full p-2.5 text-ink transition hover:bg-blush hover:text-brand sm:block"
              aria-label="Track order"
              title="Track order"
            >
              <Truck className="h-5 w-5" />
            </Link>
            <button
              onClick={openDrawer}
              className="relative rounded-full p-2.5 text-ink transition hover:bg-blush hover:text-brand"
              aria-label={`Cart, ${count} items`}
            >
              <ShoppingBag className="h-5 w-5" />
              <span
                className={cn(
                  "absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white transition",
                  count ? "scale-100" : "scale-0",
                )}
              >
                {count}
              </span>
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 animate-fade-in bg-ink/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm animate-slide-in-left flex-col bg-white">
            <div className="flex items-center justify-between border-b border-line p-4">
              <Logo />
              <button onClick={() => setMobileOpen(false)} className="p-2" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4">
              {NAV.map((item) => (
                <div key={item.label} className="border-b border-line py-1">
                  <Link href={item.href} className="block py-3 font-medium text-ink">
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="mb-2 grid gap-1 pl-3">
                      {item.children.map((c) => (
                        <Link key={c.href} href={c.href} className="py-1.5 text-sm text-ink-soft">
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
