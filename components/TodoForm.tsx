import { Plus, CheckSquare, Square, Minus } from 'lucide-react'

interface TodoFormData {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  checklist: { text: string; completed: boolean }[]
}

interface TodoFormProps {
  newTodo: TodoFormData
  setNewTodo: (todo: TodoFormData) => void
  newChecklistItem: string
  setNewChecklistItem: (text: string) => void
  onCreateTodo: () => void
  onAddChecklistItem: () => void
  onRemoveChecklistItem: (index: number) => void
  onToggleChecklistItem: (index: number) => void
}

export default function TodoForm({
  newTodo,
  setNewTodo,
  newChecklistItem,
  setNewChecklistItem,
  onCreateTodo,
  onAddChecklistItem,
  onRemoveChecklistItem,
  onToggleChecklistItem
}: TodoFormProps) {
  return (
    <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">Add New Todo</h2>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={newTodo.title}
          onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
          className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 bg-white placeholder-gray-500 font-medium shadow-sm"
        />
        <textarea
          placeholder="Add more details (optional)..."
          value={newTodo.description}
          onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
          className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-gray-900 bg-white placeholder-gray-500 font-medium shadow-sm"
          rows={2}
        />
        
        {/* Checklist Section */}
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <CheckSquare size={16} />
              Checklist ({newTodo.checklist.length})
            </h4>
          </div>
          
          {/* Add checklist item */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Add checklist item..."
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onAddChecklistItem()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 bg-white"
            />
            <button
              onClick={onAddChecklistItem}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              <Plus size={16} />
            </button>
          </div>
          
          {/* Checklist items */}
          {newTodo.checklist.length > 0 && (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {newTodo.checklist.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <button
                    onClick={() => onToggleChecklistItem(index)}
                    className={`p-1 rounded transition-all ${
                      item.completed 
                        ? 'text-green-600 bg-green-100' 
                        : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {item.completed ? <CheckSquare size={14} /> : <Square size={14} />}
                  </button>
                  <span className={`flex-1 text-sm ${
                    item.completed ? 'line-through text-gray-500' : 'text-gray-700'
                  }`}>
                    {item.text}
                  </span>
                  <button
                    onClick={() => onRemoveChecklistItem(index)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-all"
                  >
                    <Minus size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          <select
            value={newTodo.priority}
            onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as 'low' | 'medium' | 'high' })}
            className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white font-medium shadow-sm"
          >
            <option value="low">🟢 Low Priority</option>
            <option value="medium">🟡 Medium Priority</option>
            <option value="high">🔴 High Priority</option>
          </select>
          <button
            onClick={onCreateTodo}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 font-medium transition-all shadow-sm hover:shadow-md"
          >
            <Plus size={18} />
            Add Todo
          </button>
        </div>
      </div>
    </div>
  )
} 