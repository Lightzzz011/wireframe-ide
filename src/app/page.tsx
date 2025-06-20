'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileService } from '@/lib/file-service'
import { Plus, Code, FolderOpen, LogOut } from 'lucide-react'
import AuthWrapper from '@/components/AuthWrapper'
import { createClient } from '@/lib/supabase-auth'
import { User } from '@supabase/supabase-js'

function HomePage({ user }: { user: User }) {
  const [isCreating, setIsCreating] = useState(false)
  const [workspaceName, setWorkspaceName] = useState('')
  const [workspaceDescription, setWorkspaceDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) return

    setIsLoading(true)
    try {
      const workspace = await FileService.createWorkspace(
        workspaceName.trim(),
        workspaceDescription.trim() || undefined,
        user.id
      )
      
      // Create a default JavaScript file
      await FileService.createFile(
        workspace.id,
        'main.js',
        'main.js',
        '// Welcome to your new IDE!\nconsole.log("Hello, World!");\n\n// Try editing this code and click Run to see the output',
        'javascript',
        true
      )

      router.push(`/workspace/${workspace.id}`)
    } catch (error) {
      console.error('Failed to create workspace:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to create workspace: ${errorMessage}\n\nPlease check:\n1. Supabase is configured correctly in .env.local\n2. Database tables are created\n3. Browser console for more details`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center flex-1">
              <Code className="w-12 h-12 text-blue-600" />
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Wireframe IDE</h1>
          <p className="text-gray-600">Welcome, {user.email}</p>
        </div>

        {!isCreating ? (
          <div className="space-y-4">
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create New Workspace
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">Or try a demo workspace</p>
              <button
                onClick={() => router.push('/demo')}
                className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <FolderOpen className="w-4 h-4" />
                View Demo
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Workspace Name
              </label>
              <input
                type="text"
                id="name"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="My Awesome Project"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={workspaceDescription}
                onChange={(e) => setWorkspaceDescription(e.target.value)}
                placeholder="A brief description of your project..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateWorkspace}
                disabled={!workspaceName.trim() || isLoading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Creating...' : 'Create Workspace'}
              </button>
              <button
                onClick={() => {
                  setIsCreating(false)
                  setWorkspaceName('')
                  setWorkspaceDescription('')
                }}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Code className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-xs text-gray-600">Code Editor</p>
            </div>
            <div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Plus className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs text-gray-600">Live Execution</p>
            </div>
            <div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FolderOpen className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-xs text-gray-600">File Management</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <AuthWrapper>
      {(user) => <HomePage user={user} />}
    </AuthWrapper>
  )
}
