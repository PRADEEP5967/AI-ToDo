"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { taskApi, contextApi, TaskStatistics, ContextStatistics } from "@/lib/api";

const COLORS = ["#2563eb", "#f59e42", "#22c55e", "#e11d48", "#a21caf", "#fbbf24", "#14b8a6", "#6366f1"];

export default function AnalyticsPage() {
  const [taskStats, setTaskStats] = useState<TaskStatistics | null>(null);
  const [contextStats, setContextStats] = useState<ContextStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [taskStatsData, contextStatsData] = await Promise.all([
        taskApi.getStatistics(),
        contextApi.getStatistics(),
      ]);
      setTaskStats(taskStatsData);
      setContextStats(contextStatsData);
    } catch {
      setError("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for charts
  const priorityData = taskStats
    ? [
        { name: "Priority 1", value: taskStats.priority_distribution.priority_1 },
        { name: "Priority 2", value: taskStats.priority_distribution.priority_2 },
        { name: "Priority 3", value: taskStats.priority_distribution.priority_3 },
        { name: "Priority 4", value: taskStats.priority_distribution.priority_4 },
      ]
    : [];

  const categoryData = taskStats
    ? Object.entries(taskStats.category_distribution).map(([name, value]) => ({ name, value }))
    : [];

  const contextSourceData = contextStats
    ? Object.entries(contextStats.source_distribution).map(([name, value]) => ({ name, value }))
    : [];

  const contextSentimentData = contextStats
    ? Object.entries(contextStats.sentiment_distribution).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Analytics Dashboard</h1>
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        )}
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Task Priority Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Task Priority Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={priorityData}>
                  <XAxis dataKey="name" stroke="#8884d8" />
                  <YAxis allowDecimals={false} stroke="#8884d8" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Task Category Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Task Category Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#2563eb"
                    label
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Context Source Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Context Source Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={contextSourceData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#22c55e"
                    label
                  >
                    {contextSourceData.map((entry, index) => (
                      <Cell key={`cell-source-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Context Sentiment Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Context Sentiment Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={contextSentimentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#e11d48"
                    label
                  >
                    {contextSentimentData.map((entry, index) => (
                      <Cell key={`cell-sentiment-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 