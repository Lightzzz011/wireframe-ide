'use client'

import React, { useState } from 'react'
import { FileType } from '@/lib/file-service' 
import { 
  FileText, 
  Plus, 
  Trash2, 
  Play,
  Edit2,
  Check,
  X
} from 'lucide-react'

interface FileExplorerProps {
  files: FileType[]
  activeFileId: string | null
  onFileSelect: (file: FileType) => void
  onFileCreate: (name: string, language: string) => void
  onFileDelete: (fileId: string) => void
  onFileRename: (fileId: string, newName: string) => void
  onSetMainFile: (fileId: string) => void
  readOnly?: boolean
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFileId,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename,
  onSetMainFile,
  readOnly = false
}) => {
  const [isCreating, setIsCreating] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [editingFileId, setEditingFileId] = useState<string | null>(null)
  const [editingFileName, setEditingFileName] = useState('')

  const getFileIcon = () => {
    return <FileText className="w-4 h-4" />
  }

  const getLanguageFromFileName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'js':
        return 'javascript'
      case 'ts':
        return 'typescript'
      case 'py':
        return 'python'
      case 'jsx':
        return 'javascript'
      case 'tsx':
        return 'typescript'
      default:
        return 'javascript'
    }
  }

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      const language = getLanguageFromFileName(newFileName)
      onFileCreate(newFileName.trim(), language)
      setNewFileName('')
      setIsCreating(false)
    }
  }

  const handleStartRename = (file: FileType) => {
    setEditingFileId(file.id)
    setEditingFileName(file.name)
  }

  const handleRename = () => {
    if (editingFileId && editingFileName.trim()) {
      onFileRename(editingFileId, editingFileName.trim())
    }
    setEditingFileId(null)
    setEditingFileName('')
  }

  const handleCancelRename = () => {
    setEditingFileId(null)
    setEditingFileName('')
  }

  return (
    <div className="bg-gray-900 text-white p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-300">FILES</h3>
        {!readOnly && (
          <button
            onClick={() => setIsCreating(true)}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="New File"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {isCreating && (
        <div className="mb-2 p-2 bg-gray-800 rounded">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="filename.js"
            className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm mb-2"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateFile}
              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false)
                setNewFileName('')
              }}
              className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {files.map((file) => (
          <div
            key={file.id}
            className={`flex items-center group ${
              activeFileId === file.id
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-800 text-gray-300'
            } p-2 rounded cursor-pointer transition-colors`}
          >
            {editingFileId === file.id ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={editingFileName}
                  onChange={(e) => setEditingFileName(e.target.value)}
                  className="flex-1 bg-gray-700 text-white px-2 py-1 rounded text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename()
                    if (e.key === 'Escape') handleCancelRename()
                  }}
                />
                <button
                  onClick={handleRename}
                  className="p-1 hover:bg-gray-600 rounded"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={handleCancelRename}
                  className="p-1 hover:bg-gray-600 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <>
                <div
                  className="flex items-center gap-2 flex-1"
                  onClick={() => onFileSelect(file)}
                >
                  {getFileIcon()}
                  <span className="text-sm truncate">{file.name}</span>
                  {file.is_main && (
                    <div title="Main file">
                      <Play className="w-3 h-3 text-green-400 flex-shrink-0" />
                    </div>
                  )}
                </div>
                {!readOnly && (
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button
                      onClick={() => onSetMainFile(file.id)}
                      className="p-1 hover:bg-gray-600 rounded"
                      title="Set as main file"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleStartRename(file)}
                      className="p-1 hover:bg-gray-600 rounded"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onFileDelete(file.id)}
                      className="p-1 hover:bg-gray-600 rounded text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {files.length === 0 && !isCreating && (
        <div className="text-gray-500 text-sm text-center py-8">
          No files yet. {!readOnly && 'Click + to create a new file.'}
        </div>
      )}
    </div>
  )
}

export default FileExplorer
