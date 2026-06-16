import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { isProductInStock } from "@/lib/product-utils";

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const collection = await prisma.collection.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      products: {
        where: { status: "LIVE" },
        orderBy: [{ collectionOrder: "asc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!collection) {
    notFound();
  }
  const availableProducts = collection.products.filter(isProductInStock);

  return (
    <div className="pb-16">
      <div className="relative h-[400px] w-full bg-deepbrown overflow-hidden">
        <Image
          src={collection.coverImage ?? "/uploads/ombre-yellow-rust.jpg"}
          alt={collection.name}
          fill
          className="object-cover object-top opacity-60"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <h1 className="text-5xl md:text-6xl text-cream font-serif mb-4">{collection.name}</h1>
          <p className="text-cream/90 max-w-2xl font-sans text-lg">{collection.description}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-16">
        {availableProducts.length === 0 ? (
          <p className="text-center text-bodytext text-lg">Coming soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {availableProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
