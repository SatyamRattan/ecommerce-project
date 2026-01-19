'''from django.urls import path
from .views import CartViewSet

urlpatterns = [
    path('cart/', CartViewSet.as_view()),
]'''

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartViewSet, ProductVariantViewSet

router = DefaultRouter()
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'productvariant', ProductVariantViewSet, basename='productvariant')

urlpatterns = [
    path('', include(router.urls)),
]