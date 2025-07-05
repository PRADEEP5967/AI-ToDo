# Smart Todo

AI-powered productivity app with Django backend and Next.js + Tailwind CSS frontend.

---

## 🚀 Project Overview
- **Backend:** Django REST API with AI-powered task management, context processing, and analytics.
- Connect AI engine to a real LLM.
- **Frontend:** Next.js (App Router) with Tailwind CSS for a modern, responsive UI.
- **Features:**
  - Smart task creation, editing, and AI suggestions
  - Context input (messages, emails, notes)
  - Analytics dashboard
  - Category management
  - Bulk actions, dark mode, onboarding, and more
  - Use feedback/corrections to improve AI suggestions

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
# Smart Todo Frontend

A modern, AI-powered task management frontend built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

### ✨ Modern UI/UX
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Dark/Light Mode Ready** - Built with Tailwind CSS for easy theming
- **Smooth Animations** - Modern transitions and hover effects
- **Accessible** - Follows WCAG guidelines for accessibility

### 📝 Task Management
- **Create Tasks** - Add new tasks with title, description, category, priority, and deadline
- **Edit Tasks** - Modify existing tasks with a user-friendly modal
- **Delete Tasks** - Remove tasks with confirmation
- **Mark Complete** - One-click task completion
- **AI Enhancement** - Automatic task enhancement with AI analysis

### 🔍 Advanced Filtering & Search
- **Real-time Search** - Search tasks by title and description
- **Status Filtering** - Filter by pending, in progress, or completed
- **Priority Filtering** - Filter by priority levels (1-4)
- **Category Filtering** - Filter by task categories

### 📊 Analytics Dashboard
- **Task Statistics** - View total, pending, in progress, and completed tasks
- **Visual Cards** - Beautiful statistics cards with icons
- **Real-time Updates** - Statistics update automatically

### 🤖 AI Integration
- **Automatic Enhancement** - Tasks are enhanced with AI when created
- **Manual Enhancement** - Trigger AI enhancement for specific tasks
- **Priority Scoring** - AI suggests optimal priority levels
- **Deadline Suggestions** - Intelligent deadline recommendations

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Utilities**: clsx, tailwind-merge

## 📦 Installation

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the frontend directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000/api` |

### Backend Requirements

Make sure your Django backend is running on `http://localhost:8000` with:
- CORS configured for `http://localhost:3000`
- All API endpoints available
- Database migrations applied

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Main dashboard
│   │   └── globals.css     # Global styles
│   ├── components/         # Reusable components
│   │   └── TaskModal.tsx   # Task creation/edit modal
│   └── lib/               # Utilities and configurations
│       ├── api.ts         # API client and types
│       └── utils.ts       # Utility functions
├── public/                # Static assets
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── README.md             # This file
```

## 🎨 UI Components

### Task Modal
- **Form Validation** - Real-time validation with Zod
- **Category Selection** - Dropdown with available categories
- **Priority Levels** - Visual priority selection
- **Deadline Picker** - Date and time picker
- **Loading States** - Loading indicators during API calls

### Task Cards
- **Priority Badges** - Color-coded priority indicators
- **Status Badges** - Visual status representation
- **AI Enhanced Content** - Highlighted AI enhancements
- **Action Buttons** - Quick actions for each task

### Statistics Cards
- **Visual Icons** - Lucide React icons for each metric
- **Real-time Data** - Live statistics from the backend
- **Responsive Grid** - Adapts to different screen sizes

## 🔌 API Integration

The frontend integrates with the Django backend through a comprehensive API client:

### Task Operations
- `GET /api/tasks/` - List all tasks with filtering
- `POST /api/tasks/` - Create new task
- `PUT /api/tasks/{id}/` - Update task
- `DELETE /api/tasks/{id}/` - Delete task
- `POST /api/tasks/{id}/mark_completed/` - Mark as completed
- `POST /api/tasks/{id}/enhance_with_ai/` - AI enhancement

### Category Operations
- `GET /api/categories/` - List all categories
- `POST /api/categories/` - Create new category
- `PUT /api/categories/{id}/` - Update category
- `DELETE /api/categories/{id}/` - Delete category

### Statistics
- `GET /api/tasks/statistics/` - Task statistics
- `GET /api/tasks/overdue/` - Overdue tasks
- `GET /api/tasks/high_priority/` - High priority tasks

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Code Quality

- **TypeScript** - Full type safety
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting (via Tailwind CSS)
- **Zod** - Runtime type validation

## 🎯 Future Enhancements

- [ ] **Real-time Updates** - WebSocket integration
- [ ] **Offline Support** - Service Worker for offline functionality
- [ ] **Advanced Analytics** - Charts and graphs
- [ ] **Team Collaboration** - Multi-user support
- [ ] **Mobile App** - React Native version
- [ ] **Advanced AI Features** - More AI-powered insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the [API Documentation](../backend/API_ENDPOINTS.md)
- Review the [Backend README](../backend/README.md)
- Open an issue on GitHub

---









Testing Results:
✅ Root endpoint (http://localhost:8000/) - Returns comprehensive API information
✅ Tasks endpoint (http://localhost:8000/api/tasks/) - Returns existing tasks
✅ Categories endpoint (http://localhost:8000/api/categories/) - Returns existing categories


Benefits:
No more 404 errors at the root URL
Developer-friendly API discovery
Clear documentation of available endpoints
Professional appearance for API consumers
Easy navigation to different API sections







endpoints": {
            "tasks": [
                "/api/tasks/",
                "/api/tasks/{id}/",
                "/api/tasks/{id}/ai_enhance/",
                "/api/tasks/{id}/suggest_deadline/",
                "/api/tasks/{id}/prioritize/",
                "/api/tasks/{id}/categorize/",
                "/api/tasks/batch_ai_enhance/",
                "/api/tasks/statistics/",
                "/api/tasks/search/",
                "/api/tasks/filter/",
                "/api/tasks/batch_update/",
                "/api/tasks/export/",
                "/api/tasks/import/",
                "/api/tasks/ai_pipeline/",
                "/api/tasks/analytics/",
                "/api/tasks/feedback/",
                "/api/tasks/external_events/",
                "/api/tasks/corrections/",
                "/api/tasks/corrections/analyze/",
            ],
            "categories": [
                "/api/categories/",
                "/api/categories/{id}/",
                "/api/categories/{id}/tasks/",
                "/api/categories/statistics/",
            ],
            "context": [
                "/api/context/",
                "/api/context/{id}/",
                "/api/context/process/",
                "/api/context/feedback/",
                "/api/context/external_events/",
            ],
            "authentication": [
                "/api-auth/",
            ],
            "admin": [
                "/admin/",



**Happy coding! 🚀**

## 🧩 Backend Requirements

See [`backend/requirements.txt`](backend/requirements.txt) for all Python dependencies.

---

## 📄 License
MIT (or your preferred license) 
