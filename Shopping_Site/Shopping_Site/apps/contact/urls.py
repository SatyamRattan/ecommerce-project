# from django.urls import path
# from .views import ContactCreateViewSet

# urlpatterns = [
#     path('contact/', ContactCreateViewSet.as_view(), name='contact'),
#     path('contact/<int:pk>/', ContactCreateViewSet.as_view(), name='contact-detail'),
# ]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContactCreateViewSet

router = DefaultRouter()
router.register(r'contact', ContactCreateViewSet, basename='contact')

urlpatterns = [
    path('', include(router.urls)),
]