"use client";

import { useMemo, useState } from "react";

type ProductOption = {
  id: string;
  name: string;
};

export default function WriteReviewForm({ products }: { products: ProductOption[] }) {
  const [form, setForm] = useState({
    productId: products[0]?.id ?? "",
    orderReference: "",
    customerName: "",
    city: "",
    rating: "5",
    text: "",
  });
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const selectedProductName = useMemo(
    () => products.find((product) => product.id === form.productId)?.name ?? "your product",
    [form.productId, products],
  );

  if (products.length === 0) {
    return (
      <div className="rounded-sm border border-taupe/20 bg-white p-6 font-sans text-bodytext">
        There are no live products available for review yet.
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    const response = await fetch("/api/reviews/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const payload = await response.json();
    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error || "We could not save your review.");
      return;
    }

    setStatus("success");
    setMessage("Thank you. Your review has been submitted for approval.");
    setForm({
      productId: products[0]?.id ?? "",
      orderReference: "",
      customerName: "",
      city: "",
      rating: "5",
      text: "",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-sm border border-taupe/20 bg-white p-6 md:p-8">
      <div>
        <label className="mb-2 block font-sans text-sm text-bodytext">Product</label>
        <select
          value={form.productId}
          onChange={(event) => setForm({ ...form, productId: event.target.value })}
          className="w-full rounded-sm border border-taupe/30 px-3 py-2"
          required
        >
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-sans text-sm text-bodytext">Your name</label>
          <input
            value={form.customerName}
            onChange={(event) => setForm({ ...form, customerName: event.target.value })}
            className="w-full rounded-sm border border-taupe/30 px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="mb-2 block font-sans text-sm text-bodytext">City</label>
          <input
            value={form.city}
            onChange={(event) => setForm({ ...form, city: event.target.value })}
            className="w-full rounded-sm border border-taupe/30 px-3 py-2"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-sans text-sm text-bodytext">Order number or ID</label>
          <input
            value={form.orderReference}
            onChange={(event) => setForm({ ...form, orderReference: event.target.value })}
            className="w-full rounded-sm border border-taupe/30 px-3 py-2"
            placeholder="Optional but recommended"
          />
        </div>
        <div>
          <label className="mb-2 block font-sans text-sm text-bodytext">Rating</label>
          <select
            value={form.rating}
            onChange={(event) => setForm({ ...form, rating: event.target.value })}
            className="w-full rounded-sm border border-taupe/30 px-3 py-2"
          >
            <option value="5">5 - Loved it</option>
            <option value="4">4 - Very good</option>
            <option value="3">3 - Good</option>
            <option value="2">2 - Okay</option>
            <option value="1">1 - Needs improvement</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block font-sans text-sm text-bodytext">
          Tell us about {selectedProductName}
        </label>
        <textarea
          value={form.text}
          onChange={(event) => setForm({ ...form, text: event.target.value })}
          className="min-h-36 w-full rounded-sm border border-taupe/30 px-3 py-2"
          placeholder="Fabric feel, fit, finish, delivery experience, or anything another parent should know."
          required
        />
      </div>

      <button type="submit" className="btn-dark" disabled={status === "saving"}>
        {status === "saving" ? "Submitting..." : "Submit Review"}
      </button>

      {message ? (
        <p className={`font-sans text-sm ${status === "error" ? "text-red-700" : "text-deepbrown"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
