"use client";

import { useState } from "react";
import Toast from "@/components/Toast";
import Image from "next/image";

export default function ProfilePage() {
  const [name, setName] = useState("Jane Doe");
  const [email, setEmail] = useState("jane@example.com");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editEmail, setEditEmail] = useState(email);
  const [editAvatar, setEditAvatar] = useState<string | null>(avatar);
  const [showToast, setShowToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fake stats
  const stats = {
    tasks: 42,
    completed: 30,
    context: 18,
  };

  const handleEdit = () => {
    setEditName(name);
    setEditEmail(email);
    setEditAvatar(avatar);
    setEditOpen(true);
  };

  const handleSave = () => {
    setName(editName);
    setEmail(editEmail);
    setAvatar(editAvatar);
    setEditOpen(false);
    setShowToast({ message: "Profile updated!", type: "success" });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setEditAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    setShowToast({ message: "Logged out! (demo)", type: "success" });
  };

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    setShowToast({ message: "Account deleted! (demo)", type: "success" });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {showToast && <Toast message={showToast.message} type={showToast.type} onClose={() => setShowToast(null)} />}
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">User Profile</h1>
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-24 h-24 mb-2">
            <Image
              src={avatar || "/window.svg"}
              alt="Avatar"
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover border"
            />
            <button
              className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 hover:bg-blue-700"
              onClick={handleEdit}
              title="Edit Avatar"
            >
              ✎
            </button>
          </div>
          <div className="font-medium text-gray-700">{name}</div>
          <div className="text-gray-500 text-sm">{email}</div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{stats.tasks}</div>
            <div className="text-xs text-gray-500">Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600">{stats.context}</div>
            <div className="text-xs text-gray-500">Context</div>
          </div>
        </div>
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Dark mode:</span>
            <span className="text-xs text-gray-400">Use the toggle in the top-right corner</span>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" onClick={handleEdit}>Edit Profile</button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300" onClick={handleLogout}>Logout</button>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700" onClick={() => setShowDeleteConfirm(true)}>Delete Account</button>
        </div>
        {/* Edit Modal */}
        {editOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
              <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>
              <div className="flex flex-col items-center mb-4">
                <label className="relative w-20 h-20 cursor-pointer">
                  <Image
                    src={editAvatar || "/window.svg"}
                    alt="Avatar"
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover border"
                  />
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleAvatarChange} />
                </label>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" onClick={handleSave}>Save</button>
                <button className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300" onClick={() => setEditOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
              <h2 className="text-lg font-semibold mb-4 text-red-600">Delete Account</h2>
              <p className="mb-4 text-gray-700">Are you sure you want to delete your account? This action cannot be undone.</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700" onClick={handleDelete}>Delete</button>
                <button className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 