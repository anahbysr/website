import { prisma } from "@/lib/prisma";
import WriteReviewForm from "@/components/WriteReviewForm";

export default async function WriteReviewPage() {
  const products = await prisma.product.findMany({
    where: { status: "LIVE" },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="container mx-auto max-w-3xl px-4 py-20">
      <h1 className="mb-6 text-5xl text-deepbrown">Write a Review</h1>
      <p className="mb-10 max-w-2xl font-sans text-lg font-light leading-8 text-bodytext">
        Share what you loved, how the fit felt, and anything another parent should know. Your
        review is saved for admin approval before it appears on the storefront.
      </p>
      <WriteReviewForm products={products} />
    </div>
  );
}
