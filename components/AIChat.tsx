import { useState, useMemo, useCallback, useEffect } from 'react'
import { MessageCircle, Send, X, Sparkles, Zap, Plus, CheckCircle, Trash2, AlertCircle, Target, ListTodo, Filter, Clock, RotateCcw } from 'lucide-react'
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
  onClearChat: () => void
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
  onClearChat,
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

  // Dynamic suggestions based on user input and context
  const [dynamicSuggestions, setDynamicSuggestions] = useState<Suggestion[]>([])
  const [lastInputForSuggestions, setLastInputForSuggestions] = useState('')
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  // Generate dynamic suggestions based on current input
  const generateDynamicSuggestions = useCallback(async (userInput: string) => {
    if (!userInput.trim() || userInput.length < 3) {
      // Show basic suggestions when no input
      setLoadingSuggestions(false)
      setDynamicSuggestions([
        {
          icon: Plus,
          label: "Add task",
          prompt: "Create a new todo for me",
          category: "create",
          priority: 1
        },
        {
          icon: ListTodo,
          label: "Show all",
          prompt: "Show me all my todos",
          category: "view",
          priority: 2
        },
        {
          icon: CheckCircle,
          label: "Complete tasks",
          prompt: "Help me complete some pending tasks",
          category: "update",
          priority: 3
        }
      ])
      return
    }

    try {
      setLoadingSuggestions(true)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `Generate 4-6 helpful follow-up suggestions based on the user's input. Consider the current todo context:
              - Total todos: ${totalTodos}
              - Pending: ${pendingTodos}  
              - Completed: ${completedTodos}
              - High priority: ${highPriorityTodos}
              
              Return ONLY a JSON array of suggestions in this exact format:
              [
                {
                  "label": "Short action label",
                  "prompt": "Complete prompt to send",
                  "category": "create|update|delete|view|general",
                  "priority": 1
                }
              ]
              
              Make suggestions specific, actionable, and relevant to the user's input. Vary the categories and keep labels under 20 characters.`
            },
            {
              role: 'user',
              content: userInput
            }
          ]
        })
      })

      if (response.ok) {
        const data = await response.text()
        // Extract JSON from the response
        const jsonMatch = data.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const suggestions = JSON.parse(jsonMatch[0])
          const formattedSuggestions = suggestions.map((s: any, index: number) => ({
            icon: getCategoryIcon(s.category),
            label: s.label,
            prompt: s.prompt,
            category: s.category,
            priority: s.priority || index
          }))
          setDynamicSuggestions(formattedSuggestions.slice(0, 6))
        }
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error)
      // Fallback to basic suggestions
      setDynamicSuggestions([
        {
          icon: Plus,
          label: "Add related task",
          prompt: `Create a todo related to: ${userInput}`,
          category: "create",
          priority: 1
        }
      ])
    } finally {
      setLoadingSuggestions(false)
    }
  }, [totalTodos, pendingTodos, completedTodos, highPriorityTodos])

  // Get icon for category
  const getCategoryIcon = (category: string) => {
    const icons = {
      create: Plus,
      update: CheckCircle,
      delete: Trash2,
      view: ListTodo,
      general: Sparkles,
      urgent: AlertCircle,
      filter: Filter
    }
    return icons[category as keyof typeof icons] || Sparkles
  }

  // Debounced suggestion generation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (input !== lastInputForSuggestions) {
        setLastInputForSuggestions(input)
        generateDynamicSuggestions(input)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [input, generateDynamicSuggestions, lastInputForSuggestions])

  // Initialize with basic suggestions
  useEffect(() => {
    if (dynamicSuggestions.length === 0) {
      generateDynamicSuggestions('')
    }
  }, [generateDynamicSuggestions])

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
        <div className="fixed bottom-20 right-6 w-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-5 text-white">
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
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    onClick={onClearChat}
                    className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded-full transition-all"
                    title="Clear chat"
                  >
                    <RotateCcw size={18} />
                  </button>
                )}
                <button
                  onClick={() => setShowChat(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded-full transition-all"
                  title="Close chat"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Suggestions */}
          {messages.length === 0 && (
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">
                  {input.trim() && input.length >= 3
                    ? `Suggestions for: "${input.slice(0, 30)}${input.length > 30 ? '...' : ''}"`
                    : totalTodos === 0 
                      ? "Let's get started" 
                      : `Smart suggestions`
                  }
                </h4>
                {loadingSuggestions && (
                  <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {loadingSuggestions ? (
                  // Loading skeleton
                  Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="p-3 rounded-xl border border-gray-200 animate-pulse">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 bg-gray-300 rounded"></div>
                        <div className="w-16 h-3 bg-gray-300 rounded"></div>
                      </div>
                      <div className="w-full h-2 bg-gray-300 rounded mb-1"></div>
                      <div className="w-3/4 h-2 bg-gray-300 rounded"></div>
                    </div>
                  ))
                ) : (
                  dynamicSuggestions.map((suggestion, index) => {
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
                  })
                )}
              </div>
            </div>
          )}
          
          {/* Chat Messages with Markdown Support */}
          <div className="h-96 overflow-y-auto p-5 space-y-4">
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
          <form onSubmit={handleSubmit} className="p-6 border-t border-gray-100 bg-white">
            <div className="flex gap-3">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask me about your todos..."
                className="flex-1 px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-900 bg-white placeholder-gray-500 font-medium shadow-sm"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-5 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
} 