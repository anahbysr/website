-- Payment state reported by Razorpay, separate from fulfilment status.
ALTER TABLE "Order" ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Order" ADD COLUMN "paymentMethodDetail" TEXT;
ALTER TABLE "Order" ADD COLUMN "paymentFailureReason" TEXT;
ALTER TABLE "Order" ADD COLUMN "amountRefunded" REAL NOT NULL DEFAULT 0;

-- Backfill: an order that already recorded a Razorpay payment was paid.
UPDATE "Order" SET "paymentStatus" = 'PAID' WHERE "razorpayPaymentId" IS NOT NULL;
