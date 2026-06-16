import Image from "next/image";
import Link from "next/link";
import { Product } from "@prisma/client";
import { formatCurrency, parseJsonObject } from "@/lib/serializers";
import { isProductInStock } from "@/lib/product-utils";

export default function ProductCard({ product }: { product: Product }) {
  const images = parseJsonObject<string[]>(product.images, []);
  const primaryImage = images.length > 0 ? images[0] : "/placeholder.jpg";
  const badge = product.badge?.trim();
  const inStock = isProductInStock(product);
  const badgeTone =
    badge?.toLowerCase() === "new"
      ? "bg-coral text-deepbrown"
      : badge?.toLowerCase() === "bestseller"
        ? "bg-sage text-deepbrown"
        : "bg-warm-yellow text-deepbrown";

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-sm border border-taupe/10 bg-white shadow-sm transition-shadow hover:shadow-md">
      {badge ? (
        <div className={`absolute left-2 top-2 z-10 rounded-sm px-2 py-1 font-sans text-xs uppercase tracking-wider ${badgeTone}`}>
          {badge}
        </div>
      ) : null}
      {!inStock ? (
        <div className="absolute right-2 top-2 z-10 rounded-sm bg-deepbrown px-2 py-1 font-sans text-xs uppercase tracking-wider text-cream">
          Sold Out
        </div>
      ) : null}

      <Link href={`/shop/${product.slug}`} className="relative block h-[280px] w-full overflow-hidden">
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-deepbrown/0 transition-colors group-hover:bg-deepbrown/10">
          <span className="translate-y-4 rounded-sm bg-white/90 px-6 py-2 font-sans text-sm text-deepbrown opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            {inStock ? "+ Add to bag" : "View details"}
          </span>
        </div>
      </Link>

      <div className="flex flex-grow flex-col p-4">
        <Link href={`/shop/${product.slug}`} className="mb-1 line-clamp-2 font-serif text-xl text-deepbrown transition-colors hover:text-coral">
          {product.name}
        </Link>
        <p className="mb-3 font-sans text-xs uppercase tracking-wider text-bodytext">
          {product.ageFrom}-{product.ageTo} yrs - {product.fabric}
        </p>
        <div className="mt-auto flex items-center gap-2">
          {product.salePrice ? (
            <>
              <span className="text-lg font-bold text-coral">{formatCurrency(product.salePrice)}</span>
              <span className="text-sm text-bodytext/60 line-through">{formatCurrency(product.price)}</span>
            </>
          ) : (
            <span className="text-lg font-bold text-deepbrown">{formatCurrency(product.price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
