"use client";

import { useState, useEffect } from "react";
import { categoryApi, Category } from "@/lib/api";
import CategoryModal from "@/components/CategoryModal";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { AxiosError } from "axios";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; category: Category | null }>({ open: false, category: null });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await categoryApi.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      let message = "Failed to load categories.";
      if (err && typeof err === 'object' && (err as AxiosError).isAxiosError) {
        const axiosErr = err as AxiosError;
        if (axiosErr.message) {
          message += ` Error: ${axiosErr.message}`;
        }
        if (axiosErr.response && axiosErr.response.data) {
          message += ` Response: ${JSON.stringify(axiosErr.response.data)}`;
        }
      }
      setError(message);
      console.error("Categories API error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };
  const handleEdit = (cat: Category) => {
    setSelectedCategory(cat);
    setIsModalOpen(true);
  };
  const handleDelete = (cat: Category) => {
    setDeleteConfirm({ open: true, category: cat });
  };
  const confirmDelete = async () => {
    if (!deleteConfirm.category) return;
    try {
      await categoryApi.deleteCategory(deleteConfirm.category.id);
      setDeleteConfirm({ open: false, category: null });
      await loadCategories();
    } catch {
      setError("Failed to delete category.");
    }
  };
  const handleModalSuccess = () => {
    loadCategories();
  };

  const testBackend = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/test-connection/');
      const data = await res.json();
      alert(JSON.stringify(data));
    } catch (e) {
      alert('Failed to reach backend: ' + e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <Plus className="w-4 h-4" /> New Category
          </button>
        </div>
        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg">{error}</div>}
        <div className="bg-white rounded-lg shadow divide-y">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No categories yet.</div>
          ) : (
            categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full bg-${cat.color}-500 border`} />
                  <span className="font-medium text-gray-800">{cat.name}</span>
                  <span className="text-xs text-gray-500">{cat.task_count} tasks</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(cat)} className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(cat)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <CategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
          category={selectedCategory}
        />
        {deleteConfirm.open && deleteConfirm.category && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Category</h3>
                <p className="text-gray-700 mb-4">Are you sure you want to delete <span className="font-bold">{deleteConfirm.category.name}</span>?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm({ open: false, category: null })}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <button onClick={testBackend}>Test Backend Connection</button>
      </div>
    </div>
  );
} 