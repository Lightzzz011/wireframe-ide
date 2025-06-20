# Wireframe IDE Setup Instructions

## Quick Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project" 
3. Fill in project details and wait for setup to complete
4. Note your **Project URL** and **API Keys** from the project settings

### 2. Configure Environment Variables

Update `.env.local` with your actual Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-service-role-key
```

### 3. Create Database Tables

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click **Run** to create the tables

### 4. Start the Application

```bash
npm run dev
```

Visit `http://localhost:3000` and try creating a workspace.

## Troubleshooting

### "Failed to create workspace" Error

1. **Check Browser Console** - Open Developer Tools → Console tab for detailed error messages
2. **Verify Environment Variables** - Make sure `.env.local` has correct Supabase URL and keys
3. **Confirm Database Setup** - Ensure all tables were created successfully in Supabase
4. **Check Network** - Verify you can access your Supabase project URL

### Common Issues

- **Invalid URL**: Make sure SUPABASE_URL ends with `.supabase.co`
- **Wrong Keys**: Anon key should start with `eyJhbGciOiJIUzI1NiI...`
- **Missing Tables**: Re-run the SQL schema in Supabase SQL Editor
- **CORS Issues**: Check Supabase project settings allow your localhost

### Getting Your Supabase Credentials

1. In your Supabase project dashboard
2. Go to **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`