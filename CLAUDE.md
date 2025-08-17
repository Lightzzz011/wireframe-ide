# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wireframe IDE is a web-based Integrated Development Environment built with Next.js, TypeScript, Tailwind CSS, and Supabase. It allows users to create workspaces, write code, execute it server-side, and share projects with read-only links.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically

## Architecture Overview

### Core Components
- **FileService** (`src/lib/file-service.ts`) - Handles all database operations for workspaces and files
- **IDELayout** (`src/components/IDELayout.tsx`) - Main IDE interface with file explorer, editor, and output panels
- **CodeEditor** (`src/components/CodeEditor.tsx`) - Monaco Editor wrapper with syntax highlighting
- **FileExplorer** (`src/components/FileExplorer.tsx`) - File management UI with CRUD operations
- **OutputPanel** (`src/components/OutputPanel.tsx`) - Displays code execution results

### Database Schema (Supabase)
- **workspaces** - Project containers with sharing capabilities
- **files** - Code files within workspaces
- **execution_results** - History of code execution outputs

### API Routes
- `/api/execute` - POST endpoint for secure server-side code execution
  - Supports JavaScript, Python, and TypeScript
  - Implements timeouts and sandboxing
  - Returns stdout, stderr, exit codes, and execution time

### Key Features
1. **File Management** - Create, edit, delete, and rename files
2. **Code Execution** - Server-side execution with security measures
3. **Sharing** - Generate read-only links via share tokens
4. **Multi-language Support** - JavaScript, Python, TypeScript
5. **Auto-save** - Unsaved changes tracking and manual save

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Database Setup
Run the SQL schema in `supabase-schema.sql` to set up the required tables and policies.

## Common Development Tasks

### Adding New Language Support
1. Update `SUPPORTED_LANGUAGES` in `/api/execute/route.ts`
2. Add language detection logic in `FileExplorer.tsx`
3. Update Monaco Editor language configuration

### Testing Code Execution
Use the demo workspace at `/demo` which creates sample files for testing different languages and features.