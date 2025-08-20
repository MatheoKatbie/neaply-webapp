-- Enable Row Level Security on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SellerProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Workflow" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkflowVersion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkflowCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkflowTag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PricingPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Favorite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payout" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Report" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkflowCompatibility" ENABLE ROW LEVEL SECURITY;

-- ============================
-- User Policies
-- ============================

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON "User"
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON "User"
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (during registration)
CREATE POLICY "Users can insert own profile" ON "User"
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================
-- SellerProfile Policies
-- ============================

-- Users can read their own seller profile
CREATE POLICY "Users can view own seller profile" ON "SellerProfile"
    FOR SELECT USING (auth.uid() = "userId");

-- Users can update their own seller profile
CREATE POLICY "Users can update own seller profile" ON "SellerProfile"
    FOR UPDATE USING (auth.uid() = "userId");

-- Users can insert their own seller profile
CREATE POLICY "Users can insert own seller profile" ON "SellerProfile"
    FOR INSERT WITH CHECK (auth.uid() = "userId");

-- Anyone can read public seller profiles
CREATE POLICY "Anyone can view public seller profiles" ON "SellerProfile"
    FOR SELECT USING (status = 'active');

-- ============================
-- Workflow Policies
-- ============================

-- Sellers can manage their own workflows
CREATE POLICY "Sellers can manage own workflows" ON "Workflow"
    FOR ALL USING (auth.uid() = "sellerId");

-- Anyone can view published workflows
CREATE POLICY "Anyone can view published workflows" ON "Workflow"
    FOR SELECT USING (status = 'published');

-- ============================
-- WorkflowVersion Policies
-- ============================

-- Sellers can manage versions of their workflows
CREATE POLICY "Sellers can manage own workflow versions" ON "WorkflowVersion"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Workflow" 
            WHERE "Workflow".id = "WorkflowVersion"."workflowId" 
            AND "Workflow"."sellerId"::text = auth.uid()::text
        )
    );

-- Anyone can view versions of published workflows
CREATE POLICY "Anyone can view published workflow versions" ON "WorkflowVersion"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Workflow" 
            WHERE "Workflow".id = "WorkflowVersion"."workflowId" 
            AND "Workflow".status = 'published'
        )
    );

-- ============================
-- Category & Tag Policies
-- ============================

-- Anyone can read categories and tags
CREATE POLICY "Anyone can view categories" ON "Category"
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view tags" ON "Tag"
    FOR SELECT USING (true);

-- ============================
-- PricingPlan Policies
-- ============================

-- Sellers can manage pricing plans for their workflows
CREATE POLICY "Sellers can manage own pricing plans" ON "PricingPlan"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Workflow" 
            WHERE "Workflow".id = "PricingPlan"."workflowId" 
            AND "Workflow"."sellerId"::text = auth.uid()::text
        )
    );

-- Anyone can view pricing plans for published workflows
CREATE POLICY "Anyone can view published workflow pricing plans" ON "PricingPlan"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Workflow" 
            WHERE "Workflow".id = "PricingPlan"."workflowId" 
            AND "Workflow".status = 'published'
        )
    );

-- ============================
-- Favorite Policies
-- ============================

-- Users can manage their own favorites
CREATE POLICY "Users can manage own favorites" ON "Favorite"
    FOR ALL USING (auth.uid()::text = "userId"::text);

-- ============================
-- Order Policies
-- ============================

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON "Order"
    FOR SELECT USING (auth.uid()::text = "userId"::text);

-- Users can create their own orders
CREATE POLICY "Users can create own orders" ON "Order"
    FOR INSERT WITH CHECK (auth.uid()::text = "userId"::text);

-- ============================
-- OrderItem Policies
-- ============================

-- Users can view items from their own orders
CREATE POLICY "Users can view own order items" ON "OrderItem"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Order" 
            WHERE "Order".id = "OrderItem"."orderId" 
            AND "Order"."userId"::text = auth.uid()::text
        )
    );

-- Users can create items for their own orders
CREATE POLICY "Users can create own order items" ON "OrderItem"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "Order" 
            WHERE "Order".id = "OrderItem"."orderId" 
            AND "Order"."userId"::text = auth.uid()::text
        )
    );

-- ============================
-- Payment Policies
-- ============================

-- Users can view payments for their own orders
CREATE POLICY "Users can view own payments" ON "Payment"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Order" 
            WHERE "Order".id = "Payment"."orderId" 
            AND "Order"."userId"::text = auth.uid()::text
        )
    );

-- ============================
-- Review Policies
-- ============================

-- Users can manage their own reviews
CREATE POLICY "Users can manage own reviews" ON "Review"
    FOR ALL USING (auth.uid()::text = "userId"::text);

-- Anyone can view published reviews
CREATE POLICY "Anyone can view published reviews" ON "Review"
    FOR SELECT USING (status = 'published');

-- ============================
-- Payout Policies
-- ============================

-- Sellers can view their own payouts
CREATE POLICY "Sellers can view own payouts" ON "Payout"
    FOR SELECT USING (auth.uid()::text = "sellerId"::text);

-- ============================
-- Report Policies
-- ============================

-- Users can create reports
CREATE POLICY "Users can create reports" ON "Report"
    FOR INSERT WITH CHECK (auth.uid()::text = "reporterId"::text);

-- Users can view their own reports
CREATE POLICY "Users can view own reports" ON "Report"
    FOR SELECT USING (auth.uid()::text = "reporterId"::text);

-- ============================
-- AuditLog Policies
-- ============================

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs" ON "AuditLog"
    FOR SELECT USING (auth.uid()::text = "userId"::text);

-- ============================
-- WorkflowCompatibility Policies
-- ============================

-- Anyone can view compatibility info for published workflows
CREATE POLICY "Anyone can view published workflow compatibility" ON "WorkflowCompatibility"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Workflow" 
            WHERE "Workflow".id = "WorkflowCompatibility"."workflowId" 
            AND "Workflow".status = 'published'
        )
    );

-- Sellers can manage compatibility for their workflows
CREATE POLICY "Sellers can manage own workflow compatibility" ON "WorkflowCompatibility"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Workflow" 
            WHERE "Workflow".id = "WorkflowCompatibility"."workflowId" 
            AND "Workflow"."sellerId"::text = auth.uid()::text
        )
    );
