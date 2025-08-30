-- DropIndex
DROP INDEX "public"."Report_workflowId_status_createdAt_idx";

-- AlterTable
ALTER TABLE "public"."Report" ADD COLUMN     "description" TEXT,
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "resolvedBy" UUID,
ADD COLUMN     "storeId" UUID,
ALTER COLUMN "workflowId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Report_workflowId_storeId_status_createdAt_idx" ON "public"."Report"("workflowId", "storeId", "status", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."SellerProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
