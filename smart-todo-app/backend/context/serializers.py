from rest_framework import serializers
from .models import ContextEntry

class ContextEntrySerializer(serializers.ModelSerializer):
    source_type_label = serializers.CharField(source='get_source_type_display', read_only=True)
    processing_status = serializers.SerializerMethodField()
    
    class Meta:
        model = ContextEntry
        fields = [
            'id', 'content', 'source_type', 'source_type_label', 'processed_insights',
            'keywords', 'sentiment_score', 'importance_score', 'processing_status',
            'created_at', 'processed_at'
        ]
        read_only_fields = ['processed_insights', 'keywords', 'sentiment_score', 'importance_score', 'processed_at']
    
    def get_processing_status(self, obj):
        """Get the processing status of the context entry"""
        if obj.processed_at:
            return 'processed'
        elif obj.processed_insights:
            return 'partially_processed'
        else:
            return 'pending'
    
    def create(self, validated_data):
        """Create context entry and trigger AI processing"""
        context_entry = super().create(validated_data)
        self._process_with_ai(context_entry)
        return context_entry
    
    def _process_with_ai(self, context_entry):
        """Process context entry with AI for insights and analysis, including entities, intent, and schedule extraction."""
        try:
            from ai_engine import ai_manager

            # Prepare context data for analysis
            context_data = [{
                'content': context_entry.content,
                'source_type': context_entry.source_type
            }]

            # Use AI manager for enhanced description and semantic analysis
            enhanced_desc = ai_manager.enhance_task_description(
                {'title': 'Context', 'description': context_entry.content, 'category': context_entry.source_type},
                context_data
            )
            # Simulate entity, intent, and schedule extraction
            semantic_prompt = f"""
            Extract the following from the context:
            - Entities (people, places, organizations)
            - Intent (e.g., meeting, reminder, note, event)
            - Schedule info (date, time, recurrence)
            Context: {context_entry.content}
            Return as JSON: {{'entities': [...], 'intent': '...', 'schedule': '...'}}
            """
            semantic_json = ai_manager.enhance_task_description({'title': 'Semantic Extraction', 'description': semantic_prompt, 'category': ''}, context_data)
            import json
            try:
                semantic_data = json.loads(semantic_json[semantic_json.find('{'):semantic_json.rfind('}')+1])
            except Exception:
                semantic_data = {'entities': [], 'intent': '', 'schedule': ''}

            sentiment_score = min(1.0, max(0.0, len(enhanced_desc) / 200))
            importance_score = min(1.0, max(0.0, len(context_entry.content) / 500))
            keywords = [word for word in context_entry.content.lower().split() if len(word) > 3][:5]

            insights = {
                'enhanced_description': enhanced_desc,
                'entities': semantic_data.get('entities', []),
                'intent': semantic_data.get('intent', ''),
                'schedule': semantic_data.get('schedule', ''),
                'word_count': len(context_entry.content.split()),
                'content_length': len(context_entry.content),
                'analysis_timestamp': context_entry.created_at.isoformat(),
                'processing_method': 'ai_enhanced'
            }

            context_entry.sentiment_score = sentiment_score
            context_entry.importance_score = importance_score
            context_entry.keywords = keywords
            context_entry.processed_insights = insights
            context_entry.processed_at = context_entry.created_at
            context_entry.save()
        except Exception as e:
            print(f"AI processing failed for context entry {context_entry.id}: {e}")

class ContextEntryListSerializer(serializers.ModelSerializer):
    """Simplified serializer for context entry lists"""
    source_type_label = serializers.CharField(source='get_source_type_display', read_only=True)
    
    class Meta:
        model = ContextEntry
        fields = [
            'id', 'content', 'source_type', 'source_type_label', 
            'sentiment_score', 'importance_score', 'created_at'
        ]

class ContextEntryDetailSerializer(ContextEntrySerializer):
    """Detailed serializer for single context entry view"""
    class Meta(ContextEntrySerializer.Meta):
        fields = ContextEntrySerializer.Meta.fields + ['processed_insights', 'keywords', 'processed_at']

class ContextEntryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new context entries"""
    class Meta:
        model = ContextEntry
        fields = ['content', 'source_type']
    
    def create(self, validated_data):
        """Create context entry and trigger AI processing"""
        context_entry = ContextEntry.objects.create(**validated_data)
        
        # Trigger AI processing
        serializer = ContextEntrySerializer()
        serializer._process_with_ai(context_entry)
        
        return context_entry 