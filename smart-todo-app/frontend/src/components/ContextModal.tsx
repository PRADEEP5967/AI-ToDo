'use client';

import { useState } from 'react';
import { X, Save, Loader2, MessageSquare, Mail, FileText, Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { contextApi, ContextEntry } from '@/lib/api';
import { cn } from '@/lib/utils';

const contextSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  source_type: z.enum(['whatsapp', 'email', 'notes', 'manual']),
});

type ContextFormData = z.infer<typeof contextSchema>;

interface ContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  context?: ContextEntry | null;
}

export default function ContextModal({ isOpen, onClose, onSuccess, context }: ContextModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContextFormData>({
    resolver: zodResolver(contextSchema),
    defaultValues: {
      content: context?.content || '',
      source_type: context?.source_type || 'manual',
    },
  });

  const onSubmit = async (data: ContextFormData) => {
    try {
      setLoading(true);
      setError('');

      if (context) {
        await contextApi.updateContextEntry(context.id, data);
      } else {
        await contextApi.createContextEntry(data);
      }

      onSuccess();
      onClose();
      reset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'notes':
        return <FileText className="w-4 h-4" />;
      case 'manual':
        return <Edit className="w-4 h-4" />;
      default:
        return <Edit className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {context ? 'Edit Context Entry' : 'Add Context Entry'}
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
              Source Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['whatsapp', 'email', 'notes', 'manual'] as const).map((type) => (
                <label
                  key={type}
                  className={cn(
                    "flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors",
                    "hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500"
                  )}
                >
                  <input
                    {...register('source_type')}
                    type="radio"
                    value={type}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2">
                    {getSourceTypeIcon(type)}
                    <span className="capitalize">{type}</span>
                  </div>
                </label>
              ))}
            </div>
            {errors.source_type && (
              <p className="text-red-600 text-sm mt-1">{errors.source_type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              {...register('content')}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter context content (conversation, email, notes, etc.)"
            />
            {errors.content && (
              <p className="text-red-600 text-sm mt-1">{errors.content.message}</p>
            )}
          </div>

          {context && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Processing Status</h3>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  context.processing_status === 'processed' && "bg-green-100 text-green-800",
                  context.processing_status === 'partially_processed' && "bg-yellow-100 text-yellow-800",
                  context.processing_status === 'pending' && "bg-gray-100 text-gray-800"
                )}>
                  {(context.processing_status ?? '').replace('_', ' ').toUpperCase()}
                </span>
                {context.processed_at && (
                  <span className="text-xs text-gray-500">
                    Processed: {new Date(context.processed_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              
              {context.processed_insights !== undefined && context.processed_insights !== null && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">AI Insights</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    {context.keywords && context.keywords.length > 0 && (
                      <div>
                        <strong>Keywords:</strong> {context.keywords.join(', ')}
                      </div>
                    )}
                    {context.sentiment_score !== null && (
                      <div>
                        <strong>Sentiment:</strong> {context.sentiment_score.toFixed(2)}
                      </div>
                    )}
                    {context.importance_score !== null && (
                      <div>
                        <strong>Importance:</strong> {context.importance_score.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                  {context ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 