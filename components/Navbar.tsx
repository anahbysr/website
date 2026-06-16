"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "./CartContext";
import { Menu, ShoppingBag, X } from "lucide-react";

export default function Navbar({ logoImage }: { logoImage: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { setIsCartOpen, items } = useCart();
  const pathname = usePathname();

  const cartItemCount = items.reduce((acc, item) => acc + item.qty, 0);
  const navItems = [
    { href: "/shop", label: "Shop" },
    { href: "/collections", label: "Collections" },
    { href: "/our-story", label: "Our Story" },
    { href: "/care-guide", label: "Care Guide" },
  ];

  const isActive = (href: string) => {
    if (href === "/shop") {
      return pathname === "/shop" || pathname.startsWith("/shop/");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-cream/90 backdrop-blur-md border-b border-taupe/30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 md:flex-1">
          <button
            className="md:hidden p-2 -ml-2 text-deepbrown"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          <Link href="/" className="flex flex-col items-start leading-none">
            {!logoError ? (
              <Image
                src={logoImage}
                alt="Anah"
                width={1013}
                height={534}
                priority
                onError={() => setLogoError(true)}
                className="h-9 w-auto object-contain"
              />
            ) : (
              <span className="font-serif text-[30px] text-deepbrown leading-none">anah</span>
            )}
            <span className="mt-1.5 font-sans text-[14px] uppercase tracking-[0.22em] text-bodytext whitespace-nowrap">
              by Sindhura Reddy
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex flex-1 items-center justify-center gap-8 whitespace-nowrap">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 font-sans text-[16px] uppercase tracking-[0.12em] transition-colors whitespace-nowrap ${
                  active
                    ? "bg-taupe/20 text-deepbrown"
                    : "text-bodytext hover:bg-taupe/10 hover:text-deepbrown"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-4 md:flex-1">
          <button
            className="p-2 text-deepbrown relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingBag size={24} />
            {cartItemCount > 0 && (
              <span className="absolute top-1 right-1 bg-coral text-deepbrown text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-cream flex flex-col">
          <div className="flex justify-end p-4">
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-deepbrown">
              <X size={28} />
            </button>
          </div>
          <nav className="flex flex-col items-center gap-8 mt-12 text-2xl font-serif">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={pathname === "/" ? "text-deepbrown underline underline-offset-8" : ""}
            >
              Home
            </Link>
            <Link
              href="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className={isActive("/shop") ? "text-deepbrown underline underline-offset-8" : ""}
            >
              Shop All
            </Link>
            <Link
              href="/collections"
              onClick={() => setIsMobileMenuOpen(false)}
              className={isActive("/collections") ? "text-deepbrown underline underline-offset-8" : ""}
            >
              Collections
            </Link>
            <Link
              href="/our-story"
              onClick={() => setIsMobileMenuOpen(false)}
              className={isActive("/our-story") ? "text-deepbrown underline underline-offset-8" : ""}
            >
              Our Story
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
