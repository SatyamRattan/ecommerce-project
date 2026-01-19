from rest_framework.response import Response
from .models import Transaction,Coupon,CouponUsage
from .serializers import TransactionSerializer,CouponSerializer,CouponUsageSerializer
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

# Create your views here.
class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [AllowAny]
    

class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [AllowAny]
    

class CouponUsageViewSet(viewsets.ModelViewSet):
    queryset = CouponUsage.objects.all()
    serializer_class = CouponUsageSerializer
    permission_classes = [AllowAny]
    