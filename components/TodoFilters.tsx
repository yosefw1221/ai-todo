interface TodoFiltersProps {
  filter: 'all' | 'completed' | 'pending'
  setFilter: (filter: 'all' | 'completed' | 'pending') => void
  priorityFilter: 'all' | 'low' | 'medium' | 'high'
  setPriorityFilter: (priority: 'all' | 'low' | 'medium' | 'high') => void
  totalTodos: number
  pendingTodos: number
  completedTodos: number
}

export default function TodoFilters({
  filter,
  setFilter,
  priorityFilter,
  setPriorityFilter,
  totalTodos,
  pendingTodos,
  completedTodos
}: TodoFiltersProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Filter & View</h3>
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          <span className="text-sm font-medium text-gray-600 flex items-center">Status:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === 'all' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({totalTodos})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === 'pending' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({pendingTodos})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === 'completed' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed ({completedTodos})
          </button>
        </div>
        
        <div className="flex gap-2">
          <span className="text-sm font-medium text-gray-600 flex items-center">Priority:</span>
          <button
            onClick={() => setPriorityFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              priorityFilter === 'all' 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setPriorityFilter('high')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              priorityFilter === 'high' 
                ? 'bg-red-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🔴 High
          </button>
          <button
            onClick={() => setPriorityFilter('medium')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              priorityFilter === 'medium' 
                ? 'bg-yellow-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🟡 Medium
          </button>
          <button
            onClick={() => setPriorityFilter('low')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              priorityFilter === 'low' 
                ? 'bg-green-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🟢 Low
          </button>
        </div>
      </div>
    </div>
  )
} 