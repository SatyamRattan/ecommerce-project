from rest_framework import viewsets
from .models import Order,shipping_address,orderstatus
from .serializers import OrderSerializer,shipping_addressSerializer,orderstatusSerializer
from rest_framework.permissions import AllowAny


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]


class shipping_addressViewSet(viewsets.ModelViewSet):
    queryset = shipping_address.objects.all()
    serializer_class = shipping_addressSerializer
    permission_classes = [AllowAny]
    

class orderstatusViewSet(viewsets.ModelViewSet):
    queryset = orderstatus.objects.all()
    serializer_class = orderstatusSerializer
    permission_classes = [AllowAny]
