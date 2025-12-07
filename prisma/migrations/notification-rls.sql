-- ============================================
-- Notification Table - RLS Policies
-- ============================================
-- Run this script in Supabase SQL Editor to set up
-- Row Level Security and Realtime for notifications
-- ============================================

-- 1. Enable RLS on Notification table
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Users can view own notifications" ON "Notification";
DROP POLICY IF EXISTS "Users can update own notifications" ON "Notification";
DROP POLICY IF EXISTS "Users can delete own notifications" ON "Notification";
DROP POLICY IF EXISTS "Service role can insert notifications" ON "Notification";

-- 3. Create SELECT policy - Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON "Notification"
    FOR SELECT 
    USING (auth.uid()::text = "userId"::text);

-- 4. Create UPDATE policy - Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications" ON "Notification"
    FOR UPDATE 
    USING (auth.uid()::text = "userId"::text)
    WITH CHECK (auth.uid()::text = "userId"::text);

-- 5. Create DELETE policy - Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON "Notification"
    FOR DELETE 
    USING (auth.uid()::text = "userId"::text);

-- 6. Create INSERT policy - Only service role or admins can create notifications
-- Note: Your API routes should use the service_role key to create notifications
CREATE POLICY "Service role can insert notifications" ON "Notification"
    FOR INSERT 
    WITH CHECK (
        -- Check if using service role (from API routes with SUPABASE_SERVICE_ROLE_KEY)
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
        OR 
        -- Or if current user is an admin
        EXISTS (
            SELECT 1 FROM "User" 
            WHERE "User".id = auth.uid() 
            AND "User"."isAdmin" = true
        )
    );

-- ============================================
-- Enable Supabase Realtime
-- ============================================

-- 7. Add table to realtime publication for live updates
-- This allows the useNotifications hook to receive real-time updates
DO $$
BEGIN
    -- Check if table is already in publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'Notification'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE "Notification";
        RAISE NOTICE 'Added Notification table to supabase_realtime publication';
    ELSE
        RAISE NOTICE 'Notification table already in supabase_realtime publication';
    END IF;
END $$;

-- ============================================
-- Verification Queries
-- ============================================

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'Notification';

-- Check policies exist
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'Notification';

-- Check realtime publication
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'Notification';
