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

const TICKER_REPEATS = 12;

// The admin portal stores the announcement as one line, with the individual
// messages divided by a spaced separator. Split it back into ticker items so
// edits made in the portal show up on the storefront. Separators are matched
// only when padded with spaces, so hyphens inside a message ("8-10 days")
// survive.
const ANNOUNCEMENT_SEPARATORS = ["-", "–", "—", "|", "·", "•"];

function parseAnnouncementItems(value: string) {
  const items = ANNOUNCEMENT_SEPARATORS.reduce(
    (parts, separator) => parts.flatMap((part) => part.split(` ${separator} `)),
    [value],
  )
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : DEFAULT_ANNOUNCEMENT_ITEMS;
}

export default function SiteFrame({
  announcementBar,
  children,
  collections,
  instagramHandle,
  logoImage,
  whatsappNumber,
}: SiteFrameProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const announcementItems = parseAnnouncementItems(announcementBar);
  const tickerMessages = [...Array(TICKER_REPEATS)].flatMap(() => announcementItems);

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
            {tickerMessages.map((msg, i) => (
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
