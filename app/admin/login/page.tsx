"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      setError("Incorrect password");
      setLoading(false);
      return;
    }

    router.replace("/admin/orders");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white border border-taupe/20 rounded-sm p-8 shadow-sm">
        <h1 className="text-5xl text-center mb-3">Admin Portal</h1>
        <p className="font-sans text-center text-bodytext mb-8">Enter the shared password to continue.</p>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="w-full rounded-sm border border-taupe/40 bg-cream/40 px-4 py-3 font-sans"
        />
        {error ? <p className="mt-3 text-sm font-sans text-red-700">{error}</p> : null}
        <button type="submit" disabled={loading} className="btn-dark mt-6 w-full">
          {loading ? "Entering..." : "Enter"}
        </button>
      </form>
    </div>
  );
}
