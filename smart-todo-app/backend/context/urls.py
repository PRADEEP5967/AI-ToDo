from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContextEntryViewSet

router = DefaultRouter()
router.register(r'context', ContextEntryViewSet, basename='context')

urlpatterns = [
    path('api/', include(router.urls)),
] 