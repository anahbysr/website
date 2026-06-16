import type { Metadata } from "next";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import { CartProvider } from "@/components/CartContext";
import SiteFrame from "@/components/SiteFrame";
import { getStorefrontConfig } from "@/lib/storefront";

export const metadata: Metadata = {
  title: "Anah by Sindhura Reddy | Dressed in Promise",
  description: "Sustainable Indian casuals for little ones, 0-9 years. Soft fabrics. Soulful designs.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [config, collections] = await Promise.all([
    getStorefrontConfig(),
    prisma.collection.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  return (
    <html lang="en">
      <body className="font-sans font-light bg-cream text-deepbrown">
        <CartProvider>
          <SiteFrame
            announcementBar={config.announcementBar}
            collections={collections}
            instagramHandle={config.instagramHandle}
            logoImage={config.logoImage}
            whatsappNumber={config.whatsappNumber}
          >
            {children}
          </SiteFrame>
        </CartProvider>
      </body>
    </html>
  );
}
