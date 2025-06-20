import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, unlink, mkdtemp } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { supabase } from '@/lib/supabase'

const execAsync = promisify(exec)

interface ExecuteRequest {
  code: string
  language: string
  workspaceId: string
  fileId: string
}

interface ExecuteResponse {
  stdout: string
  stderr: string
  exitCode: number
  executionTime: number
}

const SUPPORTED_LANGUAGES = {
  javascript: {
    extension: '.js',
    command: 'node',
    timeout: 10000
  },
  python: {
    extension: '.py',
    command: 'python3',
    timeout: 10000
  },
  typescript: {
    extension: '.ts',
    command: 'npx ts-node',
    timeout: 10000
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { code, language, workspaceId, fileId }: ExecuteRequest = await request.json()

    if (!code || !language || !workspaceId || !fileId) {
      return NextResponse.json(
        { error: 'Missing required fields: code, language, workspaceId, fileId' },
        { status: 400 }
      )
    }

    if (!SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES]) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}. Supported languages: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}` },
        { status: 400 }
      )
    }

    const langConfig = SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES]
    const startTime = Date.now()

    // Create temporary directory and file
    const tempDir = await mkdtemp(join(tmpdir(), 'ide-execution-'))
    const tempFilePath = join(tempDir, `script${langConfig.extension}`)

    try {
      // Write code to temporary file
      await writeFile(tempFilePath, code, 'utf8')

      // Execute the code with timeout
      const { stdout, stderr } = await execAsync(
        `${langConfig.command} "${tempFilePath}"`,
        {
          timeout: langConfig.timeout,
          cwd: tempDir,
          env: {
            ...process.env,
            NODE_PATH: process.cwd() + '/node_modules'
          }
        }
      )

      const executionTime = Date.now() - startTime
      const result: ExecuteResponse = {
        stdout: stdout || '',
        stderr: stderr || '',
        exitCode: 0,
        executionTime
      }

      // Store execution result in database
      await supabase
        .from('execution_results')
        .insert([
          {
            workspace_id: workspaceId,
            file_id: fileId,
            stdout: result.stdout,
            stderr: result.stderr,
            exit_code: result.exitCode,
            execution_time_ms: result.executionTime
          }
        ])

      return NextResponse.json(result)

    } catch (error: unknown) {
      const executionTime = Date.now() - startTime
      let result: ExecuteResponse
      const execError = error as { killed?: boolean; signal?: string; stdout?: string; stderr?: string; message?: string; code?: number }

      if (execError.killed && execError.signal === 'SIGTERM') {
        // Timeout error
        result = {
          stdout: '',
          stderr: `Execution timed out after ${langConfig.timeout}ms`,
          exitCode: 124,
          executionTime
        }
      } else {
        // Other execution errors
        result = {
          stdout: execError.stdout || '',
          stderr: execError.stderr || execError.message || 'Unknown execution error',
          exitCode: execError.code || 1,
          executionTime
        }
      }

      // Store execution result in database
      await supabase
        .from('execution_results')
        .insert([
          {
            workspace_id: workspaceId,
            file_id: fileId,
            stdout: result.stdout,
            stderr: result.stderr,
            exit_code: result.exitCode,
            execution_time_ms: result.executionTime
          }
        ])

      return NextResponse.json(result)

    } finally {
      // Clean up temporary files
      try {
        await unlink(tempFilePath)
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary file:', cleanupError)
      }
    }

  } catch (error: unknown) {
    console.error('API execution error:', error)
    return NextResponse.json(
      { error: 'Internal server error during code execution' },
      { status: 500 }
    )
  }
}