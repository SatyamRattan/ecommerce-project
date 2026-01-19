from rest_framework import serializers
from .models import Cart, ProductVariant

# class CartSerializer(serializers.ModelSerializer):
#     user = serializers.StringRelatedField(read_only=True)
#     class Meta:
#         model = Cart
#         fields = '__all__'

# from apps.catalog.serializers import ProductSerializer

# class CartSerializer(serializers.ModelSerializer):
#     user = serializers.StringRelatedField(read_only=True)
#     product = ProductSerializer(read_only=True)

#     class Meta:
#         model = Cart
#         fields = ['id', 'user', 'product', 'quantity']

from rest_framework import serializers
from .models import Cart
from apps.catalog.models import Product
from apps.catalog.serializers import ProductSerializer


class CartSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    product = ProductSerializer(read_only=True)

    # 👇 WRITE-ONLY FIELD
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source='product',
        write_only=True
    )

    class Meta:
        model = Cart
        fields = [
            'id',
            'user',
            'product',
            'product_id',
            'quantity',
        ]


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = '__all__'