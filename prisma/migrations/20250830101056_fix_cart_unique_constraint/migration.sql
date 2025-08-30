-- DropIndex
DROP INDEX "public"."CartItem_cartId_workflowId_pricingPlanId_key";

-- CreateIndex
CREATE INDEX "CartItem_cartId_workflowId_idx" ON "public"."CartItem"("cartId", "workflowId");
