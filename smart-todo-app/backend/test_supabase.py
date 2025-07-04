import os
from supabase import create_client, Client
from decouple import config

# Load environment variables
supabase_url = 'https://qbfbutbtrkshhwwfoxmq.supabase.co'
supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiZmJ1dGJ0cmtzaGh3d2ZveG1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1Nzk2MTYsImV4cCI6MjA2NzE1NTYxNn0.OqCN5KiRCvuxN0zx7-4XnfqkO_H69ISn8x-Seq10SWg'

# Create Supabase client
supabase: Client = create_client(supabase_url, supabase_key)

# Test connection
try:
    # Test the connection by getting the client info
    print("✅ Supabase client created successfully!")
    print(f"Connected to: {supabase_url}")
    print("Supabase connection test completed.")
except Exception as e:
    print("❌ Supabase connection failed:")
    print(f"Error: {e}") 