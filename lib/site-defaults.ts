export type HomeContent = {
  hero: {
    eyebrow: string;
    title: string;
    accentWord: string;
    description: string;
    secondaryDescription: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    badge: string;
  };
  ageCards: Array<{
    id: string;
    label: string;
    href: string;
    imageUrl: string;
  }>;
  sectionTitles: {
    shopByAge: string;
    featured: string;
    collections: string;
    reviews: string;
    instagram: string;
  };
  brandStory: {
    quote: string;
    kicker: string;
    values: Array<{
      title: string;
      description: string;
      tone: string;
    }>;
  };
  reviewsSummary: {
    score: string;
    stars: string;
    summaryText: string;
    ctaLabel: string;
    ctaHref: string;
  };
};

export type OurStoryContent = {
  heroImage: string;
  heroImages?: string[];
  heroTitle: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
  sustainability: {
    title: string;
    body: string;
  };
  closing: {
    text: string;
    ctaLabel: string;
    ctaHref: string;
  };
};

export const defaultHomeContent: HomeContent = {
  hero: {
    eyebrow: "New Arrivals - Summer 2026",
    title: "Dressed in Promise",
    accentWord: "Promise",
    description:
      "Sustainable Indian casuals for little ones, 0-9 years. Soft fabrics. Soulful designs.",
    secondaryDescription:
      "Each piece is handcrafted by Indian artisans from pure, breathable fabrics - gentle on delicate skin and kind to the planet. Designed for play, made to be remembered.",
    primaryCtaLabel: "Shop the Collection",
    primaryCtaHref: "/shop",
    secondaryCtaLabel: "Our Story",
    secondaryCtaHref: "/our-story",
    badge: "New Arrivals",
  },
  ageCards: [
    {
      id: "0-2",
      label: "0 - 2 yrs / Newborn & Infant",
      href: "/shop?age=0-2",
      imageUrl: "/uploads/checks-teal-infant.jpg",
    },
    {
      id: "3-5",
      label: "3 - 5 yrs / Toddler",
      href: "/shop?age=3-5",
      imageUrl: "/uploads/checks-orange.jpg",
    },
    {
      id: "6-9",
      label: "6 - 9 yrs / Big Kids",
      href: "/shop?age=6-9",
      imageUrl: "/uploads/ombre-magenta-pink.jpg",
    },
  ],
  sectionTitles: {
    shopByAge: "Shop by Age",
    featured: "Featured Picks",
    collections: "Shop by Collection",
    reviews: "What Parents Say",
    instagram: "Join Our Journey",
  },
  brandStory: {
    quote: "A promise to dress childhood beautifully.",
    kicker: "Made in India - Loved by little ones",
    values: [
      {
        title: "Made in India",
        description:
          "Crafted by skilled Indian artisans celebrating our rich textile heritage.",
        tone: "warm-yellow",
      },
      {
        title: "Natural Fabrics",
        description:
          "Soft cottons and breathable weaves, kind to delicate skin and our planet.",
        tone: "sage",
      },
      {
        title: "Fashionable Childhood",
        description:
          "Designs as joyful and expressive as the little ones who wear them.",
        tone: "coral",
      },
    ],
  },
  reviewsSummary: {
    score: "4.9",
    stars: "★★★★★",
    summaryText: "Based on 124 reviews - 96% recommend this brand",
    ctaLabel: "Write a review",
    ctaHref: "/write-review",
  },
};

export const defaultOurStoryContent: OurStoryContent = {
  heroImage: "/uploads/ombre-yellow-rust.jpg",
  heroImages: [
    "/uploads/ombre-yellow-rust.jpg",
    "/uploads/checks-orange.jpg",
    "/uploads/ombre-magenta-pink.jpg",
  ],
  heroTitle: "Anah means promise.",
  sections: [
    {
      title: "Our Origin",
      body:
        "Born from a deep love for Indian textiles and craftsmanship, Anah is a natural extension of Sindhura Reddy's journey in fashion. After years of designing elegant ethnic wear and sarees for women, the vision expanded. We wanted to create something just as beautifully crafted, but designed specifically for the joyful, unhindered world of little ones.",
    },
    {
      title: "The Name",
      body:
        "Anah carries many meanings across cultures - promise, care, breath. We chose it because every piece we make is a promise. A promise to use safe, natural materials. A promise to support local artisans. And a promise to dress your children in clothes that celebrate their innocence and spirit.",
    },
    {
      title: "Design Philosophy",
      body:
        "We believe that comfort and beauty should never be a trade-off. Our clothes are designed for movement - because children run, spin, and sit on floors. We incorporate traditional hand-embroidery as a core element of our craft, adding a touch of artisanal soul to modern, wearable silhouettes.",
    },
  ],
  sustainability: {
    title: "Sustainability at Heart",
    body:
      "We strictly use natural fabrics like pure cotton, muslin, and organza. You will not find synthetic blends here. Our production supports artisan communities, and we deliver our garments in recycled tissue packaging - entirely plastic-free.",
  },
  closing: {
    text: "Discover our parent brand, Sindhura Reddy Official - our ethnic wear label for women.",
    ctaLabel: "Visit on Instagram",
    ctaHref: "https://www.instagram.com/sindhurareddyofficial?igsh=MmJjbHpoenJsZ3Nt",
  },
} as const;

export const defaultSizeGuideContent = {
  intro:
    "Please use the measurements below to choose the correct size for your child. The measurements refer to the garment, not the child.",
  rows: [
    { size: "0-1Y", chest: '19"', waist: '18"', length: '16"' },
    { size: "1-2Y", chest: '21"', waist: '20"', length: '18"' },
    { size: "3-4Y", chest: '23"', waist: '22"', length: '20"' },
    { size: "5-6Y", chest: '25"', waist: '24"', length: '22"' },
    { size: "7-8Y", chest: '27"', waist: '26"', length: '25"' },
    { size: "8-9Y", chest: '28"', waist: '27"', length: '27"' },
  ],
  howToMeasure:
    "Chest: Measure under the arms, around the fullest part of the chest.\nWaist: Measure around the natural waistline, keeping the tape comfortably loose.\nLength: Measure from the top of the shoulder to the hemline.",
  tip: "If your child is between sizes, we recommend sizing up for longer wear.",
  customization: {
    title: "Personalization",
    body:
      "Selected styles can be personalized with your child’s name. Use the customization field on the product page only when the product is marked as customizable in admin.",
    note:
      "Keep the requested name short and double-check spellings before placing the order.",
  },
} as const;

export const defaultCareGuideContent = {
  intro:
    "Our garments are crafted from natural fabrics and feature delicate hand-embroidery. Follow these instructions to ensure they last for generations.",
  categories: [
    {
      name: "Cotton & Muslin",
      icon: "droplet",
      tips: [
        "Machine wash cold (30C max).",
        "Wash inside out on a gentle cycle.",
        "Dry in shade to preserve colors.",
        "Low iron on the reverse side.",
        "Do not use bleach.",
      ],
    },
    {
      name: "Linen",
      icon: "wind",
      tips: [
        "Gentle machine or hand wash.",
        "Reshape while damp.",
        "Dry flat to maintain structure.",
        "Medium iron while slightly damp for best results.",
      ],
    },
    {
      name: "Organza & Tissue Silk",
      icon: "hanger",
      tips: [
        "Hand wash cold only.",
        "Do not wring or twist the fabric.",
        "Hang dry immediately after washing.",
        "Use a cool iron only if necessary.",
        "Store flat to avoid permanent creasing.",
      ],
    },
    {
      name: "Embroidery & Details",
      icon: "leaf",
      tips: [
        "Turn inside out before washing.",
        "Do not soak for more than 5 minutes.",
        "Never scrub or brush the embroidered areas.",
        "For lace trim, use a pressing cloth or iron on reverse only.",
        "Dry flat to prevent heavy embroidery from distorting the fabric.",
      ],
    },
  ],
  storageTitle: "Storage Tips",
  storageBody:
    "Fold garments loosely and store them in breathable cotton bags. Avoid plastic covers. Do not hang heavy, heavily-embroidered pieces for long periods, as this can stretch the fabric.",
} as const;

export const defaultShippingPolicyContent = {
  title: "Shipping Policy",
  intro:
    "We currently ship across India. Every order is packed with care and dispatched from our studio after quality checks.",
  sections: [
    {
      title: "Dispatch Timeline",
      body:
        "Ready-to-ship orders are usually dispatched within 2 to 4 business days. During launches, festive periods, or made-to-order drops, processing may take a little longer.",
    },
    {
      title: "Delivery Timeline",
      body:
        "Metro deliveries usually arrive within 3 to 5 business days after dispatch. Non-metro locations may take 5 to 8 business days depending on courier coverage.",
    },
    {
      title: "Shipping Charges",
      body:
        "Shipping rates and free-shipping thresholds are calculated at checkout. Any promotional shipping offer visible on the storefront will automatically apply to eligible carts.",
    },
    {
      title: "Tracking Updates",
      body:
        "Once your parcel is dispatched, tracking details are shared by email or phone when available. Our team can also confirm the latest status directly on call or WhatsApp.",
    },
  ],
} as const;

export const defaultReturnsExchangeContent = {
  title: "Returns & Exchange",
  intro:
    "We want every order to feel right when it reaches you. If something is not quite right, please review the policy below before raising a request.",
  sections: [
    {
      title: "Eligibility",
      body:
        "Exchange or return requests should be raised within 7 days of delivery. Items must be unused, unwashed, and returned with original tags and packaging.",
    },
    {
      title: "Non-returnable Items",
      body:
        "Customized orders, made-to-order pieces, gift packaging, and any item marked as final sale are not eligible unless the product arrives damaged or incorrect.",
    },
    {
      title: "Damaged or Incorrect Orders",
      body:
        "If your order arrives damaged or you receive the wrong item, please contact us within 48 hours with clear photos of the package and garment so we can help quickly.",
    },
    {
      title: "Exchange Process",
      body:
        "Once your request is approved, our team will guide you through the pickup or return steps. Replacement dispatch depends on stock availability for the requested size or style.",
    },
  ],
} as const;

export const defaultTrackOrderContent = {
  title: "Need help with your order?",
  intro:
    "We now handle all order updates personally. Please contact our team directly on the phone or WhatsApp number below for dispatch, delivery, and order-status help.",
  helpPoints: [
    "Keep your order number ready when you contact us so our team can help faster.",
    "For urgent delivery questions, WhatsApp is the quickest route.",
    "If your parcel is already dispatched, our team will share courier details directly.",
  ],
  reviewPromptTitle: "Want to leave a review?",
  reviewPromptBody:
    "Once you have received your order, you can submit a product review from the Write a Review page. Reviews go to the admin panel for approval before appearing on the storefront.",
} as const;
