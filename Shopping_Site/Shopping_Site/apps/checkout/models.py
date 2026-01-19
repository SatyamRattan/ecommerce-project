from django.db import models
from apps.util.choices import PaymentMethodChoices, PaymentStatusChoices, CouponTypeChoices

# Create your models here``
from django.db import models
from apps.orders.models import Order
from apps.users.models import User
from django.utils import timezone
from datetime import timedelta
from apps.util.model_mixin import BasicTimeStamp

class Transaction(BasicTimeStamp):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    total_price = models.DecimalField(max_digits=10, decimal_places=2,default=0)
    transaction_id = models.CharField(max_length=200, unique=True)
    payment_method = models.CharField(max_length=20, choices=PaymentMethodChoices.choices)
    status = models.CharField(max_length=20, choices=PaymentStatusChoices.choices)

    def __str__(self):
        return f"{self.transaction_id} - {self.status}"


class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True) 
    discount_type = models.CharField(max_length=10, choices=CouponTypeChoices.choices)
    discount_value = models.DecimalField(max_digits=8, decimal_places=2)
    min_order_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    max_discount_amount = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    valid_from = models.DateTimeField(auto_now_add=True)
    valid_to = models.DateTimeField(default=timezone.now() + timedelta(days=1))
    usage_limit = models.PositiveIntegerField(default=1)       
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.code

class CouponUsage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "coupon", "order")

    def __str__(self):
        return f"{self.user} - {self.coupon} - {self.order}"
