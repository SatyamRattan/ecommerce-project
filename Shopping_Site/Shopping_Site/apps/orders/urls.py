'''from django.urls import path
from .views import OrderViewSet

urlpatterns = [
    path('order/', OrderViewSet.as_view()),
]'''

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet,shipping_addressViewSet,orderstatusViewSet

router = DefaultRouter()
router.register(r'order', OrderViewSet, basename='order')
router.register(r'shipping_address', shipping_addressViewSet, basename='shipping_address')
router.register(r'orderstatus', orderstatusViewSet, basename='orderstatus')

urlpatterns = [
    path('', include(router.urls)),
]