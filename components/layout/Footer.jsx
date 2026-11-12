import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import Logo from "@/components/ui/Logo";
import NewsletterForm from "./NewsletterForm";
import { FOOTER_LINKS, SITE } from "@/lib/site";
const PAYMENTS = ["UPI", "VISA", "Mastercard", "RuPay", "NetBanking"];
export default function Footer({ settings }) {
  return (
    <footer className="mt-16 bg-cream sm:mt-24">
      <div className="container grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:py-16 md:grid-cols-3 lg:grid-cols-12 lg:gap-12">
        <div className="col-span-2 md:col-span-3 lg:col-span-3">
          <Logo />
          <p className="mt-5 max-w-sm text-sm">{SITE.description}</p>
          <ul className="mt-6 space-y-3 text-sm">
            {settings.address && (
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {settings.address}
              </li>
            )}
            {settings.phone && (
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-brand">
                  {settings.phone}
                </a>
              </li>
            )}
            {settings.email && (
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <a href={`mailto:${settings.email}`} className="hover:text-brand">
                  {settings.email}
                </a>
              </li>
            )}
          </ul>
        </div>

        {FOOTER_LINKS.map((col) => (
          <div key={col.title} className="lg:col-span-2">
            <h2 className="mb-4 text-lg sm:mb-5">{col.title}</h2>
            <ul className="space-y-3 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition hover:pl-1 hover:text-brand">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="col-span-2 md:col-span-3 lg:col-span-3">
          <h2 className="mb-5 text-lg">Newsletter</h2>
          <p className="mb-4 text-sm">New cakes and offers, straight to your inbox.</p>
          <div className="max-w-md">
            <NewsletterForm compact />
          </div>
          <div className="mt-6 flex gap-2">
            {[
              { href: SITE.instagram, icon: Instagram, label: "Instagram" },
              { href: SITE.facebook, icon: Facebook, label: "Facebook" },
              { href: SITE.youtube, icon: Youtube, label: "YouTube" },
            ].map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink transition hover:bg-brand hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-cream-dark">
        <div className="container flex flex-col items-center justify-between gap-4 pb-24 pt-6 text-xs sm:flex-row sm:pb-6 sm:pr-24">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} {settings.storeName || SITE.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-2" aria-label="Accepted payments">
            {PAYMENTS.map((p) => (
              <li
                key={p}
                className="rounded-md border border-cream-dark bg-white px-2.5 py-1 font-accent text-[10px] font-semibold text-ink"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
