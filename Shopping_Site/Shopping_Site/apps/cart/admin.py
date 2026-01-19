from django.contrib import admin
from .models import Cart, ProductVariant
from apps.users.models import User
from apps.catalog.models import Product

admin.site.register(Cart)
admin.site.register(ProductVariant)
