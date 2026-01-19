from django.db import models

class CreateStampMixin(models.Model):
    created_by = models.IntegerField(default=0)
    created_on = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        abstract = True

class UpdateStampMixin(models.Model):
    updated_by = models.IntegerField(default=0)
    updated_on = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        abstract = True

class CreateAndUpdateTimeStampMixin(CreateStampMixin,UpdateStampMixin):
    created_on = models.DateTimeField(auto_now_add=True, null=True)
    updated_on = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        abstract = True

class ActiveStampMixin(models.Model):
    is_active = models.BooleanField(default=True)

    class Meta:
        abstract = True

class BasicTimeStamp(CreateAndUpdateTimeStampMixin,ActiveStampMixin):
    created_by = models.IntegerField(default=0)
    created_on = models.DateTimeField(auto_now_add=True, null=True)
    updated_by = models.IntegerField(default=0)
    updated_on = models.DateTimeField(auto_now=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        abstract = True