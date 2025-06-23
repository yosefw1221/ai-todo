'use client'

import { useState } from 'react'
import { useChat } from 'ai/react'

import { API_ENDPOINTS } from '@/utils/constants'
import { useTodos } from '@/hooks/useTodos'
import Header from '@/components/Header'
import TodoForm from '@/components/TodoForm'
import TodoFilters from '@/components/TodoFilters'
import TodoList from '@/components/TodoList'
import AIChat from '@/components/AIChat'

export default function TodoApp() {
  const [showChat, setShowChat] = useState(false)
  
  // Use custom hook for todo management
  const {
    todos,
    filter,
    setFilter,
    priorityFilter,
    setPriorityFilter,
    newTodo,
    setNewTodo,
    newChecklistItem,
    setNewChecklistItem,
    editingChecklistItem,
    setEditingChecklistItem,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    addChecklistItemToNew,
    removeChecklistItemFromNew,
    toggleChecklistItemInNew,
    addChecklistItemToTodo,
    toggleChecklistItem,
    updateChecklistItemText,
    deleteChecklistItem,
    totalTodos,
    completedTodos,
    pendingTodos,
    highPriorityTodos
  } = useTodos()

  // AI chat functionality
  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput, setMessages } = useChat({
    api: API_ENDPOINTS.CHAT,
    onFinish: () => {
      // Refresh todos after AI operations
      fetchTodos()
    },
    onError: (error) => {
      console.error('Chat API error:', error)
    }
  })

  // Clear chat messages
  const clearChat = () => {
    setMessages([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header with Stats */}
        <Header 
          pendingTodos={pendingTodos}
          completedTodos={completedTodos}
          highPriorityTodos={highPriorityTodos}
        />

        {/* Todo Form */}
        <TodoForm
          newTodo={newTodo}
          setNewTodo={setNewTodo}
          newChecklistItem={newChecklistItem}
          setNewChecklistItem={setNewChecklistItem}
          onCreateTodo={createTodo}
          onAddChecklistItem={addChecklistItemToNew}
          onRemoveChecklistItem={removeChecklistItemFromNew}
          onToggleChecklistItem={toggleChecklistItemInNew}
        />

        {/* Filters */}
        <TodoFilters
          filter={filter}
          setFilter={setFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          totalTodos={totalTodos}
          pendingTodos={pendingTodos}
          completedTodos={completedTodos}
        />

        {/* Todo List */}
        <TodoList
          todos={todos}
          editingChecklistItem={editingChecklistItem}
          setEditingChecklistItem={setEditingChecklistItem}
          onUpdateTodo={updateTodo}
          onDeleteTodo={deleteTodo}
          onAddChecklistItem={addChecklistItemToTodo}
          onToggleChecklistItem={toggleChecklistItem}
          onUpdateChecklistItemText={updateChecklistItemText}
          onDeleteChecklistItem={deleteChecklistItem}
        />

        {/* AI Chat */}
        <AIChat
          showChat={showChat}
          setShowChat={setShowChat}
          messages={messages}
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          setInput={setInput}
          onClearChat={clearChat}
          totalTodos={totalTodos}
          completedTodos={completedTodos}
          pendingTodos={pendingTodos}
          highPriorityTodos={highPriorityTodos}
          filter={filter}
        />
      </div>
    </div>
  )
} 