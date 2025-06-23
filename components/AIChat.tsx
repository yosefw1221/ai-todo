import { useState, useMemo } from 'react'
import { MessageCircle, Send, X, Sparkles, Zap, Plus, CheckCircle, Trash2, AlertCircle, Target, ListTodo, Filter, Clock } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Message } from 'ai'

interface AIChatProps {
  showChat: boolean
  setShowChat: (show: boolean) => void
  messages: Message[]
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  setInput: (input: string) => void
  totalTodos: number
  completedTodos: number
  pendingTodos: number
  highPriorityTodos: number
  filter: string
}

interface Suggestion {
  icon: any
  label: string
  prompt: string
  category: string
  priority: number
}

export default function AIChat({
  showChat,
  setShowChat,
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  setInput,
  totalTodos,
  completedTodos,
  pendingTodos,
  highPriorityTodos,
  filter
}: AIChatProps) {
  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt)
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      create: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
      update: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
      delete: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200',
      filter: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200',
      general: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200',
      urgent: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
  }

  // Dynamic suggestions based on current state
  const dynamicSuggestions = useMemo(() => {
    const suggestions: Suggestion[] = []

    // Always show create option
    suggestions.push({
      icon: Plus,
      label: "Add new task",
      prompt: "Create a new todo for me",
      category: "create",
      priority: 1
    })

    // If there are pending todos, suggest completion actions
    if (pendingTodos > 0) {
      suggestions.push({
        icon: CheckCircle,
        label: `Complete ${pendingTodos} pending`,
        prompt: `Help me complete some of my ${pendingTodos} pending tasks`,
        category: "update",
        priority: 2
      })
    }

    // If there are completed todos, suggest cleanup
    if (completedTodos > 0) {
      suggestions.push({
        icon: Trash2,
        label: `Clean ${completedTodos} completed`,
        prompt: `Delete all ${completedTodos} completed todos`,
        category: "delete",
        priority: 3
      })
    }

    // High priority alerts
    if (highPriorityTodos > 0) {
      suggestions.push({
        icon: AlertCircle,
        label: `${highPriorityTodos} urgent tasks!`,
        prompt: `Show me my ${highPriorityTodos} high priority tasks that need attention`,
        category: "urgent",
        priority: 0 // Highest priority
      })
    }

    // If lots of todos, suggest organization
    if (totalTodos > 5) {
      suggestions.push({
        icon: Target,
        label: "Organize tasks",
        prompt: `Help me organize and prioritize my ${totalTodos} todos`,
        category: "general",
        priority: 4
      })
    }

    // If empty or few todos, suggest planning
    if (totalTodos === 0) {
      suggestions.push({
        icon: Sparkles,
        label: "Plan your day",
        prompt: "Help me plan some productive tasks for today",
        category: "create",
        priority: 1
      })
    } else if (totalTodos < 3) {
      suggestions.push({
        icon: ListTodo,
        label: "Add more tasks",
        prompt: "Suggest some productive tasks I could add to my list",
        category: "create",
        priority: 2
      })
    }

    // Filter suggestions based on current filter
    if (filter === 'all' && totalTodos > 0) {
      suggestions.push({
        icon: Filter,
        label: "Focus view",
        prompt: "Show me a focused view of my most important tasks",
        category: "filter",
        priority: 5
      })
    }

    // Time-based suggestions
    const hour = new Date().getHours()
    if (hour < 12 && pendingTodos > 0) {
      suggestions.push({
        icon: Clock,
        label: "Morning focus",
        prompt: "What should I focus on this morning?",
        category: "general",
        priority: 3
      })
    } else if (hour >= 12 && hour < 17 && pendingTodos > 0) {
      suggestions.push({
        icon: Clock,
        label: "Afternoon priorities",
        prompt: "What are my afternoon priorities?",
        category: "general",
        priority: 3
      })
    } else if (hour >= 17 && pendingTodos > 0) {
      suggestions.push({
        icon: Clock,
        label: "End of day review",
        prompt: "Help me review what I've accomplished today",
        category: "general",
        priority: 3
      })
    }

    // Sort by priority and return top 6
    return suggestions
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 6)
  }, [totalTodos, completedTodos, pendingTodos, highPriorityTodos, filter])

  return (
    <>
      {/* AI Chat Toggle */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3">
        {!showChat && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs">
            <p className="text-sm text-gray-600">
              <Zap className="inline w-4 h-4 text-blue-500 mr-1" />
              {highPriorityTodos > 0 
                ? `${highPriorityTodos} urgent tasks need attention!`
                : `AI assistant ready to help!`
              }
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
                  <p className="text-sm opacity-90">
                    {totalTodos === 0 
                      ? "Ready to help you get organized" 
                      : `Managing ${totalTodos} todos`
                    }
                  </p>
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

          {/* Dynamic Suggestions */}
          {messages.length === 0 && (
            <div className="p-4 border-b border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                {totalTodos === 0 
                  ? "Let's get started" 
                  : `Smart suggestions for your ${totalTodos} todos`
                }
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {dynamicSuggestions.map((suggestion, index) => {
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
                      <p className="text-xs opacity-75 leading-tight line-clamp-2">{suggestion.prompt}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* Chat Messages with Markdown Support */}
          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">
                <Sparkles className="mx-auto mb-2 text-gray-400" size={24} />
                <p>Choose a smart suggestion above or type your own message!</p>
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
                    <div className="text-sm leading-relaxed">
                      {message.role === 'user' ? (
                        message.content
                      ) : (
                        <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-gray-800 prose-code:bg-gray-200 prose-code:text-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-ul:text-gray-700 prose-ol:text-gray-700">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
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
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-white">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask me about your todos..."
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 bg-white placeholder-gray-500 font-medium shadow-sm"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
} 