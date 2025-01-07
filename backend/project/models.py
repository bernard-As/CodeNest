from django.db import models
from account.models import *
import uuid
# Create your models here.

class ProjectTypes(models.Model):
    name = models.CharField(max_length=255)
    timestamp =  models.DateTimeField(auto_now_add=True)
    tags = models.ManyToManyField(Tags,blank=True,null=True)
    newFlag = models.BooleanField(default=True)
    def __str__(self):
        return self.name
    
class Likes(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True,blank=True)
    created_at =  models.DateTimeField(auto_now_add=True)

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True,blank=True)
    text = models.TextField()
    timestamp =  models.DateTimeField(auto_now_add=True)
    tags = models.ManyToManyField(Tags)
    likes = models.ManyToManyField(Likes,blank=True,null=True)


class Files(models.Model):
    timestamp =  models.DateTimeField(auto_now_add=True)
    file = models.FileField(upload_to='files')
    tags = models.ManyToManyField(Tags)
    comments = models.ManyToManyField(Comment,blank=True,null=True)

class Folder(models.Model):
    name = models.CharField(max_length=255)
    files = models.ManyToManyField(Files)
    timestamp =  models.DateTimeField(auto_now_add=True)



class Project(models.Model):
    name = models.CharField(max_length=500)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, null=True,blank=True)
    creator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,related_name='project_creator')
    lecturer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='project_lecturer')
    advisor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,related_name='project_colaborator')
    collaborators = models.ManyToManyField(User,blank=True,null=True)
    project_type = models.ForeignKey(ProjectTypes, on_delete=models.SET_NULL, null=True, blank=True)
    timestamp =  models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True,null=True)
    tags = models.ManyToManyField(Tags,blank=True,null=True)
    comments = models.ManyToManyField(Comment,blank=True,null=True)
    likes = models.ManyToManyField(Likes,blank=True,null=True)
    image = models.ImageField(upload_to='project_profile/',null=True,blank=True)
    view = models.PositiveIntegerField(default=0)
    def __str__(self):
        return self.name
