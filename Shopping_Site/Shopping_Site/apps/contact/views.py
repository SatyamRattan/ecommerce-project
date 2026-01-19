from django.shortcuts import render

# Create your views here.
# from rest_framework.generics import CreateAPIView
# from .models import ContactMessage
# from .serializers import ContactMessageSerializer

# class ContactCreateView(CreateAPIView):
#     queryset = ContactMessage.objects.all()
#     serializer_class = ContactMessageSerializer

from rest_framework.response import Response
from .models import ContactMessage
from .serializers import ContactMessageSerializer
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

# Create your views here.
class ContactCreateViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]
    