"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCurrency, parseJsonObject, slugify } from "@/lib/serializers";
import { SUGGESTED_BADGES } from "@/lib/product-utils";

type Collection = { id: string; name: string };
type ProductRecord = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  salePrice?: number | null;
  badge?: string | null;
  allowCustomization: boolean;
  customizationLabel?: string | null;
  customizationHelp?: string | null;
  status: string;
  images: string;
  sizes: string;
  collectionId?: string | null;
  collection?: { name: string } | null;
  fabric: string;
  ageFrom: number;
  ageTo: number;
};

type ProductForm = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  salePrice: string;
  badge: string;
  allowCustomization: boolean;
  customizationLabel: string;
  customizationHelp: string;
  status: string;
  collectionId: string;
  images: string[];
  sizes: Array<{ size: string; stock: number }>;
  fabric: string;
  ageFrom: string;
  ageTo: string;
};

const emptyForm: ProductForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  salePrice: "",
  badge: "",
  allowCustomization: false,
  customizationLabel: "Child name to be added",
  customizationHelp: "Use this when you offer name embroidery or printing on the garment.",
  status: "DRAFT",
  collectionId: "",
  images: [],
  sizes: [
    { size: "XS", stock: 0 },
    { size: "S", stock: 0 },
    { size: "M", stock: 0 },
    { size: "L", stock: 0 },
    { size: "XL", stock: 0 },
    { size: "XXL", stock: 0 },
  ],
  fabric: "Cotton",
  ageFrom: "0",
  ageTo: "9",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [collectionFilter, setCollectionFilter] = useState("ALL");
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [open, setOpen] = useState(false);

  async function loadData() {
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (collectionFilter !== "ALL") params.set("collectionId", collectionFilter);
    const [productRes, collectionRes] = await Promise.all([
      fetch(`/api/admin/products${params.toString() ? `?${params.toString()}` : ""}`),
      fetch("/api/admin/collections"),
    ]);
    setProducts(await productRes.json());
    setCollections(await collectionRes.json());
  }

  useEffect(() => {
    void loadData();
  }, [statusFilter, collectionFilter]);

  const defaultSizes = useMemo(() => emptyForm.sizes, []);

  function startCreate() {
    setForm(emptyForm);
    setOpen(true);
  }

  function startEdit(product: ProductRecord) {
    setForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: String(product.price),
      salePrice: product.salePrice ? String(product.salePrice) : "",
      badge: product.badge || "",
      allowCustomization: product.allowCustomization,
      customizationLabel: product.customizationLabel || "Child name to be added",
      customizationHelp:
        product.customizationHelp
        || "Use this when you offer name embroidery or printing on the garment.",
      status: product.status,
      collectionId: product.collectionId || "",
      images: parseJsonObject<string[]>(product.images, []),
      sizes: parseJsonObject<Array<{ size: string; stock: number }>>(product.sizes, defaultSizes),
      fabric: product.fabric,
      ageFrom: String(product.ageFrom),
      ageTo: String(product.ageTo),
    });
    setOpen(true);
  }

  async function uploadImage(file: File) {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body });
    const data = await response.json();
    setForm((current) => ({ ...current, images: [...current.images, data.url] }));
  }

  async function removeImage(url: string) {
    await fetch("/api/admin/upload/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    setForm((current) => ({ ...current, images: current.images.filter((image) => image !== url) }));
  }

  async function saveProduct() {
    const totalStock = form.sizes.reduce((sum, entry) => sum + Math.max(0, Number(entry.stock) || 0), 0);
    if (form.status === "LIVE" && totalStock <= 0) {
      alert("Add stock to at least one size before marking a product LIVE.");
      return;
    }

    const payload = {
      ...form,
      slug: slugify(form.name),
    };

    await fetch(form.id ? `/api/admin/products/${form.id}` : "/api/admin/products", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setOpen(false);
    await loadData();
  }

  async function deleteProduct() {
    if (!form.id || !confirm("Delete this product?")) return;
    await fetch(`/api/admin/products/${form.id}`, { method: "DELETE" });
    setOpen(false);
    await loadData();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-4xl">Products</h2>
          <p className="font-sans text-bodytext">Manage product content, imagery, sizing, stock, and live state.</p>
        </div>
        <button onClick={startCreate} className="btn-dark">Add New Product</button>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-sm border border-taupe/30 px-3 py-2 font-sans text-sm">
          <option value="ALL">All Statuses</option>
          <option value="LIVE">LIVE</option>
          <option value="DRAFT">DRAFT</option>
        </select>
        <select value={collectionFilter} onChange={(event) => setCollectionFilter(event.target.value)} className="rounded-sm border border-taupe/30 px-3 py-2 font-sans text-sm">
          <option value="ALL">All Collections</option>
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>{collection.name}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-sm border border-taupe/20 bg-white">
        <table className="min-w-full text-left">
          <thead className="bg-cream/60">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Badge</th>
              <th className="px-4 py-3">Collection</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const image = parseJsonObject<string[]>(product.images, [])[0];
              return (
                <tr key={product.id} className="border-t border-taupe/10">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {image ? <img src={image} alt="" className="h-14 w-12 rounded-sm object-cover" /> : null}
                      <div>
                        <p>{product.name}</p>
                        <p className="font-sans text-xs text-bodytext">{product.ageFrom}-{product.ageTo} yrs</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-sans text-sm">
                    {formatCurrency(product.salePrice || product.price)}
                    {product.salePrice ? <span className="ml-2 text-bodytext/60 line-through">{formatCurrency(product.price)}</span> : null}
                  </td>
                  <td className="px-4 py-3"><span className="rounded-full bg-cream px-3 py-1 text-xs font-sans uppercase">{product.status}</span></td>
                  <td className="px-4 py-3">{product.badge || "-"}</td>
                  <td className="px-4 py-3">{product.collection?.name || "-"}</td>
                  <td className="px-4 py-3"><button onClick={() => startEdit(product)} className="font-sans text-sm text-coral underline">Edit</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 bg-deepbrown/40">
          <div className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl">{form.id ? "Edit Product" : "New Product"}</h3>
              <button onClick={() => setOpen(false)} className="font-sans text-sm underline">Close</button>
            </div>
            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <label className="font-sans text-xs uppercase tracking-[0.2em] text-bodytext">Product Name</label>
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, slug: slugify(event.target.value) })} placeholder="Periwinkle Pearl & Dots Dress" className="w-full rounded-sm border border-taupe/30 px-3 py-2" />
              </div>
              <div className="space-y-2">
                <label className="font-sans text-xs uppercase tracking-[0.2em] text-bodytext">Product Description</label>
                <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Short product story, fabric feel, embroidery detail, and silhouette notes." className="min-h-28 w-full rounded-sm border border-taupe/30 px-3 py-2" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="font-sans text-xs uppercase tracking-[0.2em] text-bodytext">Price in INR</label>
                  <input value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="1699" className="w-full rounded-sm border border-taupe/30 px-3 py-2" />
                </div>
                <div className="space-y-2">
                  <label className="font-sans text-xs uppercase tracking-[0.2em] text-bodytext">Sale Price in INR</label>
                  <input value={form.salePrice} onChange={(event) => setForm({ ...form, salePrice: event.target.value })} placeholder="Optional discount price, for example 1499" className="w-full rounded-sm border border-taupe/30 px-3 py-2" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="font-sans text-xs uppercase tracking-[0.2em] text-bodytext">Badge Label</label>
                  <select
                    value={form.badge}
                    onChange={(event) => setForm({ ...form, badge: event.target.value })}
                    className="w-full rounded-sm border border-taupe/30 px-3 py-2"
                  >
                    <option value="">No badge</option>
                    {SUGGESTED_BADGES.map((badge) => (
                      badge ? <option key={badge} value={badge}>{badge}</option> : null
                    ))}
                  </select>
                  <p className="font-sans text-xs text-bodytext">Use badges like New, Bestseller, Sale, Limited, Moving Fast, or Personalized. Stock controls sold-out automatically.</p>
                </div>
                <div className="space-y-2">
                  <label className="font-sans text-xs uppercase tracking-[0.2em] text-bodytext">Fabric</label>
                  <input value={form.fabric} onChange={(event) => setForm({ ...form, fabric: event.target.value })} placeholder="Cotton, Muslin, Organza" className="w-full rounded-sm border border-taupe/30 px-3 py-2" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="font-sans text-xs uppercase tracking-[0.2em] text-bodytext">Product Status</label>
                  <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="w-full rounded-sm border border-taupe/30 px-3 py-2">
                    <option value="DRAFT">DRAFT</option>
                    <option value="LIVE">LIVE</option>
                  </select>
                  <p className="font-sans text-xs text-bodytext">Only LIVE products appear on the storefront.</p>
                </div>
                <div className="space-y-2">
                  <label className="font-sans text-xs uppercase tracking-[0.2em] text-bodytext">Age From</label>
                  <input value={form.ageFrom} onChange={(event) => setForm({ ...form, ageFrom: event.target.value })} placeholder="0" className="w-full rounded-sm border border-taupe/30 px-3 py-2" />
                </div>
                <div className="space-y-2">
                  <label className="font-sans text-xs uppercase tracking-[0.2em] text-bodytext">Age To</label>
                  <input value={form.ageTo} onChange={(event) => setForm({ ...form, ageTo: event.target.value })} placeholder="9" className="w-full rounded-sm border border-taupe/30 px-3 py-2" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-sans text-xs uppercase tracking-[0.2em] text-bodytext">Collection</label>
                <select value={form.collectionId} onChange={(event) => setForm({ ...form, collectionId: event.target.value })} className="w-full rounded-sm border border-taupe/30 px-3 py-2">
                  <option value="">No Collection</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>{collection.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4 rounded-sm border border-taupe/20 bg-cream/30 p-4">
                <div>
                  <p className="font-sans text-xs uppercase tracking-[0.2em] text-bodytext">Customization</p>
                  <p className="mt-1 font-sans text-sm text-bodytext">Enable this when the dress can carry the child&apos;s name or another personalized detail.</p>
                </div>
                <label className="flex items-center gap-3 font-sans text-sm text-deepbrown">
                  <input
                    type="checkbox"
                    checked={form.allowCustomization}
                    onChange={(event) => setForm({ ...form, allowCustomization: event.target.checked })}
                  />
                  Allow personalization on this product
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="font-sans text-xs uppercase tracking-[0.2em] text-bodytext">Customization Field Label</label>
                    <input
                      value={form.customizationLabel}
                      onChange={(event) => setForm({ ...form, customizationLabel: event.target.value })}
                      placeholder="Child name to be added"
                      className="w-full rounded-sm border border-taupe/30 px-3 py-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-sans text-xs uppercase tracking-[0.2em] text-bodytext">Customization Help Text</label>
                    <input
                      value={form.customizationHelp}
                      onChange={(event) => setForm({ ...form, customizationHelp: event.target.value })}
                      placeholder="Example: Enter up to 12 characters."
                      className="w-full rounded-sm border border-taupe/30 px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-bodytext mb-3">Sizes & Stock</p>
                <p className="mb-3 font-sans text-sm text-bodytext">Enter each size label on the left and the available quantity on the right. Products with zero total stock stay off the storefront even if marked LIVE.</p>
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_120px] gap-3 font-sans text-xs uppercase tracking-[0.2em] text-bodytext">
                    <span>Size Label</span>
                    <span>Stock Qty</span>
                  </div>
                  {form.sizes.map((size, index) => (
                    <div key={`${size.size}-${index}`} className="grid grid-cols-[1fr_120px] gap-3">
                      <input value={size.size} onChange={(event) => {
                        const sizes = [...form.sizes];
                        sizes[index] = { ...sizes[index], size: event.target.value };
                        setForm({ ...form, sizes });
                      }} className="w-full rounded-sm border border-taupe/30 px-3 py-2" />
                      <input value={String(size.stock)} onChange={(event) => {
                        const sizes = [...form.sizes];
                        sizes[index] = { ...sizes[index], stock: Number(event.target.value) };
                        setForm({ ...form, sizes });
                      }} className="w-full rounded-sm border border-taupe/30 px-3 py-2" />
                    </div>
                  ))}
                </div>
                <button onClick={() => setForm({ ...form, sizes: [...form.sizes, { size: "", stock: 0 }] })} className="mt-3 font-sans text-sm text-coral underline">
                  Add size
                </button>
              </div>

              <div>
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-bodytext mb-3">Images</p>
                <p className="mb-3 font-sans text-sm text-bodytext">The first image becomes the main product photo. For best consistency, upload portrait images in a 4:5 ratio such as 1600 x 2000 px.</p>
                <div className="flex flex-wrap gap-3">
                  {form.images.map((image, index) => (
                    <div key={image} className="rounded-sm border border-taupe/20 p-2">
                      <img src={image} alt="" className="h-24 w-20 rounded-sm object-cover" />
                      <div className="mt-2 flex gap-2 text-xs font-sans">
                        <button onClick={() => removeImage(image)} className="text-red-700 underline">Delete</button>
                        {index > 0 ? (
                          <button onClick={() => {
                            const images = [...form.images];
                            [images[index - 1], images[index]] = [images[index], images[index - 1]];
                            setForm({ ...form, images });
                          }} className="underline">Up</button>
                        ) : null}
                        {index < form.images.length - 1 ? (
                          <button onClick={() => {
                            const images = [...form.images];
                            [images[index + 1], images[index]] = [images[index], images[index + 1]];
                            setForm({ ...form, images });
                          }} className="underline">Down</button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
                <input type="file" accept="image/*" onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void uploadImage(file);
                  }
                }} className="mt-3 font-sans text-sm" />
              </div>

              <div className="flex gap-3">
                <button onClick={() => void saveProduct()} className="btn-dark flex-1">Save</button>
                {form.id ? <button onClick={() => void deleteProduct()} className="btn-outline flex-1">Delete Product</button> : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
