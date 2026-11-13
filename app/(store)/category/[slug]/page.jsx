import { permanentRedirect } from "next/navigation";
// Categories were removed. Old category links go to the shop.
export default function CategoryPage() {
  permanentRedirect("/shop");
}
