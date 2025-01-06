from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics,viewsets, filters,status
from .models import *
from fns import send_email,generate_auth_code,verify_code
from knox.models import AuthToken # type: ignore
from knox.auth import TokenAuthentication
from .serializers import *
import json
from rest_framework.permissions import AllowAny

class LoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        email = request.data['email']
        try:
            user = User.objects.get(email=email)
            if(user.use_password):
                try:
                    password = request.data['password']
                    if(user.check_password(password)):
                        _, token = AuthToken.objects.create(user)
                        return Response({'token': token,'message': 'Login Success'}, status=status.HTTP_200_OK)
                    else:
                        return Response({'message': 'err_pwd'}, status=status.HTTP_400_BAD_REQUEST)
                except:
                        return Response({'message': 'err_nd_pwd'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                try:
                    auth_code = request.data['auth_code']
                    if(verify_code(auth_code,user.auth_code)):
                        _, token = AuthToken.objects.create(user)
                        return Response({'token': token,'message': 'Login Success'}, status=status.HTTP_200_OK)
                    else:
                        return Response({'message': 'err_auth_code'}, status=status.HTTP_400_BAD_REQUEST)
                except:
                    auth_code,hashed = generate_auth_code()
                    user.auth_code = hashed
                    user.save()
                    send_email(
                        subject='Verify your email address',
                        message=f'Your verification code is {auth_code}',
                        recipient_list=[email],
                    )
                    return Response({'message':'email_verif'},200)
        except:
            # New user sending verification email
            auth_code,hashed = generate_auth_code()
            try:
                user = User.objects.create(email=email,auth_code=hashed,username=email)
                send_email(
                    subject='Verify your email address',
                    message=f'Your verification code is {auth_code}',
                    recipient_list=[email],
                )
            except:
                return Response({'message':'Invalid email or password '}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'message':'email_verif'},200)
        
class VerifyToken(APIView):
    authentication_classes = ([TokenAuthentication])
    permission_classes = ([IsAuthenticated])
    def post(self, request):
        user = request.user
        if user.image==None or user.image=='':
            image = None
        else:
            image = user.image.url
        
        if user.department==None or user.department=='':
            dep = None
        else:
            dep = user.department.pk

        tags = []
        for tag in user.tags.all():
            tags.append(tag.name)

        return Response({
            'message':'success',
            'user':{
                'first_name':user.first_name,
                'last_name':user.last_name,
                'image':image,
                'first_login':user.first_login,
                'department':dep,
                'tags':tags
            }
        }, status=status.HTTP_200_OK)

class DepartmentRetrive(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self,request):
        departments = Department.objects.all()
        toReturn = []
        for dep in departments:
            toReturn.append({
                'id':dep.pk,
                'name':dep.name
            })
        return Response(toReturn, status=status.HTTP_200_OK)

class UpdateProfile(APIView):
    authentication_classes = ([TokenAuthentication])
    permission_classes = ([IsAuthenticated])
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        user = request.user
        data = request.data
        print(data)
        try:
            user.first_name = data['first_name']
            user.last_name = data['last_name']
        except:
            return Response({'error':'Bad equest'},status=status.HTTP_400_BAD_REQUEST)

        try:
            user.department = Department.objects.get(pk=request.data['department'])
        except:
            pass

        try:
            image = request.FILES.get('image', None)
            if image:
                user.image.save(image.name,image)
        except:
            print('error in account')
            pass

        try:
            User.objects.get(pk=user.pk).tags.clear()
            tags = json.loads(data['tags'])
            for tag in tags:
                tagobj, _ = Tags.objects.get_or_create(name=tag)
                user.tags.add(tagobj)
        except Exception as e:
            print(f"Error processing tags: {e}")
        user.save()
        return Response({'message':'success'},status=status.HTTP_200_OK)
    
class LecturerRetrive(APIView):
    authentication_classes = ([])
    permission_classes = [AllowAny]
    def post(self,request):
        lecturer = User.objects.filter(isLecturer=True)

        toReturn = []
        for lecturer in lecturer:
            toReturn.append({
                'id':lecturer.id,
                'first_name':lecturer.first_name,
                'last_name':lecturer.last_name,
                'department':lecturer.department.name,
                'image':lecturer.image.url if lecturer.image else None,
                'tags':list(lecturer.tags.all().values_list('name',flat=True)),
            })
        
        return Response(toReturn,status=status.HTTP_200_OK)
    
class AllUser(APIView):
    authentication_classes = ([])
    permission_classes = [AllowAny]
    def post(self,request):
        users = User.objects.all()
        toReturn = []
        for user in users:
            toReturn.append({
                'id':user.id,
                'name': user.first_name + ' ' + user.last_name,
                'image':user.image.url if user.image else None,
                'isLecturer':user.isLecturer,
            })
        
        return Response(toReturn,status=status.HTTP_200_OK)