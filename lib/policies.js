/** Policy pages required by Razorpay for live activation. Review with your own details before going live. */
export const POLICIES = {
  privacy: {
    title: "Privacy Policy",
    sections: [
      {
        heading: "Information we collect",
        body: [
          "When you place an order we collect your name, phone number, email address and delivery address so that we can bake and deliver your order.",
          "Payments are processed by Razorpay. We never see or store your card, UPI or bank details.",
        ],
      },
      {
        heading: "How we use it",
        body: [
          "Your details are used only to process and deliver your order, contact you about it, and — if you subscribe — send our newsletter. We do not sell your information.",
        ],
      },
      {
        heading: "Contact",
        body: ["For any privacy question, write to us using the details on our Contact page."],
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    sections: [
      {
        heading: "Orders",
        body: [
          "All orders are subject to availability. Cake designs and decorations may vary slightly from photos as each cake is handmade.",
          "Prices are in Indian Rupees and include applicable taxes. Delivery charges are shown at checkout.",
        ],
      },
      {
        heading: "Payment",
        body: ["An order is confirmed only after successful payment through Razorpay."],
      },
      {
        heading: "Allergens",
        body: [
          "Our kitchen handles gluten, dairy, nuts and eggs. Please check the ingredients on each product and contact us if you have a severe allergy.",
        ],
      },
    ],
  },
  shipping: {
    title: "Shipping & Delivery Policy",
    sections: [
      {
        heading: "Delivery area & time",
        body: [
          "We deliver within city limits in the time slot you choose at checkout. Orders placed before 4 PM can be delivered the same day.",
          "Someone must be available to receive the cake. If nobody is available, we will call you to arrange a new time; re-delivery may be charged.",
        ],
      },
      {
        heading: "Delivery charges",
        body: ["A flat delivery charge applies, and delivery is free above the amount shown in the cart."],
      },
    ],
  },
  refund: {
    title: "Cancellation & Refund Policy",
    sections: [
      {
        heading: "Cancellation",
        body: [
          "Orders can be cancelled for a full refund up to 24 hours before the delivery date. Since cakes are made fresh to order, later cancellations cannot be refunded.",
        ],
      },
      {
        heading: "Damaged or incorrect orders",
        body: [
          "If your cake arrives damaged or is not what you ordered, contact us within 2 hours of delivery with a photo and we will replace it or refund you in full.",
        ],
      },
      {
        heading: "Refund timeline",
        body: ["Approved refunds are returned to the original payment method within 5–7 working days."],
      },
    ],
  },
};
