"use client";

import { useState, useEffect, useCallback } from "react";
import { contextApi, ContextEntry } from "@/lib/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn, formatDate } from "@/lib/utils";
import { MessageSquare, Mail, FileText, Edit } from "lucide-react";
import Toast from "@/components/Toast";

const contextSchema = z.object({
  content: z.string().min(1, "Content is required"),
  source_type: z.enum(["whatsapp", "email", "notes", "manual"]),
});

type ContextFormData = z.infer<typeof contextSchema>;

export default function ContextInputPage() {
  const [entries, setEntries] = useState<ContextEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContextFormData>({
    resolver: zodResolver(contextSchema),
    defaultValues: { source_type: "manual" },
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await contextApi.getContextEntries();
      setEntries(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load context history.");
      showToast("Failed to load context history.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const onSubmit = async (data: ContextFormData) => {
    try {
      setError("");
      await contextApi.createContextEntry(data);
      reset({ content: "", source_type: data.source_type });
      await loadEntries();
      showToast("Context entry added.");
    } catch {
      setError("Failed to add context entry.");
      showToast("Failed to add context entry.", "error");
    }
  };

  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case "whatsapp": return <MessageSquare className="w-4 h-4" />;
      case "email": return <Mail className="w-4 h-4" />;
      case "notes": return <FileText className="w-4 h-4" />;
      case "manual": return <Edit className="w-4 h-4" />;
      default: return <Edit className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Daily Context Input</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 mb-8 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source Type</label>
            <div className="flex gap-2">
              {(["whatsapp", "email", "notes", "manual"] as const).map((type) => (
                <label key={type} className={cn(
                  "flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors",
                  "hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500"
                )}>
                  <input
                    {...register("source_type")}
                    type="radio"
                    value={type}
                    className="sr-only"
                  />
                  {getSourceTypeIcon(type)}
                  <span className="capitalize text-sm">{type}</span>
                </label>
              ))}
            </div>
            {errors.source_type && <p className="text-red-600 text-sm mt-1">{errors.source_type.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <textarea
              {...register("content")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Paste message, email, note, or write manually..."
            />
            {errors.content && <p className="text-red-600 text-sm mt-1">{errors.content.message}</p>}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Context
            </button>
          </div>
        </form>
        <h2 className="text-lg font-semibold mb-2 text-gray-800">Context History</h2>
        <div className="bg-white rounded-lg shadow divide-y">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No context entries yet.</div>
          ) : (
            entries.slice(0, 10).map((entry) => (
              <div key={entry.id} className="p-4 flex items-start gap-3">
                <div className="mt-1">{getSourceTypeIcon(entry.source_type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="capitalize text-xs text-gray-600">{entry.source_type_label}</span>
                    <span className="text-xs text-gray-400">{formatDate(entry.created_at)}</span>
                  </div>
                  <div className="text-gray-800 text-sm mt-1 whitespace-pre-line">{entry.content}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 