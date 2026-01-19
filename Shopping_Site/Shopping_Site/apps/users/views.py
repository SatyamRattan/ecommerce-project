'''from django.shortcuts import render

from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response

from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        user = request.user

        user_data = {
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'roles' : user.groups.all()
        }
        return Response(user_data)'''

from rest_framework import viewsets
from .models import User,UserShippingAddress
from .serializers import UserSerializer,UserShippingAddressSerializer
from rest_framework.permissions import AllowAny

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class UserShippingAddressViewSet(viewsets.ModelViewSet):
    queryset = UserShippingAddress.objects.all()
    serializer_class = UserShippingAddressSerializer
    permission_classes = [AllowAny]
    

# from rest_framework import generics, status
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from rest_framework_simplejwt.tokens import RefreshToken
# from django.contrib.auth import authenticate
# from .models import User
# from .serializers import RegisterSerializer, LoginSerializer, UserSerializer

# # Register
# class RegisterView(generics.CreateAPIView):
#     serializer_class = RegisterSerializer


# # Login
# class LoginView(generics.GenericAPIView):
#     serializer_class = LoginSerializer

#     def post(self, request):
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)

#         email = serializer.validated_data['email']
#         password = serializer.validated_data['password']
#         user = authenticate(request, email=email, password=password)

#         if user:
#             refresh = RefreshToken.for_user(user)
#             return Response({
#                 "user": UserSerializer(user).data,
#                 "refresh": str(refresh),
#                 "access": str(refresh.access_token)
#             })
#         return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


# # Profile (optional)
# class ProfileView(generics.RetrieveAPIView):
#     serializer_class = UserSerializer
#     permission_classes = [IsAuthenticated]

#     def get_object(self):
#         return self.request.user
