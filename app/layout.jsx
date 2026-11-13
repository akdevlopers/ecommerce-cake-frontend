import { Jost, Montserrat } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";
import { getSettings } from "@/lib/api";
const jost = Jost({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-jost", display: "swap" });
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-montserrat",
  display: "swap",
});
/** Browser tab title, share preview and icon use the store name / logo from Admin > Settings. */
export async function generateMetadata() {
  const s = await getSettings();
  const name = s.storeName || SITE.name;
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: { default: s.tagline ? `${name} — ${s.tagline}` : name, template: `%s | ${name}` },
    description: SITE.description,
    openGraph: { siteName: name, type: "website" },
    ...(s.logoUrl ? { icons: { icon: s.logoUrl } } : {}),
  };
}
export const viewport = { themeColor: "#E31C79" };
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jost.variable} ${montserrat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
