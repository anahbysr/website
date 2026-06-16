"use client";

import { useState } from "react";

type TrackedOrder = {
  id: string;
  orderNumber: string | null;
  status: string;
  trackingNumber: string | null;
  courier: string | null;
  notes: string | null;
  address: string | null;
  createdAt: string;
  total: number;
  items: Array<{ name?: string; size?: string; qty?: number; price?: number }>;
};

export default function TrackOrderLookup() {
  const [reference, setReference] = useState("");
  const [contact, setContact] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);

    const response = await fetch("/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference, contact }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || "Unable to find your order.");
      setLoading(false);
      return;
    }

    setOrder(payload);
    setLoading(false);
  }

  return (
    <div className="rounded-sm border border-taupe/20 bg-white p-6">
      <h2 className="mb-4 text-2xl text-deepbrown">Order Lookup</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block font-sans text-sm text-bodytext">Order number or order ID</label>
          <input
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            className="w-full rounded-sm border border-taupe/30 px-3 py-2"
            placeholder="ANH-20260527-ABCD"
            required
          />
        </div>
        <div>
          <label className="mb-2 block font-sans text-sm text-bodytext">Email address or phone number</label>
          <input
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            className="w-full rounded-sm border border-taupe/30 px-3 py-2"
            placeholder="name@example.com or 9876543210"
            required
          />
        </div>
        <button type="submit" className="btn-dark" disabled={loading}>
          {loading ? "Checking..." : "Track Order"}
        </button>
      </form>

      {error ? <p className="mt-4 font-sans text-sm text-red-700">{error}</p> : null}

      {order ? (
        <div className="mt-6 space-y-5 border-t border-taupe/20 pt-5">
          <div>
            <p className="font-sans text-xs uppercase tracking-[0.16em] text-taupe">Current status</p>
            <p className="text-3xl text-deepbrown">{order.status}</p>
          </div>
          <div className="grid gap-4 font-sans text-sm text-bodytext sm:grid-cols-2">
            <div>
              <p className="text-taupe">Order</p>
              <p>{order.orderNumber || order.id}</p>
            </div>
            <div>
              <p className="text-taupe">Placed on</p>
              <p>{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
            </div>
            <div>
              <p className="text-taupe">Courier</p>
              <p>{order.courier || "To be updated"}</p>
            </div>
            <div>
              <p className="text-taupe">Tracking number</p>
              <p>{order.trackingNumber || "To be updated"}</p>
            </div>
          </div>
          <div>
            <p className="mb-2 font-sans text-xs uppercase tracking-[0.16em] text-taupe">Items</p>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={`${item.name ?? "item"}-${index}`} className="rounded-sm bg-cream/40 px-3 py-2 font-sans text-sm text-bodytext">
                  {item.name ?? "Product"}{item.size ? ` - ${item.size}` : ""}{item.qty ? ` x ${item.qty}` : ""}
                </div>
              ))}
            </div>
          </div>
          {order.notes ? (
            <div>
              <p className="mb-1 font-sans text-xs uppercase tracking-[0.16em] text-taupe">Notes</p>
              <p className="font-sans text-sm text-bodytext">{order.notes}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
