from django.contrib import admin
from .models import Category, Product, ProductMedia, ProductReview,Wishlist


admin.site.register(Category)
admin.site.register(Product)
admin.site.register(ProductMedia)
admin.site.register(ProductReview)
#admin.site.register(ProductVariant)
#admin.site.register(ProductInventory)
admin.site.register(Wishlist)