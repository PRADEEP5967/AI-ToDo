from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import ContextEntry, ExternalEvent, ContextEntryFeedback
from .serializers import (
    ContextEntrySerializer, ContextEntryListSerializer, 
    ContextEntryDetailSerializer, ContextEntryCreateSerializer
)
from django.db import models
from collections import Counter
from datetime import timedelta
from django.utils import timezone

class ContextEntryViewSet(viewsets.ModelViewSet):
    """ViewSet for ContextEntry model with AI processing"""
    queryset = ContextEntry.objects.all()
    serializer_class = ContextEntrySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['source_type', 'processed_at']
    search_fields = ['content']
    ordering_fields = ['created_at', 'sentiment_score', 'importance_score']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return ContextEntryListSerializer
        elif self.action == 'retrieve':
            return ContextEntryDetailSerializer
        elif self.action == 'create':
            return ContextEntryCreateSerializer
        return ContextEntrySerializer
    
    @action(detail=False, methods=['get'])
    def unprocessed(self, request):
        """Get unprocessed context entries"""
        unprocessed_entries = ContextEntry.objects.filter(processed_at__isnull=True)
        serializer = self.get_serializer(unprocessed_entries, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def high_importance(self, request):
        """Get high importance context entries"""
        high_importance_entries = ContextEntry.objects.filter(importance_score__gte=0.7)
        serializer = self.get_serializer(high_importance_entries, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_source(self, request):
        """Get context entries grouped by source type"""
        source_type = request.query_params.get('source_type', '')
        if source_type:
            entries = ContextEntry.objects.filter(source_type=source_type)
        else:
            entries = ContextEntry.objects.all()
        
        serializer = self.get_serializer(entries, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reprocess(self, request, pk=None):
        """Manually trigger AI reprocessing for a context entry"""
        context_entry = self.get_object()
        serializer = ContextEntrySerializer()
        serializer._process_with_ai(context_entry)
        
        # Refresh the context entry from database
        context_entry.refresh_from_db()
        serializer = self.get_serializer(context_entry)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_process(self, request):
        """Bulk process unprocessed context entries"""
        unprocessed_entries = ContextEntry.objects.filter(processed_at__isnull=True)
        processed_count = 0
        
        for entry in unprocessed_entries:
            try:
                serializer = ContextEntrySerializer()
                serializer._process_with_ai(entry)
                processed_count += 1
            except Exception as e:
                print(f"Failed to process entry {entry.id}: {e}")
        
        return Response({
            'processed_count': processed_count,
            'total_unprocessed': unprocessed_entries.count()
        })
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get context processing statistics"""
        total_entries = ContextEntry.objects.count()
        processed_entries = ContextEntry.objects.filter(processed_at__isnull=False).count()
        unprocessed_entries = total_entries - processed_entries
        
        # Source type distribution
        source_stats = {}
        for source_type, _ in ContextEntry.SOURCE_CHOICES:
            source_stats[source_type] = ContextEntry.objects.filter(source_type=source_type).count()
        
        # Sentiment distribution
        positive_entries = ContextEntry.objects.filter(sentiment_score__gte=0.6).count()
        neutral_entries = ContextEntry.objects.filter(sentiment_score__range=(0.4, 0.6)).count()
        negative_entries = ContextEntry.objects.filter(sentiment_score__lt=0.4).count()
        
        # Average scores
        avg_sentiment = ContextEntry.objects.aggregate(
            avg_sentiment=models.Avg('sentiment_score')
        )['avg_sentiment'] or 0
        
        avg_importance = ContextEntry.objects.aggregate(
            avg_importance=models.Avg('importance_score')
        )['avg_importance'] or 0
        
        return Response({
            'total_entries': total_entries,
            'processed_entries': processed_entries,
            'unprocessed_entries': unprocessed_entries,
            'processing_rate': (processed_entries / total_entries * 100) if total_entries > 0 else 0,
            'source_distribution': source_stats,
            'sentiment_distribution': {
                'positive': positive_entries,
                'neutral': neutral_entries,
                'negative': negative_entries
            },
            'average_scores': {
                'sentiment': round(avg_sentiment, 3),
                'importance': round(avg_importance, 3)
            }
        })
    
    @action(detail=False, methods=['get'])
    def insights(self, request):
        """Get AI insights from context data"""
        # Get recent high-importance entries
        recent_important = ContextEntry.objects.filter(
            importance_score__gte=0.7
        ).order_by('-created_at')[:10]
        
        # Extract common keywords
        all_keywords = []
        for entry in ContextEntry.objects.all():
            if entry.keywords:
                all_keywords.extend(entry.keywords)
        
        # Count keyword frequency
        keyword_freq = Counter(all_keywords).most_common(10)
        
        # Sentiment trends
        recent_entries = ContextEntry.objects.order_by('-created_at')[:50]
        sentiment_trend = [
            {
                'date': entry.created_at.date().isoformat(),
                'sentiment': entry.sentiment_score,
                'importance': entry.importance_score
            }
            for entry in recent_entries
        ]
        
        return Response({
            'recent_important_entries': ContextEntryListSerializer(recent_important, many=True).data,
            'top_keywords': [{'keyword': kw, 'count': count} for kw, count in keyword_freq],
            'sentiment_trend': sentiment_trend
        })

    @action(detail=False, methods=['post'])
    def import_event(self, request):
        """Import an external event (e.g., from Google Calendar) as a context entry and as an ExternalEvent."""
        source = request.data.get('source', 'google_calendar')
        external_id = request.data.get('external_id')
        title = request.data.get('title')
        description = request.data.get('description', '')
        start_time = request.data.get('start_time')
        end_time = request.data.get('end_time')
        raw_data = request.data.get('raw_data', {})
        if not (external_id and title and start_time and end_time):
            return Response({'error': 'Missing required fields.'}, status=400)
        event = ExternalEvent.objects.create(
            source=source,
            external_id=external_id,
            title=title,
            description=description,
            start_time=start_time,
            end_time=end_time,
            raw_data=raw_data
        )
        # Also create a context entry
        context_entry = ContextEntry.objects.create(
            content=f"[Calendar] {title}: {description}",
            source_type='manual'  # or a new type like 'calendar'
        )
        # Optionally trigger AI processing
        serializer = ContextEntrySerializer()
        serializer._process_with_ai(context_entry)
        return Response({'status': 'Event imported', 'event_id': event.id, 'context_entry_id': context_entry.id})

    @action(detail=True, methods=['post'])
    def feedback(self, request, pk=None):
        """Submit user feedback on a context entry (relevant/not relevant, optional comment)."""
        context_entry = self.get_object()
        is_relevant = request.data.get('is_relevant')
        feedback = request.data.get('feedback', '')
        if is_relevant is None:
            return Response({'error': 'is_relevant is required'}, status=400)
        ContextEntryFeedback.objects.create(
            context_entry=context_entry,
            is_relevant=bool(is_relevant),
            feedback=feedback
        )
        return Response({'status': 'Feedback submitted.'})

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        total = ContextEntry.objects.count()
        feedbacks = ContextEntryFeedback.objects.all()
        relevant = feedbacks.filter(is_relevant=True).count()
        not_relevant = feedbacks.filter(is_relevant=False).count()
        intents = Counter(
            e.processed_insights.get('intent', '') for e in ContextEntry.objects.all() if e.processed_insights
        )
        # Entity stats
        all_entities = []
        for e in ContextEntry.objects.all():
            if e.processed_insights and 'entities' in e.processed_insights:
                all_entities.extend(e.processed_insights['entities'])
        entity_freq = Counter(all_entities).most_common(10)
        # Time trends (last 7 days)
        today = timezone.now().date()
        context_trend = []
        feedback_trend = []
        for i in range(7):
            day = today - timedelta(days=i)
            count = ContextEntry.objects.filter(created_at__date=day).count()
            context_trend.append({'date': str(day), 'count': count})
            fb_count = feedbacks.filter(submitted_at__date=day).count()
            feedback_trend.append({'date': str(day), 'count': fb_count})
        context_trend.reverse()
        feedback_trend.reverse()
        return Response({
            'total_context_entries': total,
            'feedback': {
                'relevant': relevant,
                'not_relevant': not_relevant,
                'percent_relevant': round(100 * relevant / total, 2) if total else 0,
            },
            'top_intents': intents.most_common(5),
            'top_entities': entity_freq,
            'context_trend_7d': context_trend,
            'feedback_trend_7d': feedback_trend,
        })
