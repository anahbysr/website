-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Collection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "heroImage" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Collection" ("createdAt", "description", "heroImage", "id", "name", "slug", "sortOrder") SELECT "createdAt", "description", "heroImage", "id", "name", "slug", "sortOrder" FROM "Collection";
DROP TABLE "Collection";
ALTER TABLE "new_Collection" RENAME TO "Collection";
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "address" TEXT,
    "items" TEXT NOT NULL,
    "total" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "trackingNumber" TEXT,
    "courier" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "orderNumber" TEXT,
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "subtotal" REAL,
    "shippingCharge" REAL,
    "couponCode" TEXT,
    "discount" REAL NOT NULL DEFAULT 0,
    "paymentMethod" TEXT
);
INSERT INTO "new_Order" ("addressLine1", "addressLine2", "city", "couponCode", "courier", "createdAt", "customerEmail", "customerName", "customerPhone", "discount", "id", "items", "orderNumber", "paymentMethod", "pincode", "razorpayOrderId", "razorpayPaymentId", "shippingCharge", "state", "status", "subtotal", "total", "trackingNumber", "updatedAt") SELECT "addressLine1", "addressLine2", "city", "couponCode", "courier", "createdAt", "customerEmail", "customerName", "customerPhone", "discount", "id", "items", "orderNumber", "paymentMethod", "pincode", "razorpayOrderId", "razorpayPaymentId", "shippingCharge", "state", "status", "subtotal", "total", "trackingNumber", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "salePrice" REAL,
    "badge" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "images" TEXT NOT NULL,
    "stock" TEXT NOT NULL,
    "collectionId" TEXT,
    "collectionOrder" INTEGER NOT NULL DEFAULT 0,
    "fabric" TEXT NOT NULL DEFAULT 'Cotton',
    "ageFrom" INTEGER NOT NULL DEFAULT 0,
    "ageTo" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("ageFrom", "ageTo", "badge", "collectionId", "createdAt", "description", "fabric", "id", "images", "name", "price", "salePrice", "slug", "status", "stock", "updatedAt") SELECT "ageFrom", "ageTo", "badge", "collectionId", "createdAt", "description", "fabric", "id", "images", "name", "price", "salePrice", "slug", "status", "stock", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE TABLE "new_Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "orderId" TEXT,
    "customerName" TEXT NOT NULL,
    "city" TEXT,
    "rating" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("city", "createdAt", "customerName", "id", "orderId", "productId", "rating", "status", "text") SELECT "city", "createdAt", "customerName", "id", "orderId", "productId", "rating", "status", "text" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
