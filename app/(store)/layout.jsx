import { getSettings } from "@/lib/api";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SettingsProvider } from "@/components/layout/SettingsProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import QuickView from "@/components/product/QuickView";
import SearchOverlay from "@/components/layout/SearchOverlay";
import { NewsletterPopup, Toaster, WhatsAppButton } from "@/components/layout/Overlays";
export default async function StoreLayout({ children }) {
  const settings = await getSettings();
  return (
    <SettingsProvider value={settings}>
      <AnnouncementBar text={settings.announcement} phone={settings.phone} />
      <Header />
      <main id="main">{children}</main>
      <Footer settings={settings} />
      <CartDrawer />
      <QuickView />
      <SearchOverlay />
      <NewsletterPopup />
      <WhatsAppButton />
      <Toaster />
    </SettingsProvider>
  );
}
