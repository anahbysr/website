"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "./CartContext";

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeItem } = useCart();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const freeShippingThreshold = 999;
  const isFreeShipping = subtotal >= freeShippingThreshold;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-deepbrown/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl">
        <div className="flex items-center justify-between border-b border-taupe/30 p-4">
          <h2 className="font-serif text-2xl text-deepbrown">Your Bag ({items.length})</h2>
          <button onClick={() => setIsCartOpen(false)} className="p-2 text-bodytext hover:text-deepbrown">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-bodytext">
              <p className="mb-4">Your bag is empty.</p>
              <button onClick={() => setIsCartOpen(false)} className="btn-primary">
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.customizationValue ?? "standard"}`} className="flex gap-4 border-b border-taupe/20 pb-4">
                <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-sm bg-taupe/20">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <Link
                        href={`/shop/${item.slug}`}
                        className="line-clamp-2 pr-4 font-serif text-lg leading-tight text-deepbrown hover:underline"
                        onClick={() => setIsCartOpen(false)}
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.productId, item.size, item.customizationValue)}
                        className="text-bodytext/60 transition-colors hover:text-deepbrown"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-bodytext">Size: {item.size}</p>
                    {item.customizationValue ? (
                      <p className="mt-1 text-sm text-bodytext">Personalization: {item.customizationValue}</p>
                    ) : null}
                    <p className="mt-1 text-deepbrown">Rs {item.price}</p>
                  </div>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center rounded-sm border border-taupe/50">
                      <button
                        className="p-1 text-bodytext hover:text-deepbrown"
                        onClick={() => updateQuantity(item.productId, item.size, item.qty - 1, item.customizationValue)}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center text-sm">{item.qty}</span>
                      <button
                        className="p-1 text-bodytext hover:text-deepbrown disabled:cursor-not-allowed disabled:text-bodytext/30"
                        onClick={() => updateQuantity(item.productId, item.size, item.qty + 1, item.customizationValue)}
                        disabled={typeof item.maxStock === "number" && item.qty >= item.maxStock}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 ? (
          <div className="border-t border-taupe/30 bg-white/50 p-4">
            <div className="mb-2 flex justify-between text-sm text-bodytext">
              <span>Subtotal</span>
              <span>Rs {subtotal}</span>
            </div>
            <div className="mb-4 flex justify-between text-sm text-bodytext">
              <span>Shipping</span>
              <span>{isFreeShipping ? "Free" : "Rs 99"}</span>
            </div>
            <div className="mb-6 flex justify-between font-serif text-xl text-deepbrown">
              <span>Total</span>
              <span>Rs {isFreeShipping ? subtotal : subtotal + 99}</span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="btn-dark flex w-full items-center justify-center py-4 text-center text-lg tracking-wider"
            >
              Checkout
            </Link>
            {!isFreeShipping ? (
              <p className="mt-3 text-center text-xs text-bodytext/80">
                Add Rs {freeShippingThreshold - subtotal} more for free shipping!
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
