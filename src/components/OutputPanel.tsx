'use client'

import React, { useEffect, useRef } from 'react'
import { Terminal, Loader2, CheckCircle, XCircle } from 'lucide-react'

interface ExecutionResult {
  stdout: string
  stderr: string
  exitCode: number
  executionTime: number
}

interface OutputPanelProps {
  isExecuting: boolean
  result: ExecutionResult | null
  onClear?: () => void
}

const OutputPanel: React.FC<OutputPanelProps> = ({
  isExecuting,
  result,
  onClear
}) => {
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [result])

  const getStatusIcon = () => {
    if (isExecuting) {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
    }
    if (result) {
      return result.exitCode === 0 
        ? <CheckCircle className="w-4 h-4 text-green-400" />
        : <XCircle className="w-4 h-4 text-red-400" />
    }
    return <Terminal className="w-4 h-4 text-gray-400" />
  }

  const getStatusText = () => {
    if (isExecuting) return 'Executing...'
    if (result) {
      return `Completed in ${result.executionTime}ms (exit code: ${result.exitCode})`
    }
    return 'Ready'
  }

  return (
    <div className="bg-gray-900 text-white h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">OUTPUT</span>
          <span className="text-xs text-gray-400">{getStatusText()}</span>
        </div>
        {onClear && result && (
          <button
            onClick={onClear}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div 
        ref={outputRef}
        className="flex-1 p-3 overflow-y-auto font-mono text-sm"
      >
        {isExecuting && (
          <div className="flex items-center gap-2 text-blue-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Running code...</span>
          </div>
        )}

        {result && (
          <div className="space-y-2">
            {result.stdout && (
              <div>
                <div className="text-green-400 text-xs mb-1">STDOUT:</div>
                <pre className="whitespace-pre-wrap text-gray-200 bg-gray-800 p-2 rounded">
                  {result.stdout}
                </pre>
              </div>
            )}

            {result.stderr && (
              <div>
                <div className="text-red-400 text-xs mb-1">STDERR:</div>
                <pre className="whitespace-pre-wrap text-red-300 bg-red-900/20 p-2 rounded border border-red-800">
                  {result.stderr}
                </pre>
              </div>
            )}

            {!result.stdout && !result.stderr && (
              <div className="text-gray-500 italic">
                No output produced
              </div>
            )}

            <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
              Execution completed in {result.executionTime}ms with exit code {result.exitCode}
            </div>
          </div>
        )}

        {!isExecuting && !result && (
          <div className="text-gray-500 italic">
            Click &quot;Run&quot; to execute your code and see the output here.
          </div>
        )}
      </div>
    </div>
  )
}

export default OutputPanel