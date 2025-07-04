#!/usr/bin/env python3
"""
Comprehensive API Endpoints Test Script
Tests all Smart Todo API functionality
"""

import requests
import json
import time
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api"

def test_api_endpoint(url, method="GET", data=None, expected_status=200):
    """Test an API endpoint"""
    try:
        if method == "GET":
            response = requests.get(url, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=10)
        elif method == "PUT":
            response = requests.put(url, json=data, timeout=10)
        elif method == "DELETE":
            response = requests.delete(url, timeout=10)
        
        print(f"✅ {method} {url} - Status: {response.status_code}")
        if response.status_code == expected_status:
            return True, response.json() if response.content else None
        else:
            print(f"   ❌ Expected {expected_status}, got {response.status_code}")
            return False, None
    except Exception as e:
        print(f"❌ {method} {url} - Error: {e}")
        return False, None

def test_categories_endpoints():
    """Test Category API endpoints"""
    print("\n🏷️  Testing Category Endpoints")
    print("=" * 50)
    
    # Test categories list
    success, data = test_api_endpoint(f"{BASE_URL}/categories/")
    if not success:
        return False
    
    # Test category creation
    category_data = {
        "name": "Test Category",
        "color": "#FF5733"
    }
    success, data = test_api_endpoint(f"{BASE_URL}/categories/", "POST", category_data, 201)
    if not success:
        return False
    
    category_id = data.get('id')
    if not category_id:
        print("❌ No category ID returned")
        return False
    
    # Test category detail
    success, data = test_api_endpoint(f"{BASE_URL}/categories/{category_id}/")
    if not success:
        return False
    
    # Test popular categories
    success, data = test_api_endpoint(f"{BASE_URL}/categories/popular/")
    if not success:
        return False
    
    # Test increment usage
    success, data = test_api_endpoint(f"{BASE_URL}/categories/{category_id}/increment_usage/", "POST", {}, 200)
    if not success:
        return False
    
    return True

def test_tasks_endpoints():
    """Test Task API endpoints"""
    print("\n📝 Testing Task Endpoints")
    print("=" * 50)
    
    # Test tasks list
    success, data = test_api_endpoint(f"{BASE_URL}/tasks/")
    if not success:
        return False
    
    # Test task creation
    task_data = {
        "title": "Test Task with AI Enhancement",
        "description": "This is a test task to verify AI enhancement",
        "priority": 2,
        "status": "pending"
    }
    success, data = test_api_endpoint(f"{BASE_URL}/tasks/", "POST", task_data, 201)
    if not success:
        return False
    
    task_id = data.get('id')
    if not task_id:
        print("❌ No task ID returned")
        return False
    
    # Test task detail
    success, data = test_api_endpoint(f"{BASE_URL}/tasks/{task_id}/")
    if not success:
        return False
    
    # Test AI enhancement
    success, data = test_api_endpoint(f"{BASE_URL}/tasks/{task_id}/enhance_with_ai/", "POST", {}, 200)
    if not success:
        return False
    
    # Test mark completed
    success, data = test_api_endpoint(f"{BASE_URL}/tasks/{task_id}/mark_completed/", "POST", {}, 200)
    if not success:
        return False
    
    return True

def test_special_endpoints():
    """Test special task endpoints"""
    print("\n🔍 Testing Special Task Endpoints")
    print("=" * 50)
    
    # Test overdue tasks
    success, data = test_api_endpoint(f"{BASE_URL}/tasks/overdue/")
    if not success:
        return False
    
    # Test high priority tasks
    success, data = test_api_endpoint(f"{BASE_URL}/tasks/high_priority/")
    if not success:
        return False
    
    # Test today's tasks
    success, data = test_api_endpoint(f"{BASE_URL}/tasks/today/")
    if not success:
        return False
    
    # Test statistics
    success, data = test_api_endpoint(f"{BASE_URL}/tasks/statistics/")
    if not success:
        return False
    
    return True

def test_filtering_and_search():
    """Test filtering and search functionality"""
    print("\n🔍 Testing Filtering and Search")
    print("=" * 50)
    
    # Test filtering by status
    success, data = test_api_endpoint(f"{BASE_URL}/tasks/?status=pending")
    if not success:
        return False
    
    # Test filtering by priority
    success, data = test_api_endpoint(f"{BASE_URL}/tasks/?priority=2")
    if not success:
        return False
    
    # Test search
    success, data = test_api_endpoint(f"{BASE_URL}/tasks/?search=test")
    if not success:
        return False
    
    # Test ordering
    success, data = test_api_endpoint(f"{BASE_URL}/tasks/?ordering=-created_at")
    if not success:
        return False
    
    return True

def test_bulk_operations():
    """Test bulk operations"""
    print("\n📦 Testing Bulk Operations")
    print("=" * 50)
    
    # Create multiple tasks for bulk operations
    tasks_to_create = [
        {"title": "Bulk Task 1", "description": "First bulk task", "status": "pending"},
        {"title": "Bulk Task 2", "description": "Second bulk task", "status": "pending"},
        {"title": "Bulk Task 3", "description": "Third bulk task", "status": "pending"}
    ]
    
    task_ids = []
    for task_data in tasks_to_create:
        success, data = test_api_endpoint(f"{BASE_URL}/tasks/", "POST", task_data, 201)
        if success and data:
            task_ids.append(data.get('id'))
    
    if task_ids:
        # Test bulk update
        bulk_data = {
            "task_ids": task_ids,
            "status": "in_progress"
        }
        success, data = test_api_endpoint(f"{BASE_URL}/tasks/bulk_update_status/", "POST", bulk_data, 200)
        if not success:
            return False
    
    return True

def main():
    """Main test function"""
    print("🚀 Smart Todo API Comprehensive Test")
    print("=" * 60)
    
    # Wait for server to start
    print("⏳ Waiting for server to start...")
    time.sleep(3)
    
    # Test all endpoint categories
    tests = [
        ("Categories", test_categories_endpoints),
        ("Tasks", test_tasks_endpoints),
        ("Special Endpoints", test_special_endpoints),
        ("Filtering & Search", test_filtering_and_search),
        ("Bulk Operations", test_bulk_operations)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test failed with error: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Summary:")
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name}: {status}")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    print(f"\n🎯 Overall Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your API is working perfectly!")
    else:
        print("⚠️  Some tests failed. Check the output above for details.")

if __name__ == "__main__":
    main() 