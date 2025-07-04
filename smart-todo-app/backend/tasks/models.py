from django.db import models
from django.contrib.auth.models import User
from collections import Counter
from django.db.models.signals import post_save
from django.dispatch import receiver
from ai_engine import ai_manager

class Category(models.Model):
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default='#3B82F6')
    usage_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Task(models.Model):
    PRIORITY_CHOICES = [
        (1, 'Low'),
        (2, 'Medium'),
        (3, 'High'),
        (4, 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    priority_score = models.FloatField(default=0.0)
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=2)
    deadline = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    ai_enhanced_description = models.TextField(blank=True)
    context_tags = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-priority_score', '-created_at']

    def __str__(self):
        return self.title

class CategoryCorrection(models.Model):
    task = models.ForeignKey('Task', on_delete=models.CASCADE)
    old_category = models.CharField(max_length=100, blank=True, null=True)
    new_category = models.CharField(max_length=100)
    corrected_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Correction for Task {self.task_id}: {self.old_category} -> {self.new_category}"

    @classmethod
    def get_frequent_corrections(cls, min_count=3):
        corrections = cls.objects.all()
        pairs = [(c.old_category, c.new_category) for c in corrections if c.old_category and c.new_category]
        counter = Counter(pairs)
        return [pair for pair, count in counter.items() if count >= min_count]

@receiver(post_save, sender=Task)
def run_ai_pipeline(sender, instance, created, **kwargs):
    if created:
        # Call your ai_pipeline logic here
        pass
