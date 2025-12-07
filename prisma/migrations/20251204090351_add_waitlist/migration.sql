-- CreateTable
CREATE TABLE "public"."WaitlistEntry" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "position" SERIAL NOT NULL,
    "source" VARCHAR(100),
    "referrer" VARCHAR(255),
    "metadata" JSONB,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "launchEmailSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaitlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistEntry_email_key" ON "public"."WaitlistEntry"("email");

-- CreateIndex
CREATE INDEX "WaitlistEntry_email_idx" ON "public"."WaitlistEntry"("email");

-- CreateIndex
CREATE INDEX "WaitlistEntry_createdAt_idx" ON "public"."WaitlistEntry"("createdAt");

-- CreateIndex
CREATE INDEX "WaitlistEntry_position_idx" ON "public"."WaitlistEntry"("position");
