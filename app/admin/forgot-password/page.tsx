"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const response = await fetch("/api/admin/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || "Unable to send reset email.");
      setLoading(false);
      return;
    }

    setMessage(payload.message || "If that email matches the admin account, a reset link has been sent.");
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white border border-taupe/20 rounded-sm p-8 shadow-sm">
        <h1 className="text-4xl text-center mb-3">Forgot password</h1>
        <p className="font-sans text-center text-bodytext mb-8">We&apos;ll email the reset link to the configured admin recovery address.</p>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Admin email"
          className="w-full rounded-sm border border-taupe/40 bg-cream/40 px-4 py-3 font-sans"
        />
        {error ? <p className="mt-3 text-sm font-sans text-red-700">{error}</p> : null}
        {message ? <p className="mt-3 text-sm font-sans text-sage-700">{message}</p> : null}
        <button type="submit" disabled={loading} className="btn-dark mt-6 w-full">
          {loading ? "Sending..." : "Send reset link"}
        </button>
        <p className="mt-5 text-center font-sans text-sm text-bodytext">
          <Link href="/admin/login" className="text-coral underline">Back to login</Link>
        </p>
      </form>
    </div>
  );
}
