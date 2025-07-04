from context.models import ContextEntry
from ai_engine import ai_manager

def get_recent_context_entries(n=5):
    context_entries = ContextEntry.objects.order_by('-created_at')[:n]
    return [
        {
            'content': entry.content,
            'source_type': entry.source_type,
            'sentiment_score': getattr(entry, 'sentiment_score', None),
            'importance_score': getattr(entry, 'importance_score', None),
            'keywords': getattr(entry, 'keywords', None)
        }
        for entry in context_entries
    ]

def ai_analyze_task_priority(task_data, context_data):
    return ai_manager.analyze_task_priority(task_data, context_data)

def ai_suggest_deadline(task_data, current_workload):
    return ai_manager.suggest_deadline(task_data, current_workload)

def ai_enhance_task_description(task_data, context_data):
    return ai_manager.enhance_task_description(task_data, context_data) 