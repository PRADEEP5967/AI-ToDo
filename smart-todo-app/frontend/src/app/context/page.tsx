'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, MessageSquare, FileText, Edit, Brain, RefreshCw, Trash2 } from 'lucide-react';
import { contextApi, ContextEntry, ContextStatistics } from '@/lib/api';
import { cn, formatDate, getSourceTypeColor, getSourceTypeIcon, getSentimentColor, getSentimentLabel } from '@/lib/utils';
import ContextModal from '@/components/ContextModal';

type PaginatedResponse<T> = { results: T[] };
function isPaginated<T>(data: unknown): data is PaginatedResponse<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'results' in data &&
    Array.isArray((data as { results?: unknown }).results)
  );
}

export default function ContextPage() {
  const [contextEntries, setContextEntries] = useState<ContextEntry[]>([]);
  const [statistics, setStatistics] = useState<ContextStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContext, setSelectedContext] = useState<ContextEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; context: ContextEntry | null }>({ open: false, context: null });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [contextData, statsData] = await Promise.all([
        contextApi.getContextEntries(),
        contextApi.getStatistics(),
      ]);
      setContextEntries(isPaginated<ContextEntry>(contextData) ? contextData.results : (contextData as unknown as ContextEntry[]));
      setStatistics(statsData);
    } catch {
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = contextEntries.filter(entry => {
    const matchesSearch = entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = sourceFilter === 'all' || entry.source_type === sourceFilter;
    const matchesStatus = statusFilter === 'all' || entry.processing_status === statusFilter;
    return matchesSearch && matchesSource && matchesStatus;
  });

  const handleProcessWithAI = async (entryId: number) => {
    try {
      await contextApi.processWithAI(entryId);
      await loadData();
    } catch {
      setError('Failed to process entry with AI.');
    }
  };

  const handleCreateContext = () => {
    setSelectedContext(null);
    setIsModalOpen(true);
  };

  const handleEditContext = (context: ContextEntry) => {
    setSelectedContext(context);
    setIsModalOpen(true);
  };

  const handleDeleteContext = (context: ContextEntry) => {
    setDeleteConfirm({ open: true, context });
  };

  const confirmDeleteContext = async () => {
    if (!deleteConfirm.context) return;
    try {
      await contextApi.deleteContextEntry(deleteConfirm.context.id);
      setDeleteConfirm({ open: false, context: null });
      await loadData();
    } catch {
      setError('Failed to delete context entry.');
    }
  };

  const handleModalSuccess = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Context Management</h1>
              <p className="text-gray-600">AI-Powered Context Processing & Insights</p>
            </div>
            <button 
              onClick={handleCreateContext}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Context
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Entries</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.total_entries}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Brain className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Processed</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.processed_entries}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <RefreshCw className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Processing Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{(statistics.processing_rate * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Sentiment</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.average_scores.sentiment.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search context entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Sources</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="notes">Notes</option>
                <option value="manual">Manual</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="partially_processed">Partially Processed</option>
                <option value="processed">Processed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Context Entries List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Context Entries ({filteredEntries.length})</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredEntries.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="text-gray-400 mb-4">
                  <FileText className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-600">No context entries found. Add your first entry to get started!</p>
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <div key={entry.id} className="px-6 py-4 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => handleEditContext(entry)}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full border flex items-center gap-1",
                          getSourceTypeColor(entry.source_type)
                        )}>
                          {getSourceTypeIcon(entry.source_type)} {entry.source_type_label}
                        </span>
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full border",
                          entry.processing_status === 'processed' && "bg-green-100 text-green-800 border-green-200",
                          entry.processing_status === 'partially_processed' && "bg-yellow-100 text-yellow-800 border-yellow-200",
                          entry.processing_status === 'pending' && "bg-gray-100 text-gray-800 border-gray-200"
                        )}>
                          {(entry.processing_status ?? '').replace('_', ' ').toUpperCase()}
                        </span>
                        {entry.sentiment_score !== null && (
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full border",
                            getSentimentColor(entry.sentiment_score)
                          )}>
                            {getSentimentLabel(entry.sentiment_score)}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-2 line-clamp-2">{entry.content}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Created: {formatDate(entry.created_at)}</span>
                        {entry.processed_at && (
                          <span>Processed: {formatDate(entry.processed_at)}</span>
                        )}
                        {entry.importance_score !== null && (
                          <span>Importance: {entry.importance_score.toFixed(2)}</span>
                        )}
                      </div>
                      
                      {entry.keywords && entry.keywords.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {entry.keywords.slice(0, 5).map((keyword, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {keyword}
                            </span>
                          ))}
                          {entry.keywords.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{entry.keywords.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleProcessWithAI(entry.id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Process with AI"
                      >
                        <Brain className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditContext(entry)}
                        className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                        title="Edit entry"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContext(entry)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Context Modal */}
      <ContextModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        context={selectedContext}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm.open && deleteConfirm.context && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Context Entry</h3>
              <p className="text-gray-700 mb-4">Are you sure you want to delete this context entry?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm({ open: false, context: null })}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteContext}
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