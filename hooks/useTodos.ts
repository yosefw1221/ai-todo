import { useState, useEffect } from 'react';
import { Todo } from '@/types/todo';
import { API_ENDPOINTS } from '@/utils/constants';
import { TodoService } from '@/services/todoService';

interface TodoFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  checklist: { text: string; completed: boolean }[];
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [priorityFilter, setPriorityFilter] = useState<
    'all' | 'low' | 'medium' | 'high'
  >('all');
  const [newTodo, setNewTodo] = useState<TodoFormData>({
    title: '',
    description: '',
    priority: 'medium',
    checklist: [],
  });
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [editingChecklistItem, setEditingChecklistItem] = useState<{
    todoId: string;
    itemId: string;
    text: string;
  } | null>(null);

  const fetchTodos = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('filter', filter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);

      const response = await fetch(`${API_ENDPOINTS.TODOS}?${params}`);
      const data = await response.json();
      setTodos(data.todos);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const createTodo = async () => {
    if (!newTodo.title.trim()) return;

    try {
      const response = await fetch(API_ENDPOINTS.TODOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo),
      });

      if (response.ok) {
        setNewTodo({
          title: '',
          description: '',
          priority: 'medium',
          checklist: [],
        });
        setNewChecklistItem('');
        fetchTodos();
      }
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      const response = await fetch(API_ENDPOINTS.TODO_BY_ID(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        fetchTodos();
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.TODO_BY_ID(id), {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTodos();
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  // Checklist operations for new todo
  const addChecklistItemToNew = () => {
    if (!newChecklistItem.trim()) return;

    setNewTodo((prev) => ({
      ...prev,
      checklist: [
        ...prev.checklist,
        { text: newChecklistItem.trim(), completed: false },
      ],
    }));
    setNewChecklistItem('');
  };

  const removeChecklistItemFromNew = (index: number) => {
    setNewTodo((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== index),
    }));
  };

  const toggleChecklistItemInNew = (index: number) => {
    setNewTodo((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item, i) =>
        i === index ? { ...item, completed: !item.completed } : item
      ),
    }));
  };

  // Checklist operations for existing todos
  const addChecklistItemToTodo = async (todoId: string, text: string) => {
    try {
      await TodoService.addChecklistItem(todoId, text);
      fetchTodos();
    } catch (error) {
      console.error('Error adding checklist item:', error);
    }
  };

  const toggleChecklistItem = async (
    todoId: string,
    itemId: string,
    completed: boolean
  ) => {
    try {
      await TodoService.toggleChecklistItem(todoId, itemId, completed);
      fetchTodos();
    } catch (error) {
      console.error('Error toggling checklist item:', error);
    }
  };

  const updateChecklistItemText = async (
    todoId: string,
    itemId: string,
    text: string
  ) => {
    try {
      await TodoService.editChecklistItemText(todoId, itemId, text);
      setEditingChecklistItem(null);
      fetchTodos();
    } catch (error) {
      console.error('Error updating checklist item:', error);
    }
  };

  const deleteChecklistItem = async (todoId: string, itemId: string) => {
    try {
      await TodoService.deleteChecklistItem(todoId, itemId);
      fetchTodos();
    } catch (error) {
      console.error('Error deleting checklist item:', error);
    }
  };

  // Computed values
  const totalTodos = todos.length;
  const completedTodos = todos.filter((todo) => todo.completed).length;
  const pendingTodos = totalTodos - completedTodos;
  const highPriorityTodos = todos.filter(
    (todo) => todo.priority === 'high' && !todo.completed
  ).length;

  useEffect(() => {
    fetchTodos();
  }, [filter, priorityFilter]);

  return {
    // State
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

    // Actions
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,

    // New todo checklist actions
    addChecklistItemToNew,
    removeChecklistItemFromNew,
    toggleChecklistItemInNew,

    // Existing todo checklist actions
    addChecklistItemToTodo,
    toggleChecklistItem,
    updateChecklistItemText,
    deleteChecklistItem,

    // Computed values
    totalTodos,
    completedTodos,
    pendingTodos,
    highPriorityTodos,
  };
}
