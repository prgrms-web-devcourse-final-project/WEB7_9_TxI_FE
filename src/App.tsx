import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-5xl font-bold mb-8 text-gray-900 dark:text-white">
          Vite + React + TypeScript + Tailwind
        </h1>
        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <button
            type="button"
            onClick={() => setCount((count) => count + 1)}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            count is {count}
          </button>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Edit <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="mt-8 text-gray-500 dark:text-gray-500">
          Click on the Vite and React logos to learn more
        </p>
      </div>
    </div>
  )
}

export default App
