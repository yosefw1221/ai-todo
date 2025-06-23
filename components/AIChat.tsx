import { useState } from 'react'
import { MessageCircle, Send, X, Sparkles, Zap, RotateCcw } from 'lucide-react'
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


          
          {/* Chat Messages with Markdown Support */}
          <div className="h-96 overflow-y-auto p-5 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">
                <Sparkles className="mx-auto mb-2 text-gray-400" size={24} />
                <p>Start a conversation by typing your message below!</p>
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