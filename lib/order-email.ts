import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";
import { buildInvoicePdf } from "@/lib/invoice-pdf";

type OrderEmailItem = {
  name?: string;
  qty?: number;
  size?: string;
  price?: number;
  customizationValue?: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function parseItems(items: string) {
  try {
    const parsed = JSON.parse(items) as OrderEmailItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildItemsHtml(items: OrderEmailItem[]) {
  if (items.length === 0) {
    return `
      <tr>
        <td style="padding: 14px 18px; color: #6f6258; font-size: 14px;">
          Your order items will be confirmed by our team shortly.
        </td>
      </tr>
    `;
  }

  return items
    .map((item) => {
      const meta = [
        item.size ? `Size ${item.size}` : null,
        typeof item.qty === "number" ? `Qty ${item.qty}` : null,
        item.customizationValue ? `Customisation ${item.customizationValue}` : null,
      ]
        .filter(Boolean)
        .join(" • ");
      const amount = typeof item.price === "number" && typeof item.qty === "number"
        ? formatCurrency(item.price * item.qty)
        : "";

      return `
        <tr>
          <td style="padding: 14px 18px; border-top: 1px solid #e8ddd1;">
            <div style="font-size: 15px; font-weight: 600; color: #2f241f;">${item.name || "Item"}</div>
            ${meta ? `<div style="margin-top: 4px; font-size: 13px; color: #7d6d61;">${meta}</div>` : ""}
          </td>
          <td style="padding: 14px 18px; border-top: 1px solid #e8ddd1; text-align: right; font-size: 14px; font-weight: 600; color: #2f241f;">
            ${amount}
          </td>
        </tr>
      `;
    })
    .join("");
}

function buildOrderEmailHtml({
  customerName,
  items,
  orderNumber,
  paymentMethod,
  status,
  total,
}: {
  customerName: string;
  items: OrderEmailItem[];
  orderNumber: string;
  paymentMethod: string | null;
  status: string;
  total: number;
}) {
  const isCod = paymentMethod === "COD";
  const headline = isCod
    ? "Your COD order has been placed."
    : status === "CONFIRMED"
      ? "Your payment was received and your order is confirmed."
      : "Your order has been created.";
  const statusLabel = isCod ? "Cash on Delivery" : paymentMethod || "ONLINE";

  return `
    <div style="margin: 0; padding: 24px 0; background: #f6f0ea; font-family: Arial, Helvetica, sans-serif; color: #2f241f;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 680px; margin: 0 auto; background: #fffdf9; border-radius: 22px; overflow: hidden; border: 1px solid #eadfD4;">
        <tr>
          <td style="padding: 0;">
            <div style="background: linear-gradient(135deg, #f8ede2 0%, #f4d8c5 45%, #e7b8a1 100%); padding: 36px 36px 30px;">
              <div style="display: inline-block; padding: 7px 14px; border-radius: 999px; background: rgba(255,255,255,0.7); color: #7a4b38; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">
                Order Confirmed
              </div>
              <h1 style="margin: 18px 0 10px; font-size: 34px; line-height: 1.15; color: #2f241f;">
                Thank you for shopping with Anah by Sindhura Reddy
              </h1>
              <p style="margin: 0; font-size: 16px; line-height: 1.7; color: #4f4038;">
                Hi ${customerName}, ${headline}
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 30px 36px 12px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #fff7f0; border: 1px solid #ead9cb; border-radius: 18px;">
              <tr>
                <td style="padding: 20px 22px; width: 50%;">
                  <div style="font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #8d7767; font-weight: 700;">Order Number</div>
                  <div style="margin-top: 8px; font-size: 22px; color: #2f241f; font-weight: 700;">${orderNumber}</div>
                </td>
                <td style="padding: 20px 22px; width: 25%; border-left: 1px solid #ead9cb;">
                  <div style="font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #8d7767; font-weight: 700;">Total</div>
                  <div style="margin-top: 8px; font-size: 20px; color: #7a4b38; font-weight: 700;">${formatCurrency(total)}</div>
                </td>
                <td style="padding: 20px 22px; width: 25%; border-left: 1px solid #ead9cb;">
                  <div style="font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #8d7767; font-weight: 700;">Payment</div>
                  <div style="margin-top: 8px; font-size: 15px; color: #2f241f; font-weight: 700;">${statusLabel}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 16px 36px 8px;">
            <h2 style="margin: 0 0 14px; font-size: 18px; color: #2f241f;">Your order summary</h2>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #ffffff; border: 1px solid #eadfd4; border-radius: 18px; overflow: hidden;">
              <tr>
                <td style="padding: 14px 18px; background: #f8f1ea; color: #8d7767; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;">Item</td>
                <td style="padding: 14px 18px; background: #f8f1ea; color: #8d7767; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; text-align: right;">Amount</td>
              </tr>
              ${buildItemsHtml(items)}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px 36px 14px;">
            <div style="padding: 18px 20px; background: #f4ebe3; border-radius: 16px; color: #4f4038; font-size: 14px; line-height: 1.7;">
              Your order confirmation PDF is attached to this email. We will begin processing your order shortly and share shipping updates once your parcel is dispatched.
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 36px 36px;">
            <div style="padding-top: 18px; border-top: 1px solid #eadfd4; color: #6f6258; font-size: 14px; line-height: 1.8;">
              If you need help, just reply to this email or contact our team on WhatsApp.
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;
}

export async function sendOrderConfirmationEmail(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      address: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      id: true,
      confirmationEmailSentAt: true,
      createdAt: true,
      customerEmail: true,
      customerName: true,
      customerPhone: true,
      discount: true,
      items: true,
      orderNumber: true,
      paymentMethod: true,
      pincode: true,
      razorpayOrderId: true,
      razorpayPaymentId: true,
      shippingCharge: true,
      state: true,
      status: true,
      subtotal: true,
      total: true,
    },
  });

  if (!order || !order.customerEmail || order.confirmationEmailSentAt) {
    return { sent: false, reason: "skipped" as const };
  }
  const invoicePdf = await buildInvoicePdf(order);
  const orderReference = order.orderNumber || order.id;

  await sendEmail({
    attachments: [
      {
        content: invoicePdf,
        contentType: "application/pdf",
        filename: `${orderReference}-invoice.pdf`,
      },
    ],
    to: order.customerEmail,
    subject: `Order Confirmation - ${orderReference}`,
    html: buildOrderEmailHtml({
      customerName: order.customerName,
      items: parseItems(order.items),
      orderNumber: orderReference,
      paymentMethod: order.paymentMethod,
      status: order.status,
      total: order.total,
    }),
  });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      confirmationEmailSentAt: new Date(),
    },
  });

  return { sent: true as const };
}
