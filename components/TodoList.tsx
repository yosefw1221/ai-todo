import { Sparkles } from 'lucide-react'
import { Todo } from '@/types/todo'
import TodoItem from './TodoItem'

interface TodoListProps {
  todos: Todo[]
  editingChecklistItem: { todoId: string; itemId: string; text: string } | null
  setEditingChecklistItem: (item: { todoId: string; itemId: string; text: string } | null) => void
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void
  onDeleteTodo: (id: string) => void
  onAddChecklistItem: (todoId: string, text: string) => void
  onToggleChecklistItem: (todoId: string, itemId: string, completed: boolean) => void
  onUpdateChecklistItemText: (todoId: string, itemId: string, text: string) => void
  onDeleteChecklistItem: (todoId: string, itemId: string) => void
}

export default function TodoList({
  todos,
  editingChecklistItem,
  setEditingChecklistItem,
  onUpdateTodo,
  onDeleteTodo,
  onAddChecklistItem,
  onToggleChecklistItem,
  onUpdateChecklistItemText,
  onDeleteChecklistItem
}: TodoListProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Your Tasks</h3>
      <div className="space-y-3">
        {todos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-gray-400" size={24} />
            </div>
            <p className="text-gray-500 text-lg mb-2">No todos found</p>
            <p className="text-gray-400 text-sm">Create one above or ask the AI assistant!</p>
          </div>
        ) : (
          todos.map((todo) => (
            <TodoItem
              key={todo._id}
              todo={todo}
              editingChecklistItem={editingChecklistItem}
              setEditingChecklistItem={setEditingChecklistItem}
              onUpdateTodo={onUpdateTodo}
              onDeleteTodo={onDeleteTodo}
              onAddChecklistItem={onAddChecklistItem}
              onToggleChecklistItem={onToggleChecklistItem}
              onUpdateChecklistItemText={onUpdateChecklistItemText}
              onDeleteChecklistItem={onDeleteChecklistItem}
            />
          ))
        )}
      </div>
    </div>
  )
} 