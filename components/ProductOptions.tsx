"use client";

import { useState } from "react";
import { Product } from "@prisma/client";
import { useCart } from "./CartContext";
import { parseProductSizes } from "@/lib/product-utils";

export default function ProductOptions({ product, images }: { product: Product; images: string[] }) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [customizationValue, setCustomizationValue] = useState("");

  const sizes = parseProductSizes(product.sizes);
  const primaryImage = images.length > 0 ? images[0] : "/placeholder.jpg";
  const selectedStock = sizes.find((entry) => entry.size === selectedSize)?.stock ?? 0;
  const totalStock = sizes.reduce((sum, entry) => sum + Math.max(0, entry.stock), 0);
  const isSoldOut = totalStock <= 0;

  function handleAddToCart() {
    if (!selectedSize || selectedStock <= 0) return;

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      size: selectedSize,
      price: product.salePrice || product.price,
      image: primaryImage,
      qty: 1,
      maxStock: selectedStock,
      customizationValue: customizationValue.trim() || undefined,
    });
  }

  return (
    <div className="mt-8">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-sans text-sm uppercase tracking-wider text-bodytext">Select Size</span>
          <a href="/size-guide" className="text-sm text-coral underline transition-colors hover:text-deepbrown">Size Guide</a>
        </div>
        <div className="flex flex-wrap gap-3">
          {sizes.map((entry) => {
            const isAvailable = entry.stock > 0;
            return (
              <button
                key={entry.size}
                type="button"
                disabled={!isAvailable}
                onClick={() => setSelectedSize(entry.size)}
                className={`rounded-sm border px-4 py-2 font-sans text-sm transition-colors ${
                  !isAvailable
                    ? "cursor-not-allowed border-taupe/20 text-taupe/40 line-through"
                    : selectedSize === entry.size
                      ? "border-deepbrown bg-deepbrown text-cream"
                      : "border-taupe text-deepbrown hover:border-deepbrown"
                }`}
              >
                {entry.size}
              </button>
            );
          })}
        </div>
      </div>

      {product.allowCustomization ? (
        <div className="mb-6">
          <label className="mb-2 block font-sans text-sm uppercase tracking-wider text-bodytext">
            {product.customizationLabel || "Child name to be added"}
          </label>
          <input
            value={customizationValue}
            onChange={(event) => setCustomizationValue(event.target.value.slice(0, 20))}
            className="w-full rounded-sm border border-taupe/30 px-3 py-3"
            placeholder="Enter the name you want on the dress"
          />
          <p className="mt-2 font-sans text-sm text-bodytext/80">
            {product.customizationHelp || "Use up to 20 characters for personalization."}
          </p>
        </div>
      ) : null}

      <button
        type="button"
        className={`w-full rounded-sm py-4 text-lg font-sans uppercase tracking-wider transition-all ${
          selectedSize && !isSoldOut ? "bg-coral text-deepbrown hover:opacity-90" : "cursor-not-allowed bg-taupe/20 text-taupe"
        }`}
        disabled={!selectedSize || isSoldOut}
        onClick={handleAddToCart}
      >
        {isSoldOut ? "Sold Out" : selectedSize ? "Add to Bag" : "Select a Size"}
      </button>

      <div className="mt-6 flex flex-col gap-2 text-sm text-bodytext/80">
        <p className="flex items-center gap-2"><span>Package</span> Ships in 2-4 working days - Free above Rs 999</p>
        <p className="flex items-center gap-2"><span>Exchange</span> 7-day exchange policy</p>
        {isSoldOut ? <p className="text-coral">This product is currently out of stock.</p> : null}
      </div>
    </div>
  );
}
