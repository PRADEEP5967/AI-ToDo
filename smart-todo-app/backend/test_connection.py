#!/usr/bin/env python3
"""
Test connection script for Smart Todo Backend
Tests Django database connection and Supabase connection
"""

import os
import sys
import django
from pathlib import Path

# Add the project directory to Python path
project_dir = Path(__file__).resolve().parent
sys.path.append(str(project_dir))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smart_todo.settings')
django.setup()

from django.db import connection
from django.core.management import execute_from_command_line
from supabase import create_client, Client
from decouple import config

def test_django_connection():
    """Test Django database connection"""
    print("🔍 Testing Django Database Connection...")
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            if result and result[0] == 1:
                print("✅ Django database connection successful!")
                return True
            else:
                print("❌ Django database connection failed: Unexpected result")
                return False
    except Exception as e:
        print(f"❌ Django database connection failed: {e}")
        return False

def test_supabase_connection():
    """Test Supabase connection"""
    print("\n🔍 Testing Supabase Connection...")
    try:
        # Load environment variables
        supabase_url = config('SUPABASE_URL', default='')
        supabase_key = config('SUPABASE_ANON_KEY', default='')
        
        if not supabase_url or not supabase_key:
            print("⚠️  Supabase credentials not found in .env file")
            print("   Please add SUPABASE_URL and SUPABASE_ANON_KEY to your .env file")
            return False
        
        # Create Supabase client
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Test the connection
        print("✅ Supabase client created successfully!")
        print(f"   Connected to: {supabase_url}")
        return True
        
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        return False

def test_django_check():
    """Run Django system check"""
    print("\n🔍 Running Django System Check...")
    try:
        # Run Django check command
        execute_from_command_line(['manage.py', 'check'])
        print("✅ Django system check passed!")
        return True
    except Exception as e:
        print(f"❌ Django system check failed: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 Smart Todo Backend Connection Test")
    print("=" * 40)
    
    # Test Django database
    django_ok = test_django_connection()
    
    # Test Supabase
    supabase_ok = test_supabase_connection()
    
    # Test Django system
    django_check_ok = test_django_check()
    
    # Summary
    print("\n" + "=" * 40)
    print("📊 Test Summary:")
    print(f"   Django Database: {'✅' if django_ok else '❌'}")
    print(f"   Supabase: {'✅' if supabase_ok else '❌'}")
    print(f"   Django System: {'✅' if django_check_ok else '❌'}")
    
    if all([django_ok, supabase_ok, django_check_ok]):
        print("\n🎉 All tests passed! Your backend is ready to go!")
    else:
        print("\n⚠️  Some tests failed. Please check your configuration.")
    
    return all([django_ok, supabase_ok, django_check_ok])

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 