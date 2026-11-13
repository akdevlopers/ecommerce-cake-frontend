/** Static storefront content. Photos: Unsplash (free licence) — replace with your own. */
export const u = (id, w = 1200, h) =>
  `https://images.unsplash.com/photo-${id}?w=${w}${h ? `&h=${h}` : ""}&fit=crop&q=80&auto=format`;
export const SITE = {
  name: "Humuzz Desserts",
  tagline: "Bakery & Cake Studio",
  description:
    "Freshly baked celebration cakes, cheesecakes and more — handcrafted every morning and delivered to your door.",
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
  youtube: "https://youtube.com/",
};
/** Registered business contact details (shown on Contact, footer and policy pages — required for Razorpay). */
export const BUSINESS = {
  name: "Humuzz Desserts",
  addressLines: ["16-95, Rifai Street", "Vilavancode", "Kanniyakumari, Tamil Nadu - 629173", "India"],
  address: "16-95, Rifai Street, Vilavancode, Kanniyakumari, Tamil Nadu - 629173, India",
  phone: "+91 9360 830744",
  email: "officialibake@gmail.com",
  hours: "Every day, 9 AM – 10 PM",
};
export const NAV = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  {
    label: "Pages",
    href: "/about",
    children: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQs", href: "/faq" },
    ],
  },
  { label: "Contact", href: "/contact" },
];
export const HERO_SLIDES = [
  {
    eyebrow: "Cake & Bakery",
    title: "Perfect for every celebration!",
    text: "Handcrafted cakes baked fresh every morning with real butter, Belgian chocolate and seasonal fruit.",
    cta: { label: "View Menu", href: "/shop" },
    image: u("1627834377411-8da5f4f09de8", 1000, 1000),
    bg: "bg-blush",
  },
  {
    eyebrow: "Fresh Every Day",
    title: "Sweet moments, baked with love",
    text: "From rich chocolate truffle to silky cheesecakes — handcrafted for every celebration.",
    cta: { label: "Shop Cakes", href: "/shop" },
    image: u("1535254973040-607b474cb50d", 1000, 1000),
    bg: "bg-peach",
  },
  {
    eyebrow: "Doorstep Delivery",
    title: "Plan your celebration, we'll bring the cake",
    text: "Book 24 hours ahead and we'll deliver it fresh to your door. Add a personal message on top.",
    cta: { label: "Order Now", href: "/shop" },
    image: u("1558636508-e0db3814bd1d", 1000, 1000),
    bg: "bg-mint-light",
  },
];
export const PROMOS = [
  {
    eyebrow: "Sweet and tasty",
    title: "Chocolate Lovers",
    href: "/shop",
    image: u("1606312619070-d48b4c652a52", 600, 600),
    bg: "bg-peach",
  },
  {
    eyebrow: "Celebrate with",
    title: "Custom Birthday Cakes",
    href: "/shop",
    image: u("1559620192-032c4bc4674e", 600, 600),
    bg: "bg-blush",
  },
  {
    eyebrow: "Delicious alternatives",
    title: "Creamy Cheesecakes",
    href: "/shop",
    image: u("1524351199678-941a58a3df50", 600, 600),
    bg: "bg-lilac",
  },
];
export const FEATURES = [
  { icon: "wheat", title: "Baked Fresh Daily", text: "Every cake is baked the morning it's delivered." },
  { icon: "heart", title: "Made to Order", text: "Pick your favourite variant and add a personal message." },
  { icon: "truck", title: "Doorstep Delivery", text: "Book 24 hours ahead, delivered fresh to your door." },
  { icon: "shield", title: "Secure Payments", text: "UPI, cards & net banking via Razorpay." },
];
export const INSTAGRAM = [
  u("1486427944299-d1955d23e34d", 400, 400),
  u("1551024601-bec78aea704b", 400, 400),
  u("1519869325930-281384150729", 400, 400),
  u("1558961363-fa8fdf82db35", 400, 400),
  u("1495147466023-ac5c588e2e94", 400, 400),
  u("1597528662465-55ece5734101", 400, 400),
];
export const FAQS = [
  {
    q: "How early should I order?",
    a: "Please place your order at least 24 hours before your delivery time. We do not take same-day orders. Choose your delivery date and time slot at checkout.",
  },
  {
    q: "Can you write a message on the cake?",
    a: "Yes — add up to 40 characters in the 'Message on cake' box on the product page, free of charge.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept UPI, credit and debit cards, net banking and popular wallets through Razorpay's secure checkout.",
  },
  {
    q: "How should I store my cake?",
    a: "Keep cream cakes and cheesecakes refrigerated and take them out 20–30 minutes before serving. Enjoy within 48 hours for the best taste.",
  },
  {
    q: "Can I cancel my order?",
    a: "No, cancellation is not available. Every cake is baked fresh to order, so an order cannot be cancelled once it has been placed and paid for. Please check your cake, delivery date, time slot and address carefully before paying.",
  },
  {
    q: "Can I get a refund?",
    a: "No, refunds are not available. All payments are final and non-refundable once an order is placed, including for wrong addresses, no one being available at delivery, or taste preferences. See our Cancellation & Refund policy for details.",
  },
  {
    q: "Can I change my order after placing it?",
    a: "Changes to the delivery date, time slot or address may be possible only if you call or WhatsApp us well before the delivery time, and only if we can accommodate them. Changing an order does not make it eligible for cancellation or refund.",
  },
  {
    q: "What if money was deducted but my payment failed?",
    a: "If money is deducted but no order is created, Razorpay and your bank reverse the amount automatically, usually within 5–7 working days. This is a payment reversal, not a refund from us. Contact your bank if you do not receive it.",
  },
  {
    q: "How do I track my order?",
    a: "Call or WhatsApp us with your order number (for example, CK2611110001) and we'll tell you the status of your order.",
  },
];
export const FOOTER_LINKS = [
  {
    title: "Information",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQs", href: "/faq" },
    ],
  },
  {
    title: "Shop",
    links: [
      { label: "All Cakes", href: "/shop" },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "Privacy Policy", href: "/policies/privacy" },
      { label: "Terms & Conditions", href: "/policies/terms" },
      { label: "Shipping & Delivery", href: "/policies/shipping" },
      { label: "Cancellation & Refunds", href: "/policies/refund" },
    ],
  },
];
