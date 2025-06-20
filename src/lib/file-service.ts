import { createClient } from './supabase-auth'
import { v4 as uuidv4 } from 'uuid'

export interface FileType {
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

export interface WorkspaceType {
  id: string
  user_id: string
  name: string
  description: string | null
  is_public: boolean
  share_token: string | null
  created_at: string
  updated_at: string
}

export class FileService {
  static async createWorkspace(name: string, description?: string, userId?: string): Promise<WorkspaceType> {
    try {
      const supabase = createClient()
      console.log('Creating workspace with:', { name, description, userId })
      
      // Get current user if userId not provided
      if (!userId) {
        console.log('Getting current user...')
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        console.log('Current user:', user, 'Error:', userError)
        
        if (!user) {
          throw new Error('User must be authenticated to create workspace. Please sign in again.')
        }
        userId = user.id
      }

      console.log('Creating workspace for user:', userId)
      
      const workspaceData = {
        user_id: userId,
        name,
        description: description || null,
        is_public: false,
        share_token: uuidv4()
      }
      
      console.log('Workspace data to insert:', workspaceData)

      const { data, error } = await supabase
        .from('workspaces')
        .insert([workspaceData])
        .select()
        .single()

      console.log('Supabase response:', { data, error })

      if (error) {
        console.error('Supabase error details:', error)
        throw new Error(`Database error: ${error.message}${error.details ? ` (${error.details})` : ''}${error.hint ? ` Hint: ${error.hint}` : ''}`)
      }

      if (!data) {
        throw new Error('No data returned from workspace creation')
      }

      console.log('Workspace created successfully:', data)
      return data
    } catch (error) {
      console.error('Full error in createWorkspace:', error)
      throw error
    }
  }

  static async getWorkspace(id: string): Promise<WorkspaceType | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return null
    }

    return data
  }

  static async getWorkspaceByShareToken(token: string): Promise<WorkspaceType | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('share_token', token)
      .single()

    if (error) {
      return null
    }

    return data
  }

  static async createFile(
    workspaceId: string,
    name: string,
    path: string,
    content: string = '',
    language: string = 'javascript',
    isMain: boolean = false
  ): Promise<FileType> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('files')
      .insert([
        {
          workspace_id: workspaceId,
          name,
          path,
          content,
          language,
          is_main: isMain
        }
      ])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create file: ${error.message}`)
    }

    return data
  }

  static async updateFile(
    fileId: string,
    updates: Partial<Pick<FileType, 'name' | 'path' | 'content' | 'language' | 'is_main'>>
  ): Promise<FileType> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('files')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update file: ${error.message}`)
    }

    return data
  }

  static async deleteFile(fileId: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId)

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`)
    }
  }

  static async getWorkspaceFiles(workspaceId: string): Promise<FileType[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to get files: ${error.message}`)
    }

    return data || []
  }

  static async getFile(fileId: string): Promise<FileType | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single()

    if (error) {
      return null
    }

    return data
  }

  static async setMainFile(workspaceId: string, fileId: string): Promise<void> {
    const supabase = createClient()
    // First, unset all files as main
    await supabase
      .from('files')
      .update({ is_main: false })
      .eq('workspace_id', workspaceId)

    // Then set the specified file as main
    const { error } = await supabase
      .from('files')
      .update({ is_main: true })
      .eq('id', fileId)

    if (error) {
      throw new Error(`Failed to set main file: ${error.message}`)
    }
  }

  static async getMainFile(workspaceId: string): Promise<FileType | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('is_main', true)
      .single()

    if (error) {
      return null
    }

    return data
  }
}