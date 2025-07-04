#!/usr/bin/env python3
"""
Smart Todo Setup and Run Script
Automatically creates .env file and starts the server
"""

import os
import subprocess
import sys
from pathlib import Path

def create_env_file():
    """Create .env file with default settings"""
    env_content = """# Django Settings
SECRET_KEY=django-insecure-smart-todo-dev-secret-key-2024
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Database Settings (SQLite for development)
DATABASE_URL=sqlite:///db.sqlite3

# Supabase Settings (for future use)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key

# AI Settings
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Local LLM Settings (LM Studio)
LOCAL_LLM_URL=http://localhost:1234/v1
LOCAL_LLM_MODEL=local-model

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Email Settings (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
"""
    
    env_file = Path('.env')
    if env_file.exists():
        print("✅ .env file already exists")
    else:
        with open(env_file, 'w') as f:
            f.write(env_content)
        print("✅ Created .env file with default settings")
        print("⚠️  Please update the .env file with your actual API keys when ready")

def run_migrations():
    """Run Django migrations"""
    print("🔄 Running database migrations...")
    try:
        result = subprocess.run([sys.executable, 'manage.py', 'migrate'], 
                              capture_output=True, text=True, check=True)
        print("✅ Database migrations completed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Migration failed: {e.stderr}")
        return False
    return True

def create_superuser():
    """Create a superuser if it doesn't exist"""
    print("🔄 Creating superuser...")
    try:
        # Use non-interactive mode to create superuser
        result = subprocess.run([
            sys.executable, 'manage.py', 'shell', '-c',
            'from django.contrib.auth.models import User; '
            'User.objects.create_superuser("admin", "admin@example.com", "admin123") '
            'if not User.objects.filter(username="admin").exists() else None'
        ], capture_output=True, text=True)
        print("✅ Superuser created (username: admin, password: admin123)")
    except Exception as e:
        print(f"⚠️  Superuser creation failed (may already exist): {e}")

def start_server():
    """Start the Django development server"""
    print("🚀 Starting Django development server...")
    print("📱 Server will be available at: http://localhost:8000")
    print("🔗 API will be available at: http://localhost:8000/api/")
    print("⚙️  Admin interface at: http://localhost:8000/admin/")
    print("👤 Admin credentials: admin / admin123")
    print("\n🛑 Press Ctrl+C to stop the server")
    print("=" * 60)
    
    try:
        subprocess.run([sys.executable, 'manage.py', 'runserver', '0.0.0.0:8000'])
    except KeyboardInterrupt:
        print("\n👋 Server stopped. Goodbye!")

def main():
    """Main setup function"""
    print("🎯 Smart Todo Setup and Run Script")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path('manage.py').exists():
        print("❌ Error: manage.py not found!")
        print("Please run this script from the backend directory")
        return
    
    # Create .env file
    create_env_file()
    
    # Run migrations
    if not run_migrations():
        return
    
    # Create superuser
    create_superuser()
    
    # Start server
    start_server()

if __name__ == "__main__":
    main() 