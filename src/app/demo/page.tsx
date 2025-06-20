'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileService } from '@/lib/file-service'
import { Loader2 } from 'lucide-react'

export default function DemoPage() {
  const router = useRouter()

  useEffect(() => {
    const createDemoWorkspace = async () => {
      try {
        // Create demo workspace
        const workspace = await FileService.createWorkspace(
          'Demo Workspace',
          'A sample workspace to explore the IDE features'
        )

        // Create demo files
        await Promise.all([
          FileService.createFile(
            workspace.id,
            'hello.js',
            'hello.js',
            `// Welcome to Wireframe IDE!
// This is a demo workspace with sample files.

console.log("Hello, World!");
console.log("Current time:", new Date().toISOString());

// Try editing this code and click Run to see the output
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((acc, num) => acc + num, 0);
console.log("Sum of numbers:", sum);

// You can create new files, run code, and share your workspace!`,
            'javascript',
            true
          ),
          FileService.createFile(
            workspace.id,
            'math.js',
            'math.js',
            `// Math utilities
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

// Calculate and display results
console.log("Fibonacci sequence (first 10 numbers):");
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}

console.log("\\nFactorials:");
for (let i = 1; i <= 5; i++) {
  console.log(\`\${i}! = \${factorial(i)}\`);
}`,
            'javascript'
          ),
          FileService.createFile(
            workspace.id,
            'example.py',
            'example.py',
            `# Python example
import json
from datetime import datetime

def greet(name):
    return f"Hello, {name}!"

def get_user_info():
    return {
        "name": "Demo User",
        "timestamp": datetime.now().isoformat(),
        "language": "Python",
        "message": "Welcome to the IDE!"
    }

# Main execution
if __name__ == "__main__":
    print(greet("Wireframe IDE"))
    print("=" * 40)
    
    user_info = get_user_info()
    print("User Information:")
    print(json.dumps(user_info, indent=2))
    
    # Simple calculation
    numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    total = sum(numbers)
    average = total / len(numbers)
    
    print(f"\\nNumbers: {numbers}")
    print(f"Sum: {total}")
    print(f"Average: {average}")`,
            'python'
          )
        ])

        router.push(`/workspace/${workspace.id}`)
      } catch (error) {
        console.error('Failed to create demo workspace:', error)
        alert('Failed to create demo workspace')
        router.push('/')
      }
    }

    createDemoWorkspace()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Creating demo workspace...</p>
      </div>
    </div>
  )
}