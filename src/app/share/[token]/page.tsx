'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { FileService, WorkspaceType } from '@/lib/file-service'
import IDELayout from '@/components/IDELayout'

export default function SharePage() {
  const params = useParams()
  const token = params.token as string
  const [workspace, setWorkspace] = useState<WorkspaceType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        console.log('Loading shared workspace:', token)
        const ws = await FileService.getWorkspaceByShareToken(token)
        console.log('Loaded shared workspace:', ws)
        
        if (!ws) {
          setError('Shared workspace not found')
        } else {
          setWorkspace(ws)
        }
      } catch (err) {
        console.error('Failed to load shared workspace:', err)
        setError('Failed to load shared workspace')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      loadWorkspace()
    }
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared workspace...</p>
        </div>
      </div>
    )
  }

  if (error || !workspace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Shared Workspace Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The requested shared workspace could not be found.'}</p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    )
  }

  return <IDELayout workspace={workspace} readOnly={true} />
}