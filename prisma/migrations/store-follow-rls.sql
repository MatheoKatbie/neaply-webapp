-- ============================================
-- StoreFollow Table - RLS Policies
-- ============================================
-- Run this script in Supabase SQL Editor after
-- running the Prisma migration for StoreFollow
-- ============================================

-- 1. Enable RLS on StoreFollow table
ALTER TABLE "StoreFollow" ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Anyone can view store follows" ON "StoreFollow";
DROP POLICY IF EXISTS "Users can follow stores" ON "StoreFollow";
DROP POLICY IF EXISTS "Users can unfollow stores" ON "StoreFollow";

-- 3. Create SELECT policy - Anyone can view follows (for follower counts)
CREATE POLICY "Anyone can view store follows" ON "StoreFollow"
    FOR SELECT 
    USING (true);

-- 4. Create INSERT policy - Users can only create their own follows
CREATE POLICY "Users can follow stores" ON "StoreFollow"
    FOR INSERT 
    WITH CHECK (auth.uid()::text = "followerId"::text);

-- 5. Create DELETE policy - Users can only delete their own follows
CREATE POLICY "Users can unfollow stores" ON "StoreFollow"
    FOR DELETE 
    USING (auth.uid()::text = "followerId"::text);

-- ============================================
-- Verification Queries
-- ============================================

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'StoreFollow';

-- Check policies exist
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'StoreFollow';
