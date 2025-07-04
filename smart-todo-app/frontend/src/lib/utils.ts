import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export function formatDate(date: string | Date) {
  if (!date) return 'No date';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
}

export function formatDateTime(date: string | Date) {
  if (!date) return 'No date';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy HH:mm');
}

export function formatRelativeTime(date: string | Date) {
  if (!date) return 'No date';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

// Priority utilities
export function getPriorityColor(priority: number) {
  switch (priority) {
    case 1:
      return 'bg-red-100 text-red-800 border-red-200';
    case 2:
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 3:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 4:
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getPriorityIcon(priority: number) {
  switch (priority) {
    case 1:
      return '🔥';
    case 2:
      return '⚡';
    case 3:
      return '📋';
    case 4:
      return '✅';
    default:
      return '📝';
  }
}

// Status utilities
export function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getStatusIcon(status: string) {
  switch (status) {
    case 'pending':
      return '⏳';
    case 'in_progress':
      return '🔄';
    case 'completed':
      return '✅';
    default:
      return '📝';
  }
}

// Source type utilities
export function getSourceTypeColor(sourceType: string) {
  switch (sourceType) {
    case 'whatsapp':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'email':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'notes':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'manual':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getSourceTypeIcon(sourceType: string) {
  switch (sourceType) {
    case 'whatsapp':
      return '💬';
    case 'email':
      return '📧';
    case 'notes':
      return '📝';
    case 'manual':
      return '✏️';
    default:
      return '📄';
  }
}

// Sentiment utilities
export function getSentimentColor(sentimentScore: number | null) {
  if (sentimentScore === null) return 'bg-gray-100 text-gray-800';
  if (sentimentScore >= 0.6) return 'bg-green-100 text-green-800';
  if (sentimentScore >= 0.4) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

export function getSentimentLabel(sentimentScore: number | null) {
  if (sentimentScore === null) return 'Unknown';
  if (sentimentScore >= 0.6) return 'Positive';
  if (sentimentScore >= 0.4) return 'Neutral';
  return 'Negative';
}

// Deadline utilities
export function getDeadlineStatus(daysUntilDeadline: number | null, isOverdue: boolean) {
  if (daysUntilDeadline === null) return { color: 'text-gray-500', label: 'No deadline' };
  if (isOverdue) return { color: 'text-red-600', label: 'Overdue' };
  if (daysUntilDeadline === 0) return { color: 'text-orange-600', label: 'Due today' };
  if (daysUntilDeadline === 1) return { color: 'text-orange-600', label: 'Due tomorrow' };
  if (daysUntilDeadline <= 3) return { color: 'text-yellow-600', label: `Due in ${daysUntilDeadline} days` };
  return { color: 'text-green-600', label: `Due in ${daysUntilDeadline} days` };
}

// Search and filtering utilities
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Local storage utilities
export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error: unknown) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function setToLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error: unknown) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
}

// Error handling utilities
export function handleApiError(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const err = error as { response?: { data?: { detail?: string; message?: string } }; message?: string };
    if (err.response?.data?.detail) {
      return err.response.data.detail;
    }
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    if (err.message) {
      return err.message;
    }
  }
  return 'An unexpected error occurred';
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Array utilities
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

// String utilities
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
} 