"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppButton from "@/components/WhatsAppButton";

interface SiteFrameProps {
  announcementBar: string;
  children: React.ReactNode;
  collections: Array<{ id: string; name: string; slug: string }>;
  instagramHandle: string;
  logoImage: string;
  whatsappNumber: string;
}

const DEFAULT_ANNOUNCEMENT_ITEMS = [
  "Free shipping above \u20b9999",
  "Pan-India delivery",
  "New arrivals every fortnight",
  "Delivery timelines 8-10 days",
];

const TICKER_MESSAGES = [...Array(12)].flatMap(() => DEFAULT_ANNOUNCEMENT_ITEMS);

export default function SiteFrame({
  announcementBar: _announcementBar,
  children,
  collections,
  instagramHandle,
  logoImage,
  whatsappNumber,
}: SiteFrameProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <div
          style={{
            background: "#2e1a0a",
            height: "36px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div className="announcement-ticker-track">
            {TICKER_MESSAGES.map((msg, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "11px",
                  fontWeight: 300,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#E7DACF",
                  paddingRight: "260px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {msg}
              </span>
            ))}
          </div>
        </div>
        <Navbar logoImage={logoImage} />
        <main className="flex-grow">{children}</main>
        <Footer
          collections={collections}
          instagramHandle={instagramHandle}
          whatsappNumber={whatsappNumber}
        />
      </div>
      <CartDrawer />
      <WhatsAppButton whatsappNumber={whatsappNumber} />
    </>
  );
}
