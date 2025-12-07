-- CreateTable
CREATE TABLE "public"."ProcessedStripeEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedStripeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProcessedStripeEvent_id_idx" ON "public"."ProcessedStripeEvent"("id");

-- CreateIndex
CREATE INDEX "ProcessedStripeEvent_createdAt_idx" ON "public"."ProcessedStripeEvent"("createdAt");
