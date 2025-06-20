import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Validate environment variables
if (!supabaseUrl || supabaseUrl === 'https://example.supabase.co') {
  console.error('Missing or invalid NEXT_PUBLIC_SUPABASE_URL in .env.local')
}

if (!supabaseAnonKey || supabaseAnonKey.includes('example')) {
  console.error('Missing or invalid NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string
          name: string
          description: string | null
          is_public: boolean
          share_token: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_public?: boolean
          share_token?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_public?: boolean
          share_token?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      files: {
        Row: {
          id: string
          workspace_id: string
          name: string
          path: string
          content: string
          language: string
          is_main: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          path: string
          content?: string
          language?: string
          is_main?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          path?: string
          content?: string
          language?: string
          is_main?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      execution_results: {
        Row: {
          id: string
          workspace_id: string
          file_id: string
          stdout: string | null
          stderr: string | null
          exit_code: number | null
          execution_time_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          file_id: string
          stdout?: string | null
          stderr?: string | null
          exit_code?: number | null
          execution_time_ms?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          file_id?: string
          stdout?: string | null
          stderr?: string | null
          exit_code?: number | null
          execution_time_ms?: number | null
          created_at?: string
        }
      }
    }
  }
}