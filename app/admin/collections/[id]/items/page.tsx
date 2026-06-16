"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type Product = { id: string; name: string; collectionId?: string | null };
type Collection = { id: string; name: string };

export default function CollectionItemsPage() {
  const params = useParams<{ id: string }>();
  const [collectionId, setCollectionId] = useState("");
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [assignedIds, setAssignedIds] = useState<string[]>([]);

  useEffect(() => {
    void (async () => {
      if (!params.id) return;
      setCollectionId(params.id);
      const [collectionsRes, productsRes] = await Promise.all([
        fetch("/api/admin/collections"),
        fetch("/api/admin/products"),
      ]);
      const collections = await collectionsRes.json();
      const allProducts = await productsRes.json();
      setCollection(collections.find((item: Collection) => item.id === params.id) || null);
      setProducts(allProducts);
      setAssignedIds(allProducts.filter((product: Product) => product.collectionId === params.id).map((product: Product) => product.id));
    })();
  }, [params.id]);

  const assignedProducts = useMemo(() => products.filter((product) => assignedIds.includes(product.id)), [products, assignedIds]);
  const unassignedProducts = useMemo(() => products.filter((product) => !assignedIds.includes(product.id)), [products, assignedIds]);

  async function save() {
    await fetch(`/api/admin/collections/${collectionId}/items`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: assignedIds }),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-4xl">Collection Items</h2>
        <p className="font-sans text-bodytext">{collection ? `Manage products for ${collection.name}.` : "Loading collection..."}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-sm border border-taupe/20 bg-white p-4">
          <h3 className="text-2xl mb-4">In this collection</h3>
          <div className="space-y-3">
            {assignedProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between rounded-sm border border-taupe/10 px-3 py-3">
                <span>{product.name}</span>
                <div className="flex gap-3 text-sm font-sans">
                  <button onClick={() => setAssignedIds(assignedIds.filter((id) => id !== product.id))} className="text-coral underline">Remove</button>
                  <button onClick={() => {
                    if (index === 0) return;
                    const next = [...assignedIds];
                    [next[index - 1], next[index]] = [next[index], next[index - 1]];
                    setAssignedIds(next);
                  }} className="underline">Up</button>
                  <button onClick={() => {
                    if (index === assignedIds.length - 1) return;
                    const next = [...assignedIds];
                    [next[index + 1], next[index]] = [next[index], next[index + 1]];
                    setAssignedIds(next);
                  }} className="underline">Down</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-sm border border-taupe/20 bg-white p-4">
          <h3 className="text-2xl mb-4">All products</h3>
          <div className="space-y-3">
            {unassignedProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-sm border border-taupe/10 px-3 py-3">
                <span>{product.name}</span>
                <button onClick={() => setAssignedIds([...assignedIds, product.id])} className="font-sans text-sm text-coral underline">Add</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button onClick={() => void save()} className="btn-dark">Save Assignments</button>
    </div>
  );
}
