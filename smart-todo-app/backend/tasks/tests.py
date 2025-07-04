from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import Task, Category

# Create your tests here.

class CategoryAPITestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.category_data = {
            "name": "Test Category",
            "color": "#FF5733"
        }
        self.category = Category.objects.create(
            name="Existing Category",
            color="#3B82F6",
            usage_count=5
        )

    def test_create_category(self):
        url = reverse('category-list')
        response = self.client.post(url, self.category_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], self.category_data['name'])

    def test_list_categories(self):
        url = reverse('category-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('results' in response.data or isinstance(response.data, list))

    def test_retrieve_category(self):
        url = reverse('category-detail', args=[self.category.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.category.id)

    def test_update_category(self):
        url = reverse('category-detail', args=[self.category.id])
        response = self.client.put(url, {**self.category_data, "name": "Updated Category"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Updated Category")

    def test_delete_category(self):
        url = reverse('category-detail', args=[self.category.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_popular_categories(self):
        url = reverse('category-popular')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_increment_usage(self):
        url = reverse('category-increment-usage', args=[self.category.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.category.refresh_from_db()
        self.assertEqual(self.category.usage_count, 6)

class TaskAPITestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name="Work", color="#FF5733")
        self.task_data = {
            "title": "Test Task",
            "description": "Test Description",
            "category": self.category.id,
            "priority": 2,
            "status": "pending"
        }
        self.task = Task.objects.create(
            title="Existing Task",
            description="Existing Description",
            category=self.category,
            priority=3,
            status="pending"
        )

    def test_create_task(self):
        url = reverse('task-list')
        response = self.client.post(url, self.task_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], self.task_data['title'])

    def test_list_tasks(self):
        url = reverse('task-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('results' in response.data or isinstance(response.data, list))

    def test_retrieve_task(self):
        url = reverse('task-detail', args=[self.task.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.task.id)

    def test_update_task(self):
        url = reverse('task-detail', args=[self.task.id])
        response = self.client.put(url, {**self.task_data, "title": "Updated Task"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Updated Task")

    def test_delete_task(self):
        url = reverse('task-detail', args=[self.task.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_filter_tasks_by_status(self):
        url = reverse('task-list') + '?status=pending'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_search_tasks(self):
        url = reverse('task-list') + '?search=Existing'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any("Existing" in t['title'] for t in response.data.get('results', [])))

    def test_mark_completed(self):
        url = reverse('task-mark-completed', args=[self.task.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertEqual(self.task.status, "completed")

    def test_enhance_with_ai(self):
        url = reverse('task-enhance-with-ai', args=[self.task.id])
        response = self.client.post(url)
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_202_ACCEPTED])
        # AI enhancement may be a no-op in dev, just check for no error

    def test_statistics_endpoint(self):
        url = reverse('task-statistics')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_tasks', response.data)
