"use client";

import { useEffect, useState } from "react";

type Review = {
  id: string;
  author: string;
  body: string;
  rating: number;
  status: string;
  createdAt: string;
  product?: { name: string } | null;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");

  async function loadReviews() {
    const query = statusFilter === "ALL" ? "" : `?status=${statusFilter}`;
    const response = await fetch(`/api/admin/reviews${query}`);
    setReviews(await response.json());
  }

  useEffect(() => {
    void loadReviews();
  }, [statusFilter]);

  async function updateReview(id: string, status: string) {
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await loadReviews();
  }

  async function deleteReview(id: string) {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    await loadReviews();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl">Reviews</h2>
          <p className="font-sans text-bodytext">Moderate what appears on product pages.</p>
        </div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-sm border border-taupe/30 px-3 py-2 font-sans text-sm">
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="HIDDEN">Hidden</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-sm border border-taupe/20 bg-white">
        <table className="min-w-full text-left">
          <thead className="bg-cream/60">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Review</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id} className="border-t border-taupe/10 align-top">
                <td className="px-4 py-3">{review.product?.name || "-"}</td>
                <td className="px-4 py-3">{review.author}</td>
                <td className="px-4 py-3">{"★".repeat(review.rating)}</td>
                <td className="px-4 py-3 font-sans text-sm text-bodytext">{review.body}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-cream px-3 py-1 text-xs font-sans uppercase">{review.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-3 text-sm font-sans">
                    <button onClick={() => void updateReview(review.id, "APPROVED")} className="text-coral underline">Approve</button>
                    <button onClick={() => void updateReview(review.id, "HIDDEN")} className="text-coral underline">Hide</button>
                    <button onClick={() => void deleteReview(review.id)} className="text-red-700 underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
