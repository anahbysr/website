import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";
import { getSettingsMap } from "@/lib/storefront";
import { getSizeStock } from "@/lib/product-utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      addressLine1,
      city,
      state,
      pincode,
      paymentMethod,
    } = body as {
      // `price` is sent by the browser but deliberately ignored; see pricedItems.
      items: Array<{
        productId?: string;
        name?: string;
        size: string;
        qty: number;
        price?: number;
        customizationValue?: string;
      }>;
      customerName: string;
      customerEmail?: string;
      customerPhone?: string;
      addressLine1?: string;
      city?: string;
      state?: string;
      pincode?: string;
      paymentMethod?: string;
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Checkout only offers online payment. Accepting any other method here
    // would let anyone create a confirmed, unpaid order by editing the request.
    if (paymentMethod !== "ONLINE") {
      return NextResponse.json({ error: "Unsupported payment method." }, { status: 400 });
    }

    const productIds: string[] = [
      ...new Set(
        items
          .map((item: { productId?: string }) => item.productId)
          .filter((productId: string | undefined): productId is string => typeof productId === "string" && productId.length > 0),
      ),
    ];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, status: true, sizes: true, price: true, salePrice: true },
    });
    const productMap = new Map(products.map((product) => [product.id, product]));

    // Quantities requested per product and size, summed across cart lines, so
    // two lines for the same size cannot together exceed the stock available.
    const requestedBySize = new Map<string, number>();

    for (const item of items) {
      if (!item.productId || typeof item.size !== "string" || !item.size) {
        return NextResponse.json({ error: "One or more cart items are invalid." }, { status: 400 });
      }

      if (!Number.isInteger(item.qty) || item.qty < 1) {
        return NextResponse.json({ error: "One or more cart items have an invalid quantity." }, { status: 400 });
      }

      const product = productMap.get(item.productId);
      if (!product || product.status !== "LIVE") {
        return NextResponse.json(
          { error: `${item.name || "This item"} is no longer available.` },
          { status: 400 },
        );
      }

      const key = `${product.id}::${item.size}`;
      const requested = (requestedBySize.get(key) ?? 0) + item.qty;
      requestedBySize.set(key, requested);

      if (getSizeStock(product, item.size) < requested) {
        return NextResponse.json(
          { error: `${product.name} in size ${item.size} is out of stock or has limited quantity left.` },
          { status: 400 },
        );
      }
    }

    // Price every line from the database. The browser's price is display-only
    // and must never decide what the customer is charged.
    const pricedItems = items.map((item) => {
      const product = productMap.get(item.productId as string)!;
      return {
        productId: product.id,
        name: product.name,
        size: item.size,
        qty: item.qty,
        price: product.salePrice || product.price,
        ...(typeof item.customizationValue === "string" && item.customizationValue.trim()
          ? { customizationValue: item.customizationValue.trim().slice(0, 60) }
          : {}),
      };
    });

    let subtotal = 0;
    for (const item of pricedItems) {
      subtotal += item.price * item.qty;
    }

    const settings = await getSettingsMap();
    const freeShippingThreshold = parseInt(settings.free_shipping_threshold || "999", 10);
    const flatShippingRate = parseInt(settings.flat_shipping_rate || "99", 10);
    const shippingCharge = subtotal >= freeShippingThreshold ? 0 : flatShippingRate;
    const total = subtotal + shippingCharge;
    const amountInPaise = Math.max(Math.round(total * 100), 100);
    const allowMockFallback = process.env.NODE_ENV !== "production";

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `ANH-${dateStr}-${randomStr}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        address: [addressLine1, city, state, pincode].filter(Boolean).join(", "),
        addressLine1,
        city,
        state,
        pincode,
        items: JSON.stringify(pricedItems),
        subtotal,
        shippingCharge,
        total,
        paymentMethod,
        status: "PENDING",
      },
    });

    const keyId = process.env.RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay credentials are not configured" }, { status: 500 });
    }

    if (keyId.includes("mock")) {
      const mockOrderId = `mock_rzp_${order.id}`;

      await prisma.order.update({
        where: { id: order.id },
        data: { razorpayOrderId: mockOrderId },
      });

      console.log(`[MOCK RAZORPAY] Creating order for amount Rs ${total}`);
      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber,
        razorpayOrderId: mockOrderId,
        amount: amountInPaise,
        currency: "INR",
      });
    }

    try {
      const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

      const rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: order.id,
        notes: {
          orderId: order.id,
          orderNumber,
          customerName,
        },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { razorpayOrderId: rzpOrder.id },
      });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber,
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
      });
    } catch (error) {
      const statusCode = typeof error === "object" && error !== null && "statusCode" in error
        ? Number(error.statusCode)
        : 500;
      const description = typeof error === "object" && error !== null && "error" in error
        && typeof error.error === "object" && error.error !== null && "description" in error.error
        ? String(error.error.description)
        : "Failed to create Razorpay order";

      if (statusCode === 401 && allowMockFallback) {
        const mockOrderId = `mock_rzp_${order.id}`;

        await prisma.order.update({
          where: { id: order.id },
          data: { razorpayOrderId: mockOrderId },
        });

        console.warn(
          `[MOCK RAZORPAY FALLBACK] Invalid Razorpay credentials in development. Falling back to mock order for ${order.id}.`,
        );

        return NextResponse.json({
          success: true,
          orderId: order.id,
          orderNumber,
          razorpayOrderId: mockOrderId,
          amount: amountInPaise,
          currency: "INR",
          mockMode: true,
          warning: "Razorpay credentials were rejected, so a development mock checkout was used.",
        });
      }

      return NextResponse.json(
        { error: description },
        { status: statusCode === 401 ? 401 : 500 },
      );
    }
  } catch (error) {
    console.error("Order creation failed:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
