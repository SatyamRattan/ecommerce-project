from django.db import models


class GenderChoices(models.TextChoices):
    MALE = 'MALE', 'Male'
    FEMALE = 'FEMALE', 'Female'
    OTHER = 'OTHER', 'Other'

class OrderStatusChoices(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    CONFIRMED = 'CONFIRMED', 'Confirmed'
    SHIPPED = 'SHIPPED', 'Shipped'
    DELIVERED = 'DELIVERED', 'Delivered'
    CANCELLED = 'CANCELLED', 'Cancelled'
    RETURNED = 'RETURNED', 'Returned'
    FAILED = 'FAILED', 'Failed'

class PaymentStatusChoices(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    SUCCESS = 'SUCCESS', 'Success'
    FAILED = 'FAILED', 'Failed'
    REFUNDED = 'REFUNDED', 'Refunded'

class PaymentMethodChoices(models.TextChoices):
    CARD = 'CARD', 'Card'
    UPI = 'UPI', 'UPI'
    COD = 'COD', 'Cash On Delivery'
    WALLET = 'WALLET', 'Wallet'
    NETBANKING = 'NETBANKING', 'Net Banking'

class CouponTypeChoices(models.TextChoices):
    FLAT = 'FLAT', 'Flat Discount'
    PERCENTAGE = 'PERCENTAGE', 'Percentage Discount'


class ProductStatusChoices(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    ACTIVE = 'ACTIVE', 'Active'
    INACTIVE = 'INACTIVE', 'Inactive'
    OUT_OF_STOCK = 'OUT_OF_STOCK', 'Out of Stock'


class ProductTypeChoices(models.TextChoices):
    SIMPLE = 'SIMPLE', 'Simple'
    VARIABLE = 'VARIABLE', 'Variable'
    DIGITAL = 'DIGITAL', 'Digital'


class InventoryStatusChoices(models.TextChoices):
    IN_STOCK = 'IN_STOCK', 'In Stock'
    LOW_STOCK = 'LOW_STOCK', 'Low Stock'
    OUT_OF_STOCK = 'OUT_OF_STOCK', 'Out of Stock'


# ---------- REVIEW ----------

class ReviewRatingChoices(models.IntegerChoices):
    ONE = 1, '1 Star'
    TWO = 2, '2 Star'
    THREE = 3, '3 Star'
    FOUR = 4, '4 Star'
    FIVE = 5, '5 Star'


# ---------- SHIPPING ----------

class ShippingStatusChoices(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    PICKED = 'PICKED', 'Picked'
    IN_TRANSIT = 'IN_TRANSIT', 'In Transit'
    DELIVERED = 'DELIVERED', 'Delivered'
    RETURNED = 'RETURNED', 'Returned'


# ---------- OFFER / PROMOTION ----------

class OfferTypeChoices(models.TextChoices):
    PRODUCT = 'PRODUCT', 'Product Offer'
    CATEGORY = 'CATEGORY', 'Category Offer'
    CART = 'CART', 'Cart Offer'

class YesNoChoices(models.TextChoices):
    YES = 'YES', 'Yes'
    NO = 'NO', 'No'

class MediaTypes(models.TextChoices):
    IMAGE = 'IMAGE', 'Image'
    VIDEO = 'VIDEO', 'Video'

