"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ExternalLink, LayoutDashboard, LogOut, Mail, Menu, Package, Settings, ShoppingCart, X } from "lucide-react";
import { CakeMark } from "@/components/ui/Logo";
import { Toaster } from "@/components/layout/Overlays";
import { getToken, setToken } from "@/lib/admin";
import { cn } from "@/lib/format";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) {
      setReady(true);
      return;
    }
    if (!getToken()) router.replace("/admin/login");
    else setReady(true);
  }, [isLogin, router]);

  useEffect(() => setOpen(false), [pathname]);

  if (isLogin) {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }
  if (!ready) return <div className="min-h-screen bg-cream" />;

  const isActive = (href) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const logout = () => {
    setToken(null);
    router.replace("/admin/login");
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-2.5 px-6 py-6">
        <CakeMark className="h-9 w-9" />
        <span>
          <span className="block font-heading text-lg font-semibold text-ink">Sweet Crumbs</span>
          <span className="block font-accent text-[10px] uppercase tracking-[0.25em] text-ink-muted">Admin</span>
        </span>
      </Link>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
              isActive(href) ? "bg-brand text-white shadow-soft" : "text-ink-soft hover:bg-blush hover:text-brand",
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="space-y-1 border-t border-line p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-ink-soft hover:bg-blush hover:text-brand"
        >
          <ExternalLink className="h-[18px] w-[18px]" /> View store
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-ink-soft hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-[18px] w-[18px]" /> Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 animate-slide-in-left bg-white">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-3 p-2" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} className="p-2" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-heading text-lg font-medium text-ink">Sweet Crumbs Admin</span>
        </header>
        <main className="mx-auto max-w-6xl p-4 md:p-8">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}

export function AdminPageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function StatusBadge({ status, styles }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", styles[status] || "bg-mist text-ink")}>
      {status.replaceAll("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
    </span>
  );
}
