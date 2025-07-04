# Smart Todo API Documentation

## 🚀 Overview

The Smart Todo API provides a comprehensive task management system with AI-powered features, context processing, and advanced filtering capabilities.

## 📋 Base URL
```
http://localhost:8000/api/
```

## 🔐 Authentication
Currently using `AllowAny` permissions for development. In production, implement proper authentication.

---

## 🏷️ Category Endpoints

### List Categories
```http
GET /api/categories/
```

### Create Category
```http
POST /api/categories/
Content-Type: application/json

{
    "name": "Work",
    "color": "#3B82F6"
}
```

### Get Category Detail
```http
GET /api/categories/{id}/
```

### Update Category
```http
PUT /api/categories/{id}/
Content-Type: application/json

{
    "name": "Updated Work",
    "color": "#EF4444"
}
```

### Delete Category
```http
DELETE /api/categories/{id}/
```

### Popular Categories
```http
GET /api/categories/popular/
```

### Increment Usage Count
```http
POST /api/categories/{id}/increment_usage/
```

---

## 📝 Task Endpoints

### List Tasks
```http
GET /api/tasks/
```

**Query Parameters:**
- `status`: Filter by status (pending, in_progress, completed)
- `priority`: Filter by priority (1-4)
- `category`: Filter by category ID
- `search`: Search in title and description
- `ordering`: Sort by field (-field for descending)

**Examples:**
```http
GET /api/tasks/?status=pending&priority=3
GET /api/tasks/?search=meeting&ordering=-created_at
```

### Create Task
```http
POST /api/tasks/
Content-Type: application/json

{
    "title": "Complete project presentation",
    "description": "Prepare slides for quarterly review",
    "category": 1,
    "priority": 3,
    "status": "pending"
}
```

**AI Enhancement:** Tasks are automatically enhanced with AI analysis including priority scoring, deadline suggestions, and enhanced descriptions.

### Get Task Detail
```http
GET /api/tasks/{id}/
```

### Update Task
```http
PUT /api/tasks/{id}/
Content-Type: application/json

{
    "title": "Updated task title",
    "description": "Updated description",
    "priority": 4
}
```

### Delete Task
```http
DELETE /api/tasks/{id}/
```

### Special Task Endpoints

#### Overdue Tasks
```http
GET /api/tasks/overdue/
```

#### High Priority Tasks
```http
GET /api/tasks/high_priority/
```

#### Today's Tasks
```http
GET /api/tasks/today/
```

#### Mark Task as Completed
```http
POST /api/tasks/{id}/mark_completed/
```

#### Manual AI Enhancement
```http
POST /api/tasks/{id}/enhance_with_ai/
```

#### Task Statistics
```http
GET /api/tasks/statistics/
```

**Response:**
```json
{
    "total_tasks": 25,
    "pending_tasks": 10,
    "completed_tasks": 12,
    "in_progress_tasks": 3,
    "priority_distribution": {
        "priority_1": 5,
        "priority_2": 8,
        "priority_3": 7,
        "priority_4": 5
    },
    "category_distribution": {
        "Work": 15,
        "Personal": 10
    }
}
```

#### Bulk Update Status
```http
POST /api/tasks/bulk_update_status/
Content-Type: application/json

{
    "task_ids": [1, 2, 3],
    "status": "completed"
}
```

---

## 📚 Context Endpoints

### List Context Entries
```http
GET /api/context/
```

**Query Parameters:**
- `source_type`: Filter by source (whatsapp, email, notes, manual)
- `search`: Search in content
- `ordering`: Sort by field

### Create Context Entry
```http
POST /api/context/
Content-Type: application/json

{
    "content": "Meeting with client scheduled for Friday",
    "source_type": "email"
}
```

**AI Processing:** Context entries are automatically processed for sentiment analysis, importance scoring, and keyword extraction.

### Get Context Entry Detail
```http
GET /api/context/{id}/
```

### Update Context Entry
```http
PUT /api/context/{id}/
Content-Type: application/json

{
    "content": "Updated context content",
    "source_type": "whatsapp"
}
```

### Delete Context Entry
```http
DELETE /api/context/{id}/
```

### Special Context Endpoints

#### Unprocessed Entries
```http
GET /api/context/unprocessed/
```

#### High Importance Entries
```http
GET /api/context/high_importance/
```

#### Entries by Source
```http
GET /api/context/by_source/?source_type=email
```

#### Manual Reprocessing
```http
POST /api/context/{id}/reprocess/
```

#### Bulk Processing
```http
POST /api/context/bulk_process/
```

#### Context Statistics
```http
GET /api/context/statistics/
```

**Response:**
```json
{
    "total_entries": 50,
    "processed_entries": 45,
    "unprocessed_entries": 5,
    "processing_rate": 90.0,
    "source_distribution": {
        "email": 20,
        "whatsapp": 15,
        "notes": 10,
        "manual": 5
    },
    "sentiment_distribution": {
        "positive": 25,
        "neutral": 15,
        "negative": 10
    },
    "average_scores": {
        "sentiment": 0.65,
        "importance": 0.72
    }
}
```

#### AI Insights
```http
GET /api/context/insights/
```

**Response:**
```json
{
    "recent_important_entries": [...],
    "top_keywords": [
        {"keyword": "meeting", "count": 15},
        {"keyword": "project", "count": 12}
    ],
    "sentiment_trend": [
        {
            "date": "2024-01-15",
            "sentiment": 0.7,
            "importance": 0.8
        }
    ]
}
```

---

## 🔍 Advanced Features

### Filtering
All list endpoints support filtering by model fields:
- Tasks: `status`, `priority`, `category`
- Context: `source_type`, `processed_at`

### Search
Search functionality available on:
- Tasks: `title`, `description`
- Context: `content`

### Ordering
Sort by any model field:
- `ordering=field` (ascending)
- `ordering=-field` (descending)

### Pagination
All list endpoints are paginated with 20 items per page:
```json
{
    "count": 100,
    "next": "http://localhost:8000/api/tasks/?page=2",
    "previous": null,
    "results": [...]
}
```

---

## 🤖 AI Features

### Automatic Task Enhancement
- **Priority Scoring**: AI analyzes task content and context to assign priority scores
- **Deadline Suggestions**: Intelligent deadline recommendations based on task complexity
- **Description Enhancement**: Context-aware task descriptions with actionable insights
- **Context Tags**: Automatic extraction of relevant context tags

### Context Processing
- **Sentiment Analysis**: Analyze emotional tone of context entries
- **Importance Scoring**: Determine relevance and importance of context
- **Keyword Extraction**: Extract key terms and topics
- **Insights Generation**: Generate actionable insights from context data

### Manual AI Operations
- Trigger AI enhancement for specific tasks
- Reprocess context entries with updated AI models
- Bulk processing for multiple items

---

## 📊 Response Formats

### Task Response
```json
{
    "id": 1,
    "title": "Complete project presentation",
    "description": "Prepare slides for quarterly review",
    "category": 1,
    "category_name": "Work",
    "category_color": "#3B82F6",
    "priority_score": 8.5,
    "priority": 3,
    "priority_label": "High",
    "deadline": "2024-01-20T17:00:00Z",
    "status": "pending",
    "status_label": "Pending",
    "ai_enhanced_description": "Enhanced description with AI insights...",
    "context_tags": ["quarterly review", "funding approval"],
    "days_until_deadline": 3,
    "is_overdue": false,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
}
```

### Context Entry Response
```json
{
    "id": 1,
    "content": "Meeting with client scheduled for Friday",
    "source_type": "email",
    "source_type_label": "Email",
    "processed_insights": {
        "word_count": 6,
        "content_length": 42,
        "analysis_timestamp": "2024-01-15T10:00:00Z",
        "processing_method": "ai_enhanced"
    },
    "keywords": ["meeting", "client", "friday"],
    "sentiment_score": 0.6,
    "importance_score": 0.8,
    "processing_status": "processed",
    "created_at": "2024-01-15T10:00:00Z",
    "processed_at": "2024-01-15T10:00:00Z"
}
```

---

## 🚨 Error Handling

### Standard Error Response
```json
{
    "error": "Error message",
    "detail": "Detailed error information"
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

---

## 🔧 Development

### Running the Server
```bash
cd backend
python manage.py runserver 0.0.0.0:8000
```

### Testing Endpoints
Use the provided test script:
```bash
python test_api_endpoints.py
```

### Admin Interface
Access Django admin at: `http://localhost:8000/admin/`

---

## 📈 Future Enhancements

- [ ] User authentication and authorization
- [ ] Real-time notifications
- [ ] Advanced AI models integration
- [ ] Mobile app support
- [ ] Webhook integrations
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Export/import functionality

# API Endpoints

| Method | Endpoint                                 | Description                                 |
|--------|------------------------------------------|---------------------------------------------|
| GET    | /api/tasks/                              | List all tasks                              |
| POST   | /api/tasks/                              | Create a new task                           |
| GET    | /api/tasks/{id}/                         | Retrieve a task                             |
| PUT    | /api/tasks/{id}/                         | Update a task                               |
| DELETE | /api/tasks/{id}/                         | Delete a task                               |
| POST   | /api/tasks/{id}/enhance_with_ai/         | AI-enhance a task                           |
| POST   | /api/tasks/{id}/suggest_deadline/        | AI deadline suggestion                      |
| POST   | /api/tasks/{id}/mark_completed/          | Mark task as completed                      |
| GET    | /api/tasks/statistics/                   | Task statistics/analytics                   |
| GET    | /api/categories/                         | List all categories                         |
| POST   | /api/categories/                         | Create a new category                       |
| GET    | /api/categories/{id}/                    | Retrieve a category                         |
| PUT    | /api/categories/{id}/                    | Update a category                           |
| DELETE | /api/categories/{id}/                    | Delete a category                           |
| GET    | /api/context/                            | List all context entries                    |
| POST   | /api/context/                            | Add a context entry                         |
| GET    | /api/context/{id}/                       | Retrieve a context entry                    |
| PUT    | /api/context/{id}/                       | Update a context entry                      |
| DELETE | /api/context/{id}/                       | Delete a context entry                      |
| GET    | /api/context/statistics/                 | Context analytics/statistics                |
| POST   | /api/context/{id}/reprocess/             | Reprocess a context entry with AI           |
| POST   | /api/tasks/{id}/accept_suggested_deadline/| Accept AI-suggested deadline               |
| ...    | ...                                      | ...                                         |

See the root API endpoint (`/`) for a full list and descriptions. 