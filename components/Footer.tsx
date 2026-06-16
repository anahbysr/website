"use client";

import Link from "next/link";
import { Mail } from "lucide-react";

interface FooterProps {
  collections: Array<{ id: string; name: string; slug: string }>;
  instagramHandle: string;
  whatsappNumber: string;
}

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
    >
      <defs>
        <linearGradient id="instagramGradient" x1="3" y1="21" x2="21" y2="3" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F58529" />
          <stop offset="0.35" stopColor="#FEDA77" />
          <stop offset="0.6" stopColor="#DD2A7B" />
          <stop offset="0.82" stopColor="#8134AF" />
          <stop offset="1" stopColor="#515BD4" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="url(#instagramGradient)" strokeWidth="1.9" />
      <circle cx="12" cy="12" r="4.25" stroke="url(#instagramGradient)" strokeWidth="1.9" />
      <circle cx="17.35" cy="6.65" r="1.1" fill="url(#instagramGradient)" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="#25D366"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 11.5a8 8 0 0 1-11.72 7.08L4 20l1.55-4.06A8 8 0 1 1 20 11.5Z" />
      <path d="M9.15 8.95c.23-.52.48-.53.71-.54h.6c.18 0 .42.07.54.34.19.43.64 1.55.69 1.66.06.11.1.24.02.39-.07.15-.11.24-.23.37-.11.12-.24.28-.34.38-.11.11-.22.22-.09.43.13.22.58.95 1.24 1.54.86.76 1.59 1 1.82 1.12.23.11.37.09.5-.06.14-.15.58-.67.73-.9.15-.22.31-.18.52-.11.22.08 1.36.64 1.59.75.23.12.38.17.44.27.05.11.05.63-.15 1.24-.19.61-1.14 1.17-1.58 1.24-.42.07-.96.1-1.56-.11-.36-.12-.82-.27-1.42-.52-2.5-1.08-4.13-3.74-4.25-3.92-.12-.17-1.01-1.34-1.01-2.56 0-1.22.64-1.82.87-2.07Z" />
    </svg>
  );
}

export default function Footer({
  collections,
  instagramHandle,
  whatsappNumber,
}: FooterProps) {
  const instagramUrl = `https://www.instagram.com/${instagramHandle}`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;
  const emailAddress = "orders@anahbysr.com";

  return (
    <footer className="bg-deepbrown px-4 pb-8 pt-16 text-cream">
      <div className="container mx-auto mb-12 grid grid-cols-1 gap-12 md:grid-cols-3">
        <div className="flex flex-col items-center md:items-start">
          <Link href="/" className="mb-1 font-serif text-4xl leading-none text-cream">
            anah
          </Link>
          <span className="mb-6 font-sans text-[10px] uppercase tracking-[0.2em] text-cream/70">
            by Sindhura Reddy
          </span>
          <div className="flex flex-wrap items-center gap-5 text-cream/90">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex items-center"
            >
              <InstagramIcon />
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex items-center"
            >
              <WhatsAppIcon />
            </a>
            <a
              href={`mailto:${emailAddress}`}
              aria-label="Email"
              className="flex items-center text-cream transition-colors hover:text-coral"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-start">
          <h3 className="mb-4 font-serif text-xl text-cream">Shop</h3>
          <ul className="space-y-2 text-center text-cream/80 md:text-left">
            <li>
              <Link href="/shop" className="transition-colors hover:text-coral">
                New Arrivals
              </Link>
            </li>
            {collections.map((collection) => (
              <li key={collection.id}>
                <Link
                  href={`/collections/${collection.slug}`}
                  className="transition-colors hover:text-coral"
                >
                  {collection.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-center md:items-start">
          <h3 className="mb-4 font-serif text-xl text-cream">Help</h3>
          <ul className="space-y-2 text-center text-cream/80 md:text-left">
            <li>
              <Link href="/size-guide" className="transition-colors hover:text-coral">
                Size Guide
              </Link>
            </li>
            <li>
              <Link href="/care-guide" className="transition-colors hover:text-coral">
                Care Guide
              </Link>
            </li>
            <li>
              <Link href="/shipping-policy" className="transition-colors hover:text-coral">
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="transition-colors hover:text-coral">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/returns-exchange" className="transition-colors hover:text-coral">
                Returns & Exchange
              </Link>
            </li>
            <li>
              <Link href="/write-review" className="transition-colors hover:text-coral">
                Write a Review
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto border-t border-cream/20 pt-8 text-center text-sm text-cream/60">
        <p>&copy; 2026 Anah by SR - anahbysr.com - All rights reserved</p>
      </div>
    </footer>
  );
}
