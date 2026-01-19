from django.db import models
from apps.users.models import User
from apps.catalog.models import Product
from apps.util.model_mixin import BasicTimeStamp
from apps.util.choices import OrderStatusChoices, PaymentStatusChoices

class Order(BasicTimeStamp):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=8, decimal_places=2,default=0)
    total_price = models.DecimalField(max_digits=8, decimal_places=2,default=0)
    payment_status = models.CharField(max_length=20, choices=PaymentStatusChoices.choices)
    
    
    def __str__(self):
        return f'{self.user} - {self.product}'

class shipping_address(BasicTimeStamp):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    pincode = models.CharField(max_length=20)
    
    def __str__(self):
        return f'{self.user} - {self.address}'

class  orderstatus(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=OrderStatusChoices.choices)
    changed_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f'{self.order} - {self.status}'

    