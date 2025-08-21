/*
  Warnings:

  - The primary key for the `AuditLog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `entityId` column on the `AuditLog` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Favorite` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Order` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OrderItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `pricingPlanId` column on the `OrderItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Payment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Payout` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PricingPlan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Report` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Review` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Tag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Workflow` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `WorkflowCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `WorkflowCompatibility` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `WorkflowTag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `WorkflowVersion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `AuditLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Category` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `workflowId` on the `Favorite` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `OrderItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orderId` on the `OrderItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `workflowId` on the `OrderItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orderId` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Payout` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `PricingPlan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `workflowId` on the `PricingPlan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Report` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `workflowId` on the `Report` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Review` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `workflowId` on the `Review` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Tag` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Workflow` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `workflowId` on the `WorkflowCategory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `categoryId` on the `WorkflowCategory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `workflowId` on the `WorkflowCompatibility` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `workflowId` on the `WorkflowTag` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tagId` on the `WorkflowTag` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `WorkflowVersion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `workflowId` on the `WorkflowVersion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."Favorite" DROP CONSTRAINT "Favorite_workflowId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_pricingPlanId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_workflowId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PricingPlan" DROP CONSTRAINT "PricingPlan_workflowId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Report" DROP CONSTRAINT "Report_workflowId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_workflowId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkflowCategory" DROP CONSTRAINT "WorkflowCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkflowCategory" DROP CONSTRAINT "WorkflowCategory_workflowId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkflowCompatibility" DROP CONSTRAINT "WorkflowCompatibility_workflowId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkflowTag" DROP CONSTRAINT "WorkflowTag_tagId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkflowTag" DROP CONSTRAINT "WorkflowTag_workflowId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkflowVersion" DROP CONSTRAINT "WorkflowVersion_workflowId_fkey";

-- AlterTable
ALTER TABLE "public"."AuditLog" DROP CONSTRAINT "AuditLog_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "entityId",
ADD COLUMN     "entityId" UUID,
ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Category" DROP CONSTRAINT "Category_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Category_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Favorite" DROP CONSTRAINT "Favorite_pkey",
DROP COLUMN "workflowId",
ADD COLUMN     "workflowId" UUID NOT NULL,
ADD CONSTRAINT "Favorite_pkey" PRIMARY KEY ("userId", "workflowId");

-- AlterTable
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Order_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "orderId",
ADD COLUMN     "orderId" UUID NOT NULL,
DROP COLUMN "workflowId",
ADD COLUMN     "workflowId" UUID NOT NULL,
DROP COLUMN "pricingPlanId",
ADD COLUMN     "pricingPlanId" UUID,
ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "orderId",
ADD COLUMN     "orderId" UUID NOT NULL,
ADD CONSTRAINT "Payment_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Payout" DROP CONSTRAINT "Payout_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Payout_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."PricingPlan" DROP CONSTRAINT "PricingPlan_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "workflowId",
ADD COLUMN     "workflowId" UUID NOT NULL,
ADD CONSTRAINT "PricingPlan_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Report" DROP CONSTRAINT "Report_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "workflowId",
ADD COLUMN     "workflowId" UUID NOT NULL,
ADD CONSTRAINT "Report_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "workflowId",
ADD COLUMN     "workflowId" UUID NOT NULL,
ADD CONSTRAINT "Review_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Tag" DROP CONSTRAINT "Tag_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Tag_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Workflow" DROP CONSTRAINT "Workflow_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."WorkflowCategory" DROP CONSTRAINT "WorkflowCategory_pkey",
DROP COLUMN "workflowId",
ADD COLUMN     "workflowId" UUID NOT NULL,
DROP COLUMN "categoryId",
ADD COLUMN     "categoryId" UUID NOT NULL,
ADD CONSTRAINT "WorkflowCategory_pkey" PRIMARY KEY ("workflowId", "categoryId");

-- AlterTable
ALTER TABLE "public"."WorkflowCompatibility" DROP CONSTRAINT "WorkflowCompatibility_pkey",
DROP COLUMN "workflowId",
ADD COLUMN     "workflowId" UUID NOT NULL,
ADD CONSTRAINT "WorkflowCompatibility_pkey" PRIMARY KEY ("workflowId", "n8nVersion");

-- AlterTable
ALTER TABLE "public"."WorkflowTag" DROP CONSTRAINT "WorkflowTag_pkey",
DROP COLUMN "workflowId",
ADD COLUMN     "workflowId" UUID NOT NULL,
DROP COLUMN "tagId",
ADD COLUMN     "tagId" UUID NOT NULL,
ADD CONSTRAINT "WorkflowTag_pkey" PRIMARY KEY ("workflowId", "tagId");

-- AlterTable
ALTER TABLE "public"."WorkflowVersion" DROP CONSTRAINT "WorkflowVersion_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "workflowId",
ADD COLUMN     "workflowId" UUID NOT NULL,
ADD CONSTRAINT "WorkflowVersion_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "public"."AuditLog"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "public"."OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_workflowId_idx" ON "public"."OrderItem"("workflowId");

-- CreateIndex
CREATE INDEX "PricingPlan_workflowId_isActive_sortOrder_idx" ON "public"."PricingPlan"("workflowId", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "Report_workflowId_status_createdAt_idx" ON "public"."Report"("workflowId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Review_workflowId_status_createdAt_idx" ON "public"."Review"("workflowId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_workflowId_userId_key" ON "public"."Review"("workflowId", "userId");

-- CreateIndex
CREATE INDEX "WorkflowVersion_workflowId_isLatest_idx" ON "public"."WorkflowVersion"("workflowId", "isLatest");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowVersion_workflowId_semver_key" ON "public"."WorkflowVersion"("workflowId", "semver");

-- AddForeignKey
ALTER TABLE "public"."WorkflowVersion" ADD CONSTRAINT "WorkflowVersion_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowCategory" ADD CONSTRAINT "WorkflowCategory_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowCategory" ADD CONSTRAINT "WorkflowCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowTag" ADD CONSTRAINT "WorkflowTag_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowTag" ADD CONSTRAINT "WorkflowTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PricingPlan" ADD CONSTRAINT "PricingPlan_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Favorite" ADD CONSTRAINT "Favorite_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_pricingPlanId_fkey" FOREIGN KEY ("pricingPlanId") REFERENCES "public"."PricingPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowCompatibility" ADD CONSTRAINT "WorkflowCompatibility_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
