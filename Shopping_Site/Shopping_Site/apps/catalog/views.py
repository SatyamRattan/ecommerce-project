from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Category, Product, ProductReview, ProductMedia,Wishlist
from .serializers import CategorySerializer, ProductSerializer, ProductReviewSerializer, ProductMediaSerializer,WishlistSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import BasicAuthentication, SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework import status
from rest_framework import request
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

@api_view(['GET'])
@permission_classes([AllowAny])
def hello_api(request):
    return Response({"message": "Hello from DRF 🚀"})
    

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    #authentication_classes = [JWTAuthentication]
    #authentication_classes = [BasicAuthentication]
    permission_classes = [AllowAny]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

class ProductMediaViewSet(viewsets.ModelViewSet):
    queryset = ProductMedia.objects.all()
    # In your views.py
    #serializer = ProductMediaSerializer(queryset, many=True, context={'request': request})
    serializer_class = ProductMediaSerializer
    permission_classes = [AllowAny]

    # Add this specific method
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

class ProductReviewViewSet(viewsets.ModelViewSet):
    queryset = ProductReview.objects.all()
    serializer_class = ProductReviewSerializer
    permission_classes = [AllowAny]


'''class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [AllowAny]


class ProductInventoryViewSet(viewsets.ModelViewSet):
    queryset = ProductInventory.objects.all()
    serializer_class = ProductInventorySerializer
    permission_classes = [AllowAny]'''


class WishlistViewSet(viewsets.ModelViewSet):
    queryset = Wishlist.objects.all()
    serializer_class = WishlistSerializer
    permission_classes = [AllowAny]
