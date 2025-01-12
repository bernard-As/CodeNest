from rest_framework.routers import DefaultRouter
from django.urls import path,include
from .views import *

router = DefaultRouter()
router.register(r'project', ProjectView, basename='project')
router.register(r'open-project', ProjectOpenView, basename='no token projects')
router.register(r'folder', FolderView, basename='folder')
router.register(r'open-folder', FolderView, basename='open folder')

urlpatterns = [
    path('', include(router.urls)),
    path('types/', TypesRetrieve.as_view(), name='departent Retreive'),
    path('like-item/', LikedItem.as_view(), name='Like Item'),
    path('open-like-item/', OpenLikedItem.as_view(), name='Like Item'),
]
