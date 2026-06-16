import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { InstagramFeedContent } from "@/components/InstagramFeed";
import { prisma } from "@/lib/prisma";
import { isProductInStock } from "@/lib/product-utils";
import { getStorefrontConfig } from "@/lib/storefront";

export const revalidate = 3600;

export default async function Home() {
  const config = await getStorefrontConfig();
  const [featuredProducts, topReviews, collections] = await Promise.all([
    prisma.product.findMany({
      where: {
        id: { in: config.featuredProductIds },
        status: "LIVE",
      },
    }),
    prisma.review.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { product: true },
    }),
    prisma.collection.findMany({
      orderBy: { order: "asc" },
      take: 4,
    }),
  ]);

  featuredProducts.sort(
    (a, b) => config.featuredProductIds.indexOf(a.id) - config.featuredProductIds.indexOf(b.id),
  );

  const availableFeaturedProducts = featuredProducts.filter(isProductInStock);
  const home = config.homeContent;
  const titleParts = home.hero.title.split(home.hero.accentWord);

  return (
    <>
      <section className="container mx-auto px-4 py-8 md:py-16">
        <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] md:gap-12">
          <div className="order-2 flex h-full flex-col justify-center space-y-6 px-4 text-center md:order-1 md:px-10 md:text-left">
            <span className="font-sans text-[12px] font-light uppercase tracking-[0.28em] text-deepbrown/70 md:text-[13px]">
              {home.hero.eyebrow}
            </span>
            <h1 className="font-serif font-normal text-[52px] leading-[1.05] text-deepbrown md:text-[68px]">
              {titleParts[0]}
              <span className="text-coral">{home.hero.accentWord}</span>
              {titleParts[1] ?? ""}
            </h1>
            <p className="max-w-md font-sans text-[15px] font-light leading-[1.8] text-bodytext md:text-[16px]">
              {home.hero.description}
            </p>
            <p className="max-w-md font-sans text-[14px] font-light leading-[1.8] text-bodytext/90 md:text-[15px]">
              {home.hero.secondaryDescription}
            </p>
            <div className="flex gap-4 pt-4">
              <Link href={home.hero.primaryCtaHref} className="btn-dark">
                {home.hero.primaryCtaLabel}
              </Link>
              <Link href={home.hero.secondaryCtaHref} className="btn-outline">
                {home.hero.secondaryCtaLabel}
              </Link>
            </div>
          </div>

          <div className="order-1 mx-auto w-full max-w-[520px] md:order-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-white/40 shadow-sm">
              <Image
                src="/images/products/ombre-yellow-rust.jpg"
                alt={home.hero.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 44vw, 520px"
                className="object-cover object-center"
                priority
              />
              <div className="absolute right-4 top-4 rounded-sm bg-sage px-3 py-1 font-sans text-xs uppercase tracking-wider text-deepbrown">
                {home.hero.badge}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-[30px] md:text-[38px]">
          {home.sectionTitles.shopByAge}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {home.ageCards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="group relative block h-[450px] overflow-hidden rounded-sm"
            >
              <Image
                src={card.imageUrl}
                alt={card.label}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-deepbrown/80 to-transparent p-6">
                <h3 className="font-serif text-2xl text-cream">{card.label}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-[30px] md:text-[38px]">
          {home.sectionTitles.featured}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {availableFeaturedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/shop" className="btn-outline">
            View All
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-[30px] md:text-[38px]">
          {home.sectionTitles.collections}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.slug}`}
              className="group relative block aspect-[4/5] overflow-hidden rounded-sm"
            >
              {collection.coverImage ? (
                <Image
                  src={collection.coverImage}
                  alt={collection.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : null}
              <div className="absolute inset-0 flex items-end bg-deepbrown/35 p-6">
                <h3 className="text-3xl text-cream">{collection.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-deepbrown px-4 pb-20 pt-16 text-cream">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-6 font-serif text-4xl italic text-cream md:text-5xl">
            &quot;{home.brandStory.quote}&quot;
          </h2>
          <p className="mb-14 font-sans text-sm uppercase tracking-widest text-taupe">
            {home.brandStory.kicker}
          </p>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {home.brandStory.values.map((value, index) => {
              const tones = ["text-warm-yellow", "text-sage", "text-coral"];
              return (
                <div key={`${value.title}-${index}`} className="flex flex-col items-center">
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cream/10 ${
                      tones[index] ?? "text-cream"
                    }`}
                  >
                    <span className="font-serif text-xl">{index + 1}</span>
                  </div>
                  <h3 className={`mb-2 font-serif text-2xl ${tones[index] ?? "text-cream"}`}>
                    {value.title}
                  </h3>
                  <p className="text-sm text-cream/80">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-[30px] md:text-[38px]">
          {home.sectionTitles.reviews}
        </h2>
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {topReviews.map((review) => (
            <div
              key={review.id}
              className="flex h-full flex-col rounded-sm border border-taupe/10 bg-white p-8 shadow-sm"
            >
              <div className="mb-4 flex gap-1 text-coral">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span key={index}>{index < review.rating ? "\u2605" : "\u2606"}</span>
                ))}
              </div>
              <p className="mb-6 flex-grow italic text-bodytext">&quot;{review.body}&quot;</p>
              <div>
                <p className="font-bold text-deepbrown">
                  {review.author}
                  {review.city ? ` - ${review.city}` : ""}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-taupe">
                  <span className="text-sage">{"\u2713"}</span> Verified purchase - {review.product.name}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 rounded-lg border border-taupe/30 bg-white px-8 py-6 text-center shadow-sm sm:flex-row sm:gap-8 sm:text-left">
          <div className="font-serif text-[44px] leading-none text-deepbrown">
            {home.reviewsSummary.score}
          </div>
          <div className="flex-1">
            <div className="text-lg tracking-[0.15em] text-coral">
              {home.reviewsSummary.stars}
            </div>
            <div className="mt-1 text-sm leading-snug text-bodytext">
              {home.reviewsSummary.summaryText}
            </div>
          </div>
          <Link
            href={home.reviewsSummary.ctaHref}
            className="whitespace-nowrap font-sans text-[11px] uppercase tracking-[0.16em] text-coral transition-colors hover:text-deepbrown"
          >
            {home.reviewsSummary.ctaLabel} {"->"}
          </Link>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-12 text-[30px] md:text-[38px]">{home.sectionTitles.instagram}</h2>
          <InstagramFeedContent
            instagramHandle={config.instagramHandle}
            instagramPostUrls={config.instagramPostUrls}
          />
        </div>
      </section>
    </>
  );
}
