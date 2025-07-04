"""
URL configuration for smart_todo project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include

def api_root(request):
    return JsonResponse({
        "message": "Welcome to the Smart Todo API!",
        "version": "1.0.0",
        "description": "AI-powered task management with smart categorization and context awareness",
        "endpoints": {
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
            ]
        },
        "documentation": "Check individual endpoints for detailed API documentation",
        "features": [
            "AI-powered task prioritization",
            "Smart deadline suggestions",
            "Context-aware task management",
            "Intelligent categorization",
            "Batch operations",
            "Analytics and statistics",
            "User feedback integration",
            "External event processing"
        ]
    })

urlpatterns = [
    path('', api_root),
    path('admin/', admin.site.urls),
    path('', include('tasks.urls')),
    path('', include('context.urls')),
    path('api-auth/', include('rest_framework.urls')),
]
