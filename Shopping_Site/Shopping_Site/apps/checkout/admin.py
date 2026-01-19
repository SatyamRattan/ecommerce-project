from django.contrib import admin
from .models import Transaction,Coupon,CouponUsage

# Register your models here.
admin.site.register(Transaction)
admin.site.register(Coupon)
admin.site.register(CouponUsage)


