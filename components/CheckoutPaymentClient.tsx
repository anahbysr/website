"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { formatCurrency } from "@/lib/serializers";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: (response: { error?: { description?: string } }) => void) => void;
    };
  }
}

type CheckoutPaymentClientProps = {
  orderId: string;
  orderNumber: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  razorpayOrderId: string;
  status: string;
  whatsappNumber: string;
};

let razorpayScriptPromise: Promise<boolean> | null = null;

function loadRazorpayScript() {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  return razorpayScriptPromise;
}

export default function CheckoutPaymentClient({
  orderId,
  orderNumber,
  amount,
  customerName,
  customerEmail,
  customerPhone,
  razorpayOrderId,
  status,
  whatsappNumber,
}: CheckoutPaymentClientProps) {
  const router = useRouter();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadRazorpayScript().then((loaded) => {
      setScriptReady(loaded);
      if (!loaded) {
        setMessage("Payment checkout could not be loaded. Please contact us on WhatsApp for assistance.");
      }
    });
  }, []);

  async function verifyPayment(payload: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  }) {
    const response = await fetch("/api/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        razorpayOrderId: payload.razorpay_order_id,
        razorpayPaymentId: payload.razorpay_payment_id,
        razorpaySignature: payload.razorpay_signature,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Payment verification failed");
    }

    clearCart();
    router.push(`/checkout/success?order=${orderId}`);
  }

  async function startPayment() {
    setLoading(true);
    setMessage(null);

    try {
      const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!key) {
        throw new Error("Razorpay key is missing. Please contact us on WhatsApp for assistance.");
      }

      if (razorpayOrderId.startsWith("mock_rzp_")) {
        await verifyPayment({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: `mock_pay_${orderId}`,
          razorpay_signature: "mock_signature",
        });
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        throw new Error("Unable to load Razorpay checkout. Please try again or contact us on WhatsApp.");
      }

      const razorpay = new window.Razorpay({
        key,
        amount,
        currency: "INR",
        name: "Anah by Sindhura Reddy",
        description: `Payment for order ${orderNumber}`,
        order_id: razorpayOrderId,
        handler: async (response: {
          razorpay_order_id?: string;
          razorpay_payment_id?: string;
          razorpay_signature?: string;
        }) => {
          try {
            await verifyPayment(response);
          } catch (error) {
            setLoading(false);
            setMessage(error instanceof Error ? error.message : "Payment verification failed.");
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setMessage("Payment was not completed. Please retry, or reach out on WhatsApp for further assistance.");
          },
        },
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: {
          color: "#7A4B38",
        },
      });

      razorpay.on("payment.failed", (response) => {
        setLoading(false);
        setMessage(
          response.error?.description
            || "Payment failed. Please retry, or reach out on WhatsApp for further assistance.",
        );
      });

      razorpay.open();
    } catch (error) {
      setLoading(false);
      setMessage(error instanceof Error ? error.message : "Unable to start payment.");
    }
  }

  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hi, I need help with payment for order ${orderNumber}.`,
  )}`;
  const paymentConfirmed = status === "CONFIRMED";

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-sm border border-taupe/20 bg-white p-8 shadow-sm">
        <p className="mb-3 text-sm uppercase tracking-[0.25em] text-taupe">Payment</p>
        <h1 className="mb-4 text-4xl font-serif text-deepbrown">Complete your order</h1>
        <p className="mb-8 text-bodytext">
          Order <span className="font-semibold text-deepbrown">{orderNumber}</span> is ready.
          Your order will only be confirmed after the payment is successfully verified.
        </p>

        <div className="mb-8 rounded-sm bg-cream p-6">
          <div className="flex items-center justify-between gap-4 border-b border-taupe/20 pb-4">
            <span className="text-bodytext">Order total</span>
            <span className="text-2xl font-serif text-deepbrown">{formatCurrency(amount / 100)}</span>
          </div>
          <div className="pt-4 text-sm text-bodytext">
            <p>Customer: {customerName}</p>
            <p>Phone: {customerPhone}</p>
            {customerEmail ? <p>Email: {customerEmail}</p> : null}
            <p>Status: {status}</p>
          </div>
        </div>

        {message ? (
          <div className="mb-6 rounded-sm border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-deepbrown">
            {message}
          </div>
        ) : null}

        <div className="flex flex-col gap-4 sm:flex-row">
          {paymentConfirmed ? (
            <Link
              href={`/checkout/success?order=${orderId}`}
              className="flex-1 rounded-sm bg-deepbrown px-6 py-4 text-center text-lg tracking-wider text-cream transition-opacity hover:opacity-90"
            >
              View Confirmation
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => void startPayment()}
              disabled={loading || !scriptReady}
              className={`flex-1 rounded-sm px-6 py-4 text-lg tracking-wider transition-opacity ${
                loading || !scriptReady ? "bg-taupe text-white" : "bg-deepbrown text-cream hover:opacity-90"
              }`}
            >
              {loading ? "Processing..." : "Pay with Razorpay"}
            </button>
          )}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-sm border border-deepbrown px-6 py-4 text-center text-lg tracking-wider text-deepbrown transition-colors hover:bg-deepbrown hover:text-cream"
          >
            Need WhatsApp Help?
          </a>
        </div>

        <div className="mt-6 text-sm text-bodytext">
          <p>If payment is interrupted or fails, your order remains pending until you retry or contact us.</p>
          <Link href="/checkout" className="mt-3 inline-block text-coral underline">
            Back to checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
