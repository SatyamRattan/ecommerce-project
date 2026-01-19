from django.db import models
from apps.users.models import User
#from apps.catalog.models import Product
from apps.util.model_mixin import BasicTimeStamp
from apps.util.choices import InventoryStatusChoices

class Cart(BasicTimeStamp):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey('catalog.Product', on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    
    def __str__(self):
        return f'{self.user} - {self.product}'

class ProductVariant(BasicTimeStamp):
    product = models.ForeignKey('catalog.Product', on_delete=models.CASCADE)
    variant_type = models.CharField(max_length=50)
    variant_value = models.CharField(max_length=50)
    variant_price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(choices=InventoryStatusChoices.choices)

    def __str__(self):
        return f'{self.product} - {self.variant_type} - {self.variant_value}'