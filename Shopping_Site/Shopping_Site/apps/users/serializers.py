from rest_framework import serializers
from .models import User,UserShippingAddress

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'password', 'name', 'phone', 'gender', 'dob', 'address']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password) # <--- THIS IS THE KEY PART!
        instance.save()
        return instance


# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = '__all__'


class UserShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserShippingAddress
        fields = '__all__'


# from rest_framework import serializers
# from .models import User
# from django.contrib.auth.password_validation import validate_password

# class RegisterSerializer(serializers.ModelSerializer):
#     password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

#     class Meta:
#         model = User
#         fields = ['id', 'name', 'email', 'password']

#     def create(self, validated_data):
#         user = User.objects.create_user(
#             email=validated_data['email'],
#             name=validated_data['name'],
#             password=validated_data['password']
#         )
#         return user


# class LoginSerializer(serializers.Serializer):
#     email = serializers.EmailField()
#     password = serializers.CharField(write_only=True)


# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['id', 'name', 'email', 'phone', 'gender', 'dob', 'address']
