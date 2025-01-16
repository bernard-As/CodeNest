from django.db import models
from account.models import *
import uuid
# Create your models here.

class ProjectTypes(models.Model):
    name = models.CharField(max_length=255)
    timestamp =  models.DateTimeField(auto_now_add=True)
    tags = models.ManyToManyField(Tags,blank=True)
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
    tags = models.ManyToManyField(Tags,blank=True)
    likes = models.ManyToManyField(Likes,blank=True)


class Project(models.Model):
    name = models.CharField(max_length=500)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, null=True,blank=True)
    creator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,related_name='project_creator')
    lecturer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='project_lecturer')
    advisor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,related_name='project_colaborator')
    collaborators = models.ManyToManyField(User,blank=True,)
    project_type = models.ForeignKey(ProjectTypes, on_delete=models.SET_NULL, null=True, blank=True)
    timestamp =  models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True,null=True)
    tags = models.ManyToManyField(Tags,blank=True,)
    comments = models.ManyToManyField(Comment,blank=True,)
    likes = models.ManyToManyField(Likes,blank=True,)
    image = models.ImageField(upload_to='project_profile/',null=True,blank=True)
    view = models.PositiveIntegerField(default=0)
    def __str__(self):
        return self.name

class Folder(models.Model):
    name = models.CharField(max_length=255)
    timestamp =  models.DateTimeField(auto_now_add=True)
    parent_folder = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='subfolders')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True, related_name='project_folder')
    
class Files(models.Model):
    timestamp =  models.DateTimeField(auto_now_add=True)
    file = models.FileField(upload_to='files')
    tags = models.ManyToManyField(Tags,blank=True)
    comments = models.ManyToManyField(Comment,blank=True)
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE, null=True, blank=True,)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True, related_name='project_file')

class Presentation(models.Model):
    file = models.ForeignKey(Files,on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    number_of_participant = models.SmallIntegerField(default=0)
    host = models.ForeignKey(User, on_delete=models.CASCADE)
