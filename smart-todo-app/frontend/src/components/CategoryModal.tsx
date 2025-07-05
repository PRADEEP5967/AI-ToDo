'use client';

import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { categoryApi, Category } from '@/lib/api';
import { cn } from '@/lib/utils';

// Type for API error response
interface ApiErrorResponse {
  response?: {
    data?: string | {
      name?: string[];
      color?: string[];
      non_field_errors?: string[];
      [key: string]: unknown;
    };
    status?: number;
    statusText?: string;
  };
}

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().min(1, 'Color is required'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: Category | null;
}

const colorOptions = [
  { name: 'Red', value: 'red', class: 'bg-red-500' },
  { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
  { name: 'Yellow', value: 'yellow', class: 'bg-yellow-500' },
  { name: 'Green', value: 'green', class: 'bg-green-500' },
  { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
  { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
  { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
  { name: 'Gray', value: 'gray', class: 'bg-gray-500' },
  { name: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
  { name: 'Teal', value: 'teal', class: 'bg-teal-500' },
  { name: 'Cyan', value: 'cyan', class: 'bg-cyan-500' },
  { name: 'Lime', value: 'lime', class: 'bg-lime-500' },
];

export default function CategoryModal({ isOpen, onClose, onSuccess, category }: CategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      color: category?.color || 'blue',
    },
  });

  const selectedColor = watch('color');

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setLoading(true);
      setError('');

      console.log('Submitting category data:', data);

      if (category) {
        await categoryApi.updateCategory(category.id, data);
      } else {
        await categoryApi.createCategory(data);
      }

      onSuccess();
      onClose();
      reset();
    } catch (err: unknown) {
      console.error('Category submission error:', err);
      
      let errorMessage = 'An error occurred while saving the category.';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as ApiErrorResponse).response;
        if (response && response.data) {
          if (typeof response.data === 'string') {
            errorMessage = response.data;
          } else if (response.data.name) {
            errorMessage = `Name error: ${response.data.name.join(', ')}`;
          } else if (response.data.color) {
            errorMessage = `Color error: ${response.data.color.join(', ')}`;
          } else if (response.data.non_field_errors) {
            errorMessage = response.data.non_field_errors.join(', ');
          } else {
            errorMessage = JSON.stringify(response.data);
          }
        } else if (response && response.status) {
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {category ? 'Edit Category' : 'Create Category'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name *
            </label>
            <input
              {...register('name')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter category name"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((color) => (
                <label
                  key={color.value}
                  className={cn(
                    "flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors",
                    "hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500",
                    selectedColor === color.value && "ring-2 ring-blue-500 bg-blue-50"
                  )}
                >
                  <input
                    {...register('color')}
                    type="radio"
                    value={color.value}
                    className="sr-only"
                  />
                  <div className={cn("w-6 h-6 rounded-full mb-1", color.class)} />
                  <span className="text-xs text-gray-700">{color.name}</span>
                </label>
              ))}
            </div>
            {errors.color && (
              <p className="text-red-600 text-sm mt-1">{errors.color.message}</p>
            )}
          </div>

          {category && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Category Statistics</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  <strong>Total Tasks:</strong> {category.task_count}
                </div>
                <div>
                  <strong>Usage Count:</strong> {category.usage_count}
                </div>
                <div>
                  <strong>Created:</strong> {new Date(category.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {category ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 