import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export default async function CollectionsIndexPage() {
  const collections = await prisma.collection.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl text-center mb-12">Our Collections</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {collections.map((collection) => (
          <Link key={collection.id} href={`/collections/${collection.slug}`} className="group block relative overflow-hidden rounded-sm aspect-[4/3]">
            <Image
              src={collection.coverImage ?? "/uploads/ombre-yellow-rust.jpg"}
              alt={collection.name}
              fill
              className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-deepbrown/40 flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-cream text-4xl font-serif mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{collection.name}</h2>
              <p className="text-cream/90 font-sans max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                {collection.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
