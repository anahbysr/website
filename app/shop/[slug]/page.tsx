import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import ProductOptions from "@/components/ProductOptions";
import { formatCurrency, parseJsonObject } from "@/lib/serializers";
import { isProductInStock } from "@/lib/product-utils";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const product = await prisma.product.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      collection: true,
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const images = parseJsonObject<string[]>(product.images, []);
  const primaryImage = images.length > 0 ? images[0] : "/placeholder.jpg";
  const inStock = isProductInStock(product);

  const relatedProducts = (await prisma.product.findMany({
    where: {
      collectionId: product.collectionId ?? undefined,
      id: { not: product.id },
      status: "LIVE",
    },
    take: 4,
  })).filter(isProductInStock);

  return (
    <div className="container mx-auto px-4 py-12">
      <nav className="mb-8 flex gap-2 text-sm text-taupe">
        <Link href="/" className="transition-colors hover:text-deepbrown">Home</Link>
        <span>/</span>
        {product.collection ? (
          <>
            <Link href={`/collections/${product.collection.slug}`} className="transition-colors hover:text-deepbrown">{product.collection.name}</Link>
            <span>/</span>
          </>
        ) : null}
        <span className="text-bodytext">{product.name}</span>
      </nav>

      <div className="mb-20 flex flex-col gap-12 md:flex-row">
        <div className="w-full md:w-1/2">
          <div className="relative mb-4 aspect-[4/5] w-full overflow-hidden rounded-sm bg-cream/50">
            <Image src={primaryImage} alt={product.name} fill className="object-cover object-top" sizes="(max-width: 768px) 100vw, 50vw" priority />
          </div>
          {images.length > 1 ? (
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, i) => (
                <div key={img} className="relative aspect-[4/5] overflow-hidden rounded-sm border bg-cream/50 hover:border-deepbrown">
                  <Image src={img} alt={`${product.name} - ${i + 1}`} fill className="object-cover object-top" sizes="(max-width: 768px) 25vw, 12vw" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex w-full flex-col md:w-1/2">
          {product.collection ? (
            <Link href={`/collections/${product.collection.slug}`} className="mb-2 text-sm uppercase tracking-wider text-taupe transition-colors hover:text-deepbrown">
              {product.collection.name}
            </Link>
          ) : null}
          <h1 className="mb-4 font-serif text-4xl text-deepbrown md:text-5xl">{product.name}</h1>

          <div className="mb-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              {product.salePrice ? (
                <>
                  <span className="text-3xl font-bold text-coral">{formatCurrency(product.salePrice)}</span>
                  <span className="text-xl text-bodytext/50 line-through">{formatCurrency(product.price)}</span>
                </>
              ) : (
                <span className="text-3xl font-bold text-deepbrown">{formatCurrency(product.price)}</span>
              )}
            </div>
            {product.badge ? (
              <span className={`rounded-sm px-2 py-1 text-xs uppercase tracking-wider ${
                product.badge.toLowerCase() === "new"
                  ? "bg-coral text-deepbrown"
                  : product.badge.toLowerCase() === "bestseller"
                    ? "bg-sage text-deepbrown"
                    : "bg-warm-yellow text-deepbrown"
              }`}>
                {product.badge}
              </span>
            ) : null}
            {!inStock ? (
              <span className="rounded-sm bg-deepbrown px-2 py-1 text-xs uppercase tracking-wider text-cream">
                Sold Out
              </span>
            ) : null}
          </div>

          <div className="mb-6 flex gap-1 text-sm text-coral">
            {"★★★★★"}
            <span className="ml-2 cursor-pointer text-bodytext underline">({product.reviews.length} reviews)</span>
          </div>

          <p className="mb-8 text-lg leading-relaxed text-bodytext">{product.description}</p>
          <ProductOptions product={product} images={images} />

          <div className="mt-12 border-t border-taupe/20 pt-6">
            <h3 className="mb-4 font-serif text-xl text-deepbrown">Fabric & Care</h3>
            <p className="mb-2 text-bodytext"><strong>Fabric:</strong> {product.fabric}</p>
            <p className="text-sm text-bodytext/80">
              Please refer to our <Link href="/care-guide" className="text-coral underline hover:text-deepbrown">Care Guide</Link> for detailed instructions on maintaining hand-embroidery and delicate fabrics.
            </p>
          </div>
        </div>
      </div>

      <section className="mb-20 border-t border-taupe/20 pt-16">
        <h2 className="mb-12 text-center font-serif text-3xl">Customer Reviews</h2>
        {product.reviews.length === 0 ? (
          <p className="text-center text-bodytext">No reviews yet for this product.</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {product.reviews.map((review) => (
              <div key={review.id} className="rounded-sm border border-taupe/10 bg-white p-6">
                <div className="mb-3 flex gap-1 text-coral">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                  ))}
                </div>
                <p className="mb-4 italic text-bodytext">&quot;{review.body}&quot;</p>
                <div>
                  <p className="font-bold text-deepbrown">{review.author}{review.city ? ` - ${review.city}` : ""}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-sage">✓ Verified purchase</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-10 text-center">
          <Link href="/write-review" className="btn-outline inline-block">
            Write a Review
          </Link>
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="mb-8 border-t border-taupe/20 pt-16">
          <h2 className="mb-12 text-center font-serif text-3xl">You may also like</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
