from rest_framework.routers import DefaultRouter
from django.urls import path,include
from .views import *

router = DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
    path('verify-token/', VerifyToken.as_view(), name='token_verification'),
    path('update-profile/', UpdateProfile.as_view(), name='update-profile'),
    path('department/', DepartmentRetrive.as_view(), name='departent Retreive'),
    path('lecturer/', LecturerRetrive.as_view(), name='lecturer Retreive'),
    path('users/', AllUser.as_view(), name='users Retreive'),


]
