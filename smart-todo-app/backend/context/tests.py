from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import ContextEntry

class ContextEntryAPITestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.context_data = {
            "content": "Test context content for AI processing",
            "source_type": "email"
        }
        self.context_entry = ContextEntry.objects.create(
            content="Existing context entry",
            source_type="whatsapp",
            sentiment_score=0.7,
            importance_score=0.8
        )

    def test_create_context_entry(self):
        url = reverse('context-list')
        response = self.client.post(url, self.context_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], self.context_data['content'])

    def test_list_context_entries(self):
        url = reverse('context-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('results' in response.data or isinstance(response.data, list))

    def test_retrieve_context_entry(self):
        url = reverse('context-detail', args=[self.context_entry.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.context_entry.id)

    def test_update_context_entry(self):
        url = reverse('context-detail', args=[self.context_entry.id])
        response = self.client.put(url, {**self.context_data, "content": "Updated content"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['content'], "Updated content")

    def test_delete_context_entry(self):
        url = reverse('context-detail', args=[self.context_entry.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_unprocessed_entries(self):
        url = reverse('context-unprocessed')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_high_importance_entries(self):
        url = reverse('context-high-importance')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_entries_by_source(self):
        url = reverse('context-by-source') + '?source_type=whatsapp'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_reprocess_context_entry(self):
        url = reverse('context-reprocess', args=[self.context_entry.id])
        response = self.client.post(url)
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_202_ACCEPTED])

    def test_bulk_process(self):
        url = reverse('context-bulk-process')
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('processed_count', response.data)

    def test_statistics_endpoint(self):
        url = reverse('context-statistics')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_entries', response.data)

    def test_insights_endpoint(self):
        url = reverse('context-insights')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('recent_important_entries', response.data)

    def test_filter_by_source_type(self):
        url = reverse('context-list') + '?search=Existing'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any("Existing" in c['content'] for c in response.data.get('results', [])))
