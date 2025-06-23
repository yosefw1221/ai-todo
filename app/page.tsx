'use client'

import { useState, useEffect } from 'react'
import { useChat } from 'ai/react'
import { Check, X, Plus, MessageCircle, Send, Trash2, Edit } from 'lucide-react'

import { Todo, TodoFilters } from '@/types/todo'
import { PRIORITY_COLORS, API_ENDPOINTS } from '@/utils/constants'

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [showChat, setShowChat] = useState(false)
  const [newTodo, setNewTodo] = useState<{ title: string; description: string; priority: 'low' | 'medium' | 'high' }>({ title: '', description: '', priority: 'medium' })

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: API_ENDPOINTS.CHAT,
    onFinish: () => {
      // Refresh todos after AI operations
      fetchTodos()
    },

  })

  const fetchTodos = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('filter', filter)
      if (priorityFilter !== 'all') params.append('priority', priorityFilter)
      
      const response = await fetch(`${API_ENDPOINTS.TODOS}?${params}`)
      const data = await response.json()
      setTodos(data.todos)
    } catch (error) {
      console.error('Error fetching todos:', error)
    }
  }

  const createTodo = async () => {
    if (!newTodo.title.trim()) return

    try {
      const response = await fetch(API_ENDPOINTS.TODOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo)
      })
      
      if (response.ok) {
        setNewTodo({ title: '', description: '', priority: 'medium' })
        fetchTodos()
      }
    } catch (error) {
      console.error('Error creating todo:', error)
    }
  }

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      const response = await fetch(API_ENDPOINTS.TODO_BY_ID(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (response.ok) {
        fetchTodos()
      }
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.TODO_BY_ID(id), {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchTodos()
      }
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || 'text-gray-600 bg-gray-50'
  }

  useEffect(() => {
    fetchTodos()
  }, [filter, priorityFilter])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">AI Todo App</h1>
          
          {/* Add Todo Form */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Add New Todo</h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Todo title..."
                value={newTodo.title}
                onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Description (optional)..."
                value={newTodo.description}
                onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
              <div className="flex gap-3">
                <select
                  value={newTodo.priority}
                  onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <button
                  onClick={createTodo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Todo
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1 rounded-full text-sm ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-3 py-1 rounded-full text-sm ${filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Completed
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setPriorityFilter('all')}
                className={`px-3 py-1 rounded-full text-sm ${priorityFilter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                All Priorities
              </button>
              <button
                onClick={() => setPriorityFilter('high')}
                className={`px-3 py-1 rounded-full text-sm ${priorityFilter === 'high' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                High
              </button>
              <button
                onClick={() => setPriorityFilter('medium')}
                className={`px-3 py-1 rounded-full text-sm ${priorityFilter === 'medium' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Medium
              </button>
              <button
                onClick={() => setPriorityFilter('low')}
                className={`px-3 py-1 rounded-full text-sm ${priorityFilter === 'low' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Low
              </button>
            </div>
          </div>

          {/* Todo List */}
          <div className="space-y-3">
            {todos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No todos found. Create one above or ask the AI assistant!</p>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo._id}
                  className={`p-4 border rounded-lg ${todo.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => updateTodo(todo._id, { completed: !todo.completed })}
                        className={`mt-1 p-1 rounded-full ${todo.completed ? 'bg-green-600 text-white' : 'border-2 border-gray-300 hover:border-green-600'}`}
                      >
                        {todo.completed && <Check size={16} />}
                      </button>
                      <div className="flex-1">
                        <h3 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {todo.title}
                        </h3>
                        {todo.description && (
                          <p className={`text-sm mt-1 ${todo.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                            {todo.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                            {todo.priority}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(todo.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTodo(todo._id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Chat Toggle */}
        <button
          onClick={() => setShowChat(!showChat)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg"
        >
          <MessageCircle size={24} />
        </button>

        {/* AI Chat Interface */}
        {showChat && (
          <div className="fixed bottom-20 right-6 w-80 h-96 bg-white rounded-lg shadow-xl border">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">AI Assistant</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Ask me to create, update, or manage your todos!
              </p>
            </div>
            
            <div className="flex-1 p-4 h-64 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  Try saying: "Add a high priority todo to buy groceries" or "Show me all completed todos"
                </p>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-3 p-2 rounded-lg ${
                      message.role === 'user' ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-600 mb-1">
                      {message.role === 'user' ? 'You' : 'AI'}
                    </div>
                    <div className="text-sm">{message.content}</div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="bg-gray-100 mr-8 p-2 rounded-lg">
                  <div className="text-sm font-medium text-gray-600 mb-1">AI</div>
                  <div className="text-sm">Thinking...</div>
                </div>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask me about your todos..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
} 