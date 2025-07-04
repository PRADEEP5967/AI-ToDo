from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Task, Category
from .serializers import (
    TaskSerializer, CategorySerializer, TaskListSerializer, 
    TaskDetailSerializer, TaskCreateSerializer
)
from ai_engine import ai_manager
from context.models import ContextEntry
from rest_framework.throttling import UserRateThrottle
from .services import get_recent_context_entries, ai_analyze_task_priority, ai_suggest_deadline, ai_enhance_task_description
from django.http import JsonResponse

class AIPostThrottle(UserRateThrottle):
    rate = '10/minute'

class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for Category model"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'usage_count', 'created_at']
    ordering = ['name']
    
    @action(detail=True, methods=['post'])
    def increment_usage(self, request, pk=None):
        """Increment usage count for a category"""
        category = self.get_object()
        category.usage_count += 1
        category.save()
        return Response({'status': 'Usage count incremented'})
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get most popular categories"""
        popular_categories = Category.objects.order_by('-usage_count')[:5]
        serializer = self.get_serializer(popular_categories, many=True)
        return Response(serializer.data)

class TaskViewSet(viewsets.ModelViewSet):
    """ViewSet for Task model with AI enhancement"""
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'category']
    search_fields = ['title', 'description']
    ordering_fields = ['priority_score', 'deadline', 'created_at', 'updated_at']
    ordering = ['-priority_score', '-created_at']
    pagination_class = None  # Use default pagination from settings
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return TaskListSerializer
        elif self.action == 'retrieve':
            return TaskDetailSerializer
        elif self.action == 'create':
            return TaskCreateSerializer
        return TaskSerializer
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue tasks"""
        from datetime import datetime
        overdue_tasks = Task.objects.filter(
            deadline__lt=datetime.now(),
            status__in=['pending', 'in_progress']
        )
        serializer = self.get_serializer(overdue_tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def high_priority(self, request):
        """Get high priority tasks"""
        high_priority_tasks = Task.objects.filter(
            priority__in=[3, 4],  # High and Critical
            status__in=['pending', 'in_progress']
        )
        serializer = self.get_serializer(high_priority_tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get tasks due today"""
        from datetime import datetime, timedelta
        today = datetime.now().date()
        tomorrow = today + timedelta(days=1)
        
        today_tasks = Task.objects.filter(
            deadline__date=today,
            status__in=['pending', 'in_progress']
        )
        serializer = self.get_serializer(today_tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """Mark a task as completed"""
        task = self.get_object()
        task.status = 'completed'
        task.save()
        serializer = self.get_serializer(task)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def enhance_with_ai(self, request, pk=None):
        """Manually trigger AI enhancement for a task"""
        task = self.get_object()
        serializer = TaskSerializer()
        serializer._enhance_task_with_ai(task)
        
        # Refresh the task from database
        task.refresh_from_db()
        serializer = self.get_serializer(task)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get task statistics"""
        total_tasks = Task.objects.count()
        pending_tasks = Task.objects.filter(status='pending').count()
        completed_tasks = Task.objects.filter(status='completed').count()
        in_progress_tasks = Task.objects.filter(status='in_progress').count()
        
        # Priority distribution
        priority_stats = {}
        for priority in range(1, 5):
            priority_stats[f'priority_{priority}'] = Task.objects.filter(priority=priority).count()
        
        # Category distribution
        category_stats = {}
        for category in Category.objects.all():
            category_stats[category.name] = category.task_set.count()
        
        return Response({
            'total_tasks': total_tasks,
            'pending_tasks': pending_tasks,
            'completed_tasks': completed_tasks,
            'in_progress_tasks': in_progress_tasks,
            'priority_distribution': priority_stats,
            'category_distribution': category_stats
        })
    
    @action(detail=False, methods=['post'])
    def bulk_update_status(self, request):
        """Bulk update task statuses"""
        task_ids = request.data.get('task_ids', [])
        new_status = request.data.get('status')
        
        if not task_ids or not new_status:
            return Response(
                {'error': 'task_ids and status are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_status not in ['pending', 'in_progress', 'completed']:
            return Response(
                {'error': 'Invalid status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        updated_count = Task.objects.filter(id__in=task_ids).update(status=new_status)
        return Response({'updated_count': updated_count})

    @action(detail=False, methods=['post'], throttle_classes=[AIPostThrottle])
    def ai_suggestions(self, request):
        """Return AI-powered task suggestions or prioritization."""
        # Extract input parameters
        user_context = request.data.get('context', None)
        preferences = request.data.get('preferences', None)
        current_task_load = request.data.get('current_task_load', None)
        task_details = request.data.get('tasks', None)

        # Fetch tasks to consider
        if task_details:
            tasks = []
            for t in task_details:
                if 'id' in t:
                    try:
                        tasks.append(Task.objects.get(id=t['id']))
                    except Task.DoesNotExist:
                        continue
                else:
                    continue
        else:
            tasks = Task.objects.all()

        # Use provided context or fetch recent
        if user_context:
            context_data = user_context
        else:
            context_data = get_recent_context_entries()

        if current_task_load is None:
            current_task_load = Task.objects.filter(status='pending').count()

        prioritized = []
        for task in tasks:
            task_data = {
                'title': task.title,
                'description': task.description,
                'category': task.category.name if task.category else 'General',
                'preferences': preferences,
                'current_task_load': current_task_load
            }
            priority_result = ai_analyze_task_priority(task_data, context_data)
            prioritized.append((task, priority_result.get('priority_score', 0)))
        prioritized.sort(key=lambda x: x[1], reverse=True)
        top_tasks = [t[0] for t in prioritized[:10]]

        serializer = self.get_serializer(top_tasks, many=True)
        return Response({
            'suggestions': serializer.data,
            'info': 'AI-powered prioritization based on context, preferences, and task data.'
        })

    @action(detail=True, methods=['post'], throttle_classes=[AIPostThrottle])
    def suggest_deadline(self, request, pk=None):
        """Suggest a realistic deadline for this task using AI."""
        task = self.get_object()
        task_data = {
            'title': task.title,
            'description': task.description,
            'category': task.category.name if task.category else 'General'
        }
        current_task_load = request.data.get('current_task_load', None)
        if current_task_load is None:
            current_task_load = Task.objects.filter(status='pending').count()
        context_data = get_recent_context_entries()
        suggested_deadline = ai_suggest_deadline(task_data, current_task_load)
        return Response({'suggested_deadline': suggested_deadline, 'info': 'AI-powered deadline suggestion.'})

    @action(detail=True, methods=['post'], throttle_classes=[AIPostThrottle])
    def suggest_category(self, request, pk=None):
        """Suggest multiple categories/tags for this task using LLM zero-shot/few-shot classification."""
        from .models import Category
        task = self.get_object()
        task_data = {
            'title': task.title,
            'description': task.description,
            'category': task.category.name if task.category else 'General'
        }
        context_data = get_recent_context_entries()
        all_categories = list(Category.objects.values_list('name', flat=True))
        prompt = f"""
        Given the following task:\nTitle: {task.title}\nDescription: {task.description}\nContext: {' '.join([c['content'] for c in context_data])}\nChoose the most appropriate categories/tags from this list: {all_categories}\nIf none fit, suggest new tags. Return a JSON list of tag names."""
        import json
        tags_json = ai_enhance_task_description({'title': 'Tag Suggestion', 'description': prompt, 'category': ''}, context_data)
        try:
            tags = json.loads(tags_json[tags_json.find('['):tags_json.rfind(']')+1])
        except Exception:
            tags = ['General']
        tag_objs = []
        for tag in tags:
            category_obj, _ = Category.objects.get_or_create(name=tag)
            tag_objs.append(category_obj.name)
        task.context_tags = tag_objs
        task.save()
        return Response({'suggested_tags': tag_objs, 'info': 'LLM-powered multi-tag suggestion.'})

    @action(detail=True, methods=['post'])
    def log_category_correction(self, request, pk=None):
        """Log user corrections for multiple tags."""
        from .models import CategoryCorrection, Task
        task = self.get_object()
        old_tags = request.data.get('old_tags', [])
        new_tags = request.data.get('new_tags', [])
        if not new_tags:
            return Response({'error': 'new_tags is required'}, status=400)
        for old, new in zip(old_tags, new_tags):
            CategoryCorrection.objects.create(task=task, old_category=old, new_category=new)
        return Response({'status': 'Corrections logged.'})

    @action(detail=True, methods=['post'], throttle_classes=[AIPostThrottle])
    def enhance_description(self, request, pk=None):
        """Enhance the task description using AI and recent context."""
        task = self.get_object()
        task_data = {
            'title': task.title,
            'description': task.description,
            'category': task.category.name if task.category else 'General'
        }
        context_data = get_recent_context_entries()
        enhanced_desc = ai_enhance_task_description(task_data, context_data)
        return Response({'enhanced_description': enhanced_desc, 'info': 'AI-powered description enhancement.'})

    @action(detail=True, methods=['post'], throttle_classes=[AIPostThrottle])
    def ai_pipeline(self, request, pk=None):
        """Run the full AI pipeline for a task: context analysis, priority, deadline, enhancement, multi-tag suggestion. Optionally auto-apply results."""
        from .models import Category
        task = self.get_object()
        task_data = {
            'title': task.title,
            'description': task.description,
            'category': task.category.name if task.category else 'General'
        }
        current_task_load = request.data.get('current_task_load', None)
        if current_task_load is None:
            current_task_load = Task.objects.filter(status='pending').count()
        context_data = get_recent_context_entries()
        priority_result = ai_analyze_task_priority(task_data, context_data)
        suggested_deadline = ai_suggest_deadline(task_data, current_task_load)
        enhanced_desc = ai_enhance_task_description(task_data, context_data)
        all_categories = list(Category.objects.values_list('name', flat=True))
        prompt = f"""
        Given the following task:\nTitle: {task.title}\nDescription: {task.description}\nContext: {' '.join([c['content'] for c in context_data])}\nChoose the most appropriate categories/tags from this list: {all_categories}\nIf none fit, suggest new tags. Return a JSON list of tag names."""
        import json
        tags_json = ai_enhance_task_description({'title': 'Tag Suggestion', 'description': prompt, 'category': ''}, context_data)
        try:
            tags = json.loads(tags_json[tags_json.find('['):tags_json.rfind(']')+1])
        except Exception:
            tags = ['General']
        tag_objs = []
        for tag in tags:
            category_obj, _ = Category.objects.get_or_create(name=tag)
            tag_objs.append(category_obj.name)
        auto_apply = request.data.get('auto_apply', False)
        updated = False
        if auto_apply:
            task.priority_score = priority_result.get('priority_score', task.priority_score)
            task.priority = priority_result.get('priority_level', task.priority)
            task.ai_enhanced_description = enhanced_desc
            if suggested_deadline:
                task.deadline = suggested_deadline
            if tag_objs:
                task.context_tags = tag_objs
            task.save()
            updated = True
        serializer = self.get_serializer(task)
        return Response({
            'priority': priority_result,
            'suggested_deadline': suggested_deadline,
            'enhanced_description': enhanced_desc,
            'suggested_tags': tag_objs,
            'auto_applied': updated,
            'task': serializer.data,
            'info': 'Full AI pipeline analysis for this task.'
        })

    @action(detail=False, methods=['post'], throttle_classes=[AIPostThrottle])
    def ai_batch_pipeline(self, request):
        """Run the AI pipeline for multiple tasks. Accepts a list of task IDs and optional auto_apply."""
        from .models import Category
        task_ids = request.data.get('task_ids', [])
        auto_apply = request.data.get('auto_apply', False)
        current_task_load = request.data.get('current_task_load', None)
        if current_task_load is None:
            current_task_load = Task.objects.filter(status='pending').count()
        context_data = get_recent_context_entries()
        results = []
        for task_id in task_ids:
            try:
                task = Task.objects.get(id=task_id)
                task_data = {
                    'title': task.title,
                    'description': task.description,
                    'category': task.category.name if task.category else 'General'
                }
                priority_result = ai_analyze_task_priority(task_data, context_data)
                suggested_deadline = ai_suggest_deadline(task_data, current_task_load)
                enhanced_desc = ai_enhance_task_description(task_data, context_data)
                all_categories = list(Category.objects.values_list('name', flat=True))
                prompt = f"""
                Given the following task:\nTitle: {task.title}\nDescription: {task.description}\nContext: {' '.join([c['content'] for c in context_data])}\nChoose the most appropriate categories/tags from this list: {all_categories}\nIf none fit, suggest new tags. Return a JSON list of tag names."""
                import json
                tags_json = ai_enhance_task_description({'title': 'Tag Suggestion', 'description': prompt, 'category': ''}, context_data)
                try:
                    tags = json.loads(tags_json[tags_json.find('['):tags_json.rfind(']')+1])
                except Exception:
                    tags = ['General']
                tag_objs = []
                for tag in tags:
                    category_obj, _ = Category.objects.get_or_create(name=tag)
                    tag_objs.append(category_obj.name)
                updated = False
                if auto_apply:
                    task.priority_score = priority_result.get('priority_score', task.priority_score)
                    task.priority = priority_result.get('priority_level', task.priority)
                    task.ai_enhanced_description = enhanced_desc
                    if suggested_deadline:
                        task.deadline = suggested_deadline
                    if tag_objs:
                        task.context_tags = tag_objs
                    task.save()
                    updated = True
                serializer = self.get_serializer(task)
                results.append({
                    'task_id': task.id,
                    'priority': priority_result,
                    'suggested_deadline': suggested_deadline,
                    'enhanced_description': enhanced_desc,
                    'suggested_tags': tag_objs,
                    'auto_applied': updated,
                    'task': serializer.data
                })
            except Task.DoesNotExist:
                results.append({'task_id': task_id, 'error': 'Task not found'})
        return Response({'results': results, 'info': 'Batch AI pipeline analysis.'})

    @action(detail=False, methods=['get'])
    def ai_analytics(self, request):
        """Return analytics about AI impact on tasks."""
        from .models import Task, Category
        # Number of tasks enhanced by AI
        enhanced_count = Task.objects.exclude(ai_enhanced_description__isnull=True).exclude(ai_enhanced_description__exact='').count()
        # Average priority score
        from django.db.models import Avg
        avg_priority = Task.objects.aggregate(avg=Avg('priority_score'))['avg'] or 0
        # Number of deadlines suggested/applied (tasks with a deadline)
        deadline_count = Task.objects.exclude(deadline__isnull=True).count()
        # Most common AI-suggested categories (by name)
        from collections import Counter
        categories = list(Task.objects.exclude(category__isnull=True).values_list('category__name', flat=True))
        category_counts = Counter(categories).most_common(5)
        # Total tasks
        total_tasks = Task.objects.count()
        return Response({
            'total_tasks': total_tasks,
            'ai_enhanced_tasks': enhanced_count,
            'average_priority_score': round(avg_priority, 2),
            'tasks_with_deadline': deadline_count,
            'top_categories': [{'category': c, 'count': n} for c, n in category_counts],
            'info': 'AI analytics dashboard.'
        })

    @action(detail=False, methods=['get'])
    def correction_analytics(self, request):
        """Return most common category corrections for prompt engineering or fine-tuning."""
        from .models import CategoryCorrection
        from collections import Counter
        corrections = CategoryCorrection.objects.all()
        pairs = [(c.old_category, c.new_category) for c in corrections if c.old_category and c.new_category]
        counter = Counter(pairs)
        most_common = counter.most_common(10)
        return Response({
            'most_common_corrections': [
                {'old_category': old, 'new_category': new, 'count': count}
                for (old, new), count in most_common
            ]
        })

@api_view(['GET'])
def test_connection(request):
    return JsonResponse({'status': 'ok', 'message': 'Backend is reachable!'})
