'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { FileType, WorkspaceType, FileService } from '@/lib/file-service'
import FileExplorer from './FileExplorer'
import SimpleCodeEditor from './SimpleCodeEditor'
import OutputPanel from './OutputPanel'
import { Play, Share2, Save, FolderOpen } from 'lucide-react'

interface IDELayoutProps {
  workspace: WorkspaceType
  readOnly?: boolean
}

interface ExecutionResult {
  stdout: string
  stderr: string
  exitCode: number
  executionTime: number
}

const IDELayout: React.FC<IDELayoutProps> = ({ workspace, readOnly = false }) => {
  const [files, setFiles] = useState<FileType[]>([])
  const [activeFile, setActiveFile] = useState<FileType | null>(null)
  const [code, setCode] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const loadFiles = useCallback(async () => {
    try {
      const workspaceFiles = await FileService.getWorkspaceFiles(workspace.id)
      setFiles(workspaceFiles)
      
      if (workspaceFiles.length > 0 && !activeFile) {
        const mainFile = workspaceFiles.find(f => f.is_main) || workspaceFiles[0]
        setActiveFile(mainFile)
        setCode(mainFile.content)
      }
    } catch (error) {
      console.error('Failed to load files:', error)
    }
  }, [workspace.id, activeFile])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  const handleFileSelect = (file: FileType) => {
    if (activeFile && hasUnsavedChanges && !readOnly) {
      if (confirm('You have unsaved changes. Do you want to discard them?')) {
        setActiveFile(file)
        setCode(file.content)
        setHasUnsavedChanges(false)
      }
    } else {
      setActiveFile(file)
      setCode(file.content)
      setHasUnsavedChanges(false)
    }
  }

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '')
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    if (!activeFile || readOnly) return
    
    setIsSaving(true)
    try {
      await FileService.updateFile(activeFile.id, { content: code })
      setHasUnsavedChanges(false)
      
      // Update the file in our local state
      setFiles(prev => prev.map(f => 
        f.id === activeFile.id ? { ...f, content: code } : f
      ))
    } catch (error) {
      console.error('Failed to save file:', error)
      alert('Failed to save file')
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileCreate = async (name: string, language: string) => {
    try {
      const newFile = await FileService.createFile(
        workspace.id,
        name,
        name, // Using name as path for simplicity
        '',
        language,
        files.length === 0 // First file becomes main file
      )
      setFiles(prev => [...prev, newFile])
      setActiveFile(newFile)
      setCode('')
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to create file:', error)
      alert('Failed to create file')
    }
  }

  const handleFileDelete = async (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      try {
        await FileService.deleteFile(fileId)
        setFiles(prev => prev.filter(f => f.id !== fileId))
        
        if (activeFile?.id === fileId) {
          const remainingFiles = files.filter(f => f.id !== fileId)
          if (remainingFiles.length > 0) {
            setActiveFile(remainingFiles[0])
            setCode(remainingFiles[0].content)
          } else {
            setActiveFile(null)
            setCode('')
          }
          setHasUnsavedChanges(false)
        }
      } catch (error) {
        console.error('Failed to delete file:', error)
        alert('Failed to delete file')
      }
    }
  }

  const handleFileRename = async (fileId: string, newName: string) => {
    try {
      const updatedFile = await FileService.updateFile(fileId, { 
        name: newName,
        path: newName 
      })
      setFiles(prev => prev.map(f => f.id === fileId ? updatedFile : f))
      if (activeFile?.id === fileId) {
        setActiveFile(updatedFile)
      }
    } catch (error) {
      console.error('Failed to rename file:', error)
      alert('Failed to rename file')
    }
  }

  const handleSetMainFile = async (fileId: string) => {
    try {
      await FileService.setMainFile(workspace.id, fileId)
      setFiles(prev => prev.map(f => ({ ...f, is_main: f.id === fileId })))
    } catch (error) {
      console.error('Failed to set main file:', error)
      alert('Failed to set main file')
    }
  }

  const handleRun = async () => {
    if (!activeFile) return

    setIsExecuting(true)
    setExecutionResult(null)

    try {
      // Save current changes before running
      if (hasUnsavedChanges && !readOnly) {
        await handleSave()
      }

      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language: activeFile.language,
          workspaceId: workspace.id,
          fileId: activeFile.id,
        }),
      })

      const result = await response.json()
      setExecutionResult(result)
    } catch (error) {
      console.error('Execution failed:', error)
      setExecutionResult({
        stdout: '',
        stderr: 'Failed to execute code: ' + (error as Error).message,
        exitCode: 1,
        executionTime: 0
      })
    } finally {
      setIsExecuting(false)
    }
  }

  const handleShare = async () => {
    if (workspace.share_token) {
      const shareUrl = `${window.location.origin}/share/${workspace.share_token}`
      await navigator.clipboard.writeText(shareUrl)
      alert('Share URL copied to clipboard!')
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-5 h-5 text-gray-600" />
            <h1 className="text-lg font-semibold text-gray-800">{workspace.name}</h1>
            {workspace.description && (
              <span className="text-sm text-gray-500">- {workspace.description}</span>
            )}
            {readOnly && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                Read Only
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!readOnly && (
              <>
                <button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || isSaving}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save*' : 'Saved'}
                </button>
                
                <button
                  onClick={handleRun}
                  disabled={!activeFile || isExecuting}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4" />
                  {isExecuting ? 'Running...' : 'Run'}
                </button>
              </>
            )}
            
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* File Explorer */}
        <div className="w-64 border-r border-gray-200">
          <FileExplorer
            files={files}
            activeFileId={activeFile?.id || null}
            onFileSelect={handleFileSelect}
            onFileCreate={handleFileCreate}
            onFileDelete={handleFileDelete}
            onFileRename={handleFileRename}
            onSetMainFile={handleSetMainFile}
            readOnly={readOnly}
          />
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          {activeFile ? (
            <div className="flex-1">
              <SimpleCodeEditor
                value={code}
                onChange={handleCodeChange}
                language={activeFile.language}
                readOnly={readOnly}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-800 text-gray-400">
              <div className="text-center">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No file selected</p>
                <p className="text-sm">
                  {files.length === 0 
                    ? readOnly 
                      ? 'This workspace has no files.'
                      : 'Create a new file to get started.'
                    : 'Select a file from the explorer to start editing.'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Output Panel */}
          <div className="h-64 border-t border-gray-200">
            <OutputPanel
              isExecuting={isExecuting}
              result={executionResult}
              onClear={() => setExecutionResult(null)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default IDELayout