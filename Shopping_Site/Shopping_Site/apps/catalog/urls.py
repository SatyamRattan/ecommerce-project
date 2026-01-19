'''from django.urls import path
from .views import CategoryViewSet, ProductViewSet

urlpatterns = [
    path('category/', CategoryViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('product/', ProductViewSet.as_view({'get': 'list', 'post': 'create'})),
]'''

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, ProductReviewViewSet, ProductMediaViewSet,WishlistViewSet

router = DefaultRouter()
router.register(r'category', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'productreviews', ProductReviewViewSet, basename='productreview')
router.register(r'productmedia', ProductMediaViewSet, basename='productmedia')
#router.register(r'productvariant', ProductVariantViewSet, basename='productvariant')
#router.register(r'productinventory', ProductInventoryViewSet, basename='productinventory')
router.register(r'wishlist', WishlistViewSet, basename='wishlist')


# urls.py
from django.urls import path
from .views import hello_api

urlpatterns = [
    path('', include(router.urls)),
    path('hello/', hello_api)
]