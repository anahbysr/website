import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { isProductInStock } from "@/lib/product-utils";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const ageParam = resolvedParams.age as string;
  const collectionParam = resolvedParams.collection as string;

  const whereClause: Prisma.ProductWhereInput = { status: "LIVE" };

  if (ageParam) {
    const [min, max] = ageParam.split("-").map(Number);
    if (!Number.isNaN(min) && !Number.isNaN(max)) {
      whereClause.AND = [{ ageFrom: { lte: max } }, { ageTo: { gte: min } }];
    }
  }

  if (collectionParam) {
    whereClause.collection = { slug: collectionParam };
  }

  const [products, collections] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    }),
    prisma.collection.findMany({
      orderBy: { order: "asc" },
    }),
  ]);
  const availableProducts = products.filter(isProductInStock);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl text-center mb-8">Shop All</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4">
          <div className="sticky top-24 space-y-8">
            <div>
              <h3 className="font-serif text-xl mb-4">Shop by Age</h3>
              <ul className="space-y-2 text-bodytext">
                <li><Link href="/shop" className={`hover:text-deepbrown ${!ageParam ? "font-bold text-deepbrown" : ""}`}>All Ages</Link></li>
                <li><Link href="/shop?age=0-2" className={`hover:text-deepbrown ${ageParam === "0-2" ? "font-bold text-deepbrown" : ""}`}>0 - 2 yrs / Newborn & Infant</Link></li>
                <li><Link href="/shop?age=3-5" className={`hover:text-deepbrown ${ageParam === "3-5" ? "font-bold text-deepbrown" : ""}`}>3 - 5 yrs / Toddler</Link></li>
                <li><Link href="/shop?age=6-9" className={`hover:text-deepbrown ${ageParam === "6-9" ? "font-bold text-deepbrown" : ""}`}>6 - 9 yrs / Big Kids</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-serif text-xl mb-4">Collections</h3>
              <ul className="space-y-2 text-bodytext">
                <li><Link href="/shop" className={`hover:text-deepbrown ${!collectionParam ? "font-bold text-deepbrown" : ""}`}>All Collections</Link></li>
                {collections.map((collection) => (
                  <li key={collection.id}>
                    <Link href={`/shop?collection=${collection.slug}`} className={`hover:text-deepbrown ${collectionParam === collection.slug ? "font-bold text-deepbrown" : ""}`}>
                      {collection.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        <main className="w-full md:w-3/4">
          {availableProducts.length === 0 ? (
            <div className="text-center py-16 text-bodytext">
              <p>No products found matching your criteria.</p>
              <Link href="/shop" className="text-coral underline mt-4 inline-block">Clear all filters</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
