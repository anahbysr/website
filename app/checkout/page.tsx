"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CheckoutPage() {
  const { items } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    // Client-mount guard: cart hydrates from localStorage, so we hold the
    // first paint until mounted to avoid flashing the empty-cart state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;
  
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-serif text-deepbrown mb-4">Checkout</h1>
        <p className="text-bodytext mb-8">Your cart is empty.</p>
        <button onClick={() => router.push('/shop')} className="btn-primary">Return to Shop</button>
      </div>
    );
  }

  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const freeShippingThreshold = 999;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingCharge = isFreeShipping ? 0 : 99;
  const total = subtotal + shippingCharge;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, items, paymentMethod: "ONLINE" })
      });
      
      const data = await res.json();
      
      if (!data.success) {
        alert(data.error || "Failed to create order");
        setLoading(false);
        return;
      }

      router.push(`/checkout/payment?order=${data.orderId}`);
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-4xl font-serif text-deepbrown mb-8 text-center md:text-left">Checkout</h1>
      
      <div className="flex flex-col-reverse md:flex-row gap-12">
        {/* Shipping Form */}
        <div className="w-full md:w-3/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-serif text-deepbrown mb-4">Shipping Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="text" name="customerName" placeholder="Full Name" onChange={handleInputChange} className="w-full p-3 border border-taupe/40 rounded-sm focus:outline-none focus:border-deepbrown bg-white" />
              <input required type="email" name="customerEmail" placeholder="Email Address" onChange={handleInputChange} className="w-full p-3 border border-taupe/40 rounded-sm focus:outline-none focus:border-deepbrown bg-white" />
              <input required type="tel" name="customerPhone" placeholder="Phone Number" onChange={handleInputChange} className="w-full p-3 border border-taupe/40 rounded-sm focus:outline-none focus:border-deepbrown bg-white" />
            </div>

            <input required type="text" name="addressLine1" placeholder="Address (House No, Building, Street, Area)" onChange={handleInputChange} className="w-full p-3 border border-taupe/40 rounded-sm focus:outline-none focus:border-deepbrown bg-white" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input required type="text" name="city" placeholder="City" onChange={handleInputChange} className="w-full p-3 border border-taupe/40 rounded-sm focus:outline-none focus:border-deepbrown bg-white" />
              <input required type="text" name="state" placeholder="State" onChange={handleInputChange} className="w-full p-3 border border-taupe/40 rounded-sm focus:outline-none focus:border-deepbrown bg-white" />
              <input required type="text" name="pincode" placeholder="PIN Code" onChange={handleInputChange} className="w-full p-3 border border-taupe/40 rounded-sm focus:outline-none focus:border-deepbrown bg-white" />
            </div>

            <button type="submit" disabled={loading} className={`w-full py-4 text-lg font-sans tracking-wider rounded-sm transition-opacity mt-8 ${loading ? 'bg-taupe text-white' : 'bg-deepbrown text-cream hover:opacity-90'}`}>
              {loading ? "Processing..." : "Continue to Payment"}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="w-full md:w-2/5">
          <div className="bg-white p-6 rounded-sm border border-taupe/20 sticky top-24">
            <h2 className="text-2xl font-serif text-deepbrown mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
              {items.map(item => (
                <div key={`${item.productId}-${item.size}`} className="flex gap-4">
                  <div className="relative w-16 h-20 flex-shrink-0 bg-taupe/10 rounded-sm overflow-hidden">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-col flex-1 text-sm text-bodytext justify-center">
                    <p className="font-bold text-deepbrown truncate">{item.name}</p>
                    <p>Size: {item.size} · Qty: {item.qty}</p>
                    <p>₹{item.price * item.qty}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-taupe/20 pt-4 space-y-2 text-sm text-bodytext">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{isFreeShipping ? 'Free' : `₹${shippingCharge}`}</span>
              </div>
              <div className="flex justify-between text-xl font-serif text-deepbrown pt-4 border-t border-taupe/20 mt-2">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
