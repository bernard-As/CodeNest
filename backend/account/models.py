from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class Tags(models.Model):
    name = models.CharField(max_length=255)
    timestamp =  models.DateTimeField(auto_now_add=True)

class Department(models.Model):
    name= models.CharField(max_length=500)
    timestamp =  models.DateTimeField(auto_now_add=True)

class User(AbstractUser):
    email = models.EmailField(unique=True, blank=False, null=False)
    use_password = models.BooleanField(default=False)
    auth_code = models.TextField(blank=True, null=True)
    first_login = models.BooleanField(default=True)
    image = models.ImageField(upload_to='profile',null=True,blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True)
    tags = models.ManyToManyField(Tags)
    isLecturer = models.BooleanField(default=False)
