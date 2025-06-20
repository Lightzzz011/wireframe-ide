-- First, let's check if the user is properly authenticated by updating the policies
-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can view their own workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can update their own workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can delete their own workspaces" ON workspaces;
DROP POLICY IF EXISTS "Public can view shared workspaces" ON workspaces;

-- Create more permissive policies for debugging
CREATE POLICY "Users can create workspaces" ON workspaces
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can view their own workspaces" ON workspaces
  FOR SELECT 
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can update their own workspaces" ON workspaces
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workspaces" ON workspaces
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Let's also check if we can temporarily disable RLS for testing
-- (Don't do this in production!)
-- ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;