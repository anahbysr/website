"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCurrency, parseJsonObject, shortOrderId } from "@/lib/serializers";

type Order = {
  id: string;
  orderNumber?: string | null;
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  address?: string | null;
  items: string;
  total: number;
  subtotal?: number | null;
  shippingCharge?: number | null;
  discount?: number | null;
  status: string;
  paymentMethod?: string | null;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  trackingNumber?: string | null;
  courier?: string | null;
  notes?: string | null;
  createdAt: string;
};

const statuses = ["ALL", "PENDING", "CONFIRMED", "DISPATCHED", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadOrders() {
    setLoading(true);
    const query = statusFilter === "ALL" ? "" : `?status=${statusFilter}`;
    const response = await fetch(`/api/admin/orders${query}`);
    const data = await response.json();
    setOrders(data);
    setLoading(false);
  }

  useEffect(() => {
    // This admin page fetches data on filter change; local state is updated
    // after the request resolves, which is the intended behavior here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadOrders();
  }, [statusFilter]);

  const parsedItems = useMemo(
    () => parseJsonObject<Array<{ name: string; size: string; qty: number; price: number; customizationValue?: string }>>(selectedOrder?.items, []),
    [selectedOrder?.items],
  );

  async function openOrder(id: string) {
    const response = await fetch(`/api/admin/orders/${id}`);
    const data = await response.json();
    setSelectedOrder(data);
  }

  async function saveOrder() {
    if (!selectedOrder) return;
    setSaving(true);
    await fetch(`/api/admin/orders/${selectedOrder.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedOrder),
    });
    setSaving(false);
    await loadOrders();
  }

  async function downloadInvoice(order: Order) {
    const response = await fetch(`/api/admin/orders/${order.id}/invoice`, {
      method: "GET",
      credentials: "same-origin",
    });

    if (!response.ok) {
      alert("Unable to download invoice right now.");
      return;
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `${order.orderNumber || order.id}-invoice.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-4xl">Orders</h2>
          <p className="font-sans text-bodytext">Track order status, shipping, and internal notes.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-sm px-3 py-2 text-sm font-sans ${statusFilter === status ? "bg-deepbrown text-cream" : "bg-white border border-taupe/30"}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-sm border border-taupe/20 bg-white">
        <table className="min-w-full text-left">
          <thead className="bg-cream/60">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-6 font-sans" colSpan={7}>Loading orders...</td></tr>
            ) : orders.map((order) => (
              <tr key={order.id} className="border-t border-taupe/10">
                <td className="px-4 py-3 font-mono text-sm">{shortOrderId(order.id)}</td>
                <td className="px-4 py-3">{order.customerName}</td>
                <td className="px-4 py-3 font-sans text-sm">{order.customerPhone || "-"}</td>
                <td className="px-4 py-3">{formatCurrency(order.total)}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-cream px-3 py-1 text-xs font-sans uppercase">{order.status}</span></td>
                <td className="px-4 py-3 font-sans text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => void openOrder(order.id)} className="font-sans text-sm text-coral underline">Open</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder ? (
        <div className="fixed inset-0 z-50 bg-deepbrown/40">
          <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white p-6 overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-3xl">Order {shortOrderId(selectedOrder.id)}</h3>
                <p className="font-sans text-bodytext mt-2">{selectedOrder.customerName} · {selectedOrder.customerPhone || "No phone"}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="font-sans text-sm underline">Close</button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-bodytext">Customer</p>
                <p>{selectedOrder.customerName}</p>
                <p className="font-sans text-sm">{selectedOrder.customerEmail || "-"}</p>
                <p className="font-sans text-sm">{selectedOrder.address || "-"}</p>
              </div>

              <div>
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-bodytext mb-2">Payment</p>
                <div className="space-y-2 rounded-sm border border-taupe/20 p-4 text-sm font-sans">
                  <div className="flex justify-between gap-4">
                    <span className="text-bodytext">Method</span>
                    <span>{selectedOrder.paymentMethod || "-"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-bodytext">Razorpay Payment ID</span>
                    <span className="break-all text-right">{selectedOrder.razorpayPaymentId || "-"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-bodytext">Razorpay Order ID</span>
                    <span className="break-all text-right">{selectedOrder.razorpayOrderId || "-"}</span>
                  </div>
                  {selectedOrder.razorpayPaymentId ? (
                    <a
                      href={`https://dashboard.razorpay.com/app/payments/${selectedOrder.razorpayPaymentId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-coral underline"
                    >
                      Open payment in Razorpay Dashboard
                    </a>
                  ) : null}
                  {selectedOrder.razorpayOrderId ? (
                    <a
                      href={`https://dashboard.razorpay.com/app/orders/${selectedOrder.razorpayOrderId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-coral underline"
                    >
                      Open order in Razorpay Dashboard
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void downloadInvoice(selectedOrder)}
                    className="block text-left text-coral underline"
                  >
                    Download invoice PDF
                  </button>
                </div>
              </div>

              <div>
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-bodytext mb-2">Line Items</p>
                <div className="space-y-2 rounded-sm border border-taupe/20 p-4">
                  {parsedItems.map((item, index) => (
                    <div key={`${item.name}-${index}`} className="flex justify-between gap-4 text-sm font-sans">
                      <span>
                        {item.name} - {item.size} - Qty {item.qty}
                        {item.customizationValue ? ` - Personalization: ${item.customizationValue}` : ""}
                      </span>
                      <span>{formatCurrency(item.price * item.qty)}</span>
                    </div>
                  ))}
                  <div className="border-t border-taupe/20 pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              <label className="block font-sans text-sm">
                Status
                <select
                  value={selectedOrder.status}
                  onChange={(event) => setSelectedOrder({ ...selectedOrder, status: event.target.value })}
                  className="mt-2 w-full rounded-sm border border-taupe/30 px-3 py-2"
                >
                  {statuses.filter((status) => status !== "ALL").map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </label>

              <label className="block font-sans text-sm">
                Tracking Number
                <input
                  value={selectedOrder.trackingNumber || ""}
                  onChange={(event) => setSelectedOrder({ ...selectedOrder, trackingNumber: event.target.value })}
                  className="mt-2 w-full rounded-sm border border-taupe/30 px-3 py-2"
                />
              </label>

              <label className="block font-sans text-sm">
                Courier
                <input
                  value={selectedOrder.courier || ""}
                  onChange={(event) => setSelectedOrder({ ...selectedOrder, courier: event.target.value })}
                  className="mt-2 w-full rounded-sm border border-taupe/30 px-3 py-2"
                />
              </label>

              <label className="block font-sans text-sm">
                Internal Notes
                <textarea
                  value={selectedOrder.notes || ""}
                  onChange={(event) => setSelectedOrder({ ...selectedOrder, notes: event.target.value })}
                  className="mt-2 min-h-28 w-full rounded-sm border border-taupe/30 px-3 py-2"
                />
              </label>

              {selectedOrder.customerPhone ? (
                <a
                  href={`https://wa.me/${selectedOrder.customerPhone}?text=${encodeURIComponent(`Hi ${selectedOrder.customerName}, your order ${shortOrderId(selectedOrder.id)} is now ${selectedOrder.status}.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-outline inline-block text-center w-full"
                >
                  Send WhatsApp Update
                </a>
              ) : null}

              <button onClick={() => void saveOrder()} disabled={saving} className="btn-dark w-full">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
