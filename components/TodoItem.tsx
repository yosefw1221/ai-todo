import { Check, Trash2, CheckSquare, Square, Plus, Minus } from 'lucide-react'
import { Todo } from '@/types/todo'
import { PRIORITY_COLORS } from '@/utils/constants'

interface TodoItemProps {
  todo: Todo
  editingChecklistItem: { todoId: string; itemId: string; text: string } | null
  setEditingChecklistItem: (item: { todoId: string; itemId: string; text: string } | null) => void
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void
  onDeleteTodo: (id: string) => void
  onAddChecklistItem: (todoId: string, text: string) => void
  onToggleChecklistItem: (todoId: string, itemId: string, completed: boolean) => void
  onUpdateChecklistItemText: (todoId: string, itemId: string, text: string) => void
  onDeleteChecklistItem: (todoId: string, itemId: string) => void
}

export default function TodoItem({
  todo,
  editingChecklistItem,
  setEditingChecklistItem,
  onUpdateTodo,
  onDeleteTodo,
  onAddChecklistItem,
  onToggleChecklistItem,
  onUpdateChecklistItemText,
  onDeleteChecklistItem
}: TodoItemProps) {
  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || 'text-gray-600 bg-gray-50'
  }

  return (
    <div
      className={`p-5 border rounded-xl transition-all hover:shadow-md ${
        todo.completed 
          ? 'bg-gradient-to-r from-gray-50 to-green-50 border-gray-200' 
          : 'bg-white border-gray-200 hover:border-blue-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <button
            onClick={() => onUpdateTodo(todo._id, { completed: !todo.completed })}
            className={`mt-1 p-2 rounded-full transition-all ${
              todo.completed 
                ? 'bg-green-600 text-white shadow-md' 
                : 'border-2 border-gray-300 hover:border-green-600 hover:bg-green-50'
            }`}
          >
            {todo.completed && <Check size={16} />}
          </button>
          <div className="flex-1">
            <h3 className={`font-semibold text-lg ${
              todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
            }`}>
              {todo.title}
            </h3>
            {todo.description && (
              <p className={`text-sm mt-2 ${
                todo.completed ? 'line-through text-gray-400' : 'text-gray-600'
              }`}>
                {todo.description}
              </p>
            )}
            
            {/* Checklist Display */}
            {todo.checklist && todo.checklist.length > 0 && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <CheckSquare size={14} />
                    Checklist ({todo.checklist.filter(item => item.completed).length}/{todo.checklist.length})
                  </h4>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="Add item..."
                      className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-24"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          onAddChecklistItem(todo._id, e.currentTarget.value.trim())
                          e.currentTarget.value = ''
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {todo.checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded group">
                      <button
                        onClick={() => onToggleChecklistItem(todo._id, item.id, !item.completed)}
                        className={`p-1 rounded transition-all ${
                          item.completed 
                            ? 'text-green-600 bg-green-100' 
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {item.completed ? <CheckSquare size={12} /> : <Square size={12} />}
                      </button>
                      {editingChecklistItem?.todoId === todo._id && editingChecklistItem?.itemId === item.id ? (
                        <input
                          type="text"
                          value={editingChecklistItem.text}
                          onChange={(e) => setEditingChecklistItem({
                            ...editingChecklistItem,
                            text: e.target.value
                          })}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              onUpdateChecklistItemText(todo._id, item.id, editingChecklistItem.text)
                            } else if (e.key === 'Escape') {
                              setEditingChecklistItem(null)
                            }
                          }}
                          onBlur={() => onUpdateChecklistItemText(todo._id, item.id, editingChecklistItem.text)}
                          className="flex-1 text-xs px-1 py-0.5 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        <span 
                          className={`flex-1 text-xs cursor-pointer ${
                            item.completed ? 'line-through text-gray-500' : 'text-gray-700'
                          }`}
                          onClick={() => setEditingChecklistItem({
                            todoId: todo._id,
                            itemId: item.id,
                            text: item.text
                          })}
                        >
                          {item.text}
                        </span>
                      )}
                      <button
                        onClick={() => onDeleteChecklistItem(todo._id, item.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Minus size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3 mt-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(todo.priority)}`}>
                {todo.priority === 'high' ? '🔴' : todo.priority === 'medium' ? '🟡' : '🟢'} {todo.priority.toUpperCase()}
              </span>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                {new Date(todo.createdAt).toLocaleDateString()}
              </span>
              {todo.checklist && todo.checklist.length > 0 && (
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  📋 {todo.checklist.filter(item => item.completed).length}/{todo.checklist.length} done
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => onDeleteTodo(todo._id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-all"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  )
} 