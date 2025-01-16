from rest_framework.routers import DefaultRouter
from django.urls import path,include
from .views import *

router = DefaultRouter()
router.register(r'project', ProjectView, basename='project')
router.register(r'open-project', ProjectOpenView, basename='no token projects')
router.register(r'folder', FolderView, basename='folder')
router.register(r'open-folder', OpenFolderView, basename='open folder')
router.register(r'file', FileView, basename='file')
router.register(r'open-file', OpenFileView, basename='open file')
router.register(r'comment', CommentView, basename='comment')
router.register(r'open-comment', OpenCommentView, basename='open comment')

urlpatterns = [
    path('', include(router.urls)),
    path('types/', TypesRetrieve.as_view(), name='departent Retreive'),
    path('like-item/', LikedItem.as_view(), name='Like Item'),
    path('open-like-item/', OpenLikedItem.as_view(), name='OpenLike Item'),
    path('execute/', ExecuteFileView.as_view(), name='Execute file'),
]
