'use client'

import React from 'react'
import Editor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-typescript'
import 'prismjs/themes/prism-dark.css'

interface SimpleCodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  readOnly?: boolean
}

const SimpleCodeEditor: React.FC<SimpleCodeEditorProps> = ({
  value,
  onChange,
  language,
  readOnly = false
}) => {
  const getLanguageHighlighter = (lang: string) => {
    switch (lang) {
      case 'javascript':
      case 'js':
        return languages.javascript
      case 'typescript':
      case 'ts':
        return languages.typescript
      case 'python':
      case 'py':
        return languages.python
      default:
        return languages.javascript
    }
  }

  const highlightCode = (code: string) => {
    const prismLanguage = getLanguageHighlighter(language)
    return highlight(code, prismLanguage, language)
  }

  return (
    <div className="h-full w-full bg-gray-900 text-white">
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={highlightCode}
        padding={16}
        disabled={readOnly}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 14,
          lineHeight: 1.5,
          minHeight: '100%',
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
        }}
        placeholder={readOnly ? '' : 'Start typing your code...'}
        className="outline-none resize-none"
      />
    </div>
  )
}

export default SimpleCodeEditor