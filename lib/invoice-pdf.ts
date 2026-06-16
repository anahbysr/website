import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { parseJsonObject } from "@/lib/serializers";

type InvoiceOrder = {
  id: string;
  orderNumber?: string | null;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  address?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  items: string;
  subtotal?: number | null;
  shippingCharge?: number | null;
  discount?: number | null;
  total: number;
  status: string;
  paymentMethod?: string | null;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  createdAt: Date | string;
};

type InvoiceLineItem = {
  name: string;
  size?: string;
  qty: number;
  price: number;
  customizationValue?: string;
};

function formatMoney(amount: number) {
  return `Rs ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

function formatInvoiceDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getAddress(order: InvoiceOrder) {
  const parts = [
    order.addressLine1,
    order.addressLine2,
    order.city,
    order.state,
    order.pincode,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : order.address || "-";
}

export async function buildInvoicePdf(order: InvoiceOrder) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  const serifBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const sansFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const sansBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const palette = {
    deepBrown: rgb(0.29, 0.17, 0.1),
    taupe: rgb(0.65, 0.58, 0.52),
    body: rgb(0.35, 0.28, 0.25),
    cream: rgb(0.98, 0.96, 0.92),
    coral: rgb(0.9, 0.55, 0.44),
    line: rgb(0.88, 0.84, 0.79),
  };

  page.drawRectangle({
    x: 0,
    y: height - 110,
    width,
    height: 110,
    color: palette.cream,
  });

  const logoPath = path.join(process.cwd(), "public", "uploads", "anah-logo.png");
  try {
    const logoBytes = await readFile(logoPath);
    const logoImage = await pdfDoc.embedPng(logoBytes);
    const logoDims = logoImage.scale(0.18);
    page.drawImage(logoImage, {
      x: 42,
      y: height - 92,
      width: logoDims.width,
      height: logoDims.height,
    });
  } catch {
    page.drawText("anah", {
      x: 42,
      y: height - 60,
      size: 26,
      font: serifBold,
      color: palette.deepBrown,
    });
  }

  page.drawText("INVOICE", {
    x: width - 150,
    y: height - 52,
    size: 20,
    font: sansBold,
    color: palette.deepBrown,
  });

  page.drawText("Anah by Sindhura Reddy", {
    x: 42,
    y: height - 108,
    size: 10,
    font: sansFont,
    color: palette.taupe,
  });

  const invoiceRef = order.orderNumber || order.id;
  const topMetaY = height - 160;
  page.drawText(`Invoice No: ${invoiceRef}`, {
    x: 42,
    y: topMetaY,
    size: 12,
    font: sansBold,
    color: palette.deepBrown,
  });
  page.drawText(`Order Date: ${formatInvoiceDate(order.createdAt)}`, {
    x: 42,
    y: topMetaY - 18,
    size: 11,
    font: sansFont,
    color: palette.body,
  });
  page.drawText(`Status: ${order.status}`, {
    x: width - 180,
    y: topMetaY,
    size: 11,
    font: sansFont,
    color: palette.body,
  });
  page.drawText(`Payment: ${order.paymentMethod || "-"}`, {
    x: width - 180,
    y: topMetaY - 18,
    size: 11,
    font: sansFont,
    color: palette.body,
  });

  const sectionY = height - 245;
  page.drawText("Bill To", {
    x: 42,
    y: sectionY,
    size: 11,
    font: sansBold,
    color: palette.taupe,
  });
  page.drawText(order.customerName, {
    x: 42,
    y: sectionY - 24,
    size: 18,
    font: serifBold,
    color: palette.deepBrown,
  });
  page.drawText(order.customerEmail || "-", {
    x: 42,
    y: sectionY - 46,
    size: 11,
    font: sansFont,
    color: palette.body,
  });
  page.drawText(order.customerPhone || "-", {
    x: 42,
    y: sectionY - 62,
    size: 11,
    font: sansFont,
    color: palette.body,
  });
  page.drawText(getAddress(order), {
    x: 42,
    y: sectionY - 78,
    size: 11,
    font: sansFont,
    color: palette.body,
    maxWidth: 250,
    lineHeight: 14,
  });

  page.drawText("Payment Reference", {
    x: width - 200,
    y: sectionY,
    size: 11,
    font: sansBold,
    color: palette.taupe,
  });
  page.drawText(`Razorpay Payment ID: ${order.razorpayPaymentId || "-"}`, {
    x: width - 200,
    y: sectionY - 24,
    size: 10,
    font: sansFont,
    color: palette.body,
    maxWidth: 160,
    lineHeight: 13,
  });
  page.drawText(`Razorpay Order ID: ${order.razorpayOrderId || "-"}`, {
    x: width - 200,
    y: sectionY - 54,
    size: 10,
    font: sansFont,
    color: palette.body,
    maxWidth: 160,
    lineHeight: 13,
  });

  const tableTop = height - 390;
  page.drawLine({
    start: { x: 42, y: tableTop + 28 },
    end: { x: width - 42, y: tableTop + 28 },
    thickness: 1.2,
    color: palette.deepBrown,
  });
  page.drawText("Item", {
    x: 42,
    y: tableTop,
    size: 11,
    font: sansBold,
    color: palette.taupe,
  });
  page.drawText("Qty", {
    x: width - 180,
    y: tableTop,
    size: 11,
    font: sansBold,
    color: palette.taupe,
  });
  page.drawText("Amount", {
    x: width - 100,
    y: tableTop,
    size: 11,
    font: sansBold,
    color: palette.taupe,
  });

  const items = parseJsonObject<InvoiceLineItem[]>(order.items, []);
  let cursorY = tableTop - 28;
  items.forEach((item) => {
    const description = `${item.name}${item.size ? ` - ${item.size}` : ""}${item.customizationValue ? ` - Personalization: ${item.customizationValue}` : ""}`;
    page.drawText(description, {
      x: 42,
      y: cursorY,
      size: 11,
      font: sansFont,
      color: palette.body,
      maxWidth: width - 250,
    });
    page.drawText(String(item.qty), {
      x: width - 175,
      y: cursorY,
      size: 11,
      font: sansFont,
      color: palette.body,
    });
    page.drawText(formatMoney(item.price * item.qty), {
      x: width - 100,
      y: cursorY,
      size: 11,
      font: sansFont,
      color: palette.body,
    });
    cursorY -= 24;
  });

  page.drawLine({
    start: { x: 42, y: cursorY + 8 },
    end: { x: width - 42, y: cursorY + 8 },
    thickness: 1,
    color: palette.line,
  });

  const summaryX = width - 210;
  const subtotal = order.subtotal ?? order.total;
  const shipping = order.shippingCharge ?? 0;
  const discount = order.discount ?? 0;

  cursorY -= 20;
  page.drawText("Subtotal", {
    x: summaryX,
    y: cursorY,
    size: 11,
    font: sansFont,
    color: palette.body,
  });
  page.drawText(formatMoney(subtotal), {
    x: width - 100,
    y: cursorY,
    size: 11,
    font: sansFont,
    color: palette.body,
  });
  cursorY -= 18;

  page.drawText("Shipping", {
    x: summaryX,
    y: cursorY,
    size: 11,
    font: sansFont,
    color: palette.body,
  });
  page.drawText(shipping === 0 ? "Free" : formatMoney(shipping), {
    x: width - 100,
    y: cursorY,
    size: 11,
    font: sansFont,
    color: palette.body,
  });

  if (discount > 0) {
    cursorY -= 18;
    page.drawText("Discount", {
      x: summaryX,
      y: cursorY,
      size: 11,
      font: sansFont,
      color: palette.body,
    });
    page.drawText(`- ${formatMoney(discount)}`, {
      x: width - 100,
      y: cursorY,
      size: 11,
      font: sansFont,
      color: palette.body,
    });
  }

  cursorY -= 28;
  page.drawLine({
    start: { x: summaryX, y: cursorY + 18 },
    end: { x: width - 42, y: cursorY + 18 },
    thickness: 1,
    color: palette.line,
  });
  page.drawText("Total", {
    x: summaryX,
    y: cursorY,
    size: 14,
    font: sansBold,
    color: palette.deepBrown,
  });
  page.drawText(formatMoney(order.total), {
    x: width - 100,
    y: cursorY,
    size: 14,
    font: sansBold,
    color: palette.deepBrown,
  });

  page.drawRectangle({
    x: 42,
    y: 56,
    width: width - 84,
    height: 88,
    color: palette.cream,
    borderColor: palette.line,
    borderWidth: 1,
  });
  page.drawText("Thank you for shopping with Anah.", {
    x: 58,
    y: 118,
    size: 16,
    font: serifBold,
    color: palette.deepBrown,
  });
  page.drawText(
    "This invoice was generated automatically from your order record. For shipping updates or support, please reach out on WhatsApp or email the brand team.",
    {
      x: 58,
      y: 92,
      size: 10,
      font: sansFont,
      color: palette.body,
      maxWidth: width - 116,
      lineHeight: 14,
    },
  );

  return Buffer.from(await pdfDoc.save());
}
