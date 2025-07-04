#!/usr/bin/env python3
"""
Test script for TaskAnalyzer functionality
Demonstrates how to use the AI-powered task analysis features
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

from ai_engine.task_analyzer import TaskAnalyzer

def test_task_analyzer():
    """Test the TaskAnalyzer with sample data"""
    print("🚀 Testing TaskAnalyzer Functionality")
    print("=" * 50)
    
    # Initialize analyzer (use local LLM by default)
    print("📋 Initializing TaskAnalyzer...")
    analyzer = TaskAnalyzer(use_local_llm=True)
    print("✅ TaskAnalyzer initialized successfully!")
    
    # Sample task data
    task_data = {
        'title': 'Complete project presentation',
        'description': 'Prepare slides for quarterly review meeting',
        'category': 'Work'
    }
    
    # Sample context data
    context_data = [
        {
            'content': 'Quarterly review meeting scheduled for Friday at 2 PM',
            'source_type': 'email'
        },
        {
            'content': 'CEO mentioned this presentation is critical for funding approval',
            'source_type': 'whatsapp'
        },
        {
            'content': 'Previous presentations took 3-4 hours to prepare',
            'source_type': 'notes'
        }
    ]
    
    print(f"\n📝 Sample Task: {task_data['title']}")
    print(f"📄 Description: {task_data['description']}")
    print(f"🏷️  Category: {task_data['category']}")
    
    print(f"\n📚 Context Data ({len(context_data)} entries):")
    for i, ctx in enumerate(context_data, 1):
        print(f"  {i}. [{ctx['source_type']}] {ctx['content'][:60]}...")
    
    # Test 1: Analyze task priority
    print("\n🔍 Testing Priority Analysis...")
    try:
        priority_result = analyzer.analyze_task_priority(task_data, context_data)
        print("✅ Priority Analysis Result:")
        print(f"   Priority Score: {priority_result.get('priority_score', 'N/A')}")
        print(f"   Priority Level: {priority_result.get('priority_level', 'N/A')}")
        print(f"   Reasoning: {priority_result.get('reasoning', 'N/A')}")
    except Exception as e:
        print(f"❌ Priority Analysis failed: {e}")
    
    # Test 2: Suggest deadline
    print("\n⏰ Testing Deadline Suggestion...")
    try:
        deadline = analyzer.suggest_deadline(task_data, current_workload=5)
        print(f"✅ Suggested Deadline: {deadline}")
    except Exception as e:
        print(f"❌ Deadline Suggestion failed: {e}")
    
    # Test 3: Enhance description
    print("\n✨ Testing Description Enhancement...")
    try:
        enhanced_desc = analyzer.enhance_task_description(task_data, context_data)
        print("✅ Enhanced Description:")
        print(f"   {enhanced_desc[:200]}...")
    except Exception as e:
        print(f"❌ Description Enhancement failed: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 TaskAnalyzer test completed!")

def test_without_llm():
    """Test TaskAnalyzer without LLM (offline mode)"""
    print("\n🔧 Testing Offline Mode...")
    
    analyzer = TaskAnalyzer(use_local_llm=False)
    
    # Test with minimal data
    task_data = {'title': 'Test task', 'description': 'Test description'}
    context_data = []
    
    print("📋 Testing with OpenAI (if configured)...")
    try:
        result = analyzer.analyze_task_priority(task_data, context_data)
        print(f"✅ Result: {result}")
    except Exception as e:
        print(f"⚠️  OpenAI test: {e}")

if __name__ == "__main__":
    # Test with local LLM
    test_task_analyzer()
    
    # Test without LLM
    test_without_llm() 