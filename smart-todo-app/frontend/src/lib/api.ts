import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

console.log('API_BASE_URL:', API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(request => {
  console.log('API Request URL:', request.url);
  console.log('API Request Full URL:', (request.baseURL || '') + (request.url || ''));
  console.log('API Request:', request);
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('API Response:', response);
    return response;
  },
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Types
export interface Category {
  id: number;
  name: string;
  color: string;
  usage_count: number;
  task_count: number;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  category: number;
  category_name: string;
  category_color: string;
  priority_score: number;
  priority: number;
  priority_label: string;
  deadline: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  status_label: string;
  ai_enhanced_description: string | null;
  context_tags: string[] | null;
  days_until_deadline: number | null;
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContextEntry {
  id: number;
  content: string;
  source_type: 'whatsapp' | 'email' | 'notes' | 'manual';
  source_type_label: string;
  processed_insights: unknown;
  keywords: string[] | null;
  sentiment_score: number | null;
  importance_score: number | null;
  processing_status: 'pending' | 'partially_processed' | 'processed';
  created_at: string;
  processed_at: string | null;
}

export interface TaskStatistics {
  total_tasks: number;
  pending_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  priority_distribution: {
    priority_1: number;
    priority_2: number;
    priority_3: number;
    priority_4: number;
  };
  category_distribution: Record<string, number>;
}

export interface ContextStatistics {
  total_entries: number;
  processed_entries: number;
  unprocessed_entries: number;
  processing_rate: number;
  source_distribution: Record<string, number>;
  sentiment_distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  average_scores: {
    sentiment: number;
    importance: number;
  };
}

// API Functions
export const taskApi = {
  // Get all tasks with optional filtering
  getTasks: async (params?: {
    status?: string;
    priority?: number;
    category?: number;
    search?: string;
    ordering?: string;
  }) => {
    const response = await api.get<Task[]>('/api/tasks/', { params });
    return response.data;
  },

  // Get single task
  getTask: async (id: number) => {
    const response = await api.get<Task>(`/api/tasks/${id}/`);
    return response.data;
  },

  // Create new task
  createTask: async (data: Partial<Task>) => {
    const response = await api.post<Task>('/api/tasks/', data);
    return response.data;
  },

  // Update task
  updateTask: async (id: number, data: Partial<Task>) => {
    const response = await api.put<Task>(`/api/tasks/${id}/`, data);
    return response.data;
  },

  // Delete task
  deleteTask: async (id: number) => {
    await api.delete(`/api/tasks/${id}/`);
  },

  // Mark task as completed
  markCompleted: async (id: number) => {
    const response = await api.post<Task>(`/api/tasks/${id}/mark_completed/`);
    return response.data;
  },

  // Enhance task with AI
  enhanceWithAI: async (id: number) => {
    const response = await api.post<Task>(`/api/tasks/${id}/enhance_with_ai/`);
    return response.data;
  },

  // Get task statistics
  getStatistics: async () => {
    const response = await api.get<TaskStatistics>('/api/tasks/statistics/');
    return response.data;
  },

  // Get overdue tasks
  getOverdueTasks: async () => {
    const response = await api.get<Task[]>('/api/tasks/overdue/');
    return response.data;
  },

  // Get high priority tasks
  getHighPriorityTasks: async () => {
    const response = await api.get<Task[]>('/api/tasks/high_priority/');
    return response.data;
  },

  // Get today's tasks
  getTodayTasks: async () => {
    const response = await api.get<Task[]>('/api/tasks/today/');
    return response.data;
  },

  // Bulk update task status
  bulkUpdateStatus: async (taskIds: number[], status: string) => {
    const response = await api.post('/api/tasks/bulk_update_status/', {
      task_ids: taskIds,
      status,
    });
    return response.data;
  },
};

export const categoryApi = {
  // Get all categories
  getCategories: async () => {
    const response = await api.get('/api/categories/');
    return response.data;
  },

  // Get single category
  getCategory: async (id: number) => {
    const response = await api.get<Category>(`/api/categories/${id}/`);
    return response.data;
  },

  // Create new category
  createCategory: async (data: Partial<Category>) => {
    const response = await api.post<Category>('/api/categories/', data);
    return response.data;
  },

  // Update category
  updateCategory: async (id: number, data: Partial<Category>) => {
    const response = await api.put<Category>(`/api/categories/${id}/`, data);
    return response.data;
  },

  // Delete category
  deleteCategory: async (id: number) => {
    await api.delete(`/api/categories/${id}/`);
  },

  // Get popular categories
  getPopularCategories: async () => {
    const response = await api.get<Category[]>('/api/categories/popular/');
    return response.data;
  },

  // Increment category usage
  incrementUsage: async (id: number) => {
    const response = await api.post<Category>(`/api/categories/${id}/increment_usage/`);
    return response.data;
  },
};

export const contextApi = {
  // Get all context entries
  getContextEntries: async (params?: {
    source_type?: string;
    search?: string;
    ordering?: string;
  }) => {
    const response = await api.get<ContextEntry[]>('/api/context/', { params });
    return response.data;
  },

  // Get single context entry
  getContextEntry: async (id: number) => {
    const response = await api.get<ContextEntry>(`/api/context/${id}/`);
    return response.data;
  },

  // Create new context entry
  createContextEntry: async (data: Partial<ContextEntry>) => {
    const response = await api.post<ContextEntry>('/api/context/', data);
    return response.data;
  },

  // Update context entry
  updateContextEntry: async (id: number, data: Partial<ContextEntry>) => {
    const response = await api.put<ContextEntry>(`/api/context/${id}/`, data);
    return response.data;
  },

  // Delete context entry
  deleteContextEntry: async (id: number) => {
    await api.delete(`/api/context/${id}/`);
  },

  // Get unprocessed entries
  getUnprocessedEntries: async () => {
    const response = await api.get<ContextEntry[]>('/api/context/unprocessed/');
    return response.data;
  },

  // Get high importance entries
  getHighImportanceEntries: async () => {
    const response = await api.get<ContextEntry[]>('/api/context/high_importance/');
    return response.data;
  },

  // Get entries by source
  getEntriesBySource: async (sourceType: string) => {
    const response = await api.get<ContextEntry[]>(`/api/context/by_source/?source_type=${sourceType}`);
    return response.data;
  },

  // Reprocess context entry
  reprocessEntry: async (id: number) => {
    const response = await api.post<ContextEntry>(`/api/context/${id}/reprocess/`);
    return response.data;
  },

  // Bulk process entries
  bulkProcess: async () => {
    const response = await api.post('/api/context/bulk_process/');
    return response.data;
  },

  // Get context statistics
  getStatistics: async () => {
    const response = await api.get<ContextStatistics>('/api/context/statistics/');
    return response.data;
  },

  // Get context insights
  getInsights: async () => {
    const response = await api.get('/api/context/insights/');
    return response.data;
  },

  // Process context entry with AI
  processWithAI: async (id: number) => {
    const response = await api.post<ContextEntry>(`/api/context/${id}/process/`);
    return response.data;
  },
}; 