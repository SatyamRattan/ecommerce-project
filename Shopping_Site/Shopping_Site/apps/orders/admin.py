from django.contrib import admin
from .models import Order,shipping_address,orderstatus
from apps.users.models import User
from apps.catalog.models import Product


admin.site.register(Order)
admin.site.register(shipping_address)
admin.site.register(orderstatus)
