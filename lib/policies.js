/**
 * Policy pages required by Razorpay for live activation:
 * Terms & Conditions, Privacy Policy, Shipping Policy, Cancellation & Refunds (+ Contact Us page).
 * Each section has `body` paragraphs and an optional `list` of bullet points.
 * Business contact details are appended automatically from BUSINESS in lib/site.js.
 */
export const POLICIES = {
  terms: {
    title: "Terms & Conditions",
    intro:
      "These Terms & Conditions govern your use of this website and any purchase you make from Humuzz Desserts. By using the website or placing an order, you agree to these terms.",
    sections: [
      {
        heading: "About us",
        body: [
          "This website is operated by Humuzz Desserts, a home bakery and cake studio located at 16-95, Rifai Street, Vilavancode, Kanniyakumari, Tamil Nadu - 629173, India. In these terms, “we”, “us” and “our” refer to Humuzz Desserts, and “you” refers to the customer.",
        ],
      },
      {
        heading: "Products",
        body: [
          "All our cakes and desserts are handmade and baked to order. Colours, decorations and finishing may vary slightly from the photographs shown on the website.",
          "Product weights are approximate. Our kitchen handles gluten, dairy, nuts and eggs, so we cannot guarantee any product is free from allergens. Please check the product description and contact us before ordering if you have a severe allergy.",
        ],
      },
      {
        heading: "Orders",
        list: [
          "All orders are subject to availability and confirmation.",
          "An order is confirmed only after full payment is received successfully.",
          "You are responsible for providing a correct delivery address, phone number and delivery date.",
          "We may refuse or cancel an order if a product is unavailable, if the information provided is incorrect, or if we cannot deliver to the given address. Any amount paid will then be refunded in full.",
        ],
      },
      {
        heading: "Pricing & payment",
        body: [
          "All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes. Delivery charges, if any, are shown at checkout before you pay.",
          "Payments are processed securely through Razorpay using UPI, credit/debit cards, net banking and wallets. We do not store your card or bank details.",
          "Prices and offers may change without notice, but the price you paid at the time of ordering will be honoured.",
        ],
      },
      {
        heading: "Cancellations, refunds and delivery",
        body: [
          "Cancellations and refunds are governed by our Cancellation & Refunds policy, and delivery by our Shipping & Delivery policy, both of which form part of these terms.",
        ],
      },
      {
        heading: "Use of the website",
        body: [
          "All content on this website, including text, logos and photographs, belongs to Humuzz Desserts or its licensors and may not be copied or reused without permission. You agree not to misuse the website or attempt to interfere with its operation.",
        ],
      },
      {
        heading: "Limitation of liability",
        body: [
          "Our liability for any order is limited to the amount you paid for that order. We are not responsible for delays or failures caused by events beyond our reasonable control, such as extreme weather, natural disasters or strikes.",
        ],
      },
      {
        heading: "Governing law",
        body: [
          "These terms are governed by the laws of India. Any dispute is subject to the exclusive jurisdiction of the courts of Kanniyakumari District, Tamil Nadu.",
        ],
      },
      {
        heading: "Changes to these terms",
        body: [
          "We may update these terms from time to time. The updated version will be posted on this page with a new “Last updated” date.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro:
      "Humuzz Desserts respects your privacy. This policy explains what information we collect when you use our website or place an order, and how we use and protect it.",
    sections: [
      {
        heading: "Information we collect",
        list: [
          "Contact details: your name, phone number and email address.",
          "Delivery details: delivery address, date, time slot and any message for the cake.",
          "Order details: the products you buy and the amount paid.",
          "Messages you send us through the contact form or newsletter sign-up.",
          "Basic technical data such as browser type and pages visited, used to keep the website working well.",
        ],
      },
      {
        heading: "Payment information",
        body: [
          "All payments are processed by Razorpay, a PCI-DSS compliant payment gateway. Your card, UPI or bank details are entered directly with Razorpay and are never seen or stored by us. We only receive a payment confirmation and reference ID.",
        ],
      },
      {
        heading: "How we use your information",
        list: [
          "To process, bake and deliver your order.",
          "To contact you about your order, delivery or any issue with it.",
          "To process refunds where applicable.",
          "To send you our newsletter and offers, only if you subscribe. You can unsubscribe at any time.",
          "To meet legal, tax and accounting obligations.",
        ],
      },
      {
        heading: "Sharing your information",
        body: [
          "We do not sell or rent your personal information. We share it only with service providers who help us run our business — such as Razorpay for payments and delivery partners for delivering your order — and only to the extent needed. We may also disclose information when required by law.",
        ],
      },
      {
        heading: "Cookies",
        body: [
          "Our website uses cookies and local storage to keep items in your cart and remember your preferences. You can disable cookies in your browser, but some features of the website may not work properly.",
        ],
      },
      {
        heading: "Data security & retention",
        body: [
          "We take reasonable measures to protect your information from unauthorised access. We keep order records only as long as needed to serve you and to meet legal requirements.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You may contact us at any time to access, correct or delete your personal information, or to stop receiving marketing messages.",
        ],
      },
      {
        heading: "Changes to this policy",
        body: ["We may update this policy from time to time. Changes will be posted on this page."],
      },
    ],
  },
  shipping: {
    title: "Shipping & Delivery Policy",
    intro:
      "We deliver freshly baked cakes and desserts directly to your door. As our products are perishable, we deliver locally using our own staff or local delivery partners.",
    sections: [
      {
        heading: "Delivery area",
        body: [
          "We currently deliver within Vilavancode and nearby areas of Kanniyakumari District, Tamil Nadu. If your address is outside our delivery area, please contact us before placing an order. We do not ship outside India.",
        ],
      },
      {
        heading: "Delivery time",
        list: [
          "You choose your delivery date and time slot at checkout.",
          "Orders placed before 4 PM can be delivered on the same day in the evening slots, subject to availability.",
          "Custom and large celebration cakes may need 1–2 days’ advance notice.",
          "Orders are delivered within the selected time slot. In rare cases of heavy traffic or bad weather there may be a short delay, and we will keep you informed by phone.",
        ],
      },
      {
        heading: "Delivery charges",
        body: [
          "A flat delivery charge applies to each order and is shown clearly at checkout before payment. Delivery is free for orders above the amount shown in the cart.",
        ],
      },
      {
        heading: "Receiving your order",
        body: [
          "Please make sure someone is available at the delivery address to receive the order and that the phone number provided is reachable. If no one is available, we will call you to arrange a new delivery time. Re-delivery may be charged, and orders cannot be refunded if delivery fails due to an incorrect address or no one being available.",
          "Please check your order at the time of delivery and keep cream cakes refrigerated.",
        ],
      },
      {
        heading: "Order tracking",
        body: [
          "You can check the status of your order on the Track Order page using your order number and phone number, or by calling us.",
        ],
      },
    ],
  },
  refund: {
    title: "Cancellation & Refund Policy",
    intro:
      "Because every cake is baked fresh to order, we follow the policy below for cancellations, replacements and refunds.",
    sections: [
      {
        heading: "Cancellation by the customer",
        list: [
          "Orders cancelled 24 hours or more before the scheduled delivery time are eligible for a full refund.",
          "Orders cancelled less than 24 hours before delivery cannot be refunded, as preparation of the cake has already started.",
          "To cancel, call us or message us with your order number. Cancellation requests cannot be made on delivery.",
        ],
      },
      {
        heading: "Cancellation by us",
        body: [
          "If we are unable to fulfil your order for any reason (for example, an ingredient is unavailable or the address is outside our delivery area), we will inform you and refund the full amount paid.",
        ],
      },
      {
        heading: "Damaged or incorrect orders",
        body: [
          "If your order arrives damaged, or is different from what you ordered, please contact us within 2 hours of delivery with your order number and a photo of the product. After checking, we will either replace the product or give you a full refund.",
          "We cannot accept returns of food items once delivered, and we cannot offer refunds based on personal taste preferences.",
        ],
      },
      {
        heading: "Refund process & timeline",
        list: [
          "Approved refunds are processed within 2 working days of approval.",
          "The amount is credited to the original payment method (UPI, card, net banking or wallet) through Razorpay.",
          "It usually takes 5–7 working days for the refund to reflect in your account, depending on your bank.",
        ],
      },
    ],
  },
};
