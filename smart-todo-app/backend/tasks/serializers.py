from rest_framework import serializers
from .models import Task, Category
from ai_engine.task_analyzer import TaskAnalyzer
from .services import get_recent_context_entries, ai_analyze_task_priority, ai_suggest_deadline, ai_enhance_task_description

class CategorySerializer(serializers.ModelSerializer):
    task_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'color', 'usage_count', 'task_count', 'created_at']
        read_only_fields = ['usage_count', 'created_at']
    
    def get_task_count(self, obj):
        return obj.task_set.count()

class TaskSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    priority_label = serializers.CharField(source='get_priority_display', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    days_until_deadline = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'category', 'category_name', 'category_color',
            'priority_score', 'priority', 'priority_label', 'deadline', 'status', 'status_label',
            'ai_enhanced_description', 'context_tags', 'days_until_deadline', 'is_overdue',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['priority_score', 'ai_enhanced_description', 'context_tags', 'created_at', 'updated_at']
    
    def get_days_until_deadline(self, obj):
        if obj.deadline:
            from django.utils import timezone
            now = timezone.now()
            # Make sure deadline is timezone-aware
            if timezone.is_naive(obj.deadline):
                deadline = timezone.make_aware(obj.deadline)
            else:
                deadline = obj.deadline
            delta = deadline - now
            return delta.days
        return None
    
    def get_is_overdue(self, obj):
        if obj.deadline:
            from django.utils import timezone
            now = timezone.now()
            # Make sure deadline is timezone-aware
            if timezone.is_naive(obj.deadline):
                deadline = timezone.make_aware(obj.deadline)
            else:
                deadline = obj.deadline
            return now > deadline
        return False
    
    def create(self, validated_data):
        # Create task first
        task = Task.objects.create(**validated_data)
        # Then enhance with AI
        serializer = TaskSerializer()
        serializer._enhance_task_with_ai(task)
        return task
    
    def update(self, instance, validated_data):
        # AI enhancement during task updates
        task = super().update(instance, validated_data)
        self._enhance_task_with_ai(task)
        return task
    
    def _enhance_task_with_ai(self, task):
        """Enhance task with AI analysis"""
        try:
            # Prepare task data
            task_data = {
                'title': task.title,
                'description': task.description,
                'category': task.category.name if task.category else 'General'
            }
            context_data = get_recent_context_entries()
            # Analyze priority
            priority_result = ai_analyze_task_priority(task_data, context_data)
            task.priority_score = priority_result.get('priority_score', 5.0)
            task.priority = priority_result.get('priority_level', 2)
            # Enhance description
            enhanced_desc = ai_enhance_task_description(task_data, context_data)
            if enhanced_desc and not enhanced_desc.startswith('Error'):
                task.ai_enhanced_description = enhanced_desc
            # Suggest deadline if not set
            if not task.deadline:
                deadline = ai_suggest_deadline(task_data, current_workload=Task.objects.filter(status='pending').count())
                task.deadline = deadline
            # Extract context tags from priority reasoning
            if 'reasoning' in priority_result:
                task.context_tags = [priority_result['reasoning']]
            task.save()
        except Exception as e:
            print(f"AI enhancement failed for task {task.id}: {e}")

    def validate(self, data):
        # Validate required fields
        if not data.get('title'):
            raise serializers.ValidationError({'title': 'Title is required.'})
        if not data.get('description'):
            raise serializers.ValidationError({'description': 'Description is required.'})
        # Validate tags/context_tags if present
        tags = data.get('context_tags')
        if tags is not None:
            if not isinstance(tags, list):
                raise serializers.ValidationError({'context_tags': 'Tags must be a list.'})
            for tag in tags:
                if not isinstance(tag, str) or not tag.strip():
                    raise serializers.ValidationError({'context_tags': 'Each tag must be a non-empty string.'})
        return data

class TaskListSerializer(serializers.ModelSerializer):
    """Simplified serializer for task lists"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    priority_label = serializers.CharField(source='get_priority_display', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'category_name', 'priority', 'priority_label', 
            'status', 'status_label', 'deadline', 'created_at'
        ]

class TaskDetailSerializer(TaskSerializer):
    """Detailed serializer for single task view"""
    class Meta(TaskSerializer.Meta):
        fields = TaskSerializer.Meta.fields + ['description', 'ai_enhanced_description', 'context_tags']

class TaskCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new tasks with AI enhancement"""
    class Meta:
        model = Task
        fields = ['title', 'description', 'category', 'priority', 'deadline', 'status', 'context_tags']
    
    def validate(self, data):
        # Validate required fields
        if not data.get('title'):
            raise serializers.ValidationError({'title': 'Title is required.'})
        if not data.get('description'):
            raise serializers.ValidationError({'description': 'Description is required.'})
        tags = data.get('context_tags')
        if tags is not None:
            if not isinstance(tags, list):
                raise serializers.ValidationError({'context_tags': 'Tags must be a list.'})
            for tag in tags:
                if not isinstance(tag, str) or not tag.strip():
                    raise serializers.ValidationError({'context_tags': 'Each tag must be a non-empty string.'})
        return data
    
    def create(self, validated_data):
        # Create task first
        task = Task.objects.create(**validated_data)
        # Then enhance with AI
        serializer = TaskSerializer()
        serializer._enhance_task_with_ai(task)
        return task 