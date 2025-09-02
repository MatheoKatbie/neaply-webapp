/*
  Warnings:

  - You are about to drop the column `pricingPlanId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `pricingPlanId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `pricingPlanId` on the `PackOrderItem` table. All the data in the column will be lost.
  - You are about to drop the `PackPricingPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PricingPlan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CartItem" DROP CONSTRAINT "CartItem_pricingPlanId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_pricingPlanId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PackOrderItem" DROP CONSTRAINT "PackOrderItem_pricingPlanId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PackPricingPlan" DROP CONSTRAINT "PackPricingPlan_packId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PricingPlan" DROP CONSTRAINT "PricingPlan_workflowId_fkey";

-- AlterTable
ALTER TABLE "public"."CartItem" DROP COLUMN "pricingPlanId";

-- AlterTable
ALTER TABLE "public"."OrderItem" DROP COLUMN "pricingPlanId";

-- AlterTable
ALTER TABLE "public"."PackOrderItem" DROP COLUMN "pricingPlanId";

-- DropTable
DROP TABLE "public"."PackPricingPlan";

-- DropTable
DROP TABLE "public"."PricingPlan";
