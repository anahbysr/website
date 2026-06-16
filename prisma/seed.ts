import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultHomeContent = {
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
    { id: "0-2", label: "0 - 2 yrs / Newborn & Infant", href: "/shop?age=0-2", imageUrl: "/uploads/checks-teal-infant.jpg" },
    { id: "3-5", label: "3 - 5 yrs / Toddler", href: "/shop?age=3-5", imageUrl: "/uploads/checks-orange.jpg" },
    { id: "6-9", label: "6 - 9 yrs / Big Kids", href: "/shop?age=6-9", imageUrl: "/uploads/ombre-magenta-pink.jpg" },
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
        description: "Crafted by skilled Indian artisans celebrating our rich textile heritage.",
        tone: "warm-yellow",
      },
      {
        title: "Natural Fabrics",
        description: "Soft cottons and breathable weaves, kind to delicate skin and our planet.",
        tone: "sage",
      },
      {
        title: "Fashionable Childhood",
        description: "Designs as joyful and expressive as the little ones who wear them.",
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

const defaultOurStoryContent = {
  heroImage: "/uploads/ombre-yellow-rust.jpg",
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
};

const defaultSizeGuideContent = {
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
};

const defaultCareGuideContent = {
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
};

async function main() {
  const collections = [
    {
      id: "c1-blossom",
      slug: "blossom-garden",
      name: "Blossom Garden",
      description:
        "Signature series. Spaghetti-strap dress, scallop neckline, white crochet lace side panels, hand-embroidered florals, ruffle hem.",
      coverImage: "/uploads/blossom-brown.jpg",
      order: 1,
    },
    {
      id: "c2-checks",
      slug: "checks-and-bows",
      name: "Checks & Bows",
      description:
        "Gingham check fabric with contrast bow accent at waist. Tiered and ruffled skirts with embroidered motifs.",
      coverImage: "/uploads/checks-orange.jpg",
      order: 2,
    },
    {
      id: "c3-ombre",
      slug: "ombre-skies",
      name: "Ombre Skies",
      description:
        "Gradient ombre dresses with flowing A-line silhouettes, scallop hems, and floral embroidery medallions.",
      coverImage: "/uploads/ombre-yellow-rust.jpg",
      order: 3,
    },
    {
      id: "c4-dots",
      slug: "pearl-and-dots",
      name: "Pearl & Dots",
      description:
        "Swiss polka dot fabric, pearl bead shoulder straps, front bows, and floral embroidery details.",
      coverImage: "/uploads/dots-sky.jpg",
      order: 4,
    },
  ];

  for (const collection of collections) {
    await prisma.collection.upsert({
      where: { slug: collection.slug },
      update: collection,
      create: collection,
    });
  }

  const products = [
    {
      slug: "chocolate-brown-blossom-dress",
      name: "Chocolate Brown Blossom Dress",
      description: "Chocolate brown with multicolor floral embroidery and lace.",
      collectionId: "c1-blossom",
      fabric: "Cotton",
      ageFrom: 0,
      ageTo: 9,
      price: 1499,
      salePrice: null,
      badge: null,
      status: "DRAFT",
      sizes: JSON.stringify([
        { size: "0-1Y", stock: 5 },
        { size: "1-2Y", stock: 5 },
        { size: "3-4Y", stock: 5 },
        { size: "5-6Y", stock: 5 },
        { size: "7-8Y", stock: 5 },
        { size: "8-9Y", stock: 5 },
      ]),
      images: JSON.stringify(["/uploads/blossom-brown.jpg"]),
    },
    {
      slug: "red-blossom-dress",
      name: "Red Blossom Dress",
      description: "Red with blue and pink floral embroidery and lace.",
      collectionId: "c1-blossom",
      fabric: "Cotton",
      ageFrom: 0,
      ageTo: 9,
      price: 1499,
      salePrice: null,
      badge: null,
      status: "DRAFT",
      sizes: JSON.stringify([
        { size: "0-1Y", stock: 5 },
        { size: "1-2Y", stock: 5 },
        { size: "3-4Y", stock: 5 },
        { size: "5-6Y", stock: 5 },
        { size: "7-8Y", stock: 5 },
        { size: "8-9Y", stock: 5 },
      ]),
      images: JSON.stringify(["/uploads/blossom-red.jpg"]),
    },
    {
      slug: "buttercup-blossom-dress",
      name: "Buttercup Blossom Dress",
      description: "Buttercup yellow with pastel floral embroidery and lace.",
      collectionId: "c1-blossom",
      fabric: "Cotton",
      ageFrom: 0,
      ageTo: 9,
      price: 1499,
      salePrice: null,
      badge: "New",
      status: "LIVE",
      sizes: JSON.stringify([
        { size: "0-1Y", stock: 5 },
        { size: "1-2Y", stock: 5 },
        { size: "3-4Y", stock: 5 },
        { size: "5-6Y", stock: 5 },
        { size: "7-8Y", stock: 5 },
        { size: "8-9Y", stock: 5 },
      ]),
      images: JSON.stringify(["/uploads/blossom-yellow.jpg"]),
    },
    {
      slug: "rust-blossom-dress",
      name: "Rust Blossom Dress",
      description: "Rust terracotta with delicate floral embroidery and lace.",
      collectionId: "c1-blossom",
      fabric: "Cotton",
      ageFrom: 0,
      ageTo: 9,
      price: 1499,
      salePrice: null,
      badge: null,
      status: "DRAFT",
      sizes: JSON.stringify([
        { size: "0-1Y", stock: 5 },
        { size: "1-2Y", stock: 5 },
        { size: "3-4Y", stock: 5 },
        { size: "5-6Y", stock: 5 },
        { size: "7-8Y", stock: 5 },
        { size: "8-9Y", stock: 5 },
      ]),
      images: JSON.stringify(["/uploads/blossom-rust.jpg"]),
    },
    {
      slug: "magenta-blossom-dress",
      name: "Magenta Blossom Dress",
      description: "Magenta with flower cluster embroidery.",
      collectionId: "c1-blossom",
      fabric: "Cotton",
      ageFrom: 0,
      ageTo: 9,
      price: 1399,
      salePrice: null,
      badge: null,
      status: "DRAFT",
      sizes: JSON.stringify([
        { size: "0-1Y", stock: 5 },
        { size: "1-2Y", stock: 5 },
        { size: "3-4Y", stock: 5 },
        { size: "5-6Y", stock: 5 },
        { size: "7-8Y", stock: 5 },
        { size: "8-9Y", stock: 5 },
      ]),
      images: JSON.stringify(["/uploads/blossom-magenta.jpg"]),
    },
    {
      slug: "ivory-petal-organza-dress",
      name: "Ivory Petal Organza Dress",
      description: "Ivory organza with daisy embroidery, pink bow waist, and lace hem.",
      collectionId: "c1-blossom",
      fabric: "Organza",
      ageFrom: 0,
      ageTo: 9,
      price: 2199,
      salePrice: 1899,
      badge: "Sale",
      status: "LIVE",
      sizes: JSON.stringify([
        { size: "0-1Y", stock: 5 },
        { size: "1-2Y", stock: 5 },
        { size: "3-4Y", stock: 5 },
        { size: "5-6Y", stock: 5 },
        { size: "7-8Y", stock: 5 },
        { size: "8-9Y", stock: 5 },
      ]),
      images: JSON.stringify(["/uploads/blossom-ivory.jpg"]),
    },
    {
      slug: "teal-gingham-bow-dress",
      name: "Teal Gingham Bow Dress",
      description: "Teal gingham with tie front and ruffle hem.",
      collectionId: "c2-checks",
      fabric: "Cotton",
      ageFrom: 0,
      ageTo: 2,
      price: 1299,
      salePrice: null,
      badge: "New",
      status: "DRAFT",
      sizes: JSON.stringify([
        { size: "0-1Y", stock: 5 },
        { size: "1-2Y", stock: 5 },
      ]),
      images: JSON.stringify(["/uploads/checks-teal-infant.jpg"]),
    },
    {
      slug: "pink-gingham-bow-dress",
      name: "Pink Gingham Bow Dress",
      description: "Pink gingham with bow ties and a flounce hem.",
      collectionId: "c2-checks",
      fabric: "Cotton",
      ageFrom: 0,
      ageTo: 2,
      price: 1299,
      salePrice: null,
      badge: null,
      status: "DRAFT",
      sizes: JSON.stringify([
        { size: "0-1Y", stock: 5 },
        { size: "1-2Y", stock: 5 },
      ]),
      images: JSON.stringify(["/uploads/checks-pink-infant.jpg"]),
    },
    {
      slug: "orange-gingham-tiered-dress",
      name: "Orange Gingham Tiered Dress",
      description: "Orange gingham with a yellow bow waist and tiered ruffle skirt.",
      collectionId: "c2-checks",
      fabric: "Cotton",
      ageFrom: 3,
      ageTo: 5,
      price: 1599,
      salePrice: null,
      badge: "Bestseller",
      status: "LIVE",
      sizes: JSON.stringify([
        { size: "3-4Y", stock: 5 },
        { size: "4-5Y", stock: 5 },
      ]),
      images: JSON.stringify(["/uploads/checks-orange.jpg"]),
    },
    {
      slug: "aqua-gingham-tiered-dress",
      name: "Aqua Gingham Tiered Dress",
      description: "Aqua gingham with a pink bow waist and tiered ruffle skirt.",
      collectionId: "c2-checks",
      fabric: "Cotton",
      ageFrom: 3,
      ageTo: 5,
      price: 1599,
      salePrice: null,
      badge: null,
      status: "DRAFT",
      sizes: JSON.stringify([
        { size: "3-4Y", stock: 5 },
        { size: "4-5Y", stock: 5 },
      ]),
      images: JSON.stringify(["/uploads/checks-aqua.jpg"]),
    },
    {
      slug: "green-teal-ombre-dress",
      name: "Green to Teal Ombre Dress",
      description: "Green-to-teal gradient with teal and green floral embroidery.",
      collectionId: "c3-ombre",
      fabric: "Muslin",
      ageFrom: 0,
      ageTo: 9,
      price: 1899,
      salePrice: null,
      badge: null,
      status: "DRAFT",
      sizes: JSON.stringify([
        { size: "0-1Y", stock: 5 },
        { size: "1-2Y", stock: 5 },
        { size: "3-4Y", stock: 5 },
        { size: "5-6Y", stock: 5 },
        { size: "7-8Y", stock: 5 },
        { size: "8-9Y", stock: 5 },
      ]),
      images: JSON.stringify(["/uploads/ombre-green-teal.jpg"]),
    },
    {
      slug: "pink-lavender-ombre-dress",
      name: "Pink to Lavender Ombre Dress",
      description: "Pink-to-lavender gradient with orange floral embroidery and pearl scatter.",
      collectionId: "c3-ombre",
      fabric: "Muslin",
      ageFrom: 0,
      ageTo: 9,
      price: 1899,
      salePrice: null,
      badge: null,
      status: "DRAFT",
      sizes: JSON.stringify([
        { size: "0-1Y", stock: 5 },
        { size: "1-2Y", stock: 5 },
        { size: "3-4Y", stock: 5 },
        { size: "5-6Y", stock: 5 },
        { size: "7-8Y", stock: 5 },
        { size: "8-9Y", stock: 5 },
      ]),
      images: JSON.stringify(["/uploads/ombre-pink-lavender.jpg"]),
    },
    {
      slug: "magenta-pink-ombre-dress",
      name: "Magenta to Pink Ombre Dress",
      description: "Dark magenta-to-pink gradient with pink floral embroidery and pearl scatter.",
      collectionId: "c3-ombre",
      fabric: "Muslin",
      ageFrom: 0,
      ageTo: 9,
      price: 1899,
      salePrice: null,
      badge: null,
      status: "DRAFT",
      sizes: JSON.stringify([
        { size: "0-1Y", stock: 5 },
        { size: "1-2Y", stock: 5 },
        { size: "3-4Y", stock: 5 },
        { size: "5-6Y", stock: 5 },
        { size: "7-8Y", stock: 5 },
        { size: "8-9Y", stock: 5 },
      ]),
      images: JSON.stringify(["/uploads/ombre-magenta-pink.jpg"]),
    },
    {
      slug: "yellow-rust-ombre-dress",
      name: "Yellow to Rust Ombre Dress",
      description: "Buttercup yellow-to-rust gradient with floral medallion embroidery.",
      collectionId: "c3-ombre",
      fabric: "Muslin",
      ageFrom: 0,
      ageTo: 9,
      price: 1899,
      salePrice: null,
      badge: "New",
      status: "LIVE",
      sizes: JSON.stringify([
        { size: "0-1Y", stock: 5 },
        { size: "1-2Y", stock: 5 },
        { size: "3-4Y", stock: 5 },
        { size: "5-6Y", stock: 5 },
        { size: "7-8Y", stock: 5 },
        { size: "8-9Y", stock: 5 },
      ]),
      images: JSON.stringify(["/uploads/ombre-yellow-rust.jpg"]),
    },
    {
      slug: "periwinkle-pearl-dots-dress",
      name: "Periwinkle Pearl & Dots Dress",
      description: "Periwinkle blue polka dot with floral hem embroidery.",
      collectionId: "c4-dots",
      fabric: "Cotton",
      ageFrom: 0,
      ageTo: 9,
      price: 1699,
      salePrice: null,
      badge: null,
      status: "DRAFT",
      sizes: JSON.stringify([
        { size: "0-1Y", stock: 5 },
        { size: "1-2Y", stock: 5 },
        { size: "3-4Y", stock: 5 },
        { size: "5-6Y", stock: 5 },
        { size: "7-8Y", stock: 5 },
        { size: "8-9Y", stock: 5 },
      ]),
      images: JSON.stringify(["/uploads/dots-periwinkle.jpg"]),
    },
    {
      slug: "pink-pearl-dots-dress",
      name: "Pink Pearl & Dots Dress",
      description: "Soft pink polka dot with floral hem embroidery.",
      collectionId: "c4-dots",
      fabric: "Cotton",
      ageFrom: 0,
      ageTo: 2,
      price: 1499,
      salePrice: null,
      badge: null,
      status: "DRAFT",
      sizes: JSON.stringify([
        { size: "0-1Y", stock: 5 },
        { size: "1-2Y", stock: 5 },
      ]),
      images: JSON.stringify(["/uploads/dots-pink.jpg"]),
    },
    {
      slug: "sky-blue-pearl-dots-dress",
      name: "Sky Blue Pearl & Dots Dress",
      description: "Sky blue polka dot with floral hem embroidery.",
      collectionId: "c4-dots",
      fabric: "Cotton",
      ageFrom: 0,
      ageTo: 9,
      price: 1699,
      salePrice: null,
      badge: "New",
      status: "LIVE",
      sizes: JSON.stringify([
        { size: "0-1Y", stock: 5 },
        { size: "1-2Y", stock: 5 },
        { size: "3-4Y", stock: 5 },
        { size: "5-6Y", stock: 5 },
        { size: "7-8Y", stock: 5 },
        { size: "8-9Y", stock: 5 },
      ]),
      images: JSON.stringify(["/uploads/dots-sky.jpg"]),
    },
  ];

  for (const [index, product] of products.entries()) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: { ...product, collectionOrder: index },
      create: { ...product, collectionOrder: index },
    });
  }

  const orangeGingham = await prisma.product.findUnique({
    where: { slug: "orange-gingham-tiered-dress" },
  });
  const buttercupBlossom = await prisma.product.findUnique({
    where: { slug: "buttercup-blossom-dress" },
  });
  const yellowRustOmbre = await prisma.product.findUnique({
    where: { slug: "yellow-rust-ombre-dress" },
  });

  if (orangeGingham && buttercupBlossom && yellowRustOmbre) {
    const reviews = [
      {
        productId: orangeGingham.id,
        orderId: "seed-order-1",
        author: "Priya M.",
        city: "Mumbai",
        rating: 5,
        body:
          "The fabric is incredibly soft and the embroidery is stunning. My daughter wore it all day without any complaints.",
        status: "APPROVED",
      },
      {
        productId: buttercupBlossom.id,
        orderId: "seed-order-2",
        author: "Anjali S.",
        city: "Delhi",
        rating: 5,
        body:
          "Beautiful design and perfect fit. I love the sustainable packaging as well. Will definitely buy more.",
        status: "APPROVED",
      },
      {
        productId: yellowRustOmbre.id,
        orderId: "seed-order-3",
        author: "Sneha K.",
        city: "Bangalore",
        rating: 4,
        body:
          "The ombre effect is so unique. The dress is gorgeous, though I wish it came in slightly larger sizes for my older niece too.",
        status: "APPROVED",
      },
    ];

    for (const [index, review] of reviews.entries()) {
      await prisma.order.upsert({
        where: { orderNumber: `SEED-ORD-000${index + 1}` },
        update: {},
        create: {
          id: review.orderId,
          orderNumber: `SEED-ORD-000${index + 1}`,
          customerName: review.author,
          customerPhone: "9999999999",
          customerEmail: "test@example.com",
          address: `123 Test St, ${review.city}`,
          addressLine1: "123 Test St",
          city: review.city,
          state: "State",
          pincode: "110001",
          items: JSON.stringify([
            { productId: review.productId, name: "Product", size: "3-4Y", qty: 1, price: 1499 },
          ]),
          subtotal: 1499,
          shippingCharge: 0,
          total: 1499,
          paymentMethod: "ONLINE",
          status: "DELIVERED",
        },
      });

      const existingReview = await prisma.review.findFirst({
        where: { productId: review.productId, author: review.author },
      });

      if (!existingReview) {
        await prisma.review.create({ data: review });
      }
    }
  }

  const liveFeaturedProducts = await prisma.product.findMany({
    where: { slug: { in: ["buttercup-blossom-dress", "orange-gingham-tiered-dress", "ivory-petal-organza-dress", "yellow-rust-ombre-dress"] } },
    select: { id: true },
  });

  const settings = [
    {
      key: "announcement_bar",
      value: "Free shipping above Rs 999 · Pan-India delivery · New arrivals every fortnight",
    },
    { key: "featured_product_ids", value: JSON.stringify(liveFeaturedProducts.map((product) => product.id)) },
    { key: "whatsapp_number", value: "918801970907" },
    { key: "hero_image", value: "/uploads/ombre-yellow-rust.jpg" },
    { key: "site_logo_image", value: "/uploads/anah-logo.png" },
    { key: "instagram_handle", value: "anahbysr" },
    {
      key: "instagram_post_urls",
      value: JSON.stringify([
        "https://www.instagram.com/p/DYzZZ0xTsfk/",
        "https://www.instagram.com/p/DYwwDjrTn79/",
        "https://www.instagram.com/p/DYCuPSEE96z/",
        "https://www.instagram.com/p/DX4GDL5Eztm/",
        "https://www.instagram.com/p/DYM-99tk9HV/",
      ]),
    },
    { key: "home_content", value: JSON.stringify(defaultHomeContent) },
    { key: "our_story_content", value: JSON.stringify(defaultOurStoryContent) },
    { key: "size_guide_content", value: JSON.stringify(defaultSizeGuideContent) },
    { key: "care_guide_content", value: JSON.stringify(defaultCareGuideContent) },
    { key: "free_shipping_threshold", value: "999" },
    { key: "flat_shipping_rate", value: "99" },
    { key: "cod_surcharge", value: "50" },
  ];

  for (const setting of settings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
