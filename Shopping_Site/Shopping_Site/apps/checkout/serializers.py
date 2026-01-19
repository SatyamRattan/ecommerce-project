from rest_framework import serializers
from .models import Transaction,Coupon,CouponUsage

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'


class CouponUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CouponUsage
        fields = '__all__'
