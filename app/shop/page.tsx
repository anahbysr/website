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

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });
  const availableProducts = products.filter(isProductInStock);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl text-center mb-8">Shop All</h1>

      {availableProducts.length === 0 ? (
        <div className="text-center py-16 text-bodytext">
          <p>No products found matching your criteria.</p>
          <Link href="/shop" className="text-coral underline mt-4 inline-block">Clear all filters</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {availableProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
