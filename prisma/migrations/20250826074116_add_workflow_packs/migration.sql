/*
  Warnings:

  - Added the required column `updatedAt` to the `SellerProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."SellerProfile" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "stripeAccountId" TEXT,
ADD COLUMN     "stripeOnboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeOnboardingUrl" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."WorkflowPack" (
    "id" UUID NOT NULL,
    "sellerId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDesc" TEXT NOT NULL,
    "longDescMd" TEXT,
    "heroImageUrl" TEXT,
    "status" "public"."WorkflowStatus" NOT NULL DEFAULT 'draft',
    "basePriceCents" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "salesCount" INTEGER NOT NULL DEFAULT 0,
    "ratingAvg" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowPackItem" (
    "id" UUID NOT NULL,
    "packId" UUID NOT NULL,
    "workflowId" UUID NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowPackItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowPackCategory" (
    "packId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,

    CONSTRAINT "WorkflowPackCategory_pkey" PRIMARY KEY ("packId","categoryId")
);

-- CreateTable
CREATE TABLE "public"."WorkflowPackTag" (
    "packId" UUID NOT NULL,
    "tagId" UUID NOT NULL,

    CONSTRAINT "WorkflowPackTag_pkey" PRIMARY KEY ("packId","tagId")
);

-- CreateTable
CREATE TABLE "public"."PackPricingPlan" (
    "id" UUID NOT NULL,
    "packId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "features" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PackPricingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PackOrderItem" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "packId" UUID NOT NULL,
    "pricingPlanId" UUID,
    "unitPriceCents" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "subtotalCents" INTEGER NOT NULL,

    CONSTRAINT "PackOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PackReview" (
    "id" UUID NOT NULL,
    "packId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "rating" SMALLINT NOT NULL,
    "title" VARCHAR(200),
    "bodyMd" TEXT,
    "status" "public"."ReviewStatus" NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PackReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PackReviewHelpfulVote" (
    "id" UUID NOT NULL,
    "reviewId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackReviewHelpfulVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PackFavorite" (
    "userId" UUID NOT NULL,
    "packId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackFavorite_pkey" PRIMARY KEY ("userId","packId")
);

-- CreateTable
CREATE TABLE "public"."PackReport" (
    "id" UUID NOT NULL,
    "reporterId" UUID,
    "packId" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "public"."ReportStatus" NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowPack_slug_key" ON "public"."WorkflowPack"("slug");

-- CreateIndex
CREATE INDEX "WorkflowPack_status_updatedAt_idx" ON "public"."WorkflowPack"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "WorkflowPackItem_packId_sortOrder_idx" ON "public"."WorkflowPackItem"("packId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowPackItem_packId_workflowId_key" ON "public"."WorkflowPackItem"("packId", "workflowId");

-- CreateIndex
CREATE INDEX "PackPricingPlan_packId_isActive_sortOrder_idx" ON "public"."PackPricingPlan"("packId", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "PackOrderItem_orderId_idx" ON "public"."PackOrderItem"("orderId");

-- CreateIndex
CREATE INDEX "PackOrderItem_packId_idx" ON "public"."PackOrderItem"("packId");

-- CreateIndex
CREATE INDEX "PackReview_packId_status_createdAt_idx" ON "public"."PackReview"("packId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "PackReview_rating_createdAt_idx" ON "public"."PackReview"("rating", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PackReview_packId_userId_key" ON "public"."PackReview"("packId", "userId");

-- CreateIndex
CREATE INDEX "PackReviewHelpfulVote_reviewId_idx" ON "public"."PackReviewHelpfulVote"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "PackReviewHelpfulVote_reviewId_userId_key" ON "public"."PackReviewHelpfulVote"("reviewId", "userId");

-- CreateIndex
CREATE INDEX "PackReport_packId_status_createdAt_idx" ON "public"."PackReport"("packId", "status", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."WorkflowPack" ADD CONSTRAINT "WorkflowPack_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowPackItem" ADD CONSTRAINT "WorkflowPackItem_packId_fkey" FOREIGN KEY ("packId") REFERENCES "public"."WorkflowPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowPackItem" ADD CONSTRAINT "WorkflowPackItem_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowPackCategory" ADD CONSTRAINT "WorkflowPackCategory_packId_fkey" FOREIGN KEY ("packId") REFERENCES "public"."WorkflowPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowPackCategory" ADD CONSTRAINT "WorkflowPackCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowPackTag" ADD CONSTRAINT "WorkflowPackTag_packId_fkey" FOREIGN KEY ("packId") REFERENCES "public"."WorkflowPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowPackTag" ADD CONSTRAINT "WorkflowPackTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PackPricingPlan" ADD CONSTRAINT "PackPricingPlan_packId_fkey" FOREIGN KEY ("packId") REFERENCES "public"."WorkflowPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PackOrderItem" ADD CONSTRAINT "PackOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PackOrderItem" ADD CONSTRAINT "PackOrderItem_packId_fkey" FOREIGN KEY ("packId") REFERENCES "public"."WorkflowPack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PackOrderItem" ADD CONSTRAINT "PackOrderItem_pricingPlanId_fkey" FOREIGN KEY ("pricingPlanId") REFERENCES "public"."PackPricingPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PackReview" ADD CONSTRAINT "PackReview_packId_fkey" FOREIGN KEY ("packId") REFERENCES "public"."WorkflowPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PackReview" ADD CONSTRAINT "PackReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PackReviewHelpfulVote" ADD CONSTRAINT "PackReviewHelpfulVote_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "public"."PackReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PackReviewHelpfulVote" ADD CONSTRAINT "PackReviewHelpfulVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PackFavorite" ADD CONSTRAINT "PackFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PackFavorite" ADD CONSTRAINT "PackFavorite_packId_fkey" FOREIGN KEY ("packId") REFERENCES "public"."WorkflowPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PackReport" ADD CONSTRAINT "PackReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PackReport" ADD CONSTRAINT "PackReport_packId_fkey" FOREIGN KEY ("packId") REFERENCES "public"."WorkflowPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
