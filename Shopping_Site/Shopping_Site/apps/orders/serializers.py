from rest_framework import serializers
from .models import Order,shipping_address,orderstatus

class OrderSerializer(serializers.ModelSerializer):
    # serializer field method
    #discounted_price = serializers.DecimalField(max_digits=8, decimal_places=2)
    class Meta:
        model = Order
        fields = '__all__'

    #def get_discounted_price(self, object):
        #return object.product.price - (object.product.price * object.product.discount / 100)`   `


class shipping_addressSerializer(serializers.ModelSerializer):
    class Meta:
        model = shipping_address
        fields = '__all__'


class orderstatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = orderstatus
        fields = '__all__'
