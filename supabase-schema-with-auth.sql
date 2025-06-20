-- Create workspaces table
CREATE TABLE workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  share_token VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create files table
CREATE TABLE files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  path VARCHAR(500) NOT NULL,
  content TEXT DEFAULT '',
  language VARCHAR(50) DEFAULT 'javascript',
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(workspace_id, path)
);

-- Create execution_results table
CREATE TABLE execution_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  stdout TEXT,
  stderr TEXT,
  exit_code INTEGER,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_workspaces_user_id ON workspaces(user_id);
CREATE INDEX idx_files_workspace_id ON files(workspace_id);
CREATE INDEX idx_execution_results_workspace_id ON execution_results(workspace_id);
CREATE INDEX idx_workspaces_share_token ON workspaces(share_token);

-- Enable Row Level Security
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspaces
CREATE POLICY "Users can view their own workspaces" ON workspaces
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workspaces" ON workspaces
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workspaces" ON workspaces
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workspaces" ON workspaces
  FOR DELETE USING (auth.uid() = user_id);

-- Allow public read access to shared workspaces
CREATE POLICY "Public can view shared workspaces" ON workspaces
  FOR SELECT USING (is_public = true);

-- RLS Policies for files
CREATE POLICY "Users can view files in their workspaces" ON files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspaces 
      WHERE workspaces.id = files.workspace_id 
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create files in their workspaces" ON files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces 
      WHERE workspaces.id = files.workspace_id 
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update files in their workspaces" ON files
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workspaces 
      WHERE workspaces.id = files.workspace_id 
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete files in their workspaces" ON files
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workspaces 
      WHERE workspaces.id = files.workspace_id 
      AND workspaces.user_id = auth.uid()
    )
  );

-- Allow public read access to files in shared workspaces
CREATE POLICY "Public can view files in shared workspaces" ON files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspaces 
      WHERE workspaces.id = files.workspace_id 
      AND workspaces.is_public = true
    )
  );

-- RLS Policies for execution_results
CREATE POLICY "Users can view execution results for their workspaces" ON execution_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspaces 
      WHERE workspaces.id = execution_results.workspace_id 
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create execution results for their workspaces" ON execution_results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces 
      WHERE workspaces.id = execution_results.workspace_id 
      AND workspaces.user_id = auth.uid()
    )
  );

-- Allow public read access to execution results in shared workspaces
CREATE POLICY "Public can view execution results in shared workspaces" ON execution_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspaces 
      WHERE workspaces.id = execution_results.workspace_id 
      AND workspaces.is_public = true
    )
  );