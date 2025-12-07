-- CreateTable
CREATE TABLE "public"."BugReport" (
    "id" UUID NOT NULL,
    "reporterId" UUID,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pageUrl" TEXT,
    "userAgent" TEXT,
    "screenshot" TEXT,
    "status" "public"."ReportStatus" NOT NULL DEFAULT 'open',
    "priority" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" UUID,

    CONSTRAINT "BugReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BugReport_status_createdAt_idx" ON "public"."BugReport"("status", "createdAt");

-- CreateIndex
CREATE INDEX "BugReport_category_status_idx" ON "public"."BugReport"("category", "status");

-- AddForeignKey
ALTER TABLE "public"."BugReport" ADD CONSTRAINT "BugReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BugReport" ADD CONSTRAINT "BugReport_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
