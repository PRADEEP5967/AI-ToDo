from django.contrib import admin
from .models import Task, Category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'color', 'usage_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name']
    ordering = ['name']

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'priority', 'status', 'deadline', 'created_at']
    list_filter = ['status', 'priority', 'category', 'created_at']
    search_fields = ['title', 'description']
    ordering = ['-priority_score', '-created_at']
    date_hierarchy = 'created_at'
