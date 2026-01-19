from django.db import models
from apps.users.models import User
from apps.util.model_mixin import BasicTimeStamp
from django.utils import timezone
from apps.util.choices import MediaTypes, ReviewRatingChoices
#from apps.cart.models import ProductVariant


class Category(BasicTimeStamp):
    name = models.CharField(max_length=100)
    description = models.TextField()
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subcategories')

    def __str__(self):
        if self.parent:
            return f"{self.parent} → {self.name}"
        return self.name

    
class Product(BasicTimeStamp):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=150)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    description = models.TextField(blank=True)
    stock = models.PositiveIntegerField(default=0)
    is_available = models.BooleanField(default=True)
    total_reviews = models.PositiveIntegerField(default=0)
    #image = models.ImageField(upload_to='products/', null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.category})"


class ProductMedia(BasicTimeStamp):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    media_type = models.CharField(max_length=10,choices=MediaTypes.choices)
    file = models.FileField(upload_to='product_media/')

    def __str__(self):
        return f"{self.product.self.name} - {self.media_type}"

class ProductReview(BasicTimeStamp):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField(choices=ReviewRatingChoices.choices)  
    comment = models.TextField(blank=True)
    review_date = models.DateField(default=timezone.now)

    class Meta:
        unique_together = ('product', 'user', 'review_date')

    def __str__(self):
        return f"{self.user} - {self.product} - {self.rating}"

'''class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    color = models.CharField(max_length=50)
    size = models.CharField(max_length=20)
    price = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return f"{self.product} - {self.color}"

class ProductInventory(models.Model):
    variant = models.OneToOneField(ProductVariant, on_delete=models.CASCADE)
    stock = models.PositiveIntegerField(default=0)
    is_available = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.variant} - {self.stock}" '''

class Wishlist(BasicTimeStamp):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    variant = models.ForeignKey('cart.ProductVariant', on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"{self.user} - {self.product}"   
