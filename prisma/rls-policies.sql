-- =====================================================
-- Neaply RLS Policies - Synced from Production
-- Last updated: 2025-12-05
-- =====================================================

-- =====================================================
-- DROP ALL EXISTING POLICIES FIRST
-- =====================================================

-- User policies
DROP POLICY IF EXISTS "Users can view own profile" ON "User";
DROP POLICY IF EXISTS "Users can update own profile" ON "User";
DROP POLICY IF EXISTS "Users can insert own profile" ON "User";

-- SellerProfile policies
DROP POLICY IF EXISTS "Users can view own seller profile" ON "SellerProfile";
DROP POLICY IF EXISTS "Users can update own seller profile" ON "SellerProfile";
DROP POLICY IF EXISTS "Users can insert own seller profile" ON "SellerProfile";
DROP POLICY IF EXISTS "Anyone can view public seller profiles" ON "SellerProfile";
DROP POLICY IF EXISTS "Admins can view all seller profiles" ON "SellerProfile";

-- Workflow policies
DROP POLICY IF EXISTS "Sellers can manage own workflows" ON "Workflow";
DROP POLICY IF EXISTS "Anyone can view published workflows" ON "Workflow";
DROP POLICY IF EXISTS "Admins can manage all workflows" ON "Workflow";

-- WorkflowVersion policies
DROP POLICY IF EXISTS "Sellers can manage own workflow versions" ON "WorkflowVersion";
DROP POLICY IF EXISTS "Anyone can view published workflow versions" ON "WorkflowVersion";
DROP POLICY IF EXISTS "Admins can manage all workflow versions" ON "WorkflowVersion";

-- Category policies
DROP POLICY IF EXISTS "Anyone can view categories" ON "Category";
DROP POLICY IF EXISTS "Admins can manage categories" ON "Category";

-- WorkflowCategory policies
DROP POLICY IF EXISTS "Anyone can view published workflow categories" ON "WorkflowCategory";
DROP POLICY IF EXISTS "Sellers can manage own workflow categories" ON "WorkflowCategory";
DROP POLICY IF EXISTS "Admins can manage all workflow categories" ON "WorkflowCategory";

-- Tag policies
DROP POLICY IF EXISTS "Anyone can view tags" ON "Tag";
DROP POLICY IF EXISTS "Admins can manage tags" ON "Tag";

-- WorkflowTag policies
DROP POLICY IF EXISTS "Anyone can view published workflow tags" ON "WorkflowTag";
DROP POLICY IF EXISTS "Sellers can manage own workflow tags" ON "WorkflowTag";
DROP POLICY IF EXISTS "Admins can manage all workflow tags" ON "WorkflowTag";

-- Favorite policies
DROP POLICY IF EXISTS "Users can manage own favorites" ON "Favorite";

-- Cart policies
DROP POLICY IF EXISTS "Users can manage own cart" ON "Cart";

-- CartItem policies
DROP POLICY IF EXISTS "Users can manage own cart items" ON "CartItem";

-- Order policies
DROP POLICY IF EXISTS "Users can view own orders" ON "Order";
DROP POLICY IF EXISTS "Users can create own orders" ON "Order";
DROP POLICY IF EXISTS "Admins can view all orders" ON "Order";

-- OrderItem policies
DROP POLICY IF EXISTS "Users can view own order items" ON "OrderItem";
DROP POLICY IF EXISTS "Users can create own order items" ON "OrderItem";

-- Payment policies
DROP POLICY IF EXISTS "Users can view own payments" ON "Payment";
DROP POLICY IF EXISTS "Admins can view all payments" ON "Payment";

-- Review policies
DROP POLICY IF EXISTS "Users can manage own reviews" ON "Review";
DROP POLICY IF EXISTS "Anyone can view published reviews" ON "Review";
DROP POLICY IF EXISTS "Admins can manage all reviews" ON "Review";

-- ReviewHelpfulVote policies
DROP POLICY IF EXISTS "Users can manage own helpful votes" ON "ReviewHelpfulVote";

-- Payout policies
DROP POLICY IF EXISTS "Sellers can view own payouts" ON "Payout";
DROP POLICY IF EXISTS "Admins can view all payouts" ON "Payout";

-- Report policies
DROP POLICY IF EXISTS "Users can create reports" ON "Report";
DROP POLICY IF EXISTS "Users can view own reports" ON "Report";
DROP POLICY IF EXISTS "Admins can manage all reports" ON "Report";

-- AuditLog policies
DROP POLICY IF EXISTS "Users can view own audit logs" ON "AuditLog";
DROP POLICY IF EXISTS "Admins can view all audit logs" ON "AuditLog";

-- WorkflowCompatibility policies
DROP POLICY IF EXISTS "Anyone can view published workflow compatibility" ON "WorkflowCompatibility";
DROP POLICY IF EXISTS "Sellers can manage own workflow compatibility" ON "WorkflowCompatibility";

-- WorkflowPack policies
DROP POLICY IF EXISTS "Sellers can manage own workflow packs" ON "WorkflowPack";
DROP POLICY IF EXISTS "Anyone can view published workflow packs" ON "WorkflowPack";
DROP POLICY IF EXISTS "Admins can manage all workflow packs" ON "WorkflowPack";

-- Notification policies
DROP POLICY IF EXISTS "Users can view own notifications" ON "Notification";
DROP POLICY IF EXISTS "Users can update own notifications" ON "Notification";
DROP POLICY IF EXISTS "Users can delete own notifications" ON "Notification";
DROP POLICY IF EXISTS "Service role can insert notifications" ON "Notification";

-- StoreFollow policies
DROP POLICY IF EXISTS "Anyone can view store follows" ON "StoreFollow";
DROP POLICY IF EXISTS "Users can follow stores" ON "StoreFollow";
DROP POLICY IF EXISTS "Users can unfollow stores" ON "StoreFollow";

-- Storage policies
DROP POLICY IF EXISTS "Public avatar access 1oj01fe_0" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload avatars 1oj01fe_0" ON storage.objects;
DROP POLICY IF EXISTS "Users can update avatars 1oj01fe_0" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete avatars 1oj01fe_0" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view documents flreew_0" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own documents flreew_0" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents flreew_0" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents flreew_0" ON storage.objects;
DROP POLICY IF EXISTS "Public can view hero images 1vxel63_0" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload hero images 1vxel63_0" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own hero images   1vxel63_0" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own hero images 1vxel63_0" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for store assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own store assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own store assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own store assets" ON storage.objects;

-- =====================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =====================================================

-- Enable Row Level Security on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SellerProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Workflow" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkflowVersion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkflowCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkflowTag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Favorite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReviewHelpfulVote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payout" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Report" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkflowCompatibility" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkflowPack" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Cart" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CartItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StoreFollow" ENABLE ROW LEVEL SECURITY;

-- ============================
-- User Policies
-- ============================

CREATE POLICY "Users can view own profile" ON "User"
    FOR SELECT USING ((auth.uid())::text = (id)::text);

CREATE POLICY "Users can update own profile" ON "User"
    FOR UPDATE USING ((auth.uid())::text = (id)::text);

CREATE POLICY "Users can insert own profile" ON "User"
    FOR INSERT WITH CHECK ((auth.uid())::text = (id)::text);

-- ============================
-- SellerProfile Policies
-- ============================

CREATE POLICY "Users can view own seller profile" ON "SellerProfile"
    FOR SELECT USING ((auth.uid())::text = ("userId")::text);

CREATE POLICY "Users can update own seller profile" ON "SellerProfile"
    FOR UPDATE USING ((auth.uid())::text = ("userId")::text);

CREATE POLICY "Users can insert own seller profile" ON "SellerProfile"
    FOR INSERT WITH CHECK ((auth.uid())::text = ("userId")::text);

CREATE POLICY "Anyone can view public seller profiles" ON "SellerProfile"
    FOR SELECT USING (status = 'active'::"SellerProfileStatus");

CREATE POLICY "Admins can view all seller profiles" ON "SellerProfile"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "User"
            WHERE (("User".id)::text = (auth.uid())::text) AND ("User"."isAdmin" = true)
        )
    );

-- ============================
-- Workflow Policies
-- ============================

CREATE POLICY "Sellers can manage own workflows" ON "Workflow"
    FOR ALL USING ((auth.uid())::text = ("sellerId")::text);

CREATE POLICY "Anyone can view published workflows" ON "Workflow"
    FOR SELECT TO anon, authenticated
    USING (status = 'published'::"WorkflowStatus");

CREATE POLICY "Admins can manage all workflows" ON "Workflow"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "User"
            WHERE (("User".id)::text = (auth.uid())::text) AND ("User"."isAdmin" = true)
        )
    );

-- ============================
-- WorkflowVersion Policies
-- ============================

CREATE POLICY "Sellers can manage own workflow versions" ON "WorkflowVersion"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Workflow" 
            WHERE ("Workflow".id = "WorkflowVersion"."workflowId") 
            AND (("Workflow"."sellerId")::text = (auth.uid())::text)
        )
    );

CREATE POLICY "Anyone can view published workflow versions" ON "WorkflowVersion"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Workflow" 
            WHERE ("Workflow".id = "WorkflowVersion"."workflowId") 
            AND ("Workflow".status = 'published'::"WorkflowStatus")
        )
    );

CREATE POLICY "Admins can manage all workflow versions" ON "WorkflowVersion"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "User"
            WHERE (("User".id)::text = (auth.uid())::text) AND ("User"."isAdmin" = true)
        )
    );

-- ============================
-- Category Policies
-- ============================

CREATE POLICY "Anyone can view categories" ON "Category"
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON "Category"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "User"
            WHERE (("User".id)::text = (auth.uid())::text) AND ("User"."isAdmin" = true)
        )
    );

-- ============================
-- WorkflowCategory Policies
-- ============================

CREATE POLICY "Anyone can view published workflow categories" ON "WorkflowCategory"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Workflow"
            WHERE ("Workflow".id = "WorkflowCategory"."workflowId") 
            AND ("Workflow".status = 'published'::"WorkflowStatus")
        )
    );

CREATE POLICY "Sellers can manage own workflow categories" ON "WorkflowCategory"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Workflow"
            WHERE ("Workflow".id = "WorkflowCategory"."workflowId") 
            AND (("Workflow"."sellerId")::text = (auth.uid())::text)
        )
    );

CREATE POLICY "Admins can manage all workflow categories" ON "WorkflowCategory"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "User"
            WHERE (("User".id)::text = (auth.uid())::text) AND ("User"."isAdmin" = true)
        )
    );

-- ============================
-- Tag Policies
-- ============================

CREATE POLICY "Anyone can view tags" ON "Tag"
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage tags" ON "Tag"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "User"
            WHERE (("User".id)::text = (auth.uid())::text) AND ("User"."isAdmin" = true)
        )
    );

-- ============================
-- WorkflowTag Policies
-- ============================

CREATE POLICY "Anyone can view published workflow tags" ON "WorkflowTag"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Workflow"
            WHERE ("Workflow".id = "WorkflowTag"."workflowId") 
            AND ("Workflow".status = 'published'::"WorkflowStatus")
        )
    );

CREATE POLICY "Sellers can manage own workflow tags" ON "WorkflowTag"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Workflow"
            WHERE ("Workflow".id = "WorkflowTag"."workflowId") 
            AND (("Workflow"."sellerId")::text = (auth.uid())::text)
        )
    );

CREATE POLICY "Admins can manage all workflow tags" ON "WorkflowTag"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "User"
            WHERE (("User".id)::text = (auth.uid())::text) AND ("User"."isAdmin" = true)
        )
    );

-- ============================
-- Favorite Policies
-- ============================

CREATE POLICY "Users can manage own favorites" ON "Favorite"
    FOR ALL USING ((auth.uid())::text = ("userId")::text);

-- ============================
-- Cart Policies
-- ============================

CREATE POLICY "Users can manage own cart" ON "Cart"
    FOR ALL USING ((auth.uid())::text = ("userId")::text);

-- ============================
-- CartItem Policies
-- ============================

CREATE POLICY "Users can manage own cart items" ON "CartItem"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Cart"
            WHERE ("Cart".id = "CartItem"."cartId") 
            AND (("Cart"."userId")::text = (auth.uid())::text)
        )
    );

-- ============================
-- Order Policies
-- ============================

CREATE POLICY "Users can view own orders" ON "Order"
    FOR SELECT USING ((auth.uid())::text = ("userId")::text);

CREATE POLICY "Users can create own orders" ON "Order"
    FOR INSERT WITH CHECK ((auth.uid())::text = ("userId")::text);

CREATE POLICY "Admins can view all orders" ON "Order"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "User"
            WHERE (("User".id)::text = (auth.uid())::text) AND ("User"."isAdmin" = true)
        )
    );

-- ============================
-- OrderItem Policies
-- ============================

CREATE POLICY "Users can view own order items" ON "OrderItem"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Order" 
            WHERE ("Order".id = "OrderItem"."orderId") 
            AND (("Order"."userId")::text = (auth.uid())::text)
        )
    );

CREATE POLICY "Users can create own order items" ON "OrderItem"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "Order" 
            WHERE ("Order".id = "OrderItem"."orderId") 
            AND (("Order"."userId")::text = (auth.uid())::text)
        )
    );

-- ============================
-- Payment Policies
-- ============================

CREATE POLICY "Users can view own payments" ON "Payment"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Order" 
            WHERE ("Order".id = "Payment"."orderId") 
            AND (("Order"."userId")::text = (auth.uid())::text)
        )
    );

CREATE POLICY "Admins can view all payments" ON "Payment"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "User"
            WHERE (("User".id)::text = (auth.uid())::text) AND ("User"."isAdmin" = true)
        )
    );

-- ============================
-- Review Policies
-- ============================

CREATE POLICY "Users can manage own reviews" ON "Review"
    FOR ALL USING ((auth.uid())::text = ("userId")::text);

CREATE POLICY "Anyone can view published reviews" ON "Review"
    FOR SELECT USING (status = 'published'::"ReviewStatus");

CREATE POLICY "Admins can manage all reviews" ON "Review"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "User"
            WHERE (("User".id)::text = (auth.uid())::text) AND ("User"."isAdmin" = true)
        )
    );

-- ============================
-- ReviewHelpfulVote Policies
-- ============================

CREATE POLICY "Users can manage own helpful votes" ON "ReviewHelpfulVote"
    FOR ALL USING ((auth.uid())::text = ("userId")::text);

-- ============================
-- Payout Policies
-- ============================

CREATE POLICY "Sellers can view own payouts" ON "Payout"
    FOR SELECT USING ((auth.uid())::text = ("sellerId")::text);

CREATE POLICY "Admins can view all payouts" ON "Payout"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "User"
            WHERE (("User".id)::text = (auth.uid())::text) AND ("User"."isAdmin" = true)
        )
    );

-- ============================
-- Report Policies
-- ============================

CREATE POLICY "Users can create reports" ON "Report"
    FOR INSERT WITH CHECK ((auth.uid())::text = ("reporterId")::text);

CREATE POLICY "Users can view own reports" ON "Report"
    FOR SELECT USING ((auth.uid())::text = ("reporterId")::text);

CREATE POLICY "Admins can manage all reports" ON "Report"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "User"
            WHERE (("User".id)::text = (auth.uid())::text) AND ("User"."isAdmin" = true)
        )
    );

-- ============================
-- AuditLog Policies
-- ============================

CREATE POLICY "Users can view own audit logs" ON "AuditLog"
    FOR SELECT USING ((auth.uid())::text = ("userId")::text);

CREATE POLICY "Admins can view all audit logs" ON "AuditLog"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "User"
            WHERE (("User".id)::text = (auth.uid())::text) AND ("User"."isAdmin" = true)
        )
    );

-- ============================
-- WorkflowCompatibility Policies
-- ============================

CREATE POLICY "Anyone can view published workflow compatibility" ON "WorkflowCompatibility"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Workflow" 
            WHERE ("Workflow".id = "WorkflowCompatibility"."workflowId") 
            AND ("Workflow".status = 'published'::"WorkflowStatus")
        )
    );

CREATE POLICY "Sellers can manage own workflow compatibility" ON "WorkflowCompatibility"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Workflow" 
            WHERE ("Workflow".id = "WorkflowCompatibility"."workflowId") 
            AND (("Workflow"."sellerId")::text = (auth.uid())::text)
        )
    );

-- ============================
-- WorkflowPack Policies
-- ============================

CREATE POLICY "Sellers can manage own workflow packs" ON "WorkflowPack"
    FOR ALL USING ((auth.uid())::text = ("sellerId")::text);

CREATE POLICY "Anyone can view published workflow packs" ON "WorkflowPack"
    FOR SELECT USING (status = 'published'::"WorkflowStatus");

CREATE POLICY "Admins can manage all workflow packs" ON "WorkflowPack"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "User"
            WHERE (("User".id)::text = (auth.uid())::text) AND ("User"."isAdmin" = true)
        )
    );

-- ============================
-- Notification Policies
-- ============================

CREATE POLICY "Users can view own notifications" ON "Notification"
    FOR SELECT USING ((auth.uid())::text = ("userId")::text);

CREATE POLICY "Users can update own notifications" ON "Notification"
    FOR UPDATE USING ((auth.uid())::text = ("userId")::text);

CREATE POLICY "Users can delete own notifications" ON "Notification"
    FOR DELETE USING ((auth.uid())::text = ("userId")::text);

CREATE POLICY "Service role can insert notifications" ON "Notification"
    FOR INSERT WITH CHECK (
        ((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text
        OR EXISTS (
            SELECT 1 FROM "User" 
            WHERE ("User".id = auth.uid()) AND ("User"."isAdmin" = true)
        )
    );

-- Enable Realtime for Notification table
ALTER PUBLICATION supabase_realtime ADD TABLE "Notification";

-- ============================
-- StoreFollow Policies
-- ============================

CREATE POLICY "Anyone can view store follows" ON "StoreFollow"
    FOR SELECT USING (true);

CREATE POLICY "Users can follow stores" ON "StoreFollow"
    FOR INSERT WITH CHECK ((auth.uid())::text = ("followerId")::text);

CREATE POLICY "Users can unfollow stores" ON "StoreFollow"
    FOR DELETE USING ((auth.uid())::text = ("followerId")::text);

-- =====================================================
-- Storage Policies
-- =====================================================

-- Avatars bucket
CREATE POLICY "Public avatar access 1oj01fe_0" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'avatars'::text);

CREATE POLICY "Users can upload avatars 1oj01fe_0" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'avatars'::text);

CREATE POLICY "Users can update avatars 1oj01fe_0" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'avatars'::text);

CREATE POLICY "Users can delete avatars 1oj01fe_0" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'avatars'::text);

-- Documents bucket
CREATE POLICY "Anyone can view documents flreew_0" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'documents'::text);

CREATE POLICY "Users can upload their own documents flreew_0" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'documents'::text);

CREATE POLICY "Users can update their own documents flreew_0" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'documents'::text);

CREATE POLICY "Users can delete their own documents flreew_0" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'documents'::text);

-- Hero images bucket
CREATE POLICY "Public can view hero images 1vxel63_0" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'hero-images'::text);

CREATE POLICY "Users can upload hero images 1vxel63_0" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'hero-images'::text);

CREATE POLICY "Users can update their own hero images   1vxel63_0" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'hero-images'::text);

CREATE POLICY "Users can delete their own hero images 1vxel63_0" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'hero-images'::text);

-- Store assets bucket
CREATE POLICY "Public read access for store assets" ON storage.objects
    FOR SELECT USING (bucket_id = 'store-assets'::text);

CREATE POLICY "Users can upload their own store assets" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'store-assets'::text);

CREATE POLICY "Users can update their own store assets" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'store-assets'::text);

CREATE POLICY "Users can delete their own store assets" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'store-assets'::text);
