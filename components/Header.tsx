import { Sparkles } from 'lucide-react'

interface HeaderProps {
  pendingTodos: number
  completedTodos: number
  highPriorityTodos: number
}

export default function Header({ pendingTodos, completedTodos, highPriorityTodos }: HeaderProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="text-white" size={20} />
          </div>
          AI Todo App
        </h1>
        <div className="flex gap-4">
          <div className="text-center px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{pendingTodos}</div>
            <div className="text-xs text-blue-600">Pending</div>
          </div>
          <div className="text-center px-4 py-2 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">{completedTodos}</div>
            <div className="text-xs text-green-600">Done</div>
          </div>
          {highPriorityTodos > 0 && (
            <div className="text-center px-4 py-2 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{highPriorityTodos}</div>
              <div className="text-xs text-red-600">Urgent</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 