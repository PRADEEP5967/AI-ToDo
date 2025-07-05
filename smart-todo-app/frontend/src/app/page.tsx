'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, BarChart3, Calendar, CheckCircle, Clock, AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import { taskApi, categoryApi, Task, Category, TaskStatistics } from '@/lib/api';
import { cn, formatDate, getPriorityColor, getStatusColor, getPriorityIcon, getStatusIcon } from '@/lib/utils';
import TaskModal from '@/components/TaskModal';
import { useForm } from 'react-hook-form';
import Toast from "@/components/Toast";

type PaginatedResponse<T> = { results: T[] };
function isPaginated<T>(data: unknown): data is PaginatedResponse<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'results' in data &&
    Array.isArray((data as { results?: unknown }).results)
  );
}

interface QuickAddTaskProps {
  onTaskCreated: () => void;
  categories: Category[];
}

interface QuickAddTaskForm {
  title: string;
  description?: string;
  category?: string;
}

function QuickAddTask({ onTaskCreated, categories }: QuickAddTaskProps) {
  const { register, handleSubmit, reset } = useForm<QuickAddTaskForm>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: QuickAddTaskForm) => {
    setLoading(true);
    try {
      await taskApi.createTask({
        title: data.title,
        description: data.description || '',
        category: data.category ? Number(data.category) : undefined,
        priority: 2,
        status: 'pending',
      });
      reset();
      onTaskCreated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-2 mb-4">
      <input
        {...register('title', { required: true })}
        placeholder="Quick add task..."
        className="flex-1 px-3 py-2 border rounded-lg"
        disabled={loading}
      />
      <input
        {...register('description')}
        placeholder="Description (optional)"
        className="flex-1 px-3 py-2 border rounded-lg"
        disabled={loading}
      />
      <select {...register('category')} className="px-2 py-2 border rounded-lg">
        <option value="">Category</option>
        {categories.map((cat: Category) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        disabled={loading}
      >
        Add
      </button>
    </form>
  );
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statistics, setStatistics] = useState<TaskStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; task: Task | null }>({ open: false, task: null });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [tasksData, categoriesData, statsData] = await Promise.all([
        taskApi.getTasks(),
        categoryApi.getCategories(),
        taskApi.getStatistics(),
      ]);
      setTasks(isPaginated<Task>(tasksData) ? tasksData.results : (tasksData as unknown as Task[]));
      setCategories(isPaginated<Category>(categoriesData) ? categoriesData.results : (categoriesData as unknown as Category[]));
      setStatistics(statsData);
    } catch {
      setError('Failed to load data. Please try again.');
      showToast('Failed to load data.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredTasks = tasks.filter(task => {
    const searchTermLower = (searchTerm || '').toLowerCase();
    const matchesSearch = (task.title?.toLowerCase() || '').includes(searchTermLower) ||
                         (task.description?.toLowerCase() || '').includes(searchTermLower);
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === null || task.priority === priorityFilter;
    const matchesCategory = categoryFilter === null || task.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleMarkCompleted = async (taskId: number) => {
    try {
      await taskApi.markCompleted(taskId);
      await loadData();
      showToast('Task marked as completed.');
    } catch {
      setError('Failed to mark task as completed.');
      showToast('Failed to mark task as completed.', 'error');
    }
  };

  const handleEnhanceWithAI = async (taskId: number) => {
    try {
      await taskApi.enhanceWithAI(taskId);
      await loadData();
      showToast('Task enhanced with AI.');
    } catch {
      setError('Failed to enhance task with AI.');
      showToast('Failed to enhance task with AI.', 'error');
    }
  };

  // const handleSuggestDeadline = async (taskId: number) => {
  //   try {
  //     await taskApi.suggestDeadline(taskId);
  //     await loadData();
  //     showToast('AI suggested a deadline.');
  //   } catch {
  //     setError('Failed to suggest deadline.');
  //     showToast('Failed to suggest deadline.', 'error');
  //   }
  // };

  // const handleAcceptSuggestedDeadline = async (taskId: number) => {
  //   try {
  //     await taskApi.acceptSuggestedDeadline(taskId);
  //     await loadData();
  //     showToast('Deadline accepted.');
  //   } catch {
  //     setError('Failed to accept suggested deadline.');
  //     showToast('Failed to accept suggested deadline.', 'error');
  //   }
  // };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setDeleteConfirm({ open: true, task });
  };

  const confirmDeleteTask = async () => {
    if (!deleteConfirm.task) return;
    try {
      await taskApi.deleteTask(deleteConfirm.task.id);
      setDeleteConfirm({ open: false, task: null });
      await loadData();
      showToast('Task deleted.');
    } catch {
      setError('Failed to delete task.');
      showToast('Failed to delete task.', 'error');
    }
  };

  const handleModalSuccess = () => {
    loadData();
  };

  const handleSelectTask = (taskId: number, checked: boolean) => {
    setSelectedTasks(prev => checked ? [...prev, taskId] : prev.filter(id => id !== taskId));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedTasks(checked ? filteredTasks.map(t => t.id) : []);
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedTasks.map(id => taskApi.deleteTask(id)));
      setSelectedTasks([]);
      await loadData();
      showToast("Tasks deleted.");
    } catch {
      showToast("Failed to delete tasks.", "error");
    }
  };

  const handleBulkComplete = async () => {
    try {
      await Promise.all(selectedTasks.map(id => taskApi.markCompleted(id)));
      setSelectedTasks([]);
      await loadData();
      showToast("Tasks marked as completed.");
    } catch {
      showToast("Failed to mark tasks as completed.", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {/* Bulk Actions Bar */}
      {selectedTasks.length > 0 && (
        <div className="fixed top-20 left-0 right-0 z-40 flex justify-center">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg px-6 py-3 flex gap-4 items-center">
            <span className="font-medium">{selectedTasks.length} selected</span>
            <button onClick={handleBulkComplete} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Mark Completed</button>
            <button onClick={handleBulkDelete} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Delete</button>
            <button onClick={() => setSelectedTasks([])} className="text-gray-500 hover:text-gray-800">Clear</button>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Smart Todo Pradeep</h1>
              <p className="text-gray-600 dark:text-gray-300">AI-Powered Task Management</p>
            </div>
            <button 
              onClick={handleCreateTask}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Add Task */}
        <QuickAddTask onTaskCreated={loadData} categories={categories} />
        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.total_tasks}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.pending_tasks}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.in_progress_tasks}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.completed_tasks}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={priorityFilter || ''}
                onChange={(e) => setPriorityFilter(e.target.value ? Number(e.target.value) : null)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="">All Priorities</option>
                <option value="1">Priority 1</option>
                <option value="2">Priority 2</option>
                <option value="3">Priority 3</option>
                <option value="4">Priority 4</option>
              </select>
              <select
                value={categoryFilter || ''}
                onChange={e => setCategoryFilter(e.target.value ? Number(e.target.value) : null)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* Tasks List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
              onChange={e => handleSelectAll(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-700"
            />
            <span className="text-sm text-gray-700 dark:text-gray-200">Select All</span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white ml-auto">Tasks ({filteredTasks.length})</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTasks.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="text-gray-400 mb-4">
                  <AlertTriangle className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-600 dark:text-gray-300">No tasks found. Create your first task to get started!</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div key={task.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task.id)}
                    onChange={e => handleSelectTask(task.id, e.target.checked)}
                    className="w-4 h-4 mt-1 rounded border-gray-300 dark:border-gray-700"
                  />
                  <div className="flex-1 cursor-pointer" onClick={() => handleEditTask(task)}>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{task.title || 'Untitled Task'}</h3>
                      <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full border",
                        getPriorityColor(task.priority || 1)
                      )}>
                        {getPriorityIcon(task.priority || 1)} {task.priority_label || 'Priority'}
                      </span>
                      <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full border",
                        getStatusColor(task.status || 'pending')
                      )}>
                        {getStatusIcon(task.status || 'pending')} {task.status_label || 'Pending'}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">{task.description || 'No description'}</p>
                    {/* Context tags */}
                    {task.context_tags && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {task.context_tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full">{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>Category: {task.category_name || 'Uncategorized'}</span>
                      {task.deadline && (
                        <span>Due: {formatDate(task.deadline)}</span>
                      )}
                      {task.days_until_deadline !== null && (
                        <span className={task.is_overdue ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}>
                          {task.is_overdue ? 'Overdue' : `${task.days_until_deadline} days left`}
                        </span>
                      )}
                    </div>
                    {/* AI-enhanced description */}
                    {task.ai_enhanced_description && (
                      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>AI Enhanced:</strong> {task.ai_enhanced_description}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    {task.status !== 'completed' && (
                      <button
                        onClick={() => handleMarkCompleted(task.id)}
                        className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                        title="Mark as completed"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEnhanceWithAI(task.id)}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                      title="Enhance with AI"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    {/* <button
                      onClick={() => handleSuggestDeadline(task.id)}
                      className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors"
                      title="Suggest Deadline"
                    >
                      <Clock className="w-4 h-4" />
                    </button> */}
                    <button
                      onClick={() => handleEditTask(task)}
                      className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded-lg transition-colors"
                      title="Edit task"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        task={selectedTask}
        categories={categories}
      />
      {/* Delete Confirmation Modal */}
      {deleteConfirm.open && deleteConfirm.task && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Task</h3>
              <p className="text-gray-700 dark:text-gray-200 mb-4">Are you sure you want to delete <span className="font-bold">{deleteConfirm.task.title || 'this task'}</span>?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm({ open: false, task: null })}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteTask}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
