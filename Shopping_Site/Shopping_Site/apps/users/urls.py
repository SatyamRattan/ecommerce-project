'''from django.urls import path
from rest_framework.routers import DefaultRouter

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)

from rest_framework.permissions import IsAuthenticated
from .views import UserViewSet

router = DefaultRouter()

urlpatterns = [
    #path('user/', UserViewSet.as_view()),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    #path('profile/', views.UserProfileView.as_view(), name='user_profile'),
]

urlpatterns += router.urls

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

router = DefaultRouter()
router.register(r'user', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
]'''


from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)
from .views import UserViewSet,UserShippingAddressViewSet

# 1. Setup the Router
router = DefaultRouter()
router.register(r'user', UserViewSet, basename='user')
router.register(r'usershippingaddress', UserShippingAddressViewSet, basename='user_shipping_address')

# 2. Define all patterns in ONE list
urlpatterns = [
    # JWT Token Endpoints
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Include Router URLs (this covers /user/ and /user/<id>/)
    path('', include(router.urls)),
]