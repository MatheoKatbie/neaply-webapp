-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."NotificationType" ADD VALUE 'new_follower';
ALTER TYPE "public"."NotificationType" ADD VALUE 'store_new_workflow';

-- CreateTable
CREATE TABLE "public"."StoreFollow" (
    "id" UUID NOT NULL,
    "followerId" UUID NOT NULL,
    "sellerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreFollow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoreFollow_sellerId_idx" ON "public"."StoreFollow"("sellerId");

-- CreateIndex
CREATE INDEX "StoreFollow_followerId_idx" ON "public"."StoreFollow"("followerId");

-- CreateIndex
CREATE UNIQUE INDEX "StoreFollow_followerId_sellerId_key" ON "public"."StoreFollow"("followerId", "sellerId");

-- AddForeignKey
ALTER TABLE "public"."StoreFollow" ADD CONSTRAINT "StoreFollow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StoreFollow" ADD CONSTRAINT "StoreFollow_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
