import type { Product } from "@prisma/client";
import { parseJsonObject } from "@/lib/serializers";

export type ProductSizeStock = {
  size: string;
  stock: number;
};

export const SUGGESTED_BADGES = [
  "",
  "New",
  "Bestseller",
  "Sale",
  "Limited",
  "Festive",
  "Moving Fast",
  "Personalized",
] as const;

export function parseProductSizes(value: string | null | undefined) {
  return parseJsonObject<ProductSizeStock[]>(value, []);
}

export function getTotalStock(product: Pick<Product, "sizes">) {
  return parseProductSizes(product.sizes).reduce((total, entry) => total + Math.max(0, entry.stock), 0);
}

export function isProductInStock(product: Pick<Product, "sizes">) {
  return getTotalStock(product) > 0;
}

export function getSizeStock(product: Pick<Product, "sizes">, size: string) {
  const match = parseProductSizes(product.sizes).find((entry) => entry.size === size);
  return Math.max(0, match?.stock ?? 0);
}
