-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SELLER';

-- CreateTable
CREATE TABLE "Seller" (
    "id" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "logoUrl" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Seller_userId_key" ON "Seller"("userId");

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "sellerId" TEXT;

-- AlterTable
ALTER TABLE "ProductOrderItem" ADD COLUMN "fulfilled" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Seller" ADD CONSTRAINT "Seller_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;
