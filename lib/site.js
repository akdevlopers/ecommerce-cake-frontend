/** Static storefront content. Photos: Unsplash (free licence) — replace with your own. */
export const u = (id, w = 1200, h) =>
  `https://images.unsplash.com/photo-${id}?w=${w}${h ? `&h=${h}` : ""}&fit=crop&q=80&auto=format`;
export const SITE = {
  name: "Sweet Crumbs",
  tagline: "Bakery & Cake Studio",
  description:
    "Freshly baked celebration cakes, cheesecakes and more — handcrafted every morning and delivered to your door.",
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
  youtube: "https://youtube.com/",
};
export const NAV = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  {
    label: "Cakes",
    href: "/shop",
    children: [
      { label: "Chocolate Cakes", href: "/category/chocolate-cakes" },
      { label: "Fruit Cakes", href: "/category/fruit-cakes" },
      { label: "Cheesecakes", href: "/category/cheesecakes" },
      { label: "Signature Cakes", href: "/category/signature-cakes" },
      { label: "Birthday Cakes", href: "/category/birthday-cakes" },
      { label: "Classic Cakes", href: "/category/classic-cakes" },
    ],
  },
  { label: "Blog", href: "/blog" },
  {
    label: "Pages",
    href: "/about",
    children: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQs", href: "/faq" },
      { label: "Track Order", href: "/track-order" },
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
    text: "From rich chocolate truffle to silky cheesecakes — every cake can be made eggless.",
    cta: { label: "Shop Cakes", href: "/shop" },
    image: u("1535254973040-607b474cb50d", 1000, 1000),
    bg: "bg-peach",
  },
  {
    eyebrow: "Same-Day Delivery",
    title: "Celebrate today, we'll bring the cake",
    text: "Order before 4 PM for same-day delivery across the city. Add a personal message on top.",
    cta: { label: "Order Now", href: "/category/birthday-cakes" },
    image: u("1558636508-e0db3814bd1d", 1000, 1000),
    bg: "bg-mint-light",
  },
];
export const PROMOS = [
  {
    eyebrow: "Sweet and tasty",
    title: "Chocolate Lovers",
    href: "/category/chocolate-cakes",
    image: u("1606312619070-d48b4c652a52", 600, 600),
    bg: "bg-peach",
  },
  {
    eyebrow: "Celebrate with",
    title: "Custom Birthday Cakes",
    href: "/category/birthday-cakes",
    image: u("1559620192-032c4bc4674e", 600, 600),
    bg: "bg-blush",
  },
  {
    eyebrow: "Delicious alternatives",
    title: "Creamy Cheesecakes",
    href: "/category/cheesecakes",
    image: u("1524351199678-941a58a3df50", 600, 600),
    bg: "bg-lilac",
  },
];
export const HOME_TABS = [
  { label: "Best Seller", value: "best" },
  { label: "Chocolate", value: "chocolate-cakes" },
  { label: "Fruit", value: "fruit-cakes" },
  { label: "Cheesecakes", value: "cheesecakes" },
  { label: "Birthday", value: "birthday-cakes" },
];
export const FEATURES = [
  { icon: "wheat", title: "Baked Fresh Daily", text: "Every cake is baked the morning it's delivered." },
  { icon: "egg", title: "Eggless Options", text: "Almost every cake can be made 100% eggless." },
  { icon: "truck", title: "Same-Day Delivery", text: "Order before 4 PM for delivery today." },
  { icon: "shield", title: "Secure Payments", text: "UPI, cards & net banking via Razorpay." },
];
export const BLOG_POSTS = [
  {
    slug: "spring-delights-to-winter-wonders",
    title: "From Spring Delights to Winter Wonders",
    date: "2026-10-02",
    excerpt: "How we change our cake menu with the seasons — and the fruit we can't wait to bake with each year.",
    image: u("1563729784474-d77dbb933a9e", 900, 600),
    body: [
      "Every season brings its own flavours to our kitchen. In spring we reach for strawberries and fresh cream, summer is all about Alphonso mangoes, and winter means rich chocolate, warm spices and caramel.",
      "Baking with the seasons means our fruit is at its sweetest and most fragrant. It also keeps our menu exciting for the bakers — there's always something new to try.",
      "Watch our Instagram for limited seasonal cakes. They only stay on the menu while the best fruit is available.",
    ],
  },
  {
    slug: "diy-cake-decorating-tips",
    title: "DIY Cake Decorating Tips for Beginners",
    date: "2026-09-14",
    excerpt: "Five simple tricks our pastry chefs use for smooth frosting, neat drips and pretty piping at home.",
    image: u("1586985289688-ca3cf47d3e6e", 900, 600),
    body: [
      "Chill your cake layers before frosting. Cold sponge produces fewer crumbs and is much easier to stack evenly.",
      "Always do a thin crumb coat first, chill for 20 minutes, then add the final layer of frosting.",
      "For a clean ganache drip, let the ganache cool until it's just warm to the touch, and test one drip before going around the whole cake.",
      "Practise piping on parchment paper — you can scrape it back into the bag and try again.",
      "Finally: fresh flowers, berries and a dusting of cocoa can make even a simple cake look stunning.",
    ],
  },
  {
    slug: "a-day-in-the-life-of-our-cake-shop",
    title: "A Day in the Life of Our Cake Shop",
    date: "2026-08-21",
    excerpt: "Our ovens fire up at 5 AM. Here's what happens between the first batch of sponge and the last delivery.",
    image: u("1517433670267-08bbd4be890f", 900, 600),
    body: [
      "Our day starts at 5 AM when the first sponges go into the oven. By 8 AM the fillings are ready and our decorators begin finishing the day's orders.",
      "Each cake is checked before it's boxed: the right size, the right message, and eggless orders are always prepared on a separate station.",
      "Delivery runs leave from 10 AM in four time slots, and the last cakes reach their celebrations by 10 PM.",
    ],
  },
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
    q: "Can every cake be made eggless?",
    a: "Most of our cakes can be made eggless for a small extra charge. Choose 'Eggless' on the product page. Baked cheesecakes contain egg and are marked as not available eggless.",
  },
  {
    q: "Do you offer same-day delivery?",
    a: "Yes. Orders placed before 4 PM can be delivered the same day in the evening slots. Choose your delivery date and time slot at checkout.",
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
    q: "Can I cancel or change my order?",
    a: "Contact us at least 24 hours before the delivery date to change or cancel an order. See our refund policy for details.",
  },
  {
    q: "How do I track my order?",
    a: "Use the Track Order page with your order number (e.g. CK2611110001) and the phone number you ordered with.",
  },
];
export const FOOTER_LINKS = [
  {
    title: "Information",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQs", href: "/faq" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Shop",
    links: [
      { label: "All Cakes", href: "/shop" },
      { label: "Birthday Cakes", href: "/category/birthday-cakes" },
      { label: "Cheesecakes", href: "/category/cheesecakes" },
      { label: "Track Order", href: "/track-order" },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "Privacy Policy", href: "/policies/privacy" },
      { label: "Terms & Conditions", href: "/policies/terms" },
      { label: "Shipping & Delivery", href: "/policies/shipping" },
      { label: "Cancellation & Refund", href: "/policies/refund" },
    ],
  },
];
