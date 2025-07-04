# Smart Todo

AI-powered productivity app with Django backend and Next.js + Tailwind CSS frontend.

---

## 🚀 Project Overview
- **Backend:** Django REST API with AI-powered task management, context processing, and analytics.
- **Frontend:** Next.js (App Router) with Tailwind CSS for a modern, responsive UI.
- **Features:**
  - Smart task creation, editing, and AI suggestions
  - Context input (messages, emails, notes)
  - Analytics dashboard
  - Category management
  - Bulk actions, dark mode, onboarding, and more

---

## 🖼️ Screenshots

> Add screenshots of your UI here (Dashboard, Context Input, Analytics, etc.)

---

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd smart-todo-app
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

- Visit [http://localhost:3000](http://localhost:3000) for the frontend
- Visit [http://localhost:8000](http://localhost:8000) for the backend API

---

## 📖 API Documentation

See `backend/API_ENDPOINTS.md` for a full list of endpoints.

Example endpoints:
- `GET /api/tasks/` — List all tasks
- `POST /api/tasks/` — Create a new task
- `POST /api/tasks/{id}/enhance_with_ai/` — AI-enhance a task
- `POST /api/tasks/{id}/suggest_deadline/` — AI deadline suggestion
- `GET /api/context/` — List context entries
- `POST /api/context/` — Add context entry
- ...and more

---

## 📝 Sample Tasks & AI Suggestions

> Add screenshots or JSON samples of tasks and AI suggestions from your system here.

---

## 🧩 Backend Requirements

See [`backend/requirements.txt`](backend/requirements.txt) for all Python dependencies.

---

## 📄 License
MIT (or your preferred license) 