-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "salePrice" REAL,
    "badge" TEXT,
    "allowCustomization" BOOLEAN NOT NULL DEFAULT false,
    "customizationLabel" TEXT,
    "customizationHelp" TEXT,
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
INSERT INTO "new_Product" ("ageFrom", "ageTo", "badge", "collectionId", "collectionOrder", "createdAt", "description", "fabric", "id", "images", "name", "price", "salePrice", "slug", "status", "stock", "updatedAt") SELECT "ageFrom", "ageTo", "badge", "collectionId", "collectionOrder", "createdAt", "description", "fabric", "id", "images", "name", "price", "salePrice", "slug", "status", "stock", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
