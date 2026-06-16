"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setError("Reset token is missing.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || "Unable to reset password.");
      setLoading(false);
      return;
    }

    router.replace("/admin/login");
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md bg-white border border-taupe/20 rounded-sm p-8 shadow-sm">
      <h1 className="text-4xl text-center mb-3">Set new password</h1>
      <p className="font-sans text-center text-bodytext mb-8">Choose a new shared admin password for the store.</p>
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="New password"
        className="w-full rounded-sm border border-taupe/40 bg-cream/40 px-4 py-3 font-sans"
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        placeholder="Confirm password"
        className="mt-4 w-full rounded-sm border border-taupe/40 bg-cream/40 px-4 py-3 font-sans"
      />
      {error ? <p className="mt-3 text-sm font-sans text-red-700">{error}</p> : null}
      <button type="submit" disabled={loading} className="btn-dark mt-6 w-full">
        {loading ? "Saving..." : "Save new password"}
      </button>
      <p className="mt-5 text-center font-sans text-sm text-bodytext">
        <Link href="/admin/login" className="text-coral underline">Back to login</Link>
      </p>
    </form>
  );
}
