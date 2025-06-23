'use client'

import { useState, useEffect } from 'react'
import { useChat } from 'ai/react'
import { Check, X, Plus, MessageCircle, Send, Trash2, Edit, Sparkles, Zap, Target, Clock } from 'lucide-react'

import { Todo, TodoFilters } from '@/types/todo'
import { PRIORITY_COLORS, API_ENDPOINTS } from '@/utils/constants'

// Chat suggestions for better UX
const CHAT_SUGGESTIONS = [
  {
    icon: Plus,
    label: "Add new task",
    prompt: "Create a new todo for me",
    category: "create"
  },
  {
    icon: Check,
    label: "Complete tasks",
    prompt: "Mark my pending tasks as completed",
    category: "update"
  },
  {
    icon: Trash2,
    label: "Delete completed",
    prompt: "Delete all completed todos",
    category: "delete"
  },
  {
    icon: Target,
    label: "High priority",
    prompt: "Show me all high priority tasks",
    category: "filter"
  },
  {
    icon: Clock,
    label: "Today's tasks",
    prompt: "What should I focus on today?",
    category: "general"
  },
  {
    icon: Sparkles,
    label: "Organize todos",
    prompt: "Help me organize my todo list better",
    category: "general"
  }
]

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [showChat, setShowChat] = useState(false)
  const [newTodo, setNewTodo] = useState<{ title: string; description: string; priority: 'low' | 'medium' | 'high' }>({ title: '', description: '', priority: 'medium' })

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
    api: API_ENDPOINTS.CHAT,
    onFinish: () => {
      // Refresh todos after AI operations
      fetchTodos()
    },
    onError: (error) => {
      console.error('Chat API error:', error)
    }
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

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt)
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      create: 'bg-green-100 text-green-700 border-green-200',
      update: 'bg-blue-100 text-blue-700 border-blue-200',
      delete: 'bg-red-100 text-red-700 border-red-200',
      filter: 'bg-purple-100 text-purple-700 border-purple-200',
      general: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  useEffect(() => {
    fetchTodos()
  }, [filter, priorityFilter])

  const totalTodos = todos.length
  const completedTodos = todos.filter(todo => todo.completed).length
  const pendingTodos = totalTodos - completedTodos
  const highPriorityTodos = todos.filter(todo => todo.priority === 'high' && !todo.completed).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header with Stats */}
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
          
          {/* Add Todo Form */}
          <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Add New Todo</h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="What needs to be done?"
                value={newTodo.title}
                onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <textarea
                placeholder="Add more details (optional)..."
                value={newTodo.description}
                onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                rows={2}
              />
              <div className="flex gap-3">
                <select
                  value={newTodo.priority}
                  onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">🟢 Low Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="high">🔴 High Priority</option>
                </select>
                <button
                  onClick={createTodo}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 font-medium transition-all shadow-sm hover:shadow-md"
                >
                  <Plus size={18} />
                  Add Todo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Filter & View</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2">
              <span className="text-sm font-medium text-gray-600 flex items-center">Status:</span>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                All ({totalTodos})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'pending' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Pending ({pendingTodos})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'completed' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Completed ({completedTodos})
              </button>
            </div>
            
            <div className="flex gap-2">
              <span className="text-sm font-medium text-gray-600 flex items-center">Priority:</span>
              <button
                onClick={() => setPriorityFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${priorityFilter === 'all' ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                All
              </button>
              <button
                onClick={() => setPriorityFilter('high')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${priorityFilter === 'high' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                🔴 High
              </button>
              <button
                onClick={() => setPriorityFilter('medium')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${priorityFilter === 'medium' ? 'bg-yellow-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                🟡 Medium
              </button>
              <button
                onClick={() => setPriorityFilter('low')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${priorityFilter === 'low' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                🟢 Low
              </button>
            </div>
          </div>
        </div>

        {/* Todo List */}
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
                <div
                  key={todo._id}
                  className={`p-5 border rounded-xl transition-all hover:shadow-md ${
                    todo.completed 
                      ? 'bg-gradient-to-r from-gray-50 to-green-50 border-gray-200' 
                      : 'bg-white border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <button
                        onClick={() => updateTodo(todo._id, { completed: !todo.completed })}
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
                        <div className="flex items-center gap-3 mt-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(todo.priority)}`}>
                            {todo.priority === 'high' ? '🔴' : todo.priority === 'medium' ? '🟡' : '🟢'} {todo.priority.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                            {new Date(todo.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTodo(todo._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Chat Toggle */}
        <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3">
          {!showChat && (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs">
              <p className="text-sm text-gray-600">
                <Zap className="inline w-4 h-4 text-blue-500 mr-1" />
                Need help? Ask your AI assistant!
              </p>
            </div>
          )}
          <button
            onClick={() => setShowChat(!showChat)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-105"
          >
            <MessageCircle size={24} />
          </button>
        </div>

        {/* Enhanced AI Chat Interface */}
        {showChat && (
          <div className="fixed bottom-20 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Assistant</h3>
                    <p className="text-sm opacity-90">Ready to help with your todos</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Suggestions */}
            {messages.length === 0 && (
              <div className="p-4 border-b border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  {CHAT_SUGGESTIONS.map((suggestion, index) => {
                    const Icon = suggestion.icon
                    return (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion.prompt)}
                        className={`p-3 rounded-xl text-left border transition-all hover:shadow-md ${getCategoryColor(suggestion.category)}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon size={14} />
                          <span className="text-xs font-medium">{suggestion.label}</span>
                        </div>
                        <p className="text-xs opacity-75 leading-tight">{suggestion.prompt}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* Chat Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">
                  <Sparkles className="mx-auto mb-2 text-gray-400" size={24} />
                  <p>Choose a quick action above or type your own message!</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="text-sm leading-relaxed">{message.content}</div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-2xl">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      AI is thinking...
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Chat Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask me about your todos..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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