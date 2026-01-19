from django.db import models

# Create your models here.  
from django.db import models
from apps.util.model_mixin import BasicTimeStamp

class ContactMessage(BasicTimeStamp):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.email}"  