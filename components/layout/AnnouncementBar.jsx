import { Phone } from "lucide-react";
export default function AnnouncementBar({ text, phone }) {
  if (!text && !phone) return null;
  return (
    <div className="bg-ink text-white">
      <div className="container flex h-10 items-center justify-center gap-6 text-xs tracking-wide sm:justify-between">
        <p className="truncate font-accent">{text}</p>
        <div className="hidden items-center gap-5 sm:flex">
          {phone && (
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-brand-light">
              <Phone className="h-3.5 w-3.5" /> {phone}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
