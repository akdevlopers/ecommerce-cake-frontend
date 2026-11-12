import { Clock, Mail, MapPin, Phone } from "lucide-react";
import PageBanner from "@/components/ui/PageBanner";
import ContactForm from "@/components/layout/ContactForm";
import { getSettings } from "@/lib/api";
import { BUSINESS } from "@/lib/site";
export const metadata = { title: "Contact Us" };
export default async function ContactPage() {
  const s = await getSettings();
  const info = [
    { icon: MapPin, title: "Visit us", text: s.address },
    { icon: Phone, title: "Call us", text: s.phone, href: `tel:${s.phone.replace(/\s/g, "")}` },
    { icon: Mail, title: "Email", text: s.email, href: `mailto:${s.email}` },
    { icon: Clock, title: "Open", text: BUSINESS.hours },
  ].filter((i) => i.text);
  return (
    <>
      <PageBanner title="Contact Us" crumbs={[{ label: "Contact" }]} />
      <section className="container mt-20 grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="eyebrow">Get in touch</p>
          <h2 className="mb-4 mt-3 text-4xl">We&apos;d love to hear from you</h2>
          <p className="mb-8">
            Planning a custom cake for a wedding or birthday, or have a question about an order? Send us a message and
            we&apos;ll reply within a few hours.
          </p>
          <ul className="grid gap-5 sm:grid-cols-2">
            {info.map(({ icon: Icon, title, text, href }) => (
              <li key={title} className="flex gap-4 rounded-2xl bg-cream p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="text-sm">
                  <p className="font-heading text-base font-medium text-ink">{title}</p>
                  {href ? (
                    <a href={href} className="hover:text-brand">
                      {text}
                    </a>
                  ) : (
                    <p>{text}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-line p-6 md:p-10">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
