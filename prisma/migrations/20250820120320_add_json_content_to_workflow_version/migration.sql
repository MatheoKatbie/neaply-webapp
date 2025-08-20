-- AlterTable
ALTER TABLE "public"."WorkflowVersion" ADD COLUMN     "jsonContent" JSONB,
ALTER COLUMN "jsonFileUrl" DROP NOT NULL;
