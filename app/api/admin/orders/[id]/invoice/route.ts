import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-auth";
import { buildInvoicePdf } from "@/lib/invoice-pdf";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const order = await prisma.order.findUnique({ where: { id } });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const pdfBytes = await buildInvoicePdf(order);
  const filename = `${order.orderNumber || order.id}-invoice.pdf`;

  return new NextResponse(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
