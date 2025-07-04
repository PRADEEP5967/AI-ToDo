# AI Integration Module for Task Management
from .task_analyzer import TaskAnalyzer

# Singleton or factory for AI operations
ai_manager = TaskAnalyzer()

# Example usage:
# ai_manager.analyze_task_priority(task_data, context_data)
# ai_manager.suggest_deadline(task_data, current_workload)
# ai_manager.enhance_task_description(task_data, context_data)
