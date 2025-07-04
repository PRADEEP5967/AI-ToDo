import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any
from decouple import config
import hashlib
from django.core.cache import cache

class TaskAnalyzer:
    def __init__(self, use_local_llm=True):
        self.use_local_llm = use_local_llm
        self.lm_studio_url = "http://localhost:1234/v1/chat/completions"
        self.openai_api_key = config('OPENAI_API_KEY', default='')
        self.cache_timeout = 60 * 10  # 10 minutes
        
    def _cache_key(self, prefix, *args):
        key_str = prefix + ':' + hashlib.sha256(str(args).encode()).hexdigest()
        return key_str

    def analyze_task_priority(self, task_data: Dict, context_data: List[Dict]) -> Dict:
        """Analyze task priority based on content and context"""
        cache_key = self._cache_key('priority', task_data, context_data)
        cached = cache.get(cache_key)
        if cached:
            return cached
        prompt = self._build_priority_prompt(task_data, context_data)
        
        if self.use_local_llm:
            response = self._query_local_llm(prompt)
        else:
            response = self._query_openai(prompt)
            
        result = self._parse_priority_response(response)
        cache.set(cache_key, result, self.cache_timeout)
        return result
    
    def suggest_deadline(self, task_data: Dict, current_workload: int = 0) -> datetime:
        """Suggest realistic deadline for task"""
        cache_key = self._cache_key('deadline', task_data, current_workload)
        cached = cache.get(cache_key)
        if cached:
            return cached
        prompt = self._build_deadline_prompt(task_data, current_workload)
        
        if self.use_local_llm:
            response = self._query_local_llm(prompt)
        else:
            response = self._query_openai(prompt)
            
        result = self._parse_deadline_response(response)
        cache.set(cache_key, result, self.cache_timeout)
        return result
    
    def enhance_task_description(self, task_data: Dict, context_data: List[Dict]) -> str:
        """Enhance task description with context-aware details"""
        cache_key = self._cache_key('enhance', task_data, context_data)
        cached = cache.get(cache_key)
        if cached:
            return cached
        prompt = self._build_enhancement_prompt(task_data, context_data)
        
        if self.use_local_llm:
            response = self._query_local_llm(prompt)
        else:
            response = self._query_openai(prompt)
            
        cache.set(cache_key, response, self.cache_timeout)
        return response.strip()
    
    def _query_local_llm(self, prompt: str) -> str:
        """Query local LLM via LM Studio"""
        try:
            payload = {
                "model": "local-model",
                "messages": [
                    {"role": "system", "content": "You are an AI assistant specialized in task management and productivity."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 500
            }
            
            response = requests.post(self.lm_studio_url, json=payload, timeout=30)
            response.raise_for_status()
            
            return response.json()['choices'][0]['message']['content']
        except Exception as e:
            return f"Error querying local LLM: {str(e)}"
    
    def _query_openai(self, prompt: str) -> str:
        """Query OpenAI API"""
        try:
            if not self.openai_api_key:
                return "OpenAI API key not configured"
                
            payload = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": "You are an AI assistant specialized in task management and productivity."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 500
            }
            
            headers = {
                "Authorization": f"Bearer {self.openai_api_key}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                json=payload,
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            
            return response.json()['choices'][0]['message']['content']
        except Exception as e:
            return f"Error querying OpenAI: {str(e)}"
    
    def _build_priority_prompt(self, task_data: Dict, context_data: List[Dict]) -> str:
        """Build prompt for priority analysis"""
        context_summary = "\n".join([f"- {ctx['content'][:100]}..." for ctx in context_data[-5:]])
        
        return f"""
        Analyze the priority of this task based on the context provided.
        
        Task: {task_data.get('title', '')}
        Description: {task_data.get('description', '')}
        Category: {task_data.get('category', 'General')}
        
        Recent Context:
        {context_summary}
        
        Return a JSON response with:
        - priority_score (0-10 float)
        - priority_level (1-4 integer: 1=Low, 2=Medium, 3=High, 4=Critical)
        - reasoning (brief explanation)
        
        Format: {{"priority_score": 7.5, "priority_level": 3, "reasoning": "High priority due to..."}}
        """
    
    def _build_deadline_prompt(self, task_data: Dict, current_workload: int) -> str:
        """Build prompt for deadline suggestion"""
        return f"""
        Suggest a realistic deadline for this task based on its complexity and current workload.
        
        Task: {task_data.get('title', '')}
        Description: {task_data.get('description', '')}
        Category: {task_data.get('category', 'General')}
        Current Workload: {current_workload} active tasks
        
        Consider:
        - Task complexity and scope
        - Current workload
        - Task urgency and importance
        - Realistic time estimates
        
        Return a JSON response with:
        - suggested_deadline (ISO format: YYYY-MM-DD HH:MM:SS)
        - reasoning (brief explanation)
        
        Format: {{"suggested_deadline": "2024-01-15 17:00:00", "reasoning": "Based on task complexity..."}}
        """
    
    def _build_enhancement_prompt(self, task_data: Dict, context_data: List[Dict]) -> str:
        """Build prompt for task description enhancement"""
        context_summary = "\n".join([f"- {ctx['content'][:100]}..." for ctx in context_data[-5:]])
        
        return f"""
        Enhance this task description with context-aware details and actionable insights.
        
        Original Task: {task_data.get('title', '')}
        Original Description: {task_data.get('description', '')}
        Category: {task_data.get('category', 'General')}
        
        Recent Context:
        {context_summary}
        
        Provide an enhanced description that includes:
        - More specific details and requirements
        - Context-aware considerations
        - Potential challenges or dependencies
        - Suggested approach or steps
        
        Return only the enhanced description text, no JSON formatting.
        """
    
    def _parse_priority_response(self, response: str) -> Dict:
        """Parse LLM response for priority analysis"""
        try:
            # Extract JSON from response
            start = response.find('{')
            end = response.rfind('}') + 1
            json_str = response[start:end]
            return json.loads(json_str)
        except:
            return {"priority_score": 5.0, "priority_level": 2, "reasoning": "Default priority"}
    
    def _parse_deadline_response(self, response: str) -> datetime:
        """Parse LLM response for deadline suggestion"""
        try:
            # Extract JSON from response
            start = response.find('{')
            end = response.rfind('}') + 1
            json_str = response[start:end]
            data = json.loads(json_str)
            
            # Parse the suggested deadline
            deadline_str = data.get('suggested_deadline', '')
            return datetime.fromisoformat(deadline_str.replace('Z', '+00:00'))
        except:
            # Default to 7 days from now
            return datetime.now() + timedelta(days=7) 