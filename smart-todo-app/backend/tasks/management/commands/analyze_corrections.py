from django.core.management.base import BaseCommand
from tasks.models import CategoryCorrection

class Command(BaseCommand):
    help = 'Analyze frequent category corrections for LLM prompt improvement or fine-tuning.'

    def add_arguments(self, parser):
        parser.add_argument('--min_count', type=int, default=3, help='Minimum number of corrections to consider frequent.')

    def handle(self, *args, **options):
        min_count = options['min_count']
        frequent = CategoryCorrection.get_frequent_corrections(min_count=min_count)
        if not frequent:
            self.stdout.write(self.style.WARNING('No frequent corrections found.'))
            return
        self.stdout.write(self.style.SUCCESS(f'Frequent corrections (min_count={min_count}):'))
        for old, new in frequent:
            self.stdout.write(f"  '{old}' -> '{new}'") 