from django.db import models

# Create your models here.

class ContextEntry(models.Model):
    SOURCE_CHOICES = [
        ('whatsapp', 'WhatsApp'),
        ('email', 'Email'),
        ('notes', 'Notes'),
        ('manual', 'Manual Entry'),
    ]

    content = models.TextField()
    source_type = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    processed_insights = models.JSONField(default=dict, blank=True)
    keywords = models.JSONField(default=list, blank=True)
    sentiment_score = models.FloatField(default=0.0)
    importance_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.source_type} - {self.content[:50]}..."

class ExternalEvent(models.Model):
    source = models.CharField(max_length=50)  # e.g., 'google_calendar'
    external_id = models.CharField(max_length=200)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    raw_data = models.JSONField(default=dict, blank=True)
    imported_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.source}: {self.title} ({self.start_time})"

class ContextEntryFeedback(models.Model):
    context_entry = models.ForeignKey('ContextEntry', on_delete=models.CASCADE)
    is_relevant = models.BooleanField()
    feedback = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback for ContextEntry {self.context_entry_id}: {'Relevant' if self.is_relevant else 'Not Relevant'}"
