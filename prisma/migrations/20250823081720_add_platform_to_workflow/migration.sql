-- CreateEnum
CREATE TYPE "public"."Platform" AS ENUM ('n8n', 'zapier', 'make', 'airtable_script');

-- AlterTable
ALTER TABLE "public"."Workflow" ADD COLUMN     "platform" "public"."Platform";
