from django.contrib import admin
from .models import ContextEntry

@admin.register(ContextEntry)
class ContextEntryAdmin(admin.ModelAdmin):
    list_display = ['source_type', 'content_preview', 'sentiment_score', 'importance_score', 'created_at', 'processed_at']
    list_filter = ['source_type', 'created_at', 'processed_at']
    search_fields = ['content']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    
    def content_preview(self, obj):
        return obj.content[:100] + "..." if len(obj.content) > 100 else obj.content
    content_preview.short_description = 'Content Preview'
