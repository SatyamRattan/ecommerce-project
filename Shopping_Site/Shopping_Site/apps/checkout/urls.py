'''from django.urls import path
from .views import TransactionListCreateView

urlpatterns = [
    path('transactions/', TransactionListCreateView.as_view()),
]'''

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet,CouponViewSet,CouponUsageViewSet

router = DefaultRouter()
router.register(r'transaction', TransactionViewSet, basename='transaction')
router.register(r'coupon', CouponViewSet, basename='coupon')
router.register(r'couponusage', CouponUsageViewSet, basename='coupon-usage')

urlpatterns = [
    path('', include(router.urls)),
]